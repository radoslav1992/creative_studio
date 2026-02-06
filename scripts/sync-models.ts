/**
 * Script to sync model schemas from Replicate API into the local database.
 *
 * Usage:
 *   npx tsx scripts/sync-models.ts
 *
 * Requires:
 *   - DATABASE_URL in .env or .env.local
 *   - REPLICATE_API_TOKEN in .env or .env.local
 */

import { PrismaClient } from '@prisma/client';

// Load env vars
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Import model registry
import { MODEL_REGISTRY } from '../lib/model-registry';

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
          if (refSchema) {
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

async function main() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment');
    process.exit(1);
  }

  console.log(`🔄 Syncing ${MODEL_REGISTRY.length} models from Replicate API...\n`);

  let synced = 0;
  let errors = 0;

  for (const entry of MODEL_REGISTRY) {
    process.stdout.write(`  ${entry.replicateId}... `);

    try {
      const res = await fetch(`https://api.replicate.com/v1/models/${entry.replicateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.log(`❌ HTTP ${res.status}`);
        errors++;
        continue;
      }

      const data = await res.json();
      const latestVersion = data.latest_version;

      if (!latestVersion?.openapi_schema) {
        console.log('❌ No schema');
        errors++;
        continue;
      }

      const allSchemas = latestVersion.openapi_schema.components?.schemas ?? {};
      const inputProperties = allSchemas.Input?.properties ?? {};
      const requiredFields: string[] = allSchemas.Input?.required ?? [];

      const resolvedProperties = resolveSchema(inputProperties, allSchemas);

      const inputSchema = {
        properties: resolvedProperties,
        required: requiredFields,
      };

      const paramCount = Object.keys(resolvedProperties).length;

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

      console.log(`✅ ${paramCount} params`);
      synced++;
    } catch (error: any) {
      console.log(`❌ ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Done: ${synced} synced, ${errors} errors`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
