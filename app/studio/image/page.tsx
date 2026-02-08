'use client';

import { useState, useCallback, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { DynamicModel, Generation } from '@/lib/types';
import { useModels } from '@/lib/use-models';
import { DynamicModelSelector } from '@/components/DynamicModelSelector';
import { DynamicParameterControls } from '@/components/DynamicParameterControls';
import { GenerationResult } from '@/components/GenerationResult';
import { StudioLayout } from '@/components/StudioLayout';
import { PromptEnhancer } from '@/components/PromptEnhancer';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

export default function ImageStudioPage() {
  const { models, isLoading: modelsLoading } = useModels('image');
  const [selectedModel, setSelectedModel] = useState<DynamicModel | null>(null);
  const [prompt, setPrompt] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const { generations, addGeneration, updateGeneration, loadGenerations, isLoaded } = useStore();
  const imageGenerations = generations.filter((g) => g.category === 'image');

  useEffect(() => {
    if (!isLoaded) {
      loadGenerations();
    }
  }, [isLoaded, loadGenerations]);

  const handleModelSelect = useCallback((model: DynamicModel) => {
    setSelectedModel(model);
    const defaults: Record<string, any> = {};
    const props = model.inputSchema?.properties ?? {};
    for (const [key, prop] of Object.entries(props)) {
      if (key === 'prompt') continue;
      if (prop.default !== undefined) {
        defaults[key] = prop.default;
      }
    }
    setParamValues(defaults);
  }, []);

  const handleParamChange = useCallback((key: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = async () => {
    if (!selectedModel) {
      toast.error('Моля, изберете модел');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Моля, въведете промпт');
      return;
    }

    // Check required params from schema
    const required = new Set(selectedModel.inputSchema?.required ?? []);
    for (const key of required) {
      if (key === 'prompt') continue;
      const val = paramValues[key];
      if (val === undefined || val === null || val === '') {
        const label = key.replace(/_/g, ' ');
        toast.error(`Моля, попълнете: ${label}`);
        return;
      }
    }

    setIsGenerating(true);

    try {
      const createRes = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel.replicateId,
          modelName: selectedModel.name,
          prompt: prompt.trim(),
          category: 'image',
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error || 'Грешка при създаване на генерация');
      }

      const dbGeneration = await createRes.json();

      const generation: Generation = {
        id: dbGeneration.id,
        modelId: selectedModel.replicateId,
        modelName: selectedModel.name,
        prompt: prompt.trim(),
        status: 'starting',
        createdAt: dbGeneration.createdAt,
        category: 'image',
      };

      addGeneration(generation);
      toast('Генерирането е стартирано', {
        description: `Модел: ${selectedModel.name}`,
      });

      // Build API input from schema + values
      const input: Record<string, any> = {
        prompt: prompt.trim(),
      };

      const props = selectedModel.inputSchema?.properties ?? {};
      for (const [key, schemaProp] of Object.entries(props)) {
        if (key === 'prompt') continue;
        const val = paramValues[key] ?? schemaProp.default;
        if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
          input[key] = val;
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.replicateId,
          input,
          generationId: dbGeneration.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Грешка при генерирането');
      }

      updateGeneration(dbGeneration.id, { status: 'processing', replicateId: data.id });
      pollForResult(dbGeneration.id, data.id);
    } catch (error: any) {
      toast.error('Грешка при генерирането', {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const pollForResult = async (generationId: string, predictionId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/status/${predictionId}`);
        const data = await response.json();

        if (data.status === 'succeeded') {
          const output = data.output;
          updateGeneration(generationId, {
            status: 'succeeded',
            output: typeof output === 'string' ? output : Array.isArray(output) ? output : undefined,
          });
          toast.success('Изображението е готово!');
          return;
        }

        if (data.status === 'failed' || data.status === 'canceled') {
          updateGeneration(generationId, {
            status: data.status,
            error: data.error,
          });
          if (data.status === 'failed') {
            toast.error('Генерирането не успя', { description: data.error });
          }
          return;
        }

        setTimeout(poll, 2000);
      } catch {
        setTimeout(poll, 4000);
      }
    };

    poll();
  };

  const hasEditingCapability = selectedModel?.capabilities.includes('image-editing');
  const hasCharacterCapability = selectedModel?.capabilities.includes('character-consistency');
  const hasAnyImageParam = selectedModel?.inputSchema?.properties
    ? Object.keys(selectedModel.inputSchema.properties).some((k) =>
        ['image', 'image_input', 'input_images', 'character_reference_image'].includes(k) && paramValues[k]
      )
    : false;

  const promptDescription = selectedModel?.inputSchema?.properties?.prompt?.description;

  return (
    <StudioLayout
      title="Изображения Студио"
      subtitle="Създавайте и редактирайте изображения с AI"
      icon={<ImageIcon className="w-5 h-5 text-brand-600" />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,480px] gap-6">
        {/* Left: Model selection + Generation */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-extrabold text-ink mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              Изберете модел
            </h2>
            <DynamicModelSelector
              models={models}
              isLoading={modelsLoading}
              selectedModelId={selectedModel?.id ?? null}
              onSelect={handleModelSelect}
            />
          </section>

          {selectedModel && (
            <section className="animate-fade-in space-y-6">
              {/* Mode indicator for editing models */}
              {(hasEditingCapability || hasCharacterCapability) && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-50 border-2 border-brand-300">
                  <Wand2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-brand-700">
                    {hasCharacterCapability
                      ? 'Този модел поддържа създаване на последователни персонажи. Качете референтно изображение.'
                      : 'Този модел поддържа редактиране на изображения. Качете изображение, за да го редактирате, или оставете празно за ново генериране.'}
                  </p>
                </div>
              )}

              {/* Prompt */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                    <Wand2 className="w-4 h-4 text-brand-500" />
                    Промпт
                    <span className="text-brand-500">*</span>
                  </label>
                  <PromptEnhancer
                    prompt={prompt}
                    category="image"
                    onEnhanced={setPrompt}
                    disabled={isGenerating}
                  />
                </div>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Опишете изображението, което искате да създадете..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500 focus:shadow-brutal-brand-sm transition-all leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-bold text-ink-faint">
                    {prompt.length} символа
                  </div>
                </div>
                {promptDescription && (
                  <p className="text-xs font-medium text-ink-muted">{promptDescription}</p>
                )}
              </div>

              {/* Dynamic Parameters from schema */}
              {selectedModel.inputSchema && (
                <div className="p-5 rounded-xl bg-white border-2 border-ink shadow-brutal-sm space-y-5">
                  <h3 className="text-sm font-extrabold text-ink">Настройки</h3>
                  <DynamicParameterControls
                    schema={selectedModel.inputSchema}
                    values={paramValues}
                    onChange={handleParamChange}
                  />
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="nb-btn w-full py-3.5 rounded-xl bg-brand-500 border-2 border-ink text-white font-bold text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-brutal flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Генериране...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {hasEditingCapability && hasAnyImageParam
                      ? 'Редактирай изображение'
                      : 'Генерирай изображение'}
                  </>
                )}
              </button>
            </section>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-ink flex items-center gap-2">
            Резултати
            {imageGenerations.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold border-2 border-brand-300">
                {imageGenerations.length}
              </span>
            )}
          </h2>

          {imageGenerations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-ink shadow-brutal flex items-center justify-center mb-4">
                <ImageIcon className="w-7 h-7 text-ink-muted" />
              </div>
              <p className="text-sm font-bold text-ink-muted mb-1">Все още няма генерирани изображения</p>
              <p className="text-xs font-medium text-ink-faint">Изберете модел и въведете промпт, за да започнете</p>
            </div>
          ) : (
            <div className="space-y-4">
              {imageGenerations.map((gen) => (
                <GenerationResult key={gen.id} generation={gen} />
              ))}
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
