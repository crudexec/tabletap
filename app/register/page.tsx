'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-ive-lg">
            <span className="text-primary-foreground font-semibold text-2xl">S</span>
          </div>
          <h1 className="text-title mb-1">Create account</h1>
          <p className="text-caption">Get started with Service Manager</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-footnote block">Name</label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-border bg-secondary/50 placeholder:text-muted-foreground/50 focus:bg-background transition-ive"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-footnote block">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-border bg-secondary/50 placeholder:text-muted-foreground/50 focus:bg-background transition-ive"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-footnote block">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl border-border bg-secondary/50 placeholder:text-muted-foreground/50 focus:bg-background transition-ive"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-footnote block">Confirm password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 rounded-xl border-border bg-secondary/50 placeholder:text-muted-foreground/50 focus:bg-background transition-ive"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[var(--status-critical-muted)] text-[var(--status-critical)] text-[13px] text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={cn(
              'w-full h-12 rounded-xl text-[15px] font-medium transition-ive',
              loading && 'opacity-80'
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center mt-8 text-caption">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium transition-ive"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
