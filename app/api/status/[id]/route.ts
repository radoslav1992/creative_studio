import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Не сте автентикирани' },
        { status: 401 }
      );
    }

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

    // If the prediction is complete (succeeded or failed), update DB
    if (data.status === 'succeeded' || data.status === 'failed' || data.status === 'canceled') {
      try {
        const dbGen = await prisma.generation.findFirst({
          where: {
            replicateId: id,
            userId: session.user.id,
          },
        });

        if (dbGen) {
          const updateData: any = { status: data.status };
          if (data.output) {
            updateData.output = JSON.stringify(
              typeof data.output === 'string' ? data.output : data.output
            );
          }
          if (data.error) {
            updateData.error = data.error;
          }

          await prisma.generation.update({
            where: { id: dbGen.id },
            data: updateData,
          });
        }
      } catch (dbError) {
        console.error('DB update error during status poll:', dbError);
      }
    }

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
