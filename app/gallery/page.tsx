'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Video, Image as ImageIcon, Filter } from 'lucide-react';
import { useStore } from '@/lib/store';
import { GenerationResult } from '@/components/GenerationResult';
import { StudioLayout } from '@/components/StudioLayout';
import { clsx } from 'clsx';

type FilterType = 'all' | 'video' | 'image';

export default function GalleryPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const { generations, loadGenerations, isLoaded } = useStore();

  // Load generations from DB on mount
  useEffect(() => {
    if (!isLoaded) {
      loadGenerations();
    }
  }, [isLoaded, loadGenerations]);

  const filteredGenerations =
    filter === 'all'
      ? generations
      : generations.filter((g) => g.category === filter);

  const successfulGenerations = filteredGenerations.filter(
    (g) => g.status === 'succeeded'
  );
  const processingGenerations = filteredGenerations.filter(
    (g) => g.status === 'starting' || g.status === 'processing'
  );
  const failedGenerations = filteredGenerations.filter(
    (g) => g.status === 'failed'
  );

  return (
    <StudioLayout
      title="Галерия"
      subtitle="Всички ваши генерирани творби на едно място"
      icon={<LayoutGrid className="w-5 h-5 text-brand-400" />}
    >
      {/* Filters */}
      <div className="flex items-center gap-3 mb-8">
        <Filter className="w-4 h-4 text-zinc-500" />
        <div className="flex items-center gap-2">
          {[
            { value: 'all' as FilterType, label: 'Всички', icon: LayoutGrid },
            { value: 'video' as FilterType, label: 'Видео', icon: Video },
            { value: 'image' as FilterType, label: 'Изображения', icon: ImageIcon },
          ].map((item) => {
            const Icon = item.icon;
            const count =
              item.value === 'all'
                ? generations.length
                : generations.filter((g) => g.category === item.value).length;

            return (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filter === item.value
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-surface-400 text-zinc-400 border border-white/5 hover:border-white/15'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-surface-500 border border-white/5">
          <div className="text-2xl font-bold text-white">{successfulGenerations.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Успешни</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-500 border border-white/5">
          <div className="text-2xl font-bold text-brand-400">{processingGenerations.length}</div>
          <div className="text-xs text-zinc-500 mt-1">В обработка</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-500 border border-white/5">
          <div className="text-2xl font-bold text-red-400">{failedGenerations.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Неуспешни</div>
        </div>
      </div>

      {/* Results */}
      {filteredGenerations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-400 border border-white/5 flex items-center justify-center mb-6">
            <LayoutGrid className="w-9 h-9 text-zinc-600" />
          </div>
          <p className="text-lg text-zinc-400 mb-2">Галерията е празна</p>
          <p className="text-sm text-zinc-600 max-w-sm">
            Генерирайте видеа или изображения в студиата, за да ги видите тук.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGenerations.map((gen) => (
            <GenerationResult key={gen.id} generation={gen} />
          ))}
        </div>
      )}
    </StudioLayout>
  );
}
