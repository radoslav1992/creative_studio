'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { InputSchema, SchemaProperty } from '@/lib/types';
import {
  PARAM_LABELS,
  PARAM_DESCRIPTIONS,
  ENUM_LABELS,
  HIDDEN_PARAMS,
  ADVANCED_PARAMS,
} from '@/lib/param-labels';
import { ImageUploader, MultiImageUploader } from './ImageUploader';
import { clsx } from 'clsx';

interface DynamicParameterControlsProps {
  schema: InputSchema;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

/**
 * Determines the UI control type from the OpenAPI schema property.
 */
function getControlType(
  key: string,
  prop: SchemaProperty
): 'select' | 'number' | 'boolean' | 'text' | 'textarea' | 'image' | 'images' | 'hidden' {
  // Hide internal params
  if (HIDDEN_PARAMS.has(key)) return 'hidden';

  // Boolean
  if (prop.type === 'boolean') return 'boolean';

  // Array of images (uri format)
  if (prop.type === 'array') return 'images';

  // Single image (string with uri format, or known image param names)
  const imageKeys = [
    'image', 'start_image', 'end_image', 'last_frame', 'mask',
    'input_reference', 'character_reference_image',
  ];
  if (imageKeys.includes(key)) return 'image';
  if (prop.type === 'string' && prop.format === 'uri') return 'image';

  // Enum → select
  if (prop.enum && prop.enum.length > 0) {
    // Skip resolution selects with 60+ options for Ideogram
    if (prop.enum.length > 20) return 'hidden';
    return 'select';
  }

  // Integer/number with bounded range → number slider
  if (
    (prop.type === 'integer' || prop.type === 'number') &&
    prop.minimum !== undefined &&
    prop.maximum !== undefined
  ) {
    return 'number';
  }

  // Integer/number without bounds — just a text input
  if (prop.type === 'integer' || prop.type === 'number') return 'number';

  // Long text fields (prompt, negative_prompt)
  if (key === 'prompt' || key === 'negative_prompt') return 'textarea';

  // Default: text input
  return 'text';
}

/**
 * Gets the Bulgarian label for a parameter.
 */
function getLabel(key: string, prop: SchemaProperty): string {
  return PARAM_LABELS[key] || prop.title || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Gets the Bulgarian description for a parameter.
 */
function getDescription(key: string, prop: SchemaProperty): string | undefined {
  return PARAM_DESCRIPTIONS[key] || prop.description;
}

/**
 * Gets the Bulgarian label for an enum value.
 */
function getEnumLabel(paramKey: string, value: string | number): string {
  const keyMap = ENUM_LABELS[paramKey];
  if (keyMap) {
    const label = keyMap[String(value)];
    if (label) return label;
  }
  return String(value);
}

/**
 * Determines if a property's enum values are numeric.
 */
function isNumericEnum(prop: SchemaProperty): boolean {
  if (!prop.enum) return false;
  return prop.enum.every((v) => typeof v === 'number');
}

// ============================================================
// Individual field renderers
// ============================================================

function SelectField({
  paramKey,
  prop,
  value,
  defaultValue,
  onChange,
}: {
  paramKey: string;
  prop: SchemaProperty;
  value: any;
  defaultValue: any;
  onChange: (val: any) => void;
}) {
  const label = getLabel(paramKey, prop);
  const description = getDescription(paramKey, prop);
  const required = false; // managed at schema level
  const currentVal = value ?? defaultValue;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="text-brand-400">*</span>}
      </label>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      <div className="flex flex-wrap gap-2">
        {prop.enum?.map((opt) => {
          const optStr = String(opt);
          return (
            <button
              key={optStr}
              onClick={() => onChange(isNumericEnum(prop) ? Number(opt) : optStr)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                String(currentVal) === optStr
                  ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                  : 'bg-surface-400 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/15'
              )}
            >
              {getEnumLabel(paramKey, opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberField({
  paramKey,
  prop,
  value,
  defaultValue,
  onChange,
}: {
  paramKey: string;
  prop: SchemaProperty;
  value: any;
  defaultValue: any;
  onChange: (val: any) => void;
}) {
  const label = getLabel(paramKey, prop);
  const description = getDescription(paramKey, prop);
  const hasRange = prop.minimum !== undefined && prop.maximum !== undefined;
  const currentVal = value ?? defaultValue ?? prop.minimum ?? 0;

  if (hasRange) {
    return (
      <div className="space-y-2">
        <label className="flex items-center justify-between text-sm font-medium text-zinc-300">
          <span>{label}</span>
          <span className="text-brand-400 font-mono text-sm">{currentVal}</span>
        </label>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
        <input
          type="range"
          min={prop.minimum}
          max={prop.maximum}
          step={prop.type === 'integer' ? 1 : 0.1}
          value={currentVal}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-surface-200 accent-brand-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>{prop.minimum}</span>
          <span>{prop.maximum}</span>
        </div>
      </div>
    );
  }

  // Simple number input without range
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      <input
        type="number"
        value={currentVal}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full px-3 py-2 rounded-lg bg-surface-400 border border-white/5 text-sm text-white focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
      />
    </div>
  );
}

function BooleanField({
  paramKey,
  prop,
  value,
  defaultValue,
  onChange,
}: {
  paramKey: string;
  prop: SchemaProperty;
  value: any;
  defaultValue: any;
  onChange: (val: any) => void;
}) {
  const label = getLabel(paramKey, prop);
  const description = getDescription(paramKey, prop);
  const currentVal = value ?? defaultValue ?? false;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <button
          onClick={() => onChange(!currentVal)}
          className={clsx(
            'relative w-11 h-6 rounded-full transition-colors',
            currentVal ? 'bg-brand-500' : 'bg-surface-200'
          )}
        >
          <div
            className={clsx(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              currentVal ? 'translate-x-[22px]' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
    </div>
  );
}

function TextField({
  paramKey,
  prop,
  value,
  onChange,
  isTextarea = false,
}: {
  paramKey: string;
  prop: SchemaProperty;
  value: any;
  onChange: (val: any) => void;
  isTextarea?: boolean;
}) {
  const label = getLabel(paramKey, prop);
  const description = getDescription(paramKey, prop);

  if (isTextarea) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={description}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-surface-400 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all leading-relaxed"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={description}
        className="w-full px-3 py-2 rounded-lg bg-surface-400 border border-white/5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
      />
    </div>
  );
}

function ImageField({
  paramKey,
  prop,
  value,
  required,
  onChange,
}: {
  paramKey: string;
  prop: SchemaProperty;
  value: any;
  required: boolean;
  onChange: (val: any) => void;
}) {
  const label = getLabel(paramKey, prop);
  const description = getDescription(paramKey, prop);

  return (
    <ImageUploader
      label={label}
      description={description}
      value={value ?? null}
      onChange={onChange}
      required={required}
    />
  );
}

function ImagesField({
  paramKey,
  prop,
  value,
  onChange,
}: {
  paramKey: string;
  prop: SchemaProperty;
  value: any;
  onChange: (val: any) => void;
}) {
  const label = getLabel(paramKey, prop);
  const description = getDescription(paramKey, prop);

  return (
    <MultiImageUploader
      label={label}
      description={description}
      maxImages={10}
      values={value ?? []}
      onChange={onChange}
    />
  );
}

// ============================================================
// Main component
// ============================================================

export function DynamicParameterControls({
  schema,
  values,
  onChange,
}: DynamicParameterControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const properties = schema.properties ?? {};
  const requiredFields = new Set(schema.required ?? []);

  // Separate params into main and advanced
  const mainParams: [string, SchemaProperty][] = [];
  const advancedParams: [string, SchemaProperty][] = [];

  for (const [key, prop] of Object.entries(properties)) {
    if (key === 'prompt') continue; // Handled separately in the studio
    const controlType = getControlType(key, prop);
    if (controlType === 'hidden') continue;

    if (ADVANCED_PARAMS.has(key)) {
      advancedParams.push([key, prop]);
    } else {
      mainParams.push([key, prop]);
    }
  }

  const renderField = (key: string, prop: SchemaProperty) => {
    const controlType = getControlType(key, prop);
    const isRequired = requiredFields.has(key);

    switch (controlType) {
      case 'select':
        return (
          <SelectField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            defaultValue={prop.default}
            onChange={(val) => onChange(key, val)}
          />
        );
      case 'number':
        return (
          <NumberField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            defaultValue={prop.default}
            onChange={(val) => onChange(key, val)}
          />
        );
      case 'boolean':
        return (
          <BooleanField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            defaultValue={prop.default}
            onChange={(val) => onChange(key, val)}
          />
        );
      case 'textarea':
        return (
          <TextField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            onChange={(val) => onChange(key, val)}
            isTextarea
          />
        );
      case 'image':
        return (
          <ImageField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            required={isRequired}
            onChange={(val) => onChange(key, val)}
          />
        );
      case 'images':
        return (
          <ImagesField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            onChange={(val) => onChange(key, val)}
          />
        );
      case 'text':
        return (
          <TextField
            key={key}
            paramKey={key}
            prop={prop}
            value={values[key]}
            onChange={(val) => onChange(key, val)}
          />
        );
      default:
        return null;
    }
  };

  if (mainParams.length === 0 && advancedParams.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Main parameters */}
      {mainParams.map(([key, prop]) => renderField(key, prop))}

      {/* Advanced parameters (collapsible) */}
      {advancedParams.length > 0 && (
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Допълнителни настройки ({advancedParams.length})
          </button>
          {showAdvanced && (
            <div className="mt-4 space-y-5 animate-fade-in">
              {advancedParams.map(([key, prop]) => renderField(key, prop))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
