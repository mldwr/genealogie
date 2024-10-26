"use client";

import Link from "next/link";
import Logo from "./logo";
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { usePathname, useRouter } from 'next/navigation';

interface NavlinksProps {
  user?: any;
}

export default  function Header({ user }: NavlinksProps) {
  const router = useRouter();

  const pathname = usePathname();

  // Define routes where the Header should NOT be displayed
  const hideHeaderRoutes = ['/signin', '/signup']; 

  return (
    <>
    {/* Conditionally render Header, it will be not shown on signup and signin pages */}
    {!hideHeaderRoutes.includes(pathname) && 
      <header className="fixed top-2 z-30 w-full md:top-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
            {/* Site branding */}
            <div className="flex flex-1 items-center">
              <Logo />
            </div>

              {/* Middle links */}
              <ul className="flex flex-1 justify-center gap-12">
                <li>
                  <Link href="/deport" className="text-gray-800 hover:text-gray-600">
                    Deportationen
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-800 hover:text-gray-600">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-800 hover:text-gray-600">
                    Contact
                  </Link>
                </li>
            </ul>
            
            {/* Desktop sign in links */}
            <ul className="flex flex-1 items-center justify-end gap-3">
            {user ? (
              <li>
                <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
                  <input type="hidden" name="pathName" value={usePathname()} />
                  <button type="submit" className="btn-sm bg-white text-gray-800 shadow hover:bg-gray-50">
                    Logout
                  </button>
                </form>
              </li>
            ):(
              <li>
                <Link
                  href="/signin"
                  className="btn-sm bg-white text-gray-800 shadow hover:bg-gray-50"
                >
                  Login
                </Link>
              </li>
              )}
              {user ? (
              <li>
                <Link
                  href="/account"
                  className="btn-sm bg-gray-800 text-gray-200 shadow hover:bg-gray-900"
                >
                  Account
                </Link>
              </li>
              ):(
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
          </div>
        </div>
      </header>
    }
    </>
  );
}
