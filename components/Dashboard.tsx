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
  bgColor,
  shadowColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  shadowColor: string;
}) {
  return (
    <div className={clsx('p-4 rounded-xl bg-white border-2 border-ink transition-all', shadowColor)}>
      <div className="flex items-center gap-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border-2 border-ink', bgColor)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-ink">{value}</p>
          <p className="text-xs font-bold text-ink-muted">{label}</p>
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
    <div className="group relative rounded-xl border-2 border-ink bg-white overflow-hidden shadow-brutal-sm hover:shadow-brutal transition-all hover:-translate-y-0.5">
      {/* Thumbnail / Preview */}
      <div className="aspect-video bg-cream-200 relative">
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <span className="text-xs font-bold text-ink-muted">Обработка...</span>
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
            <XCircle className="w-8 h-8 text-peach-500" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border-2 border-ink',
              isVideo
                ? 'bg-sky-200 text-ink'
                : 'bg-mint-200 text-ink'
            )}
          >
            {isVideo ? <Film className="w-3 h-3" /> : <Palette className="w-3 h-3" />}
            {isVideo ? 'Видео' : 'Изображение'}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {gen.status === 'succeeded' && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-mint-300 border-2 border-ink text-ink">
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
          {isProcessing && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-sunny-200 border-2 border-ink text-ink animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
            </span>
          )}
          {gen.status === 'failed' && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-peach-200 border-2 border-ink text-ink">
              <XCircle className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5 border-t-2 border-ink">
        <p className="text-sm font-bold text-ink line-clamp-2 leading-snug">{gen.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-ink-muted">{gen.modelName}</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-ink-faint">
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
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-ink">
              Здравейте, {firstName}
            </h1>
            <p className="text-sm font-medium text-ink-muted mt-1">
              Ето какво се случва в студиото ви
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/studio/video"
              className="nb-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 border-2 border-ink text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-brutal-sm"
            >
              <Plus className="w-4 h-4" />
              Ново видео
            </Link>
            <Link
              href="/studio/image"
              className="nb-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-ink text-ink text-sm font-bold hover:bg-cream-200 transition-colors shadow-brutal-sm"
            >
              <Plus className="w-4 h-4" />
              Ново изображение
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-brand-600" />}
            label="Общо генерации"
            value={stats.total}
            bgColor="bg-brand-100"
            shadowColor="shadow-brutal-sm"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-mint-500" />}
            label="Успешни"
            value={stats.succeeded}
            bgColor="bg-mint-100"
            shadowColor="shadow-brutal-sm"
          />
          <StatCard
            icon={<Loader2 className="w-5 h-5 text-sky-500" />}
            label="В обработка"
            value={stats.processing}
            bgColor="bg-sky-100"
            shadowColor="shadow-brutal-sm"
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-peach-500" />}
            label="Неуспешни"
            value={stats.failed}
            bgColor="bg-peach-100"
            shadowColor="shadow-brutal-sm"
          />
          <StatCard
            icon={<Video className="w-5 h-5 text-sky-500" />}
            label="Видеа"
            value={stats.videos}
            bgColor="bg-sky-100"
            shadowColor="shadow-brutal-sm"
          />
          <StatCard
            icon={<ImageIcon className="w-5 h-5 text-mint-500" />}
            label="Изображения"
            value={stats.images}
            bgColor="bg-mint-100"
            shadowColor="shadow-brutal-sm"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/studio/video"
            className="group flex items-center gap-4 p-5 rounded-xl bg-sky-100 border-2 border-ink shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-300 border-2 border-ink flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
              <Video className="w-6 h-6 text-ink" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-ink mb-0.5">Видео Студио</h3>
              <p className="text-xs font-medium text-ink-muted">
                Създавайте видеа с Veo 3, Sora 2 Pro, Kling и други
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-ink-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/studio/image"
            className="group flex items-center gap-4 p-5 rounded-xl bg-mint-100 border-2 border-ink shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-mint-300 border-2 border-ink flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
              <ImageIcon className="w-6 h-6 text-ink" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-ink mb-0.5">Изображения Студио</h3>
              <p className="text-xs font-medium text-ink-muted">
                Генерирайте с Imagen 4, GPT Image, Ideogram и други
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-ink-muted group-hover:text-ink group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Recent generations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
              <Clock className="w-5 h-5 text-ink-muted" />
              Последни генерации
            </h2>
            {generations.length > 0 && (
              <Link
                href="/gallery"
                className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Виж всички
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-ink shadow-brutal flex items-center justify-center mb-5">
                <Sparkles className="w-9 h-9 text-brand-400" />
              </div>
              <h3 className="text-base font-extrabold text-ink mb-2">
                Все още няма генерации
              </h3>
              <p className="text-sm font-medium text-ink-muted max-w-sm mb-6">
                Създайте първото си видео или изображение с AI, за да го видите тук.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/studio/video"
                  className="nb-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 border-2 border-ink text-white text-sm font-bold shadow-brutal-sm transition-all"
                >
                  <Video className="w-4 h-4" />
                  Създай видео
                </Link>
                <Link
                  href="/studio/image"
                  className="nb-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-ink text-ink text-sm font-bold shadow-brutal-sm transition-all"
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
