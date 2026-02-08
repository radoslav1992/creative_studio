import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/models — List ALL models (including inactive)
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  const models = await prisma.replicateModel.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  const parsed = models.map((m) => ({
    ...m,
    capabilities: JSON.parse(m.capabilities),
    inputSchema: JSON.parse(m.inputSchema),
  }));

  return NextResponse.json(parsed);
}

/**
 * POST /api/admin/models — Add a new model
 * Body: { replicateId, name, provider, providerColor, description, category, capabilities, badge, sortOrder }
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();

    const {
      replicateId,
      name,
      provider,
      providerColor = '#888888',
      description = '',
      category,
      capabilities = [],
      badge,
      sortOrder = 0,
      inputSchema,
    } = body;

    if (!replicateId || !name || !category) {
      return NextResponse.json(
        { error: 'replicateId, name, and category are required' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.replicateModel.findUnique({
      where: { replicateId },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Model ${replicateId} already exists` },
        { status: 409 }
      );
    }

    const model = await prisma.replicateModel.create({
      data: {
        replicateId,
        name,
        provider: provider || replicateId.split('/')[0],
        providerColor,
        description,
        category,
        capabilities: JSON.stringify(capabilities),
        badge: badge || null,
        sortOrder,
        inputSchema: JSON.stringify(inputSchema || { properties: {}, required: [] }),
        lastSyncedAt: inputSchema ? new Date() : null,
      },
    });

    return NextResponse.json({
      ...model,
      capabilities: JSON.parse(model.capabilities),
      inputSchema: JSON.parse(model.inputSchema),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
