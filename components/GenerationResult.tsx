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
      icon: <Loader2 className="w-4 h-4 animate-spin text-blue-400" />,
      label: 'Стартиране...',
      color: 'text-blue-400',
    },
    processing: {
      icon: <Loader2 className="w-4 h-4 animate-spin text-brand-400" />,
      label: 'Обработка...',
      color: 'text-brand-400',
    },
    succeeded: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      label: 'Завършено',
      color: 'text-emerald-400',
    },
    failed: {
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      label: 'Грешка',
      color: 'text-red-400',
    },
    canceled: {
      icon: <XCircle className="w-4 h-4 text-zinc-400" />,
      label: 'Отменено',
      color: 'text-zinc-400',
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
        'result-card rounded-xl border overflow-hidden animate-fade-in',
        isLoading
          ? 'border-brand-500/30 bg-surface-400'
          : generation.status === 'succeeded'
          ? 'border-white/5 bg-surface-400'
          : 'border-white/5 bg-surface-400'
      )}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="aspect-video flex items-center justify-center bg-surface-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
            <p className="text-sm text-zinc-400">Генериране с {generation.modelName}...</p>
            <p className="text-xs text-zinc-600">Това може да отнеме няколко минути</p>
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
                className="w-full aspect-video bg-black"
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
        <div className="aspect-video flex items-center justify-center bg-surface-500">
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <XCircle className="w-12 h-12 text-red-400/50" />
            <p className="text-sm text-red-400">Генерирането не успя</p>
            {generation.error && (
              <p className="text-xs text-zinc-500 max-w-sm">{generation.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 space-y-3">
        {/* Status bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={clsx('text-xs font-medium', status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] text-zinc-600">
              {new Date(generation.createdAt).toLocaleTimeString('bg-BG')}
            </span>
          </div>
        </div>

        {/* Model name */}
        <div className="text-xs text-zinc-500">{generation.modelName}</div>

        {/* Prompt */}
        <p className="text-sm text-zinc-300 line-clamp-2">{generation.prompt}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {generation.status === 'succeeded' && outputs.length > 0 && (
            <>
              <a
                href={outputs[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-medium hover:bg-brand-500/30 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Отвори
              </a>
              <a
                href={outputs[0]}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                <Download className="w-3 h-3" />
                Изтегли
              </a>
            </>
          )}
          <button
            onClick={() => removeGeneration(generation.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-zinc-500 text-xs font-medium hover:bg-red-500/20 hover:text-red-400 transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            Изтрий
          </button>
        </div>
      </div>
    </div>
  );
}
