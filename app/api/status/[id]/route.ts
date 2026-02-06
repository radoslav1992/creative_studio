import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN не е конфигуриран' },
        { status: 500 }
      );
    }

    const { id } = params;

    const response = await fetch(`${REPLICATE_API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.detail || `Грешка: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      id: data.id,
      status: data.status,
      output: data.output,
      error: data.error,
      metrics: data.metrics,
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Грешка при проверка на статуса' },
      { status: 500 }
    );
  }
}
