'use client';

import { useState, useCallback, useEffect } from 'react';
import { Video, Sparkles, Wand2 } from 'lucide-react';
import { videoModels } from '@/lib/models';
import { ModelConfig, Generation } from '@/lib/types';
import { ModelSelector } from '@/components/ModelSelector';
import { ParameterControls } from '@/components/ParameterControls';
import { GenerationResult } from '@/components/GenerationResult';
import { StudioLayout } from '@/components/StudioLayout';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

export default function VideoStudioPage() {
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const { generations, addGeneration, updateGeneration, loadGenerations, isLoaded } = useStore();
  const videoGenerations = generations.filter((g) => g.category === 'video');

  // Load generations from DB on mount
  useEffect(() => {
    if (!isLoaded) {
      loadGenerations();
    }
  }, [isLoaded, loadGenerations]);

  const handleModelSelect = useCallback((model: ModelConfig) => {
    setSelectedModel(model);
    // Reset params with defaults
    const defaults: Record<string, any> = {};
    model.params.forEach((p) => {
      if (p.default !== undefined) {
        defaults[p.key] = p.default;
      }
    });
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

    setIsGenerating(true);

    try {
      // Create generation in DB first
      const createRes = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          prompt: prompt.trim(),
          category: 'video',
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error || 'Грешка при създаване на генерация');
      }

      const dbGeneration = await createRes.json();

      const generation: Generation = {
        id: dbGeneration.id,
        modelId: selectedModel.id,
        modelName: selectedModel.name,
        prompt: prompt.trim(),
        status: 'starting',
        createdAt: dbGeneration.createdAt,
        category: 'video',
      };

      addGeneration(generation);
      toast('Генерирането е стартирано', {
        description: `Модел: ${selectedModel.name}`,
      });

      const input: Record<string, any> = {
        prompt: prompt.trim(),
      };

      // Add non-prompt params
      selectedModel.params.forEach((param) => {
        if (param.key === 'prompt') return;
        const val = paramValues[param.key] ?? param.default;
        if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
          if (param.type === 'number' || param.sendAsNumber) {
            input[param.key] = Number(val);
          } else {
            input[param.key] = val;
          }
        }
      });

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

      // Start polling for result
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
          toast.success('Видеото е готово!');
          return;
        }

        if (data.status === 'failed' || data.status === 'canceled') {
          updateGeneration(generationId, {
            status: data.status,
            error: data.error,
          });
          if (data.status === 'failed') {
            toast.error('Генерирането не успя');
          }
          return;
        }

        // Still processing, poll again
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  return (
    <StudioLayout
      title="Видео Студио"
      subtitle="Създавайте невероятни видеа с AI модели"
      icon={<Video className="w-5 h-5 text-brand-400" />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,420px] gap-6">
        {/* Left: Model selection + Generation */}
        <div className="space-y-6">
          {/* Model Selector */}
          <section>
            <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Изберете модел
            </h2>
            <ModelSelector
              models={videoModels}
              selectedModelId={selectedModel?.id ?? null}
              onSelect={handleModelSelect}
            />
          </section>

          {/* Prompt + Controls */}
          {selectedModel && (
            <section className="animate-fade-in space-y-6">
              {/* Prompt */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-zinc-300">
                  <Wand2 className="w-4 h-4 text-brand-400" />
                  Промпт
                  <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      selectedModel.params.find((p) => p.key === 'prompt')?.placeholder ??
                      'Опишете видеото, което искате да създадете...'
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-surface-400 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-zinc-600">
                    {prompt.length} символа
                  </div>
                </div>
                {selectedModel.params.find((p) => p.key === 'prompt')?.description && (
                  <p className="text-xs text-zinc-500">
                    {selectedModel.params.find((p) => p.key === 'prompt')?.description}
                  </p>
                )}
              </div>

              {/* Parameters */}
              <div className="p-5 rounded-xl bg-surface-500 border border-white/5 space-y-5">
                <h3 className="text-sm font-semibold text-zinc-300">Настройки</h3>
                <ParameterControls
                  params={selectedModel.params}
                  values={paramValues}
                  onChange={handleParamChange}
                />
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Генериране...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Генерирай видео
                  </>
                )}
              </button>
            </section>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            Резултати
            {videoGenerations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 text-xs">
                {videoGenerations.length}
              </span>
            )}
          </h2>

          {videoGenerations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-400 border border-white/5 flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 mb-1">Все още няма генерирани видеа</p>
              <p className="text-xs text-zinc-600">Изберете модел и въведете промпт, за да започнете</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videoGenerations.map((gen) => (
                <GenerationResult key={gen.id} generation={gen} />
              ))}
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
