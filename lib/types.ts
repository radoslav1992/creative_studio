export type ModelCategory = 'video' | 'image';
export type ModelCapability = 'text-to-video' | 'image-to-video' | 'text-to-image' | 'image-editing' | 'character-consistency';

export interface ModelParam {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'image' | 'images' | 'boolean';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  maxImages?: number;
  /** When true, select string values that look numeric will be sent as integers to the API */
  sendAsNumber?: boolean;
}

export interface ModelConfig {
  id: string;
  replicateId: string;
  name: string;
  provider: string;
  providerColor: string;
  description: string;
  category: ModelCategory;
  capabilities: ModelCapability[];
  params: ModelParam[];
  badge?: string;
}

export interface Generation {
  id: string;
  modelId: string;
  modelName: string;
  prompt: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  createdAt: string;
  category: ModelCategory;
}

export interface StoreState {
  generations: Generation[];
  addGeneration: (gen: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  removeGeneration: (id: string) => void;
}
