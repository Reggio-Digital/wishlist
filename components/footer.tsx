'use client';

import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <p>Built for families</p>
          <span>•</span>
          <p>
            Made with ❤️ by{' '}
            <a
              href="https://reggiodigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              Reggio Digital
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Admin
          </Link>
          <span className="text-gray-400">•</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
