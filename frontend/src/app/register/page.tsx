'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'vendor',
    receiveUpdates: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError('Please complete all fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4f2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(90,55,64,0.12)] lg:grid-cols-2">
          {/* Left form side */}
          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-[#b76e79]">
                  Surprise Events
                </p>

                <h1 className="text-4xl font-bold text-[#2f1f24] sm:text-5xl">
                  Sign Up
                  <span className="align-top text-[#d78d9e]">•</span>
                </h1>

                <p className="mt-3 text-sm text-[#6f6265]">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#b76e79] hover:text-[#9f5b65]"
                  >
                    Log in
                  </Link>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[#3f3135]"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-[#edd6dc] bg-white px-4 text-[#3f3135] outline-none transition placeholder:text-[#a39196] focus:border-[#c98a98] focus:ring-4 focus:ring-[#f3d7de]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-medium text-[#3f3135]"
                  >
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-[#edd6dc] bg-white px-4 text-[#3f3135] outline-none transition focus:border-[#c98a98] focus:ring-4 focus:ring-[#f3d7de]/50"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#3f3135]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-[#edd6dc] bg-white px-4 text-[#3f3135] outline-none transition placeholder:text-[#a39196] focus:border-[#c98a98] focus:ring-4 focus:ring-[#f3d7de]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#3f3135]"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-[#edd6dc] bg-white px-4 text-[#3f3135] outline-none transition placeholder:text-[#a39196] focus:border-[#c98a98] focus:ring-4 focus:ring-[#f3d7de]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-[#3f3135]"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-[#edd6dc] bg-white px-4 text-[#3f3135] outline-none transition placeholder:text-[#a39196] focus:border-[#c98a98] focus:ring-4 focus:ring-[#f3d7de]/50"
                  />
                </div>

                <label className="flex items-center gap-3 pt-1 text-sm text-[#6f6265]">
                  <input
                    type="checkbox"
                    name="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-[#d8bcc4] text-[#b76e79] focus:ring-[#e7c1ca]"
                  />
                  Receive email updates
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-md border-0 bg-[#b76e79] text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-[#9f5b65]"
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <p className="pt-3 text-xs leading-6 text-[#8b7b7f]">
                  By signing up you agree to our{' '}
                  <Link
                    href="/privacy"
                    className="underline decoration-[#c9a5ae] underline-offset-2 hover:text-[#b76e79]"
                  >
                    Privacy Policy
                  </Link>{' '}
                  &{' '}
                  <Link
                    href="/terms"
                    className="underline decoration-[#c9a5ae] underline-offset-2 hover:text-[#b76e79]"
                  >
                    Terms of Service
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Right image side */}
          <div className="relative hidden min-h-[760px] bg-[#f4ece9] lg:block">
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80"
              alt="Elegant event setup"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#4b2e35]/18 via-transparent to-[#4b2e35]/8" />

            
          </div>
        </ div>
      </div>
    </div>
  );
}