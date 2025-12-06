'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

// Constants for rate limiting
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEBOUNCE_TIME_MS = 3000; // 3 seconds
const STORAGE_KEY = 'password_change_attempts';

// Password validation rules
interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

const validatePassword = (password: string): PasswordValidation => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
});

const isPasswordValid = (validation: PasswordValidation): boolean =>
  Object.values(validation).every(Boolean);

export default function ChangePassword() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidRecoverySession, setHasValidRecoverySession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Rate limiting state
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const passwordValidation = validatePassword(newPassword);

  // Initialize rate limiting state from localStorage
  useEffect(() => {
    const checkStoredRateLimit = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { attempts, firstAttempt } = JSON.parse(stored);
          const now = Date.now();

          // Clear old attempts if window expired
          if (now - firstAttempt > RATE_LIMIT_WINDOW_MS) {
            localStorage.removeItem(STORAGE_KEY);
            setRateLimitError(null);
            setRetryAfter(null);
            return;
          }

          if (attempts >= MAX_ATTEMPTS) {
            const resetTime = new Date(firstAttempt + RATE_LIMIT_WINDOW_MS);
            setRetryAfter(resetTime);
            setRateLimitError(`Zu viele Versuche. Bitte versuchen Sie es erneut in ${Math.ceil((resetTime.getTime() - now) / 60000)} Minuten.`);
          }
        }
      } catch (e) {
        console.error('Error reading rate limit from storage', e);
      }
    };

    checkStoredRateLimit();
    // Check every minute to update the error message if needed
    const interval = setInterval(checkStoredRateLimit, 60000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!retryAfter) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = retryAfter.getTime() - now;

      if (distance < 0) {
        setRateLimitError(null);
        setRetryAfter(null);
        setTimeLeft(null);
        localStorage.removeItem(STORAGE_KEY);
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  // Check if user has a valid recovery session (from password reset link)
  // This page should ONLY be used for password recovery via email link
  // Authenticated users who want to change their password should use /account
  useEffect(() => {
    const checkRecoverySession = async () => {
      // Check URL hash for recovery token (Supabase appends tokens as hash fragments)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');

      // Check URL search params as well (some flows use query params)
      const searchParams = new URLSearchParams(window.location.search);
      const tokenFromSearch = searchParams.get('token');
      const typeFromSearch = searchParams.get('type');

      const isRecoveryFromHash = type === 'recovery' && accessToken;
      const isRecoveryFromSearch = typeFromSearch === 'recovery' && tokenFromSearch;

      // If coming from a recovery link, let Supabase handle the session
      if (isRecoveryFromHash || isRecoveryFromSearch) {
        // Wait a moment for Supabase to process the recovery token
        // The auth callback should have already processed this, but just in case
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidRecoverySession(true);
        } else {
          setHasValidRecoverySession(false);
        }
        setSessionChecked(true);
        return;
      }

      // No recovery token in URL - check if user has a regular session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is logged in but came to this page without a recovery token
        // They should use the account settings to change their password
        // Redirect them to /account with a message
        router.push('/account?message=password-change-redirect');
        return;
      }

      // No session at all - user needs a recovery link
      setHasValidRecoverySession(false);
      setSessionChecked(true);
    };

    checkRecoverySession();
  }, [supabase.auth, router]);

  const checkAndRecordRateLimit = (): boolean => {
    try {
      const now = Date.now();
      const stored = localStorage.getItem(STORAGE_KEY);

      let data = { attempts: 0, firstAttempt: now };

      if (stored) {
        data = JSON.parse(stored);

        // Reset if window expired
        if (now - data.firstAttempt > RATE_LIMIT_WINDOW_MS) {
          data = { attempts: 0, firstAttempt: now };
        }
      }

      // Check limit
      if (data.attempts >= MAX_ATTEMPTS) {
        const resetTime = new Date(data.firstAttempt + RATE_LIMIT_WINDOW_MS);
        setRetryAfter(resetTime);
        setRateLimitError(`Zu viele Versuche. Bitte warten Sie bis der Timer abläuft.`);
        return false;
      }

      // Increment
      data.attempts++;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Rate limit error', e);
      // Fail safe - allow attempt if storage fails
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setRateLimitError(null);

    // Check client-side rate limit
    if (!checkAndRecordRateLimit()) {
      return;
    }

    setLoading(true);
    setIsDebouncing(true);

    // Debounce timer - enable button after delay regardless of outcome
    setTimeout(() => {
      setIsDebouncing(false);
    }, DEBOUNCE_TIME_MS);

    // Validate password strength
    if (!isPasswordValid(passwordValidation)) {
      setError('Das Passwort erfüllt nicht alle Anforderungen.');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        // Handle Supabase rate limiting specific error (429)
        if (error.status === 429) {
          setError('Zu viele Anfragen. Bitte warten Sie einen Moment.');
        }
        // Translate common Supabase error messages
        else if (error.message.includes('same password')) {
          setError('Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.');
        } else if (error.message.includes('session')) {
          setError('Ihre Sitzung ist abgelaufen. Bitte fordern Sie einen neuen Link an.');
        } else if (error.message.includes('weak')) {
          setError('Das Passwort ist zu schwach. Bitte wählen Sie ein stärkeres Passwort.');
        } else {
          setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
      } else {
        // Successful password change
        localStorage.removeItem(STORAGE_KEY); // Clear failure attempts on success
        await supabase.auth.signOut();
        setSuccess(true);
      }
    } catch (err) {
      setError('Ein Fehler ist beim Ändern des Passworts aufgetreten.');
    }

    setLoading(false);
  };

  // Show loading state while checking session
  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error if no valid recovery session
  if (!hasValidRecoverySession) {
    return (
      <>
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Link ungültig</h1>
        </div>

        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Der Link ist ungültig oder abgelaufen</p>
              <p className="mt-1 text-sm">
                Der Link zum Zurücksetzen des Passworts ist nicht mehr gültig.
                Links sind nur 24 Stunden gültig und können nur einmal verwendet werden.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/reset-password"
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-size-[100%_100%] bg-bottom text-white shadow hover:bg-size-[100%_150%] text-center block"
          >
            Neuen Link anfordern
          </Link>

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

  // Show success state
  if (success) {
    return (
      <>
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Passwort geändert</h1>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Ihr Passwort wurde erfolgreich geändert!</p>
              <p className="mt-1 text-sm">
                Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/signin"
          className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-size-[100%_100%] bg-bottom text-white shadow hover:bg-size-[100%_150%] text-center block"
        >
          Zur Anmeldung
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Neues Passwort festlegen</h1>
        <p className="mt-2 text-gray-600">
          Geben Sie Ihr neues Passwort ein.
        </p>
      </div>

      {rateLimitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">{rateLimitError}</p>
              {timeLeft && <p className="text-sm mt-1">Nächster Versuch in: <span className="font-bold">{timeLeft}</span></p>}
            </div>
          </div>
        </div>
      )}

      {error && !rateLimitError && (
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
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="newPassword">
              Neues Passwort
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input w-full py-2 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={!!rateLimitError}
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={!!rateLimitError}
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          {newPassword && (
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-700">Passwort-Anforderungen:</p>
              <ul className="space-y-1">
                <li className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.minLength ? (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                  )}
                  Mindestens 8 Zeichen
                </li>
                <li className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasUppercase ? (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                  )}
                  Mindestens ein Großbuchstabe
                </li>
                <li className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasLowercase ? (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                  )}
                  Mindestens ein Kleinbuchstabe
                </li>
                <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordValidation.hasNumber ? (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                  )}
                  Mindestens eine Zahl
                </li>
              </ul>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
              Passwort bestätigen
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input w-full py-2 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!!rateLimitError}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                disabled={!!rateLimitError}
                aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Die Passwörter stimmen nicht überein.</p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Passwörter stimmen überein
              </p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading || isDebouncing || !!rateLimitError || !isPasswordValid(passwordValidation) || newPassword !== confirmPassword}
            className="btn w-full bg-linear-to-t from-blue-600 to-blue-500 bg-size-[100%_100%] bg-bottom text-white shadow hover:bg-size-[100%_150%] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Wird gespeichert...
              </>
            ) : isDebouncing ? (
              'Bitte warten...'
            ) : (
              'Passwort speichern'
            )}
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