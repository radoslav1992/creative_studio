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

  if (existsSync(filepath)) return `/outputs/${filename}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/outputs/${filename}`;
}

/**
 * Checks if a generation's output URLs are stale (remote Replicate URLs).
 * If so, re-fetches from Replicate API and downloads locally.
 */
async function refreshStaleGeneration(gen: any, apiToken: string): Promise<any> {
  if (!gen.output || !gen.replicateId || gen.status !== 'succeeded') return gen;

  let parsed: any;
  try {
    parsed = JSON.parse(gen.output);
  } catch {
    return gen;
  }

  const urls: string[] = Array.isArray(parsed) ? parsed : [parsed];

  // Check if already local
  const allLocal = urls.every((u) => typeof u === 'string' && u.startsWith('/outputs/'));
  if (allLocal) {
    // Verify files exist
    const allExist = urls.every((u) => existsSync(path.join(process.cwd(), 'public', u)));
    if (allExist) return gen;
  }

  // Need to refresh — fetch fresh URLs from Replicate
  try {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${gen.replicateId}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
      cache: 'no-store',
    });

    if (!res.ok) return gen;

    const data = await res.json();
    if (data.status !== 'succeeded' || !data.output) return gen;

    const localPaths: string[] = [];
    if (typeof data.output === 'string') {
      localPaths.push(await downloadAndSave(data.output, gen.id, 0));
    } else if (Array.isArray(data.output)) {
      for (let i = 0; i < data.output.length; i++) {
        if (typeof data.output[i] === 'string') {
          localPaths.push(await downloadAndSave(data.output[i], gen.id, i));
        }
      }
    }

    const localOutput = localPaths.length === 1 ? localPaths[0] : localPaths;
    await prisma.generation.update({
      where: { id: gen.id },
      data: { output: JSON.stringify(localOutput) },
    });

    return { ...gen, output: JSON.stringify(localOutput) };
  } catch (e: any) {
    console.error(`Failed to refresh generation ${gen.id}:`, e.message);
    return gen;
  }
}

// GET /api/generations — fetch user's generations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Не сте автентикирани' }, { status: 401 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

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

    // Auto-refresh stale generations (download expired Replicate URLs)
    let refreshedGenerations = generations;
    if (apiToken) {
      refreshedGenerations = await Promise.all(
        generations.map((g) => refreshStaleGeneration(g, apiToken))
      );
    }

    // Parse output JSON
    const parsed = refreshedGenerations.map((g) => ({
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
