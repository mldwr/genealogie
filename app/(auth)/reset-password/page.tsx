'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function ResetPassword() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        // Translate common Supabase error messages to German
        if (error.message.includes('rate limit')) {
          setError('Zu viele Anfragen. Bitte versuchen Sie es später erneut.');
        } else if (error.message.includes('not found')) {
          // Don't reveal if email exists or not for security
          setSuccess(true);
        } else {
          setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Ein Fehler ist beim Senden des Links aufgetreten. Bitte versuchen Sie es erneut.');
    }

    setLoading(false);
  };

  // Show success state
  if (success) {
    return (
      <>
        <div className="mb-10">
          <h1 className="text-4xl font-bold">E-Mail gesendet</h1>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Prüfen Sie Ihr E-Mail-Postfach</p>
              <p className="mt-1 text-sm">
                Falls ein Konto mit der E-Mail-Adresse <strong>{email}</strong> existiert,
                haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Der Link ist 24 Stunden gültig. Falls Sie keine E-Mail erhalten haben,
            überprüfen Sie bitte Ihren Spam-Ordner.
          </p>

          <button
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            className="btn w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Andere E-Mail-Adresse verwenden
          </button>

          <div className="text-center">
            <Link
              className="text-sm text-gray-700 underline hover:no-underline"
              href="/signin"
            >
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Passwort zurücksetzen</h1>
        <p className="mt-2 text-gray-600">
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
        </p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              required
              autoFocus
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-size-[100%_100%] bg-bottom text-white shadow hover:bg-size-[100%_150%] disabled:opacity-50"
          >
            {loading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          className="text-sm text-gray-700 underline hover:no-underline"
          href="/signin"
        >
          Zurück zur Anmeldung
        </Link>
      </div>
    </>
  );
}
