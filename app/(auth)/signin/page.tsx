'use client';

import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Translate common error messages to German
        if (error.message.includes('Invalid login credentials')) {
          setError('E-Mail oder Passwort ist falsch.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.');
        } else if (error.message.includes('rate limit')) {
          setError('Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.');
        } else {
          setError('Ein Fehler ist bei der Anmeldung aufgetreten. Bitte versuchen Sie es erneut.');
        }
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Ein Fehler ist bei der Anmeldung aufgetreten.');
    }

    setLoading(false);
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Anmelden</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              className="form-input w-full py-2"
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Passwort
            </label>
            <input
              id="password"
              className="form-input w-full py-2"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-size-[100%_100%] bg-bottom text-white shadow hover:bg-size-[100%_150%] disabled:opacity-50"
          >
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <Link
          className="text-sm text-gray-700 underline hover:no-underline"
          href="/reset-password"
        >
          Passwort vergessen?
        </Link>
      </div>
    </>
  );
}
