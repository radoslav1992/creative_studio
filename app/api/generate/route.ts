import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Не сте автентикирани. Моля, влезте в системата.' },
        { status: 401 }
      );
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN не е конфигуриран. Моля, добавете го в .env файла.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { model, input, generationId } = body;

    if (!model || !input) {
      return NextResponse.json(
        { error: 'Липсват задължителни полета: model и input' },
        { status: 400 }
      );
    }

    // Use the model-specific predictions endpoint:
    // POST https://api.replicate.com/v1/models/{owner}/{name}/predictions
    // This doesn't require a version hash — it uses the latest version automatically.
    const apiUrl = `https://api.replicate.com/v1/models/${model}/predictions`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Prefer: 'respond-async',
      },
      cache: 'no-store',
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail || errorData?.error || `Replicate API грешка: ${response.status}`;

      // Update DB generation if exists
      if (generationId) {
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: 'failed', error: errorMessage },
        }).catch(() => {});
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();

    // Update DB generation with replicate prediction ID
    if (generationId) {
      await prisma.generation.update({
        where: { id: generationId },
        data: { replicateId: data.id, status: 'processing' },
      }).catch(() => {});
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Неочаквана грешка при генерирането' },
      { status: 500 }
    );
  }
}
