'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  X,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Video,
  Image,
  ArrowLeft,
  ExternalLink,
  Layers,
  Download,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminModel {
  id: string;
  replicateId: string;
  name: string;
  provider: string;
  providerColor: string;
  description: string;
  category: string;
  capabilities: string[];
  badge: string | null;
  inputSchema: any;
  isActive: boolean;
  lastSyncedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface FetchedModelInfo {
  replicateId: string;
  name: string;
  owner: string;
  description: string;
  provider: string;
  category: string;
  capabilities: string[];
  inputSchema: any;
  paramCount: number;
  runCount: number;
  coverImageUrl: string | null;
}

type Toast = { id: number; type: 'success' | 'error'; message: string };

// ─── Toast System ───────────────────────────────────────────────────────────

let toastId = 0;

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-ink shadow-brutal-sm text-sm font-bold animate-in slide-in-from-right-5',
            t.type === 'success'
              ? 'bg-mint-100 text-ink'
              : 'bg-peach-100 text-ink'
          )}
        >
          {t.type === 'success' ? (
            <Check className="w-4 h-4 flex-shrink-0 text-mint-500" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-peach-500" />
          )}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Capability Labels ──────────────────────────────────────────────────────

const CAPABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'text-to-video', label: 'Текст → Видео' },
  { value: 'image-to-video', label: 'Изображение → Видео' },
  { value: 'text-to-image', label: 'Текст → Изображение' },
  { value: 'image-editing', label: 'Редактиране' },
  { value: 'character-consistency', label: 'Консистентност' },
  { value: 'style-reference', label: 'Стил референция' },
];

// ─── Add Model Dialog ───────────────────────────────────────────────────────

