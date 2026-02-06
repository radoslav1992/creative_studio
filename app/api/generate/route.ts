import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN не е конфигуриран. Моля, добавете го в .env файла.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { model, input } = body;

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
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();

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
