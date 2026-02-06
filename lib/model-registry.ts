/**
 * Static metadata for all supported Replicate models.
 * This is the ONLY place where model metadata is defined.
 * The actual input parameters come dynamically from Replicate's OpenAPI schema.
 */

export interface ModelRegistryEntry {
  replicateId: string;
  name: string;
  provider: string;
  providerColor: string;
  description: string; // Bulgarian
  category: 'video' | 'image';
  capabilities: string[]; // e.g. ["text-to-video", "image-to-video"]
  badge?: string; // Bulgarian badge text
  sortOrder: number;
}

export const MODEL_REGISTRY: ModelRegistryEntry[] = [
  // ============== VIDEO MODELS ==============

  // --- Google Veo ---
  {
    replicateId: 'google/veo-3',
    name: 'Veo 3',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Водещият модел на Google за генериране на видео с вграден звук. Създава кинематографични клипове с естествен аудио.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    badge: 'Популярен',
    sortOrder: 0,
  },
  {
    replicateId: 'google/veo-3.1',
    name: 'Veo 3.1',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Подобрена версия на Veo 3 с контекстно аудио, референтни изображения и поддръжка на последен кадър.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    badge: 'Ново',
    sortOrder: 1,
  },
  {
    replicateId: 'google/veo-3-fast',
    name: 'Veo 3 Fast',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'По-бърза и евтина версия на Veo 3. Генерира видео с вграден звук бързо.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    badge: 'Бързо',
    sortOrder: 2,
  },
  {
    replicateId: 'google/veo-2',
    name: 'Veo 2',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Модел за генериране на видео с реалистично движение и високо качество до 4K.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    sortOrder: 3,
  },
  {
    replicateId: 'google/veo-3.1-fast',
    name: 'Veo 3.1 Fast',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Бърза версия на Veo 3.1 с високо качество, контекстно аудио и последен кадър.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    badge: 'Ново & Бързо',
    sortOrder: 4,
  },

  // --- OpenAI Sora ---
  {
    replicateId: 'openai/sora-2-pro',
    name: 'Sora 2 Pro',
    provider: 'OpenAI',
    providerColor: '#10a37f',
    description: 'Най-напредналият модел на OpenAI за видео генерация. Кинематографично качество.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    badge: 'Премиум',
    sortOrder: 5,
  },
  {
    replicateId: 'openai/sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    providerColor: '#10a37f',
    description: 'Флагманският модел на OpenAI за видео генерация от текст или изображения.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    sortOrder: 6,
  },

  // --- Kling ---
  {
    replicateId: 'kwaivgi/kling-v2.5-turbo-pro',
    name: 'Kling v2.5 Turbo Pro',
    provider: 'Kuaishou',
    providerColor: '#FF6B35',
    description: 'Професионално видео с плавно движение и кинематографична дълбочина.',
    category: 'video',
    capabilities: ['text-to-video', 'image-to-video'],
    badge: 'Топ избор',
    sortOrder: 7,
  },
  {
    replicateId: 'kwaivgi/kling-v2.1',
    name: 'Kling v2.1',
    provider: 'Kuaishou',
    providerColor: '#FF6B35',
    description: 'Генериране на 5 и 10 секундни видеа в 720p и 1080p от начално изображение.',
    category: 'video',
    capabilities: ['image-to-video'],
    sortOrder: 8,
  },

  // ============== IMAGE MODELS ==============

  // --- Google Imagen ---
  {
    replicateId: 'google/imagen-4',
    name: 'Imagen 4',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Флагманският модел на Google за изображения. Фини детайли и разнообразни стилове.',
    category: 'image',
    capabilities: ['text-to-image'],
    badge: 'Популярен',
    sortOrder: 0,
  },
  {
    replicateId: 'google/imagen-4-ultra',
    name: 'Imagen 4 Ultra',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Ултра версия на Imagen 4 — когато качеството е по-важно от скоростта.',
    category: 'image',
    capabilities: ['text-to-image'],
    badge: 'Премиум',
    sortOrder: 1,
  },
  {
    replicateId: 'google/imagen-4-fast',
    name: 'Imagen 4 Fast',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Бърза версия на Imagen 4 — когато скоростта е по-важна от качеството.',
    category: 'image',
    capabilities: ['text-to-image'],
    badge: 'Бързо',
    sortOrder: 2,
  },
  {
    replicateId: 'google/imagen-3',
    name: 'Imagen 3',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Модел за висококачествено генериране на изображения с подобрени детайли.',
    category: 'image',
    capabilities: ['text-to-image'],
    sortOrder: 3,
  },
  {
    replicateId: 'google/imagen-3-fast',
    name: 'Imagen 3 Fast',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Бърз модел Imagen 3 — когато скоростта е по-важна от качеството.',
    category: 'image',
    capabilities: ['text-to-image'],
    badge: 'Бързо',
    sortOrder: 4,
  },
  {
    replicateId: 'google/nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Генериране и редактиране на изображения. Поддържа до 14 входни изображения и до 4K.',
    category: 'image',
    capabilities: ['text-to-image', 'image-editing'],
    badge: 'Редактиране',
    sortOrder: 5,
  },
  {
    replicateId: 'google/nano-banana',
    name: 'Nano Banana',
    provider: 'Google',
    providerColor: '#4285F4',
    description: 'Генериране и редактиране на изображения в Gemini 2.5. Мултимодален.',
    category: 'image',
    capabilities: ['text-to-image', 'image-editing'],
    badge: 'Редактиране',
    sortOrder: 6,
  },

  // --- OpenAI ---
  {
    replicateId: 'openai/gpt-image-1.5',
    name: 'GPT Image 1.5',
    provider: 'OpenAI',
    providerColor: '#10a37f',
    description: 'Генериране и редактиране на изображения с прецизен контрол и следване на инструкции.',
    category: 'image',
    capabilities: ['text-to-image', 'image-editing'],
    badge: 'Ново',
    sortOrder: 7,
  },

  // --- Ideogram ---
  {
    replicateId: 'ideogram-ai/ideogram-character',
    name: 'Ideogram Character',
    provider: 'Ideogram',
    providerColor: '#E040FB',
    description: 'Последователни персонажи от едно референтно изображение. Различни стилове и инпейнтинг.',
    category: 'image',
    capabilities: ['character-consistency', 'image-editing'],
    badge: 'Персонажи',
    sortOrder: 8,
  },
  {
    replicateId: 'ideogram-ai/ideogram-v3-quality',
    name: 'Ideogram v3 Quality',
    provider: 'Ideogram',
    providerColor: '#E040FB',
    description: 'Най-високото качество на Ideogram v3. Реализъм и креативни дизайни.',
    category: 'image',
    capabilities: ['text-to-image'],
    badge: 'Премиум',
    sortOrder: 9,
  },
  {
    replicateId: 'ideogram-ai/ideogram-v3-turbo',
    name: 'Ideogram v3 Turbo',
    provider: 'Ideogram',
    providerColor: '#E040FB',
    description: 'Най-бързият Ideogram v3. Реализъм с максимална скорост.',
    category: 'image',
    capabilities: ['text-to-image'],
    badge: 'Бързо',
    sortOrder: 10,
  },
  {
    replicateId: 'ideogram-ai/ideogram-v3-balanced',
    name: 'Ideogram v3 Balanced',
    provider: 'Ideogram',
    providerColor: '#E040FB',
    description: 'Балансиран модел между скорост, качество и цена.',
    category: 'image',
    capabilities: ['text-to-image'],
    sortOrder: 11,
  },
];
