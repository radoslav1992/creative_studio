'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { clsx } from 'clsx';
import {
  Video,
  Image,
  Home,
  LayoutGrid,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  {
    href: '/',
    label: 'Начало',
    icon: Home,
  },
  {
    href: '/studio/video',
    label: 'Видео Студио',
    icon: Video,
  },
  {
    href: '/studio/image',
    label: 'Изображения Студио',
    icon: Image,
  },
  {
    href: '/gallery',
    label: 'Галерия',
    icon: LayoutGrid,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase()
    || session?.user?.email?.charAt(0)?.toUpperCase()
    || 'U';

  return (
    <aside
      className={clsx(
        'relative flex flex-col bg-surface-600 border-r border-white/5 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide">
              КРЕАТИВ
            </span>
            <span className="text-[10px] text-zinc-500 tracking-widest uppercase">
              Студио
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-500/15 text-brand-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-brand-400' : 'text-zinc-500'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-300 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-surface-100 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* User Section */}
      <div className="border-t border-white/5">
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              {/* Avatar */}
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Потребител'}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{userInitial}</span>
                </div>
              )}
              {!collapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium text-white truncate max-w-[160px]">
                    {session?.user?.name || 'Потребител'}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[160px]">
                    {session?.user?.email}
                  </span>
                </div>
              )}
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className={clsx(
                  'absolute z-30 bottom-full mb-1 rounded-xl bg-surface-400 border border-white/10 shadow-2xl overflow-hidden',
                  collapsed ? 'left-1 w-48' : 'left-2 right-2'
                )}>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-500" />
                    Профил
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    Настройки
                  </Link>
                  <div className="border-t border-white/5" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Изход
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="px-3 py-3">
            {collapsed ? (
              <Link
                href="/auth/login"
                className="flex items-center justify-center w-full py-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 transition-all"
              >
                <User className="w-4 h-4" />
                Влезте
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
