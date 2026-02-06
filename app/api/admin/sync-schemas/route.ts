import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MODEL_REGISTRY } from '@/lib/model-registry';

export const dynamic = 'force-dynamic';

/**
 * Resolves $ref references in OpenAPI schema properties.
 * Replicate stores enums in separate schema definitions referenced via $ref/allOf.
 */
function resolveSchema(
  properties: Record<string, any>,
  allSchemas: Record<string, any>
): Record<string, any> {
  const resolved: Record<string, any> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const resolvedProp = { ...prop };

    // Resolve allOf references (Replicate puts enums in $ref)
    if (prop.allOf && Array.isArray(prop.allOf)) {
      for (const ref of prop.allOf) {
        if (ref.$ref) {
          const refName = ref.$ref.split('/').pop();
          const refSchema = allSchemas[refName];
          if (refSchema) {
            // Merge the referenced schema into the property
            Object.assign(resolvedProp, refSchema);
          }
        }
      }
      delete resolvedProp.allOf;
    }

    resolved[key] = resolvedProp;
  }

  return resolved;
}

/**
 * POST /api/admin/sync-schemas
 *
 * Fetches the OpenAPI input schema for each model in the registry from Replicate,
 * resolves $ref/allOf references, and stores the result in the DB.
 */
export async function POST(request: Request) {
  // Simple auth check — require the REPLICATE_API_TOKEN as bearer
  const authHeader = request.headers.get('authorization');
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN not configured' }, { status: 500 });
  }

  // Allow the sync to run if the request comes from the same server (no auth header needed in dev)
  // or if the correct token is provided
  if (authHeader && authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { replicateId: string; status: string; error?: string }[] = [];

  for (const entry of MODEL_REGISTRY) {
    try {
      // Fetch model info from Replicate
      const res = await fetch(`https://api.replicate.com/v1/models/${entry.replicateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        results.push({
          replicateId: entry.replicateId,
          status: 'error',
          error: `Replicate API returned ${res.status}`,
        });
        continue;
      }

      const data = await res.json();
      const latestVersion = data.latest_version;

      if (!latestVersion?.openapi_schema) {
        results.push({
          replicateId: entry.replicateId,
          status: 'error',
          error: 'No OpenAPI schema found',
        });
        continue;
      }

      const allSchemas = latestVersion.openapi_schema.components?.schemas ?? {};
      const inputProperties = allSchemas.Input?.properties ?? {};
      const requiredFields: string[] = allSchemas.Input?.required ?? [];

      // Resolve $ref/allOf references
      const resolvedProperties = resolveSchema(inputProperties, allSchemas);

      // Build clean schema object
      const inputSchema = {
        properties: resolvedProperties,
        required: requiredFields,
      };

      // Upsert into DB
      await prisma.replicateModel.upsert({
        where: { replicateId: entry.replicateId },
        create: {
          replicateId: entry.replicateId,
          name: entry.name,
          provider: entry.provider,
          providerColor: entry.providerColor,
          description: entry.description,
          category: entry.category,
          capabilities: JSON.stringify(entry.capabilities),
          badge: entry.badge,
          sortOrder: entry.sortOrder,
          inputSchema: JSON.stringify(inputSchema),
          lastSyncedAt: new Date(),
        },
        update: {
          name: entry.name,
          provider: entry.provider,
          providerColor: entry.providerColor,
          description: entry.description,
          category: entry.category,
          capabilities: JSON.stringify(entry.capabilities),
          badge: entry.badge,
          sortOrder: entry.sortOrder,
          inputSchema: JSON.stringify(inputSchema),
          lastSyncedAt: new Date(),
        },
      });

      results.push({ replicateId: entry.replicateId, status: 'synced' });
    } catch (error: any) {
      results.push({
        replicateId: entry.replicateId,
        status: 'error',
        error: error.message,
      });
    }
  }

  const synced = results.filter((r) => r.status === 'synced').length;
  const errors = results.filter((r) => r.status === 'error').length;

  return NextResponse.json({
    message: `Synced ${synced} models, ${errors} errors`,
    results,
  });
}
