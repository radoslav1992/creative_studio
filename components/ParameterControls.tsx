'use client';

import { ModelParam } from '@/lib/types';
import { ImageUploader, MultiImageUploader } from './ImageUploader';
import { clsx } from 'clsx';

interface ParameterControlsProps {
  params: ModelParam[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function ParameterControls({ params, values, onChange }: ParameterControlsProps) {
  // Filter out prompt - it's handled separately
  const nonPromptParams = params.filter((p) => p.key !== 'prompt');

  if (nonPromptParams.length === 0) return null;

  return (
    <div className="space-y-5">
      {nonPromptParams.map((param) => (
        <ParameterField
          key={param.key}
          param={param}
          value={values[param.key]}
          onChange={(val) => onChange(param.key, val)}
        />
      ))}
    </div>
  );
}

interface ParameterFieldProps {
  param: ModelParam;
  value: any;
  onChange: (value: any) => void;
}

function ParameterField({ param, value, onChange }: ParameterFieldProps) {
  switch (param.type) {
    case 'select':
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
            {param.label}
            {param.required && <span className="text-brand-400">*</span>}
          </label>
          {param.description && (
            <p className="text-xs text-zinc-500">{param.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {param.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  (value ?? param.default) === opt.value
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                    : 'bg-surface-400 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/15'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-medium text-zinc-300">
            <span className="flex items-center gap-1.5">
              {param.label}
              {param.required && <span className="text-brand-400">*</span>}
            </span>
            <span className="text-brand-400 font-mono text-sm">
              {value ?? param.default}
            </span>
          </label>
          {param.description && (
            <p className="text-xs text-zinc-500">{param.description}</p>
          )}
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={value ?? param.default}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-surface-200 accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>{param.min}</span>
            <span>{param.max}</span>
          </div>
        </div>
      );

    case 'boolean':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              {param.label}
            </label>
            <button
              onClick={() => onChange(!(value ?? param.default))}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                (value ?? param.default) ? 'bg-brand-500' : 'bg-surface-200'
              )}
            >
              <div
                className={clsx(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  (value ?? param.default) ? 'translate-x-[22px]' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
          {param.description && (
            <p className="text-xs text-zinc-500">{param.description}</p>
          )}
        </div>
      );

    case 'text':
      return (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
            {param.label}
            {param.required && <span className="text-brand-400">*</span>}
          </label>
          {param.description && (
            <p className="text-xs text-zinc-500">{param.description}</p>
          )}
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={param.placeholder}
            className="w-full px-3 py-2 rounded-lg bg-surface-400 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
      );

    case 'image':
      return (
        <ImageUploader
          label={param.label}
          description={param.description}
          value={value ?? null}
          onChange={onChange}
          required={param.required}
        />
      );

    case 'images':
      return (
        <MultiImageUploader
          label={param.label}
          description={param.description}
          maxImages={param.maxImages ?? 3}
          values={value ?? []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}
