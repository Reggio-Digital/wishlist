'use client';

import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  actions?: React.ReactNode;
  maxWidth?: 'max-w-5xl' | 'max-w-7xl';
}

export default function Header({ title, subtitle, imageUrl, actions, maxWidth = 'max-w-7xl' }: HeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Admin Warning */}
      {isAuthenticated && (
        <div className="sticky top-0 z-50 bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800">
          <div className={`${maxWidth} mx-auto py-3 px-4 sm:px-6 lg:px-8`}>
            <p className="text-center text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Warning: Viewing public wishlists may spoil surprises
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className={`${maxWidth} mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {imageUrl && (
              <div className="md:w-64 flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-64 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
            <div className={imageUrl ? 'flex-1 text-left' : 'flex-1 text-center'}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </h1>
              {subtitle && (
                <p className={`text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-6 ${imageUrl ? '' : 'max-w-3xl mx-auto'}`}>
                  {subtitle}
                </p>
              )}
              {actions && (
                <div className={`flex flex-col sm:flex-row items-center gap-3 ${imageUrl ? 'justify-start' : 'justify-center'}`}>
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
