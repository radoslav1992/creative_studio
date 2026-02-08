'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Video,
  Image,
  ArrowRight,
  Sparkles,
  Zap,
  Film,
  Palette,
  Pencil,
  Users,
  Layers,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { DynamicModel } from '@/lib/types';
import { Dashboard } from '@/components/Dashboard';

const features = [
  {
    icon: <Film className="w-5 h-5" />,
    title: 'Видео Генерация',
    description: 'Създавайте кинематографични видеа от текст с Veo, Sora и Kling.',
    color: 'from-blue-500/20 to-blue-700/20 border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'Изображения',
    description: 'Генерирайте фотореалистични изображения с Imagen, GPT Image и Ideogram.',
    color: 'from-emerald-500/20 to-emerald-700/20 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: <Pencil className="w-5 h-5" />,
    title: 'Редактиране',
    description: 'Редактирайте изображения с AI — промяна на стил, добавяне на елементи, маскиране.',
    color: 'from-purple-500/20 to-purple-700/20 border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Персонажи',
    description: 'Поддържайте последователност на персонажите с Ideogram Character.',
    color: 'from-pink-500/20 to-pink-700/20 border-pink-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Начални Кадри',
    description: 'Използвайте изображения като начални кадри за видео генерация.',
    color: 'from-amber-500/20 to-amber-700/20 border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Бързо',
    description: 'Fast модели за бързо генериране, когато времето е важно.',
    color: 'from-cyan-500/20 to-cyan-700/20 border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
];

function LandingPage() {
  const [videoModels, setVideoModels] = useState<DynamicModel[]>([]);
  const [imageModels, setImageModels] = useState<DynamicModel[]>([]);

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: DynamicModel[]) => {
        setVideoModels(data.filter((m) => m.category === 'video'));
        setImageModels(data.filter((m) => m.category === 'image'));
      })
      .catch(() => {});
  }, []);

  const totalModels = videoModels.length + imageModels.length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/30 via-surface-700 to-surface-700" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Задвижвано от {totalModels > 0 ? totalModels : '21'} AI модела
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Създавайте с{' '}
            <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
              изкуствен интелект
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Генерирайте невероятни видеа и изображения с най-добрите AI модели.
            Veo, Sora, Kling, Imagen, GPT Image, Ideogram — всичко на едно място.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Регистрирайте се
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <LogIn className="w-5 h-5" />
              Влезте в акаунта си
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Възможности</h2>
          <p className="text-sm text-zinc-500">Всичко, от което се нуждаете за AI генериране</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`p-6 rounded-xl bg-gradient-to-br ${feature.color} border transition-all hover:scale-[1.02]`}
            >
              <div className={`w-10 h-10 rounded-lg bg-black/20 flex items-center justify-center mb-4 ${feature.iconColor}`}>
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Models Overview */}
      {(videoModels.length > 0 || imageModels.length > 0) && (
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Models */}
            <div className="p-6 rounded-xl bg-surface-500 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Видео Модели</h3>
                  <p className="text-xs text-zinc-500">{videoModels.length} модела</p>
                </div>
              </div>
              <div className="space-y-2">
                {videoModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-400 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: model.providerColor }} />
                      <span className="text-sm text-zinc-300">{model.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600">{model.provider}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Влезте за Видео Студио
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image Models */}
            <div className="p-6 rounded-xl bg-surface-500 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Image className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Изображения Модели</h3>
                  <p className="text-xs text-zinc-500">{imageModels.length} модела</p>
                </div>
              </div>
              <div className="space-y-2">
                {imageModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-400 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: model.providerColor }} />
                      <span className="text-sm text-zinc-300">{model.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.capabilities.includes('image-editing') && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                          Редактиране
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-600">{model.provider}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Влезте за Изображения Студио
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm text-zinc-500">Креатив Студио</span>
          </div>
          <p className="text-xs text-zinc-600">
            Задвижвано от Replicate API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  const { status } = useSession();

  if (status === 'authenticated') {
    return <Dashboard />;
  }

  return <LandingPage />;
}
