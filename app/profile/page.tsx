'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Mail, BarChart3, Video, Image as ImageIcon, Shield, CheckCircle2, LogOut } from 'lucide-react';
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
      icon={<User className="w-5 h-5 text-brand-600" />}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* User Info Card */}
        <div className="p-8 rounded-2xl bg-white border-2 border-ink shadow-brutal">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Потребител'}
                className="w-20 h-20 rounded-2xl border-2 border-ink shadow-brutal-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-500 border-2 border-ink shadow-brutal-sm flex items-center justify-center">
                <span className="text-2xl font-black text-white">{userInitial}</span>
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-xl font-black text-ink">
                {session?.user?.name || 'Потребител'}
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
                <Mail className="w-4 h-4 text-ink-faint" />
                {session?.user?.email}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-mint-500 bg-mint-100 px-2.5 py-1 rounded-lg border-2 border-ink">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Активен акаунт
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-sm font-extrabold text-ink mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-500" />
            Статистика
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-white border-2 border-ink shadow-brutal-sm text-center">
              <div className="text-2xl font-black text-ink">{stats.total}</div>
              <div className="text-xs font-bold text-ink-muted mt-1">Общо</div>
            </div>
            <div className="p-4 rounded-xl bg-sky-100 border-2 border-ink shadow-brutal-sm text-center">
              <div className="text-2xl font-black text-ink">{stats.video}</div>
              <div className="text-xs font-bold text-ink-muted mt-1 flex items-center justify-center gap-1">
                <Video className="w-3 h-3" /> Видео
              </div>
            </div>
            <div className="p-4 rounded-xl bg-mint-100 border-2 border-ink shadow-brutal-sm text-center">
              <div className="text-2xl font-black text-ink">{stats.image}</div>
              <div className="text-xs font-bold text-ink-muted mt-1 flex items-center justify-center gap-1">
                <ImageIcon className="w-3 h-3" /> Изображения
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border-2 border-ink shadow-brutal-sm text-center">
              <div className="text-2xl font-black text-mint-500">{stats.succeeded}</div>
              <div className="text-xs font-bold text-ink-muted mt-1">Успешни</div>
            </div>
            <div className="p-4 rounded-xl bg-white border-2 border-ink shadow-brutal-sm text-center">
              <div className="text-2xl font-black text-peach-500">{stats.failed}</div>
              <div className="text-xs font-bold text-ink-muted mt-1">Неуспешни</div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div>
          <h3 className="text-sm font-extrabold text-ink mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            Информация за акаунта
          </h3>
          <div className="p-6 rounded-xl bg-white border-2 border-ink shadow-brutal-sm space-y-0">
            <div className="flex items-center justify-between py-4 border-b-2 border-ink/10">
              <div className="text-sm font-bold text-ink-muted">Име</div>
              <div className="text-sm font-bold text-ink">{session?.user?.name || '—'}</div>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="text-sm font-bold text-ink-muted">Имейл</div>
              <div className="text-sm font-bold text-ink">{session?.user?.email}</div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="nb-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-peach-100 border-2 border-ink text-ink text-sm font-bold hover:bg-peach-200 transition-all shadow-brutal-sm"
          >
            <LogOut className="w-4 h-4" />
            Излизане от акаунта
          </button>
        </div>
      </div>
    </StudioLayout>
  );
}
