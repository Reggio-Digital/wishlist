'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PasswordLockGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Skip check for admin and lock pages
    if (pathname.startsWith('/admin') || pathname === '/lock') {
      setIsChecking(false);
      return;
    }

    const checkPasswordLock = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data.success && data.settings.passwordLockEnabled) {
          setIsLocked(true);
          // Redirect to lock page
          router.push('/lock');
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking password lock:', error);
        // On error, allow access to prevent site lockout
        setIsChecking(false);
      }
    };

    checkPasswordLock();
  }, [pathname, router]);

  // Show loading or nothing while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  // If locked, don't render children (redirect is happening)
  if (isLocked) {
    return null;
  }

  return <>{children}</>;
}
