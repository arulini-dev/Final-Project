'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f4f2]">
      {/* Soft background shapes */}
      <div className="absolute left-[-60px] top-24 h-40 w-40 rounded-full bg-[#e8b9c3]/35 blur-3xl" />
      <div className="absolute bottom-16 right-[-40px] h-52 w-52 rounded-full bg-[#d99aa8]/25 blur-3xl" />
      <div className="absolute right-1/4 top-10 h-28 w-28 rounded-full bg-[#f1d7dd]/40 blur-2xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(90,55,64,0.12)] lg:grid-cols-2">
          {/* Left branding panel */}
          <div className="hidden bg-[#f5ece9] p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#b76e79]">
                Surprise Events
              </p>

              <h1 className="mt-6 text-5xl font-semibold leading-tight text-[#4b2e35]">
                Welcome
                <span className="block text-[#b76e79]">back</span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-[#6b5b5f]">
                Sign in to manage your bookings, explore trusted vendors, and
                plan memorable event experiences without the usual mess.
              </p>
            </div>

            <div className="mt-10 rounded-3xl bg-white/80 p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
                Elegant event experiences
              </p>
              <p className="mt-3 text-base leading-7 text-[#6b5b5f]">
                Premium decor, curated vendors, and smoother planning in one
                place.
              </p>
            </div>
          </div>

          {/* Right form panel */}
          <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
            <div className="w-full max-w-md">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3d7de] text-xl font-semibold text-[#8f5564] shadow-sm">
                  S
                </div>

                <h2 className="mt-6 text-3xl font-bold text-[#4b2e35] sm:text-4xl">
                  Good to see you again
                </h2>

                <p className="mt-3 text-sm text-[#7b6a6d]">
                  Sign in to continue your event journey
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-[#5c4a4e]"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#e7d7da] bg-[#fcf9f8] px-4 text-[#4b2e35] outline-none transition placeholder:text-[#a18f93] focus:border-[#c88c99] focus:ring-4 focus:ring-[#eec9d1]/40"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-[#5c4a4e]"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#e7d7da] bg-[#fcf9f8] px-4 text-[#4b2e35] outline-none transition placeholder:text-[#a18f93] focus:border-[#c88c99] focus:ring-4 focus:ring-[#eec9d1]/40"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#b76e79] transition hover:text-[#9f5b65]"
                  >
                    Forgot password?
                  </Link>

                  <Link
                    href="/register"
                    className="font-medium text-[#8f5564] transition hover:text-[#b76e79]"
                  >
                    Create account
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border-0 bg-[#b76e79] text-base font-medium text-white shadow-md transition hover:bg-[#9f5b65] focus:outline-none focus:ring-4 focus:ring-[#e9c2cb]"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[#7b6a6d]">
                New here?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-[#b76e79] hover:text-[#9f5b65]"
                >
                  Create a new account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}