'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Calendar, BarChart3, Video, Image as ImageIcon, Shield } from 'lucide-react';
import { StudioLayout } from '@/components/StudioLayout';
import { useStore } from '@/lib/store';

interface UserStats {
  total: number;
  video: number;
  image: number;
  succeeded: number;
  failed: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { generations, loadGenerations, isLoaded } = useStore();
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    video: 0,
    image: 0,
    succeeded: 0,
    failed: 0,
  });

  useEffect(() => {
    if (!isLoaded) {
      loadGenerations();
    }
  }, [isLoaded, loadGenerations]);

  useEffect(() => {
    setStats({
      total: generations.length,
      video: generations.filter((g) => g.category === 'video').length,
      image: generations.filter((g) => g.category === 'image').length,
      succeeded: generations.filter((g) => g.status === 'succeeded').length,
      failed: generations.filter((g) => g.status === 'failed').length,
    });
  }, [generations]);

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase()
    || session?.user?.email?.charAt(0)?.toUpperCase()
    || 'U';

  return (
    <StudioLayout
      title="Профил"
      subtitle="Управлявайте вашия акаунт и настройки"
      icon={<User className="w-5 h-5 text-brand-400" />}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* User Info Card */}
        <div className="p-8 rounded-2xl bg-surface-500 border border-white/5">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Потребител'}
                className="w-20 h-20 rounded-2xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{userInitial}</span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                {session?.user?.name || 'Потребител'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="w-4 h-4 text-zinc-500" />
                {session?.user?.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="w-3.5 h-3.5" />
                Активен акаунт
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-400" />
            Статистика
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-surface-500 border border-white/5 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-zinc-500 mt-1">Общо</div>
            </div>
            <div className="p-4 rounded-xl bg-surface-500 border border-white/5 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.video}</div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center justify-center gap-1">
                <Video className="w-3 h-3" /> Видео
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-500 border border-white/5 text-center">
              <div className="text-2xl font-bold text-emerald-400">{stats.image}</div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center justify-center gap-1">
                <ImageIcon className="w-3 h-3" /> Изображения
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-500 border border-white/5 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.succeeded}</div>
              <div className="text-xs text-zinc-500 mt-1">Успешни</div>
            </div>
            <div className="p-4 rounded-xl bg-surface-500 border border-white/5 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
              <div className="text-xs text-zinc-500 mt-1">Неуспешни</div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" />
            Информация за акаунта
          </h3>
          <div className="p-6 rounded-xl bg-surface-500 border border-white/5 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="text-sm text-zinc-400">Име</div>
              <div className="text-sm text-white font-medium">{session?.user?.name || '—'}</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="text-sm text-zinc-400">Имейл</div>
              <div className="text-sm text-white font-medium">{session?.user?.email}</div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="text-sm text-zinc-400">ID</div>
              <div className="text-xs text-zinc-500 font-mono">{session?.user?.id}</div>
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Конфигурация
          </h3>
          <div className="p-6 rounded-xl bg-surface-500 border border-white/5 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="text-sm text-zinc-400">База данни</div>
              <div className="text-sm text-emerald-400 font-medium">SQLite (Prisma)</div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div className="text-sm text-zinc-400">Автентикация</div>
              <div className="text-sm text-emerald-400 font-medium">NextAuth.js</div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="text-sm text-zinc-400">AI API</div>
              <div className="text-sm text-emerald-400 font-medium">Replicate</div>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
