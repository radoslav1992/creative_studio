import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const OUTPUTS_DIR = path.join(process.cwd(), 'public', 'outputs');

async function downloadAndSave(url: string, generationId: string, index: number): Promise<string> {
  if (!existsSync(OUTPUTS_DIR)) {
    await mkdir(OUTPUTS_DIR, { recursive: true });
  }

  let ext = '.bin';
  try {
    const urlPath = new URL(url).pathname;
    const urlExt = path.extname(urlPath);
    if (urlExt && urlExt.length <= 5) ext = urlExt;
  } catch {}

  if (ext === '.bin') {
    if (url.includes('.mp4') || url.includes('video')) ext = '.mp4';
    else if (url.includes('.webm')) ext = '.webm';
    else if (url.includes('.png')) ext = '.png';
    else if (url.includes('.jpg') || url.includes('.jpeg')) ext = '.jpg';
    else if (url.includes('.webp')) ext = '.webp';
  }

  const hash = crypto.createHash('md5').update(`${generationId}-${index}-${url}`).digest('hex').slice(0, 12);
  const filename = `${generationId}-${index}-${hash}${ext}`;
  const filepath = path.join(OUTPUTS_DIR, filename);

  // Skip if already downloaded
  if (existsSync(filepath)) {
    return `/outputs/${filename}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/outputs/${filename}`;
}

/**
 * POST /api/generations/[id]/refresh
 *
 * Re-fetches the prediction from Replicate, downloads fresh output files,
 * saves them locally, and updates the DB.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не сте автентикирани' }, { status: 401 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: 'REPLICATE_API_TOKEN не е конфигуриран' }, { status: 500 });
    }

    const gen = await prisma.generation.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!gen) {
      return NextResponse.json({ error: 'Генерацията не е намерена' }, { status: 404 });
    }

    if (!gen.replicateId) {
      return NextResponse.json({ error: 'Няма Replicate ID' }, { status: 400 });
    }

    // Check if output is already local
    if (gen.output) {
      try {
        const parsed = JSON.parse(gen.output);
        const urls = Array.isArray(parsed) ? parsed : [parsed];
        const allLocal = urls.every((u: string) => typeof u === 'string' && u.startsWith('/outputs/'));
        if (allLocal) {
          // Already saved locally, check files exist
          const allExist = urls.every((u: string) => existsSync(path.join(process.cwd(), 'public', u)));
          if (allExist) {
            return NextResponse.json({
              id: gen.id,
              status: gen.status,
              output: parsed,
              refreshed: false,
              message: 'Файловете вече са локални',
            });
          }
        }
      } catch {}
    }

    // Fetch fresh prediction data from Replicate
    const res = await fetch(`https://api.replicate.com/v1/predictions/${gen.replicateId}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Replicate API грешка: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (data.status !== 'succeeded' || !data.output) {
      return NextResponse.json({
        error: 'Генерацията не е завършена или няма резултат',
        replicateStatus: data.status,
      }, { status: 400 });
    }

    // Download output files
    const localPaths: string[] = [];
    if (typeof data.output === 'string') {
      const localPath = await downloadAndSave(data.output, gen.id, 0);
      localPaths.push(localPath);
    } else if (Array.isArray(data.output)) {
      for (let i = 0; i < data.output.length; i++) {
        if (typeof data.output[i] === 'string') {
          const localPath = await downloadAndSave(data.output[i], gen.id, i);
          localPaths.push(localPath);
        }
      }
    }

    // Update DB
    const localOutput = localPaths.length === 1 ? localPaths[0] : localPaths;
    await prisma.generation.update({
      where: { id: gen.id },
      data: {
        output: JSON.stringify(localOutput),
        status: 'succeeded',
      },
    });

    return NextResponse.json({
      id: gen.id,
      status: 'succeeded',
      output: localOutput,
      refreshed: true,
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
