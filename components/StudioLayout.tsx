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
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-ink">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 border-2 border-ink flex items-center justify-center shadow-brutal-sm">
              {icon}
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-ink">{title}</h1>
              <p className="text-xs font-bold text-ink-muted">{subtitle}</p>
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
