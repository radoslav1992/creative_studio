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
  Shield,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  {
    href: '/',
    label: 'Табло',
    icon: Home,
    requiresAuth: false,
    adminOnly: false,
  },
  {
    href: '/studio/video',
    label: 'Видео Студио',
    icon: Video,
    requiresAuth: true,
    adminOnly: false,
  },
  {
    href: '/studio/image',
    label: 'Изображения Студио',
    icon: Image,
    requiresAuth: true,
    adminOnly: false,
  },
  {
    href: '/gallery',
    label: 'Галерия',
    icon: LayoutGrid,
    requiresAuth: true,
    adminOnly: false,
  },
  {
    href: '/admin/models',
    label: 'Админ панел',
    icon: Shield,
    requiresAuth: true,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const isAdmin = (session?.user as any)?.role === 'admin';
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase()
    || session?.user?.email?.charAt(0)?.toUpperCase()
    || 'U';

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  return (
    <aside
      className={clsx(
        'relative flex flex-col bg-white border-r-3 border-ink transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b-2 border-ink">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 border-2 border-ink shadow-brutal-sm">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-ink tracking-wide">
              КРЕАТИВ
            </span>
            <span className="text-[10px] text-ink-muted tracking-widest uppercase font-bold">
              Студио
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {visibleNavItems.map((item) => {
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150',
                isActive
                  ? 'bg-brand-100 text-brand-700 border-2 border-brand-500 shadow-brutal-brand-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-cream-200 border-2 border-transparent'
              )}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-brand-600' : 'text-ink-faint'
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
        className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-white border-2 border-ink shadow-brutal-sm flex items-center justify-center text-ink hover:bg-brand-100 transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* User Section */}
      <div className="border-t-2 border-ink">
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-200 transition-colors"
            >
              {/* Avatar */}
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Потребител'}
                  className="w-8 h-8 rounded-lg border-2 border-ink flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-brand-400 border-2 border-ink flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
                  <span className="text-xs font-extrabold text-white">{userInitial}</span>
                </div>
              )}
              {!collapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-bold text-ink truncate max-w-[160px]">
                    {session?.user?.name || 'Потребител'}
                  </span>
                  <span className="text-[10px] text-ink-muted truncate max-w-[160px] font-medium">
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
                  'absolute z-30 bottom-full mb-1.5 rounded-xl bg-white border-2 border-ink shadow-brutal overflow-hidden',
                  collapsed ? 'left-1 w-48' : 'left-2 right-2'
                )}>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream-200 transition-colors"
                  >
                    <User className="w-4 h-4 text-ink-muted" />
                    Профил
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream-200 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-ink-muted" />
                    Настройки
                  </Link>
                  <div className="border-t-2 border-ink/10" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-peach-500 hover:bg-peach-100 transition-colors"
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
                className="flex items-center justify-center w-full py-2 rounded-xl bg-brand-500 border-2 border-ink text-white hover:bg-brand-600 transition-colors shadow-brutal-sm nb-btn"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-500 border-2 border-ink text-white text-sm font-bold hover:bg-brand-600 transition-all shadow-brutal-sm nb-btn"
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
