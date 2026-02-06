export type ModelCategory = 'video' | 'image';
export type ModelCapability = 'text-to-video' | 'image-to-video' | 'text-to-image' | 'image-editing' | 'character-consistency';

// ============== Dynamic model (from DB / API) ==============

/**
 * A single property from the Replicate OpenAPI schema.
 * This is the raw schema — the UI renderer translates it to controls.
 */
export interface SchemaProperty {
  type?: string;        // "string" | "integer" | "boolean" | "array" | "number"
  enum?: (string | number)[];
  default?: any;
  description?: string;
  minimum?: number;
  maximum?: number;
  format?: string;      // "uri" for image URLs
  title?: string;
  // For arrays
  items?: { type?: string; format?: string };
}

/**
 * The cached input schema for a model.
 */
export interface InputSchema {
  properties: Record<string, SchemaProperty>;
  required: string[];
}

/**
 * A model as returned by /api/models — DB record with parsed JSON.
 */
export interface DynamicModel {
  id: string;
  replicateId: string;
  name: string;
  provider: string;
  providerColor: string;
  description: string;
  category: ModelCategory;
  capabilities: ModelCapability[];
  badge?: string | null;
  inputSchema: InputSchema;
  lastSyncedAt?: string | null;
}

// ============== Legacy static model (kept for backward compat) ==============

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

// ============== Generations ==============

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
  replicateId?: string;
}

export interface StoreState {
  generations: Generation[];
  isLoaded: boolean;
  loadGenerations: (category?: 'video' | 'image') => Promise<void>;
  addGeneration: (gen: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  removeGeneration: (id: string) => void;
}
