import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/models/[id] — Update a model
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { id } = params;

    // Build update data — only include fields that were sent
    const data: Record<string, any> = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.provider !== undefined) data.provider = body.provider;
    if (body.providerColor !== undefined) data.providerColor = body.providerColor;
    if (body.description !== undefined) data.description = body.description;
    if (body.category !== undefined) data.category = body.category;
    if (body.badge !== undefined) data.badge = body.badge || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.capabilities !== undefined) {
      data.capabilities = JSON.stringify(body.capabilities);
    }
    if (body.inputSchema !== undefined) {
      data.inputSchema = JSON.stringify(body.inputSchema);
      data.lastSyncedAt = new Date();
    }

    const model = await prisma.replicateModel.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...model,
      capabilities: JSON.parse(model.capabilities),
      inputSchema: JSON.parse(model.inputSchema),
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/models/[id] — Delete a model
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await prisma.replicateModel.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
