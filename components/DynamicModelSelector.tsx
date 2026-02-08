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
  if (badge.includes('Бързо')) return 'bg-mint-200 text-ink border-ink';
  if (badge.includes('Премиум')) return 'bg-sunny-200 text-ink border-ink';
  if (badge.includes('Популярен') || badge.includes('Топ')) return 'bg-sky-200 text-ink border-ink';
  if (badge.includes('Редактиране')) return 'bg-brand-100 text-ink border-ink';
  if (badge.includes('Персонажи')) return 'bg-rose-200 text-ink border-ink';
  return 'bg-brand-100 text-ink border-ink';
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
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        <span className="ml-3 text-sm font-bold text-ink-muted">Зареждане на модели...</span>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-bold text-ink-muted">Няма налични модели.</p>
        <p className="text-xs font-medium text-ink-faint mt-1">
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
              className="w-3 h-3 rounded-full border-2 border-ink"
              style={{ backgroundColor: providerModels[0].providerColor }}
            />
            <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider">
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
                    'model-card relative text-left p-4 rounded-xl border-2 transition-all duration-150',
                    isSelected
                      ? 'selected bg-brand-50 border-brand-500 shadow-brutal-brand-sm'
                      : 'bg-white border-ink shadow-brutal-sm hover:bg-cream-100'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-brand-500 border-2 border-ink flex items-center justify-center shadow-brutal-sm">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {model.badge && (
                    <div
                      className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border-2 mb-2',
                        getBadgeColor(model.badge)
                      )}
                    >
                      {getBadgeIcon(model.badge)}
                      {model.badge}
                    </div>
                  )}

                  <h4 className="text-sm font-extrabold text-ink mb-1">
                    {model.name}
                  </h4>
                  <p className="text-xs font-medium text-ink-muted line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[9px] px-2 py-0.5 rounded-lg bg-cream-200 text-ink-muted font-bold border border-ink/10"
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
