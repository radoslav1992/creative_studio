import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/models?category=video|image
 *
 * Returns all active models with their cached input schemas.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const where: any = { isActive: true };
  if (category === 'video' || category === 'image') {
    where.category = category;
  }

  const models = await prisma.replicateModel.findMany({
    where,
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  // Parse JSON fields for the response
  const parsed = models.map((m) => ({
    id: m.id,
    replicateId: m.replicateId,
    name: m.name,
    provider: m.provider,
    providerColor: m.providerColor,
    description: m.description,
    category: m.category,
    capabilities: JSON.parse(m.capabilities),
    badge: m.badge,
    inputSchema: JSON.parse(m.inputSchema),
    lastSyncedAt: m.lastSyncedAt,
  }));

  return NextResponse.json(parsed);
}
