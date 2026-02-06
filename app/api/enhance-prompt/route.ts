import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPTS: Record<string, string> = {
  video: `You are an expert AI video prompt engineer. Your task is to take a user's rough video prompt and enhance it into a highly detailed, cinematic prompt optimized for AI video generation models (like Veo, Sora, Kling).

Rules:
- Keep the original intent and subject matter intact
- Add specific details about: camera movement (tracking shot, dolly zoom, crane shot, etc.), lighting (golden hour, neon-lit, soft diffused, etc.), atmosphere, color grading, visual style, motion dynamics, and sound/ambient audio cues
- Use vivid, descriptive language that AI video models respond well to
- Keep the prompt between 2-5 sentences — detailed but not overwhelming
- Output ONLY the enhanced prompt text, nothing else — no explanations, no quotes, no prefixes
- Write the enhanced prompt in the SAME language as the input prompt`,

  image: `You are an expert AI image prompt engineer. Your task is to take a user's rough image prompt and enhance it into a highly detailed, visually rich prompt optimized for AI image generation models (like Imagen, DALL-E, Ideogram, Midjourney).

Rules:
- Keep the original intent and subject matter intact
- Add specific details about: composition, lighting, color palette, texture, art style, medium (photography, digital painting, 3D render, etc.), mood, depth of field, and fine details
- Use vivid, descriptive language that AI image models respond well to
- Keep the prompt between 2-5 sentences — detailed but not overwhelming
- Output ONLY the enhanced prompt text, nothing else — no explanations, no quotes, no prefixes
- Write the enhanced prompt in the SAME language as the input prompt`,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Не сте автентикирани' },
        { status: 401 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_AI_API_KEY не е конфигуриран. Моля, добавете го в .env файла.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, category } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Моля, въведете промпт за подобряване' },
        { status: 400 }
      );
    }

    if (!category || !['video', 'image'].includes(category)) {
      return NextResponse.json(
        { error: 'Невалидна категория. Използвайте "video" или "image".' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 512,
      },
    });

    const systemPrompt = SYSTEM_PROMPTS[category];
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Enhance this prompt:\n\n${prompt.trim()}` },
    ]);

    const response = result.response;
    const enhancedPrompt = response.text().trim();

    if (!enhancedPrompt) {
      return NextResponse.json(
        { error: 'Не беше генериран подобрен промпт' },
        { status: 500 }
      );
    }

    return NextResponse.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Prompt enhance error:', error);

    // Handle specific Google AI errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Невалиден Google AI API ключ' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Грешка при подобряване на промпта' },
      { status: 500 }
    );
  }
}
