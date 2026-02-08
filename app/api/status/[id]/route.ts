import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
const OUTPUTS_DIR = path.join(process.cwd(), 'public', 'outputs');

/**
 * Downloads a file from a URL and saves it locally.
 * Returns the public-accessible path (e.g. /outputs/abc123.mp4).
 */
async function downloadAndSave(url: string, generationId: string, index: number): Promise<string> {
  // Ensure output directory exists
  if (!existsSync(OUTPUTS_DIR)) {
    await mkdir(OUTPUTS_DIR, { recursive: true });
  }

  // Determine file extension from URL or content
  let ext = '.bin';
  try {
    const urlPath = new URL(url).pathname;
    const urlExt = path.extname(urlPath);
    if (urlExt && urlExt.length <= 5) {
      ext = urlExt;
    }
  } catch {}

  // If no extension detected, try common patterns
  if (ext === '.bin') {
    if (url.includes('video') || url.includes('.mp4')) ext = '.mp4';
    else if (url.includes('.webm')) ext = '.webm';
    else if (url.includes('.png')) ext = '.png';
    else if (url.includes('.jpg') || url.includes('.jpeg')) ext = '.jpg';
    else if (url.includes('.webp')) ext = '.webp';
  }

  const hash = crypto.createHash('md5').update(`${generationId}-${index}-${url}`).digest('hex').slice(0, 12);
  const filename = `${generationId}-${index}-${hash}${ext}`;
  const filepath = path.join(OUTPUTS_DIR, filename);

  // Download
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/outputs/${filename}`;
}

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

    // First check if we already have a completed generation in DB with local files
    const existingGen = await prisma.generation.findFirst({
      where: {
        replicateId: id,
        userId: session.user.id,
      },
    });

    if (existingGen && (existingGen.status === 'succeeded' || existingGen.status === 'failed' || existingGen.status === 'canceled')) {
      // Already completed — return cached result, no need to hit Replicate
      return NextResponse.json({
        id,
        status: existingGen.status,
        output: existingGen.output ? JSON.parse(existingGen.output) : null,
        error: existingGen.error,
      });
    }

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

    // If the prediction succeeded, download output files and save locally
    if (data.status === 'succeeded' && data.output) {
      try {
        const genId = existingGen?.id || id;
        const outputUrls: string[] = [];

        if (typeof data.output === 'string') {
          // Single output URL
          const localPath = await downloadAndSave(data.output, genId, 0);
          outputUrls.push(localPath);
        } else if (Array.isArray(data.output)) {
          // Multiple output URLs
          for (let i = 0; i < data.output.length; i++) {
            if (typeof data.output[i] === 'string') {
              const localPath = await downloadAndSave(data.output[i], genId, i);
              outputUrls.push(localPath);
            }
          }
        }

        // Update DB with local file paths
        if (existingGen) {
          const localOutput = outputUrls.length === 1 ? outputUrls[0] : outputUrls;
          await prisma.generation.update({
            where: { id: existingGen.id },
            data: {
              status: 'succeeded',
              output: JSON.stringify(localOutput),
            },
          });
        }

        return NextResponse.json({
          id: data.id,
          status: data.status,
          output: outputUrls.length === 1 ? outputUrls[0] : outputUrls,
          error: data.error,
          metrics: data.metrics,
        });
      } catch (downloadError: any) {
        console.error('File download error:', downloadError);
        // Fall through — return original URLs as fallback
      }
    }

    // If failed/canceled, update DB
    if (data.status === 'failed' || data.status === 'canceled') {
      if (existingGen) {
        await prisma.generation.update({
          where: { id: existingGen.id },
          data: {
            status: data.status,
            error: data.error || null,
          },
        }).catch((e: any) => console.error('DB update error:', e));
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
