'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, LogIn, Github, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/studio/video');
        router.refresh();
      }
    } catch {
      setError('Възникна неочаквана грешка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/studio/video' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream-100 relative">
      {/* Decorative shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-brand-200 rounded-full border-2 border-ink opacity-20" />
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-sunny-300 rounded-xl border-2 border-ink opacity-20 rotate-12" />
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-mint-300 rounded-full border-2 border-ink opacity-15" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 border-2 border-ink shadow-brutal mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-ink mb-2">Добре дошли обратно</h1>
          <p className="text-sm font-bold text-ink-muted">Влезте в Креатив Студио</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white border-2 border-ink shadow-brutal">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-peach-100 border-2 border-ink">
              <AlertCircle className="w-4 h-4 text-peach-500 flex-shrink-0" />
              <p className="text-sm font-bold text-ink">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink">Имейл</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500 focus:shadow-brutal-brand-sm transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-ink">Парола</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-100 border-2 border-ink text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand-500 focus:shadow-brutal-brand-sm transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="nb-btn w-full py-3 rounded-xl bg-brand-500 border-2 border-ink text-white font-bold text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-brutal-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Влизане...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Влезте
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-ink/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-ink-muted font-bold">или</span>
            </div>
          </div>

          {/* GitHub */}
          <button
            onClick={handleGitHubLogin}
            className="nb-btn w-full py-3 rounded-xl bg-white border-2 border-ink text-ink font-bold text-sm hover:bg-cream-100 transition-all shadow-brutal-sm flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4" />
            Продължете с GitHub
          </button>

          {/* Register link */}
          <p className="text-center text-sm font-medium text-ink-muted mt-6">
            Нямате акаунт?{' '}
            <Link
              href="/auth/register"
              className="text-brand-600 hover:text-brand-700 font-bold transition-colors"
            >
              Регистрирайте се
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
