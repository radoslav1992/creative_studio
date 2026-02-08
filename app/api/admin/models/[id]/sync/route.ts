import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

function resolveSchema(
  properties: Record<string, any>,
  allSchemas: Record<string, any>
): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, prop] of Object.entries(properties)) {
    const resolvedProp = { ...prop };
    if (prop.allOf && Array.isArray(prop.allOf)) {
      for (const ref of prop.allOf) {
        if (ref.$ref) {
          const refName = ref.$ref.split('/').pop();
          const refSchema = allSchemas[refName];
          if (refSchema) Object.assign(resolvedProp, refSchema);
        }
      }
      delete resolvedProp.allOf;
    }
    resolved[key] = resolvedProp;
  }
  return resolved;
}

/**
 * POST /api/admin/models/[id]/sync — Re-fetch schema from Replicate for a single model
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN not configured' }, { status: 500 });
  }

  const model = await prisma.replicateModel.findUnique({ where: { id: params.id } });
  if (!model) {
    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
  }

  try {
    const res = await fetch(`https://api.replicate.com/v1/models/${model.replicateId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Replicate API returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const latestVersion = data.latest_version;

    if (!latestVersion?.openapi_schema) {
      return NextResponse.json({ error: 'No OpenAPI schema found' }, { status: 404 });
    }

    const allSchemas = latestVersion.openapi_schema.components?.schemas ?? {};
    const inputProperties = allSchemas.Input?.properties ?? {};
    const requiredFields: string[] = allSchemas.Input?.required ?? [];
    const resolvedProperties = resolveSchema(inputProperties, allSchemas);
    const inputSchema = { properties: resolvedProperties, required: requiredFields };

    const updated = await prisma.replicateModel.update({
      where: { id: params.id },
      data: {
        inputSchema: JSON.stringify(inputSchema),
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...updated,
      capabilities: JSON.parse(updated.capabilities),
      inputSchema: JSON.parse(updated.inputSchema),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
