"use client";

import Link from "next/link";
import Logo from "./logo";
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from "react";
import { useAuth } from '@/components/providers/AuthProvider';

interface NavlinksProps {
  initialUser?: any;
}

export default function Header({ initialUser }: NavlinksProps) {
  const { user, signOut } = useAuth();
  const currentUser = user || initialUser;  // Use context user or fall back to initial server-side user
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <>
      <header className="fixed top-2 z-30 w-full lg:top-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-14 items-center justify-between sm:gap-3 rounded-2xl bg-white/90 sm:px-3 shadow-lg shadow-black/3 backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(var(--color-gray-100),var(--color-gray-200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,linear-gradient(white_0_0)]">
            {/* Site branding */}
            <div className="flex flex-1 items-center">
              <Logo />
            </div>

            {/* Hamburger menu button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`h-6 w-6 ${mobileMenuOpen ? 'hidden' : 'block'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${mobileMenuOpen ? 'block' : 'hidden'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex flex-1 justify-center gap-12">
              <li>
                <Link href="/deport" className="text-gray-800 hover:text-gray-600">
                  Deportationen
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-800 hover:text-gray-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/participate" className="text-gray-800 hover:text-gray-600">
                  Mitmachen
                </Link>
              </li>
            </ul>
            
            {/* Desktop sign in links */}
            <ul className="hidden lg:flex flex-1 items-center justify-end gap-3">
              {currentUser ? (
                <li>
                  <form onSubmit={handleSignOut}>
                    <button type="submit" className="btn-sm bg-white text-gray-800 shadow hover:bg-gray-50">
                      Logout
                    </button>
                  </form>
                </li>
              ) : (
                <li>
                  <Link
                    href="/signin"
                    className="btn-sm bg-white text-gray-800 shadow hover:bg-gray-50"
                  >
                    Login
                  </Link>
                </li>
              )}
              {currentUser ? (
                <li>
                  <Link
                    href="/account"
                    className="btn-sm bg-gray-800 text-gray-200 shadow hover:bg-gray-900"
                  >
                    Account
                  </Link>
                </li>
              ) : (
                <li>
                  <Link
                    href="/signup"
                    className="btn-sm bg-gray-800 text-gray-200 shadow hover:bg-gray-900"
                  >
                    Register
                  </Link>
                </li>
              )}
            </ul>

            {/* Mobile menu */}
            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/deport"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50"
                >
                  Deportationen
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/participate"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50"
                >
                  Mitmachen
                </Link>
                {currentUser ? (
                  <>
                    <Link
                      href="/account"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50"
                    >
                      Account
                    </Link>
                    <form onSubmit={handleSignOut}>
                      <button
                        type="submit"
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/signin"
                        className="btn-sm bg-white text-gray-800 shadow hover:bg-gray-50 w-fit"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="btn-sm bg-gray-800 text-gray-200 shadow hover:bg-gray-900 w-fit"
                      >
                        Register
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
