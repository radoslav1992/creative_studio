'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  Video,
  Image,
  Home,
  LayoutGrid,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false);

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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5">
        {!collapsed && (
          <div className="text-[11px] text-zinc-600">
            Задвижвано от Replicate API
          </div>
        )}
      </div>
    </aside>
  );
}
