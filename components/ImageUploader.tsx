'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploaderProps {
  label: string;
  description?: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  required?: boolean;
}

export function ImageUploader({
  label,
  description,
  value,
  onChange,
  required,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
        {label}
        {required && <span className="text-brand-500">*</span>}
      </label>
      {description && (
        <p className="text-xs font-medium text-ink-muted">{description}</p>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-ink bg-white shadow-brutal-sm">
          <img
            src={value}
            alt="Качено изображение"
            className="w-full h-40 object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white border-2 border-ink flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-peach-100 hover:text-peach-500 shadow-brutal-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={clsx(
            'flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-ink/30 bg-cream-100 hover:border-ink hover:bg-cream-200'
          )}
        >
          <input {...getInputProps()} />
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-ink flex items-center justify-center mb-3 shadow-brutal-sm">
            {isDragging ? (
              <Upload className="w-5 h-5 text-brand-500" />
            ) : (
              <ImageIcon className="w-5 h-5 text-ink-muted" />
            )}
          </div>
          <p className="text-sm font-bold text-ink-muted text-center">
            {isDragging
              ? 'Пуснете тук...'
              : 'Плъзнете или щракнете за качване'}
          </p>
          <p className="text-xs font-medium text-ink-faint mt-1">PNG, JPG, WEBP</p>
        </div>
      )}
    </div>
  );
}

interface MultiImageUploaderProps {
  label: string;
  description?: string;
  maxImages: number;
  values: string[];
  onChange: (dataUrls: string[]) => void;
}

export function MultiImageUploader({
  label,
  description,
  maxImages,
  values,
  onChange,
}: MultiImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      const remaining = maxImages - values.length;
      const files = acceptedFiles.slice(0, remaining);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          onChange([...values, reader.result as string].slice(0, maxImages));
        };
        reader.readAsDataURL(file);
      });
    },
    [values, maxImages, onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: maxImages - values.length,
    multiple: true,
    disabled: values.length >= maxImages,
  });

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-bold text-ink">
        {label}
      </label>
      {description && (
        <p className="text-xs font-medium text-ink-muted">{description}</p>
      )}

      {/* Existing images */}
      {values.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {values.map((url, i) => (
            <div
              key={i}
              className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-ink shadow-brutal-sm"
            >
              <img
                src={url}
                alt={`Изображение ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-lg bg-white border border-ink flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-peach-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {values.length < maxImages && (
        <div
          {...getRootProps()}
          className={clsx(
            'flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-ink/30 bg-cream-100 hover:border-ink'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-4 h-4 text-ink-muted mb-1" />
          <p className="text-xs font-bold text-ink-muted">
            {values.length}/{maxImages} изображения
          </p>
        </div>
      )}
    </div>
  );
}
