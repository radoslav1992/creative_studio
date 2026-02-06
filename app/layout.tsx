import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Креатив Студио — AI Генератор на Видео и Изображения',
  description: 'Българска платформа за генериране на видео и изображения с изкуствен интелект. Използвайте най-добрите AI модели.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#1e2028',
                border: '1px solid #2a2d35',
                color: '#e4e4e7',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
