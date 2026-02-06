'use client';

import { DynamicModel } from '@/lib/types';
import { clsx } from 'clsx';
import { Check, Zap, Crown, Star, Pencil, Users, Loader2 } from 'lucide-react';

interface DynamicModelSelectorProps {
  models: DynamicModel[];
  isLoading: boolean;
  selectedModelId: string | null;
  onSelect: (model: DynamicModel) => void;
}

function getBadgeIcon(badge?: string | null) {
  if (!badge) return null;
  if (badge.includes('Бързо')) return <Zap className="w-3 h-3" />;
  if (badge.includes('Премиум')) return <Crown className="w-3 h-3" />;
  if (badge.includes('Популярен') || badge.includes('Топ')) return <Star className="w-3 h-3" />;
  if (badge.includes('Редактиране')) return <Pencil className="w-3 h-3" />;
  if (badge.includes('Персонажи')) return <Users className="w-3 h-3" />;
  return <Zap className="w-3 h-3" />;
}

function getBadgeColor(badge?: string | null) {
  if (!badge) return '';
  if (badge.includes('Бързо')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (badge.includes('Премиум')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (badge.includes('Популярен') || badge.includes('Топ')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (badge.includes('Редактиране')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (badge.includes('Персонажи')) return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
  return 'bg-brand-500/20 text-brand-400 border-brand-500/30';
}

const CAPABILITY_LABELS: Record<string, string> = {
  'text-to-video': 'Текст → Видео',
  'image-to-video': 'Изображение → Видео',
  'text-to-image': 'Текст → Изображение',
  'image-editing': 'Редактиране',
  'character-consistency': 'Персонаж',
};

function groupByProvider(models: DynamicModel[]): Record<string, DynamicModel[]> {
  const groups: Record<string, DynamicModel[]> = {};
  for (const model of models) {
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
  }
  return groups;
}

export function DynamicModelSelector({
  models,
  isLoading,
  selectedModelId,
  onSelect,
}: DynamicModelSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        <span className="ml-3 text-sm text-zinc-400">Зареждане на модели...</span>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-zinc-500">Няма налични модели.</p>
        <p className="text-xs text-zinc-600 mt-1">
          Моля, синхронизирайте моделите от панела за администрация.
        </p>
      </div>
    );
  }

  const grouped = groupByProvider(models);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([provider, providerModels]) => (
        <div key={provider}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: providerModels[0].providerColor }}
            />
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {provider}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {providerModels.map((model) => {
              const isSelected = selectedModelId === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => onSelect(model)}
                  className={clsx(
                    'model-card relative text-left p-4 rounded-xl border transition-all duration-200',
                    isSelected
                      ? 'selected bg-surface-300 border-brand-500'
                      : 'bg-surface-400 border-white/5 hover:border-white/15'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {model.badge && (
                    <div
                      className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border mb-2',
                        getBadgeColor(model.badge)
                      )}
                    >
                      {getBadgeIcon(model.badge)}
                      {model.badge}
                    </div>
                  )}

                  <h4 className="text-sm font-semibold text-white mb-1">
                    {model.name}
                  </h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500"
                      >
                        {CAPABILITY_LABELS[cap] || cap}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
