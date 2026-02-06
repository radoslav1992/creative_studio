import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/generations/:id — update generation status/output
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не сте автентикирани' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, output, error, replicateId } = body;

    // Verify ownership
    const existing = await prisma.generation.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Генерацията не е намерена' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (output !== undefined) updateData.output = JSON.stringify(output);
    if (error !== undefined) updateData.error = error;
    if (replicateId) updateData.replicateId = replicateId;

    const updated = await prisma.generation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      output: updated.output ? JSON.parse(updated.output) : undefined,
    });
  } catch (error: any) {
    console.error('Generation update error:', error);
    return NextResponse.json({ error: 'Грешка при обновяване' }, { status: 500 });
  }
}

// DELETE /api/generations/:id — delete a generation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не сте автентикирани' }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const existing = await prisma.generation.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Генерацията не е намерена' }, { status: 404 });
    }

    await prisma.generation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Generation delete error:', error);
    return NextResponse.json({ error: 'Грешка при изтриване' }, { status: 500 });
  }
}
