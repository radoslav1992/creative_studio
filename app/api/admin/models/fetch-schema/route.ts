import { NextResponse } from 'next/server';
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
 * POST /api/admin/models/fetch-schema
 * Body: { replicateId: "owner/model-name" }
 *
 * Fetches model info + OpenAPI schema from Replicate, returns parsed data.
 * Used by the admin UI when adding a new model.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN not configured' }, { status: 500 });
  }

  const { replicateId } = await request.json();
  if (!replicateId || !replicateId.includes('/')) {
    return NextResponse.json(
      { error: 'Invalid replicateId. Must be "owner/model-name"' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.replicate.com/v1/models/${replicateId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: `Model "${replicateId}" not found on Replicate` }, { status: 404 });
      }
      return NextResponse.json({ error: `Replicate API returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const latestVersion = data.latest_version;

    // Parse schema
    let inputSchema = { properties: {}, required: [] as string[] };
    if (latestVersion?.openapi_schema) {
      const allSchemas = latestVersion.openapi_schema.components?.schemas ?? {};
      const inputProperties = allSchemas.Input?.properties ?? {};
      const requiredFields: string[] = allSchemas.Input?.required ?? [];
      inputSchema = {
        properties: resolveSchema(inputProperties, allSchemas),
        required: requiredFields,
      };
    }

    const paramCount = Object.keys(inputSchema.properties).length;

    // Guess category from description or schema
    const desc = (data.description || '').toLowerCase();
    const hasVideoOutput = desc.includes('video') || desc.includes('clip');
    const hasImageOutput = desc.includes('image') || desc.includes('photo');
    const guessedCategory = hasVideoOutput ? 'video' : 'image';

    // Guess capabilities
    const capabilities: string[] = [];
    const props = inputSchema.properties as Record<string, any>;
    if (guessedCategory === 'video') {
      capabilities.push('text-to-video');
      if (props.image || props.start_image || props.input_reference) {
        capabilities.push('image-to-video');
      }
    } else {
      capabilities.push('text-to-image');
      if (props.image || props.image_input || props.input_images || props.mask) {
        capabilities.push('image-editing');
      }
      if (props.character_reference_image) {
        capabilities.push('character-consistency');
      }
    }

    const [owner] = replicateId.split('/');

    return NextResponse.json({
      replicateId,
      name: data.name || replicateId.split('/')[1],
      owner,
      description: data.description || '',
      provider: owner.charAt(0).toUpperCase() + owner.slice(1),
      category: guessedCategory,
      capabilities,
      inputSchema,
      paramCount,
      runCount: data.run_count,
      coverImageUrl: data.cover_image_url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
