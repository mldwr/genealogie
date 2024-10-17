'use client';

import { useState } from 'react';
import { handleRequest } from '@/utils/auth-helpers/client';
import { signUp } from '@/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //e.preventDefault();
    //setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signUp, router);
    //setIsSubmitting(false);
  };

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Erstelle ein Konto</h1>
      </div>

      {/* Form */}
      <form
        noValidate={true}
        className="mb-4"
        onSubmit={(e) => handleSubmit(e)}
      >
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              className="form-input w-full py-2"
              type="text"
              placeholder="Stefanie Meyer"
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              className="form-input w-full py-2"
              type="email"
              placeholder="stefaniemeyer@email.com"
              required
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
              name="password"
              className="form-input w-full py-2"
              type="password"
              autoComplete="on"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <button 
            className="btn w-full bg-gradient-to-t from-blue-600 to-blue-500 bg-[length:100%_100%] bg-[bottom] text-white shadow hover:bg-[length:100%_150%]"
            >
            Absenden
          </button>
        </div>
      </form>

      {/* Bottom link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Mit der Anmeldung erklärst Du Dich mit den{" "}
          <a
            className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
            href="#0"
          >
            Nutzungsbedingungen 
          </a>{" "}
          und{" "}
          <a
            className="whitespace-nowrap font-medium text-gray-700 underline hover:no-underline"
            href="#0"
          >
            Datenschutzrichtlinien 
          </a>
          {" "}einverstanden.
        </p>
      </div>
    </>
  );
}