function AddModelDialog({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (model: AdminModel) => void;
}) {
  const [step, setStep] = useState<'input' | 'preview' | 'saving'>('input');
  const [replicateIdInput, setReplicateIdInput] = useState('');
  const [fetchedInfo, setFetchedInfo] = useState<FetchedModelInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  // Editable fields
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [providerColor, setProviderColor] = useState('#888888');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'video' | 'image'>('image');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [badge, setBadge] = useState('');

  const reset = () => {
    setStep('input');
    setReplicateIdInput('');
    setFetchedInfo(null);
    setIsFetching(false);
    setError('');
    setName('');
    setProvider('');
    setProviderColor('#888888');
    setDescription('');
    setCategory('image');
    setCapabilities([]);
    setBadge('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFetch = async () => {
    const rid = replicateIdInput.trim();
    let replicateId = rid;
    const urlMatch = rid.match(/replicate\.com\/([^/]+\/[^/\s?#]+)/);
    if (urlMatch) {
      replicateId = urlMatch[1];
    }

    if (!replicateId.includes('/')) {
      setError('Формат: owner/model-name или URL от Replicate');
      return;
    }

    setError('');
    setIsFetching(true);

    try {
      const res = await fetch('/api/admin/models/fetch-schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicateId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Грешка при извличане');
        setIsFetching(false);
        return;
      }

      setFetchedInfo(data);
      setName(data.name);
      setProvider(data.provider);
      setDescription(data.description);
      setCategory(data.category);
      setCapabilities(data.capabilities);
      setStep('preview');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if (!fetchedInfo) return;
    setStep('saving');

    try {
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replicateId: fetchedInfo.replicateId,
          name,
          provider,
          providerColor,
          description,
          category,
          capabilities,
          badge: badge || null,
          inputSchema: fetchedInfo.inputSchema,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Грешка при запазване');
        setStep('preview');
        return;
      }

      onAdd(data);
      handleClose();
    } catch (e: any) {
      setError(e.message);
      setStep('preview');
    }
  };

  const toggleCapability = (cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border-2 border-ink shadow-brutal-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink">
          <h2 className="text-lg font-black text-ink">
            {step === 'input' && 'Добавяне на нов модел'}
            {step === 'preview' && 'Настройки на модел'}
            {step === 'saving' && 'Запазване...'}
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Step 1: Enter Replicate ID */}
          {step === 'input' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink">
                  Replicate модел ID или URL
                </label>
                <p className="text-xs font-medium text-ink-muted">
                  Въведете ID (напр. <code className="text-brand-600 font-bold bg-brand-50 px-1 rounded">google/veo-3</code>) или
                  пълен URL от Replicate
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replicateIdInput}
                    onChange={(e) => setReplicateIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                    placeholder="owner/model-name или https://replicate.com/..."
                    className="flex-1 px-3 py-2.5 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500 focus:shadow-brutal-brand-sm"
                  />
                  <button
                    onClick={handleFetch}
                    disabled={isFetching || !replicateIdInput.trim()}
                    className="nb-btn px-4 py-2.5 rounded-xl bg-brand-500 border-2 border-ink text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-brutal-sm"
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Извличане
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-peach-100 border-2 border-ink">
                  <AlertCircle className="w-4 h-4 text-peach-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-ink">{error}</span>
                </div>
              )}
            </>
          )}

          {/* Step 2: Preview & Edit */}
          {step === 'preview' && fetchedInfo && (
            <>
              {/* Summary banner */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 border-2 border-brand-300">
                <Download className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-sm font-bold text-ink">
                    Извлечен: <span className="text-brand-600">{fetchedInfo.replicateId}</span>
                  </p>
                  <p className="text-xs font-medium text-ink-muted">
                    {fetchedInfo.paramCount} параметъра · {fetchedInfo.runCount?.toLocaleString()} изпълнения
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-peach-100 border-2 border-ink">
                  <AlertCircle className="w-4 h-4 text-peach-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-ink">{error}</span>
                </div>
              )}

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-muted">Име на модела</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-muted">Доставчик</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-muted">Категория</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCategory('video')}
                      className={clsx(
                        'nb-btn flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors border-2',
                        category === 'video'
                          ? 'bg-sky-100 text-ink border-ink shadow-brutal-sm'
                          : 'bg-cream-100 text-ink-muted border-ink/20 hover:text-ink'
                      )}
                    >
                      <Video className="w-4 h-4" /> Видео
                    </button>
                    <button
                      onClick={() => setCategory('image')}
                      className={clsx(
                        'nb-btn flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors border-2',
                        category === 'image'
                          ? 'bg-mint-100 text-ink border-ink shadow-brutal-sm'
                          : 'bg-cream-100 text-ink-muted border-ink/20 hover:text-ink'
                      )}
                    >
                      <Image className="w-4 h-4" /> Изображение
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-muted">Цвят на доставчик</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={providerColor}
                      onChange={(e) => setProviderColor(e.target.value)}
                      className="w-10 h-9 rounded-lg cursor-pointer bg-transparent border-2 border-ink"
                    />
                    <input
                      type="text"
                      value={providerColor}
                      onChange={(e) => setProviderColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-muted">Описание (БГ)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-muted">Възможности</label>
                <div className="flex flex-wrap gap-2">
                  {CAPABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleCapability(opt.value)}
                      className={clsx(
                        'nb-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border-2',
                        capabilities.includes(opt.value)
                          ? 'bg-brand-100 text-brand-700 border-brand-500 shadow-brutal-brand-sm'
                          : 'bg-cream-100 text-ink-muted border-ink/20 hover:text-ink'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-muted">Значка (опционално)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Напр. Нов, Популярен, Бърз..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Schema preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink-muted">
                  Параметри от схемата ({fetchedInfo.paramCount})
                </label>
                <div className="max-h-40 overflow-y-auto rounded-xl bg-cream-200 border-2 border-ink p-3 space-y-1">
                  {Object.entries(fetchedInfo.inputSchema.properties).map(([key, prop]: [string, any]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-brand-600">{key}</span>
                      <span className="text-ink-faint">—</span>
                      <span className="font-medium text-ink-muted">
                        {prop.type || 'string'}
                        {prop.enum && ` [${prop.enum.length} опции]`}
                      </span>
                      {fetchedInfo.inputSchema.required.includes(key) && (
                        <span className="px-1.5 py-0.5 bg-sunny-200 text-ink rounded-lg text-[10px] font-bold border border-ink/20">
                          задължителен
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Saving state */}
          {step === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-sm font-bold text-ink-muted">Запазване на модела...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-t-2 border-ink">
            <button
              onClick={() => setStep('input')}
              className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors"
            >
              Назад
            </button>
            <button
              onClick={handleSave}
              disabled={!name}
              className="nb-btn px-5 py-2.5 rounded-xl bg-brand-500 border-2 border-ink text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-brutal-sm"
            >
              <Plus className="w-4 h-4" />
              Добави модел
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Edit Model Dialog ──────────────────────────────────────────────────────

function EditModelDialog({
  model,
  onClose,
  onSave,
}: {
  model: AdminModel;
  onClose: () => void;
  onSave: (updated: AdminModel) => void;
}) {
  const [name, setName] = useState(model.name);
  const [provider, setProvider] = useState(model.provider);
  const [providerColor, setProviderColor] = useState(model.providerColor);
  const [description, setDescription] = useState(model.description);
  const [category, setCategory] = useState<'video' | 'image'>(model.category as any);
  const [capabilities, setCapabilities] = useState<string[]>(model.capabilities);
  const [badge, setBadge] = useState(model.badge || '');
  const [sortOrder, setSortOrder] = useState(model.sortOrder);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleCapability = (cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          provider,
          providerColor,
          description,
          category,
          capabilities,
          badge: badge || null,
          sortOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Грешка при запазване');
        setSaving(false);
        return;
      }
      onSave(data);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border-2 border-ink shadow-brutal-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink">
          <h2 className="text-lg font-black text-ink">
            Редактиране: {model.name}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cream-200 border-2 border-ink/10">
            <span className="text-xs font-bold text-ink-muted">Replicate ID:</span>
            <span className="text-xs font-mono font-bold text-brand-600">{model.replicateId}</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-peach-100 border-2 border-ink">
              <AlertCircle className="w-4 h-4 text-peach-500 flex-shrink-0" />
              <span className="text-sm font-bold text-ink">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted">Име на модела</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted">Доставчик</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted">Категория</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCategory('video')}
                  className={clsx(
                    'nb-btn flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors border-2',
                    category === 'video'
                      ? 'bg-sky-100 text-ink border-ink shadow-brutal-sm'
                      : 'bg-cream-100 text-ink-muted border-ink/20 hover:text-ink'
                  )}
                >
                  <Video className="w-4 h-4" /> Видео
                </button>
                <button
                  onClick={() => setCategory('image')}
                  className={clsx(
                    'nb-btn flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors border-2',
                    category === 'image'
                      ? 'bg-mint-100 text-ink border-ink shadow-brutal-sm'
                      : 'bg-cream-100 text-ink-muted border-ink/20 hover:text-ink'
                  )}
                >
                  <Image className="w-4 h-4" /> Изображение
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted">Цвят на доставчик</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={providerColor}
                  onChange={(e) => setProviderColor(e.target.value)}
                  className="w-10 h-9 rounded-lg cursor-pointer bg-transparent border-2 border-ink"
                />
                <input
                  type="text"
                  value={providerColor}
                  onChange={(e) => setProviderColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-muted">Описание (БГ)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-muted">Възможности</label>
            <div className="flex flex-wrap gap-2">
              {CAPABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleCapability(opt.value)}
                  className={clsx(
                    'nb-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border-2',
                    capabilities.includes(opt.value)
                      ? 'bg-brand-100 text-brand-700 border-brand-500 shadow-brutal-brand-sm'
                      : 'bg-cream-100 text-ink-muted border-ink/20 hover:text-ink'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted">Значка</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Напр. Нов, Популярен..."
                className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-muted">Подредба</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-ink">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors"
          >
            Отказ
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="nb-btn px-5 py-2.5 rounded-xl bg-brand-500 border-2 border-ink text-white text-sm font-bold hover:bg-brand-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-brutal-sm"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Запази промените
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Dialog ──────────────────────────────────────────────────

function ConfirmDeleteDialog({
  model,
  onClose,
  onConfirm,
}: {
  model: AdminModel;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white border-2 border-ink shadow-brutal-lg">
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-peach-100 border-2 border-ink flex items-center justify-center shadow-brutal-sm">
              <Trash2 className="w-5 h-5 text-peach-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-ink">Изтриване на модел</h3>
              <p className="text-xs font-bold text-ink-muted">Това действие не може да бъде отменено</p>
            </div>
          </div>

          <p className="text-sm font-medium text-ink">
            Сигурни ли сте, че искате да изтриете <strong className="font-bold">{model.name}</strong>{' '}
            (<code className="text-brand-600 text-xs font-bold bg-brand-50 px-1 rounded">{model.replicateId}</code>)?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t-2 border-ink">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm font-bold text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors"
          >
            Отказ
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="nb-btn px-4 py-2 rounded-xl bg-peach-500 border-2 border-ink text-white text-sm font-bold hover:bg-peach-400 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-brutal-sm"
          >
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Изтрий
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────────────────

export default function AdminModelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [models, setModels] = useState<AdminModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all');
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editModel, setEditModel] = useState<AdminModel | null>(null);
  const [deleteModel, setDeleteModel] = useState<AdminModel | null>(null);

  // Syncing
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [syncingAll, setSyncingAll] = useState(false);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/models');
      const data = await res.json();
      setModels(data);
    } catch (e) {
      addToast('error', 'Грешка при зареждане на моделите');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const isAdmin = (session?.user as any)?.role === 'admin';

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const filteredModels = models.filter((m) => {
    if (filter !== 'all' && m.category !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(s) ||
        m.replicateId.toLowerCase().includes(s) ||
        m.provider.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const videoCount = models.filter((m) => m.category === 'video').length;
  const imageCount = models.filter((m) => m.category === 'image').length;

  // Toggle active/inactive
  const toggleActive = async (model: AdminModel) => {
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !model.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setModels((prev) => prev.map((m) => (m.id === model.id ? updated : m)));
        addToast('success', `${model.name} ${!model.isActive ? 'активиран' : 'деактивиран'}`);
      }
    } catch {
      addToast('error', 'Грешка при промяна на статуса');
    }
  };

  // Sync single model
  const syncModel = async (model: AdminModel) => {
    setSyncingIds((prev) => new Set([...prev, model.id]));
    try {
      const res = await fetch(`/api/admin/models/${model.id}/sync`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setModels((prev) => prev.map((m) => (m.id === model.id ? updated : m)));
        addToast('success', `Схемата на ${model.name} е обновена`);
      } else {
        const data = await res.json();
        addToast('error', data.error || 'Грешка при синхронизиране');
      }
    } catch {
      addToast('error', 'Грешка при синхронизиране');
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(model.id);
        return next;
      });
    }
  };

  // Sync all models
  const syncAllModels = async () => {
    setSyncingAll(true);
    let success = 0;
    let errors = 0;
    for (const model of models) {
      setSyncingIds((prev) => new Set([...prev, model.id]));
      try {
        const res = await fetch(`/api/admin/models/${model.id}/sync`, { method: 'POST' });
        if (res.ok) {
          const updated = await res.json();
          setModels((prev) => prev.map((m) => (m.id === model.id ? updated : m)));
          success++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      } finally {
        setSyncingIds((prev) => {
          const next = new Set(prev);
          next.delete(model.id);
          return next;
        });
      }
    }
    setSyncingAll(false);
    addToast('success', `Синхронизирани: ${success}, грешки: ${errors}`);
  };

  // Delete model
  const handleDelete = async () => {
    if (!deleteModel) return;
    try {
      const res = await fetch(`/api/admin/models/${deleteModel.id}`, { method: 'DELETE' });
      if (res.ok) {
        setModels((prev) => prev.filter((m) => m.id !== deleteModel.id));
        addToast('success', `${deleteModel.name} изтрит`);
      } else {
        addToast('error', 'Грешка при изтриване');
      }
    } catch {
      addToast('error', 'Грешка при изтриване');
    }
    setDeleteModel(null);
  };

  // Handle model added
  const handleModelAdded = (model: AdminModel) => {
    setModels((prev) => [...prev, model]);
    addToast('success', `${model.name} добавен успешно`);
  };

  // Handle model edited
  const handleModelEdited = (updated: AdminModel) => {
    setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditModel(null);
    addToast('success', `${updated.name} обновен`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream-100">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (status === 'authenticated' && !isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-peach-100 border-2 border-ink shadow-brutal flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-peach-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">Достъпът е ограничен</h2>
            <p className="text-sm font-medium text-ink-muted mt-1">
              Нямате администраторски права за тази страница.
            </p>
          </div>
          <Link
            href="/"
            className="nb-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-ink text-sm font-bold text-ink hover:bg-cream-200 transition-colors shadow-brutal-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Към началото
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="flex-1 overflow-y-auto bg-cream-100">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-white border-2 border-transparent hover:border-ink transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-ink">Админ панел — Модели</h1>
                <p className="text-sm font-bold text-ink-muted mt-0.5">
                  Управлявайте AI моделите · {videoCount} видео · {imageCount} изображения
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={syncAllModels}
                disabled={syncingAll}
                className="nb-btn px-4 py-2.5 rounded-xl text-sm font-bold text-ink bg-white border-2 border-ink hover:bg-cream-200 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-brutal-sm"
              >
                <RefreshCw className={clsx('w-4 h-4', syncingAll && 'animate-spin')} />
                Синхронизирай всички
              </button>
              <button
                onClick={() => setShowAddDialog(true)}
                className="nb-btn px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-500 border-2 border-ink hover:bg-brand-600 transition-all flex items-center gap-2 shadow-brutal-sm"
              >
                <Plus className="w-4 h-4" />
                Добави модел
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl border-2 border-ink p-1 shadow-brutal-sm">
              {[
                { key: 'all' as const, label: 'Всички', count: models.length },
                { key: 'video' as const, label: 'Видео', count: videoCount },
                { key: 'image' as const, label: 'Изображения', count: imageCount },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={clsx(
                    'px-4 py-1.5 rounded-lg text-sm font-bold transition-colors',
                    filter === f.key
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-ink-muted hover:text-ink'
                  )}
                >
                  {f.label}
                  <span className="ml-1.5 text-[10px] opacity-60">({f.count})</span>
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Търсене..."
                className="pl-9 pr-3 py-2 rounded-xl bg-white border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500 w-64 shadow-brutal-sm"
              />
            </div>
          </div>

          {/* Model List */}
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-ink shadow-brutal flex items-center justify-center">
                <Layers className="w-8 h-8 text-ink-muted" />
              </div>
              <p className="font-bold text-ink-muted">
                {search ? 'Няма намерени модели' : 'Няма добавени модели'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredModels.map((model) => {
                const paramCount = model.inputSchema?.properties
                  ? Object.keys(model.inputSchema.properties).length
                  : 0;
                const isSyncing = syncingIds.has(model.id);

                return (
                  <div
                    key={model.id}
                    className={clsx(
                      'group flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all',
                      model.isActive
                        ? 'bg-white border-ink shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal'
                        : 'bg-cream-200 border-ink/30 opacity-60 hover:opacity-80'
                    )}
                  >
                    {/* Category icon */}
                    <div
                      className="w-9 h-9 rounded-lg border-2 border-ink flex items-center justify-center flex-shrink-0 shadow-brutal-sm"
                      style={{ backgroundColor: `${model.providerColor}20` }}
                    >
                      {model.category === 'video' ? (
                        <Video className="w-4 h-4" style={{ color: model.providerColor }} />
                      ) : (
                        <Image className="w-4 h-4" style={{ color: model.providerColor }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-ink truncate">{model.name}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-lg font-bold border"
                          style={{
                            backgroundColor: `${model.providerColor}15`,
                            color: model.providerColor,
                            borderColor: `${model.providerColor}40`,
                          }}
                        >
                          {model.provider}
                        </span>
                        {model.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-sunny-100 text-ink font-bold border border-sunny-300">
                            {model.badge}
                          </span>
                        )}
                        {!model.isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-cream-300 text-ink-muted font-bold border border-ink/10">
                            Неактивен
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-ink-faint font-mono font-bold">{model.replicateId}</span>
                        <span className="text-xs text-ink-faint">·</span>
                        <span className="text-xs font-bold text-ink-muted">{paramCount} параметъра</span>
                        {model.lastSyncedAt && (
                          <>
                            <span className="text-xs text-ink-faint">·</span>
                            <span className="text-xs font-bold text-ink-muted">
                              Синхр. {new Date(model.lastSyncedAt).toLocaleDateString('bg-BG')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="hidden lg:flex items-center gap-1">
                      {model.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-cream-200 text-ink-muted font-bold border border-ink/10"
                        >
                          {CAPABILITY_OPTIONS.find((o) => o.value === cap)?.label || cap}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => syncModel(model)}
                        disabled={isSyncing}
                        title="Синхронизирай схемата"
                        className="p-2 rounded-lg text-ink-muted hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50 border border-transparent hover:border-brand-300"
                      >
                        <RefreshCw className={clsx('w-4 h-4', isSyncing && 'animate-spin')} />
                      </button>
                      <button
                        onClick={() => toggleActive(model)}
                        title={model.isActive ? 'Деактивирай' : 'Активирай'}
                        className="p-2 rounded-lg text-ink-muted hover:text-sunny-500 hover:bg-sunny-100 transition-colors border border-transparent hover:border-sunny-300"
                      >
                        {model.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditModel(model)}
                        title="Редактирай"
                        className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors border border-transparent hover:border-ink/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://replicate.com/${model.replicateId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Отвори в Replicate"
                        className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-200 transition-colors border border-transparent hover:border-ink/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setDeleteModel(model)}
                        title="Изтрий"
                        className="p-2 rounded-lg text-ink-muted hover:text-peach-500 hover:bg-peach-100 transition-colors border border-transparent hover:border-peach-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddModelDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleModelAdded}
      />

      {editModel && (
        <EditModelDialog
          model={editModel}
          onClose={() => setEditModel(null)}
          onSave={handleModelEdited}
        />
      )}

      {deleteModel && (
        <ConfirmDeleteDialog
          model={deleteModel}
          onClose={() => setDeleteModel(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
