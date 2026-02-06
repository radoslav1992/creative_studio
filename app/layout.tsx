import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from 'sonner';

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
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
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
      </body>
    </html>
  );
}
