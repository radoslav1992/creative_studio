'use client';

import { ReactNode } from 'react';

interface StudioLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}

export function StudioLayout({ title, subtitle, icon, children }: StudioLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-700/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/20 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{title}</h1>
              <p className="text-xs text-zinc-500">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}
