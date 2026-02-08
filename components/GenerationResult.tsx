'use client';

import { Generation } from '@/lib/types';
import { clsx } from 'clsx';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface GenerationResultProps {
  generation: Generation;
}

export function GenerationResult({ generation }: GenerationResultProps) {
  const removeGeneration = useStore((s) => s.removeGeneration);

  const statusInfo = {
    starting: {
      icon: <Loader2 className="w-4 h-4 animate-spin text-sky-500" />,
      label: 'Стартиране...',
      color: 'text-sky-600',
      bgColor: 'bg-sky-100',
    },
    processing: {
      icon: <Loader2 className="w-4 h-4 animate-spin text-brand-500" />,
      label: 'Обработка...',
      color: 'text-brand-600',
      bgColor: 'bg-brand-100',
    },
    succeeded: {
      icon: <CheckCircle2 className="w-4 h-4 text-mint-500" />,
      label: 'Завършено',
      color: 'text-mint-500',
      bgColor: 'bg-mint-100',
    },
    failed: {
      icon: <XCircle className="w-4 h-4 text-peach-500" />,
      label: 'Грешка',
      color: 'text-peach-500',
      bgColor: 'bg-peach-100',
    },
    canceled: {
      icon: <XCircle className="w-4 h-4 text-ink-muted" />,
      label: 'Отменено',
      color: 'text-ink-muted',
      bgColor: 'bg-cream-200',
    },
  };

  const status = statusInfo[generation.status];
  const isLoading = generation.status === 'starting' || generation.status === 'processing';

  // Get output URLs
  const outputs: string[] = [];
  if (generation.output) {
    if (Array.isArray(generation.output)) {
      outputs.push(...generation.output);
    } else {
      outputs.push(generation.output);
    }
  }

  return (
    <div
      className={clsx(
        'result-card rounded-xl border-2 border-ink overflow-hidden animate-fade-in bg-white',
        isLoading ? 'shadow-brutal-brand-sm' : 'shadow-brutal-sm'
      )}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="aspect-video flex items-center justify-center bg-cream-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full border-3 border-brand-200 border-t-brand-500 animate-spin" />
            <p className="text-sm font-bold text-ink">Генериране с {generation.modelName}...</p>
            <p className="text-xs font-medium text-ink-muted">Това може да отнеме няколко минути</p>
          </div>
        </div>
      )}

      {/* Success - show outputs */}
      {generation.status === 'succeeded' && outputs.length > 0 && (
        <div>
          {outputs.map((url, i) => {
            const isVideo =
              url.endsWith('.mp4') ||
              url.endsWith('.webm') ||
              url.includes('video') ||
              generation.category === 'video';

            return isVideo ? (
              <video
                key={i}
                src={url}
                controls
                className="w-full aspect-video bg-ink"
                preload="metadata"
              />
            ) : (
              <img
                key={i}
                src={url}
                alt={`Резултат ${i + 1}`}
                className="w-full object-cover"
                loading="lazy"
              />
            );
          })}
        </div>
      )}

      {/* Error state */}
      {generation.status === 'failed' && (
        <div className="aspect-video flex items-center justify-center bg-peach-100">
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <XCircle className="w-12 h-12 text-peach-500" />
            <p className="text-sm font-bold text-ink">Генерирането не успя</p>
            {generation.error && (
              <p className="text-xs font-medium text-ink-muted max-w-sm">{generation.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 space-y-3 border-t-2 border-ink">
        {/* Status bar */}
        <div className="flex items-center justify-between">
          <div className={clsx('flex items-center gap-2 px-2.5 py-1 rounded-lg border-2 border-ink', status.bgColor)}>
            {status.icon}
            <span className={clsx('text-xs font-bold', status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-ink-faint" />
            <span className="text-[10px] font-bold text-ink-faint">
              {new Date(generation.createdAt).toLocaleTimeString('bg-BG')}
            </span>
          </div>
        </div>

        {/* Model name */}
        <div className="text-xs font-bold text-ink-muted">{generation.modelName}</div>

        {/* Prompt */}
        <p className="text-sm font-medium text-ink line-clamp-2">{generation.prompt}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {generation.status === 'succeeded' && outputs.length > 0 && (
            <>
              <a
                href={outputs[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-100 border-2 border-ink text-ink text-xs font-bold hover:bg-brand-200 transition-colors shadow-brutal-sm"
              >
                <ExternalLink className="w-3 h-3" />
                Отвори
              </a>
              <a
                href={outputs[0]}
                download
                className="nb-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border-2 border-ink text-ink text-xs font-bold hover:bg-cream-200 transition-colors shadow-brutal-sm"
              >
                <Download className="w-3 h-3" />
                Изтегли
              </a>
            </>
          )}
          <button
            onClick={() => removeGeneration(generation.id)}
            className="nb-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border-2 border-ink text-ink-muted text-xs font-bold hover:bg-peach-100 hover:text-peach-500 transition-colors shadow-brutal-sm ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            Изтрий
          </button>
        </div>
      </div>
    </div>
  );
}
