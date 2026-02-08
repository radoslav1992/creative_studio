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
    bgColor: 'bg-sky-100',
    borderShadow: 'shadow-brutal-sky',
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'Изображения',
    description: 'Генерирайте фотореалистични изображения с Imagen, GPT Image и Ideogram.',
    bgColor: 'bg-mint-100',
    borderShadow: 'shadow-brutal-mint',
  },
  {
    icon: <Pencil className="w-5 h-5" />,
    title: 'Редактиране',
    description: 'Редактирайте изображения с AI — промяна на стил, добавяне на елементи, маскиране.',
    bgColor: 'bg-brand-50',
    borderShadow: 'shadow-brutal-brand',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Персонажи',
    description: 'Поддържайте последователност на персонажите с Ideogram Character.',
    bgColor: 'bg-rose-100',
    borderShadow: 'shadow-brutal-rose',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Начални Кадри',
    description: 'Използвайте изображения като начални кадри за видео генерация.',
    bgColor: 'bg-sunny-100',
    borderShadow: 'shadow-brutal-sunny',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Бързо',
    description: 'Fast модели за бързо генериране, когато времето е важно.',
    bgColor: 'bg-sky-100',
    borderShadow: 'shadow-brutal-sky',
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
    <div className="min-h-screen bg-cream-100">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-200 rounded-full border-2 border-ink opacity-30" />
        <div className="absolute top-40 right-20 w-20 h-20 bg-sunny-300 rounded-xl border-2 border-ink opacity-30 rotate-12" />
        <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-mint-300 rounded-full border-2 border-ink opacity-20" />

        <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-ink shadow-brutal-sm text-ink text-xs font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            Задвижвано от {totalModels > 0 ? totalModels : '21'} AI модела
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-ink mb-6 leading-tight">
            Създавайте с{' '}
            <span className="relative inline-block">
              <span className="relative z-10">изкуствен интелект</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-brand-200 -z-0 -rotate-1" />
            </span>
          </h1>
          <p className="text-lg font-medium text-ink-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Генерирайте невероятни видеа и изображения с най-добрите AI модели.
            Veo, Sora, Kling, Imagen, GPT Image, Ideogram — всичко на едно място.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="nb-btn group flex items-center gap-3 px-8 py-4 rounded-xl bg-brand-500 border-2 border-ink text-white font-bold shadow-brutal transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Регистрирайте се
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="nb-btn group flex items-center gap-3 px-8 py-4 rounded-xl bg-white border-2 border-ink text-ink font-bold shadow-brutal transition-all"
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
          <h2 className="text-3xl font-black text-ink mb-3">Възможности</h2>
          <p className="text-sm font-bold text-ink-muted">Всичко, от което се нуждаете за AI генериране</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`p-6 rounded-xl ${feature.bgColor} border-2 border-ink ${feature.borderShadow} transition-all hover:-translate-y-1`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-ink flex items-center justify-center mb-4 shadow-brutal-sm text-ink">
                {feature.icon}
              </div>
              <h3 className="text-sm font-extrabold text-ink mb-2">{feature.title}</h3>
              <p className="text-xs font-medium text-ink-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Models Overview */}
      {(videoModels.length > 0 || imageModels.length > 0) && (
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Models */}
            <div className="p-6 rounded-xl bg-white border-2 border-ink shadow-brutal">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-200 border-2 border-ink flex items-center justify-center shadow-brutal-sm">
                  <Video className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">Видео Модели</h3>
                  <p className="text-xs font-bold text-ink-muted">{videoModels.length} модела</p>
                </div>
              </div>
              <div className="space-y-2">
                {videoModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-cream-100 border-2 border-ink/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-ink" style={{ backgroundColor: model.providerColor }} />
                      <span className="text-sm font-bold text-ink">{model.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-ink-muted">{model.provider}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 mt-4 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Влезте за Видео Студио
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Image Models */}
            <div className="p-6 rounded-xl bg-white border-2 border-ink shadow-brutal">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-mint-200 border-2 border-ink flex items-center justify-center shadow-brutal-sm">
                  <Image className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">Изображения Модели</h3>
                  <p className="text-xs font-bold text-ink-muted">{imageModels.length} модела</p>
                </div>
              </div>
              <div className="space-y-2">
                {imageModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-cream-100 border-2 border-ink/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-ink" style={{ backgroundColor: model.providerColor }} />
                      <span className="text-sm font-bold text-ink">{model.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.capabilities.includes('image-editing') && (
                        <span className="text-[9px] px-2 py-0.5 rounded-lg bg-brand-100 text-brand-700 font-bold border border-brand-300">
                          Редактиране
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-ink-muted">{model.provider}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 mt-4 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Влезте за Изображения Студио
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-ink py-8 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-bold text-ink">Креатив Студио</span>
          </div>
          <p className="text-xs font-bold text-ink-muted">
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
