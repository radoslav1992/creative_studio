'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Video,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  LayoutGrid,
  Plus,
  TrendingUp,
  Film,
  Palette,
} from 'lucide-react';
import { Generation } from '@/lib/types';
import { clsx } from 'clsx';

interface DashboardStats {
  total: number;
  succeeded: number;
  failed: number;
  processing: number;
  videos: number;
  images: number;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-500 border border-white/5">
      <div className="flex items-center gap-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function RecentGenerationCard({ gen }: { gen: Generation }) {
  const isVideo = gen.category === 'video';
  const outputs: string[] = gen.output
    ? Array.isArray(gen.output) ? gen.output : [gen.output]
    : [];
  const thumbnail = outputs[0];
  const isProcessing = gen.status === 'starting' || gen.status === 'processing';

  return (
    <div className="group relative rounded-xl border border-white/5 bg-surface-500 overflow-hidden hover:border-white/10 transition-all">
      {/* Thumbnail / Preview */}
      <div className="aspect-video bg-surface-600 relative">
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <span className="text-xs text-zinc-500">Обработка...</span>
            </div>
          </div>
        )}
        {gen.status === 'succeeded' && thumbnail && (
          isVideo ? (
            <video
              src={thumbnail}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            <img
              src={thumbnail}
              alt={gen.prompt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )
        )}
        {gen.status === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400/50" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span
            className={clsx(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm',
              isVideo
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            )}
          >
            {isVideo ? <Film className="w-3 h-3" /> : <Palette className="w-3 h-3" />}
            {isVideo ? 'Видео' : 'Изображение'}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {gen.status === 'succeeded' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
          {isProcessing && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30 backdrop-blur-sm animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
            </span>
          )}
          {gen.status === 'failed' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">
              <XCircle className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm text-zinc-300 line-clamp-2 leading-snug">{gen.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-600">{gen.modelName}</span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Clock className="w-3 h-3" />
            {new Date(gen.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data: session } = useSession();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, succeeded: 0, failed: 0, processing: 0, videos: 0, images: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/generations?limit=12')
      .then((r) => r.json())
      .then((data) => {
        const gens: Generation[] = data.generations || [];
        setGenerations(gens);
        setStats({
          total: data.total || gens.length,
          succeeded: gens.filter((g: Generation) => g.status === 'succeeded').length,
          failed: gens.filter((g: Generation) => g.status === 'failed').length,
          processing: gens.filter((g: Generation) => g.status === 'starting' || g.status === 'processing').length,
          videos: gens.filter((g: Generation) => g.category === 'video').length,
          images: gens.filter((g: Generation) => g.category === 'image').length,
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'потребител';

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Здравейте, {firstName}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Ето какво се случва в студиото ви
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/studio/video"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 transition-all shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              Ново видео
            </Link>
            <Link
              href="/studio/image"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-400 border border-white/5 text-zinc-300 text-sm font-medium hover:bg-surface-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ново изображение
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-brand-400" />}
            label="Общо генерации"
            value={stats.total}
            color="bg-brand-500/10"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            label="Успешни"
            value={stats.succeeded}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<Loader2 className="w-5 h-5 text-blue-400" />}
            label="В обработка"
            value={stats.processing}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-red-400" />}
            label="Неуспешни"
            value={stats.failed}
            color="bg-red-500/10"
          />
          <StatCard
            icon={<Video className="w-5 h-5 text-blue-400" />}
            label="Видеа"
            value={stats.videos}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<ImageIcon className="w-5 h-5 text-emerald-400" />}
            label="Изображения"
            value={stats.images}
            color="bg-emerald-500/10"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/studio/video"
            className="group flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-700/5 border border-blue-500/10 hover:border-blue-500/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-0.5">Видео Студио</h3>
              <p className="text-xs text-zinc-500">
                Създавайте видеа с Veo 3, Sora 2 Pro, Kling и други
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/studio/image"
            className="group flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-700/5 border border-emerald-500/10 hover:border-emerald-500/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-0.5">Изображения Студио</h3>
              <p className="text-xs text-zinc-500">
                Генерирайте с Imagen 4, GPT Image, Ideogram и други
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Recent generations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-500" />
              Последни генерации
            </h2>
            {generations.length > 0 && (
              <Link
                href="/gallery"
                className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Виж всички
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-500 border border-white/5 flex items-center justify-center mb-5">
                <Sparkles className="w-9 h-9 text-zinc-700" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Все още няма генерации
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mb-6">
                Създайте първото си видео или изображение с AI, за да го видите тук.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/studio/video"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 transition-all"
                >
                  <Video className="w-4 h-4" />
                  Създай видео
                </Link>
                <Link
                  href="/studio/image"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-400 border border-white/5 text-zinc-300 text-sm font-medium hover:bg-surface-300 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Създай изображение
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {generations.map((gen) => (
                <RecentGenerationCard key={gen.id} gen={gen} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
