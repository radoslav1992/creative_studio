/**
 * Bulgarian translations for Replicate API parameter names and enum values.
 * Used by the dynamic parameter renderer to display human-readable labels.
 */

/** Map of parameter key → Bulgarian label */
export const PARAM_LABELS: Record<string, string> = {
  // Common
  prompt: 'Промпт',
  seed: 'Случайно семе',
  negative_prompt: 'Негативен промпт',

  // Video
  duration: 'Продължителност (секунди)',
  seconds: 'Продължителност (секунди)',
  aspect_ratio: 'Съотношение',
  resolution: 'Резолюция',
  generate_audio: 'Генериране на аудио',
  image: 'Начален кадър',
  start_image: 'Начално изображение',
  end_image: 'Краен кадър',
  last_frame: 'Краен кадър',
  reference_images: 'Референтни изображения',
  input_reference: 'Начално изображение',
  mode: 'Режим',

  // Image
  output_format: 'Формат',
  safety_filter_level: 'Филтър за безопасност',
  image_input: 'Входни изображения',
  input_images: 'Входни изображения',
  quality: 'Качество',
  background: 'Фон',
  number_of_images: 'Брой изображения',
  output_compression: 'Компресия',
  input_fidelity: 'Точност на вход',
  moderation: 'Модерация',
  user_id: 'Потребителски ID',
  openai_api_key: 'OpenAI API ключ',

  // Ideogram
  style_type: 'Тип стил',
  style_preset: 'Стилов шаблон',
  rendering_speed: 'Скорост на рендериране',
  magic_prompt_option: 'Магически промпт',
  character_reference_image: 'Референтно изображение на персонаж',
  style_reference_images: 'Референция за стил',
  mask: 'Маска',
};

/** Map of parameter key → Bulgarian description/help text */
export const PARAM_DESCRIPTIONS: Record<string, string> = {
  prompt: 'Текстово описание на това, което искате да създадете.',
  negative_prompt: 'Какво НЕ искате да се появява в резултата.',
  seed: 'Фиксирана стойност за възпроизводимост. Оставете празно за случаен резултат.',
  image: 'Качете изображение като начален кадър.',
  start_image: 'Качете начално изображение за видеото.',
  end_image: 'Качете изображение като краен кадър.',
  last_frame: 'Качете изображение като краен кадър за плавен преход.',
  reference_images: 'Качете референтни изображения за стил и последователност.',
  input_reference: 'Качете изображение като първи кадър на видеото.',
  generate_audio: 'Включва автоматично генериране на синхронизирано аудио.',
  image_input: 'Качете изображения за трансформиране или референция.',
  input_images: 'Качете изображения за редактиране.',
  character_reference_image: 'Качете ясна снимка на персонажа, който искате да запазите.',
  style_reference_images: 'Качете изображения като референция за стил.',
  mask: 'Черно-бяло изображение. Черните пиксели се редактират.',
  magic_prompt_option: 'Автоматично подобряване на промпта от Ideogram.',
  safety_filter_level: 'Ниво на филтриране на нежелано съдържание.',
  background: 'Определя дали фонът е прозрачен или плътен.',
  quality: 'По-високо качество = по-бавно генериране.',
  output_format: 'Формат на изходния файл.',
};

/** Map of enum value → Bulgarian label, keyed by "paramKey.enumValue" */
export const ENUM_LABELS: Record<string, Record<string, string>> = {
  aspect_ratio: {
    '16:9': '16:9 (Пейзаж)',
    '9:16': '9:16 (Портрет)',
    '1:1': '1:1 (Квадрат)',
    '4:3': '4:3',
    '3:4': '3:4',
    '3:2': '3:2',
    '2:3': '2:3',
    '4:5': '4:5',
    '5:4': '5:4',
    '21:9': '21:9 (Ултра широк)',
    '1:3': '1:3',
    '3:1': '3:1',
    '1:2': '1:2',
    '2:1': '2:1',
    '10:16': '10:16',
    '16:10': '16:10',
    portrait: 'Портрет (720×1280)',
    landscape: 'Пейзаж (1280×720)',
    match_input_image: 'Като входното изображение',
  },
  duration: {
    '4': '4 секунди',
    '5': '5 секунди',
    '6': '6 секунди',
    '7': '7 секунди',
    '8': '8 секунди',
    '10': '10 секунди',
  },
  seconds: {
    '4': '4 секунди',
    '8': '8 секунди',
    '12': '12 секунди',
  },
  resolution: {
    '720p': '720p',
    '1080p': '1080p',
    standard: 'Стандартна (720p)',
    high: 'Висока (1024p)',
    '1K': '1K',
    '2K': '2K',
    '4K': '4K',
    None: 'Автоматично',
  },
  mode: {
    standard: 'Стандартен (720p)',
    pro: 'Професионален (1080p)',
  },
  quality: {
    auto: 'Автоматично',
    high: 'Високо',
    medium: 'Средно',
    low: 'Ниско',
  },
  background: {
    auto: 'Автоматично',
    transparent: 'Прозрачен',
    opaque: 'Плътен',
  },
  output_format: {
    jpg: 'JPG',
    png: 'PNG',
    jpeg: 'JPEG',
    webp: 'WebP',
  },
  safety_filter_level: {
    block_low_and_above: 'Строг',
    block_medium_and_above: 'Среден',
    block_only_high: 'Минимален',
  },
  style_type: {
    None: 'Без',
    Auto: 'Автоматичен',
    General: 'Общ',
    Realistic: 'Реалистичен',
    Design: 'Дизайн',
    Fiction: 'Фикция',
  },
  rendering_speed: {
    Default: 'По подразбиране',
    Turbo: 'Турбо',
    Quality: 'Качество',
  },
  magic_prompt_option: {
    Auto: 'Автоматично',
    On: 'Включен',
    Off: 'Изключен',
  },
  moderation: {
    auto: 'Автоматично',
    low: 'Ниско',
  },
  input_fidelity: {
    low: 'Ниска',
    high: 'Висока',
  },
};

/**
 * Parameters to hide from the UI (internal / rarely needed).
 */
export const HIDDEN_PARAMS: Set<string> = new Set([
  'openai_api_key',
  'user_id',
]);

/**
 * Parameters that should be shown as optional/advanced (collapsed by default).
 */
export const ADVANCED_PARAMS: Set<string> = new Set([
  'seed',
  'output_format',
  'output_compression',
  'safety_filter_level',
  'moderation',
  'input_fidelity',
  'style_preset',
  'resolution', // for ideogram models with 60+ resolution options
]);
