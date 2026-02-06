import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/generations — fetch user's generations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не сте автентикирани' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: any = { userId: session.user.id };
    if (category && (category === 'video' || category === 'image')) {
      where.category = category;
    }

    const [generations, total] = await Promise.all([
      prisma.generation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.generation.count({ where }),
    ]);

    // Parse output JSON
    const parsed = generations.map((g) => ({
      ...g,
      output: g.output ? JSON.parse(g.output) : undefined,
    }));

    return NextResponse.json({ generations: parsed, total });
  } catch (error: any) {
    console.error('Generations fetch error:', error);
    return NextResponse.json({ error: 'Грешка при зареждане на генерациите' }, { status: 500 });
  }
}

// POST /api/generations — create a new generation record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не сте автентикирани' }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, modelName, prompt, category } = body;

    if (!modelId || !modelName || !prompt || !category) {
      return NextResponse.json({ error: 'Липсват задължителни полета' }, { status: 400 });
    }

    const generation = await prisma.generation.create({
      data: {
        userId: session.user.id,
        modelId,
        modelName,
        prompt,
        category,
        status: 'starting',
      },
    });

    return NextResponse.json(generation);
  } catch (error: any) {
    console.error('Generation create error:', error);
    return NextResponse.json({ error: 'Грешка при създаване на генерация' }, { status: 500 });
  }
}
