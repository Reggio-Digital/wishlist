'use client';

import { useState } from 'react';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title = 'Check out this wishlist!',
  text = 'I thought you might be interested in this wishlist.',
  url,
  className = ''
}: ShareButtonProps) {
  const [isSupported, setIsSupported] = useState(true);

  const handleShare = async () => {
    // Use current URL if not provided
    const shareUrl = url || window.location.href;

    // Check if Web Share API is supported
    if (!navigator.share) {
      setIsSupported(false);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Unable to share or copy link');
      }
      return;
    }

    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
    } catch (err: any) {
      // User cancelled or share failed
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  if (!isSupported && typeof window !== 'undefined' && !navigator.clipboard) {
    // Don't show button if neither share nor clipboard is supported
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center px-6 py-3 border-2 border-indigo-600 dark:border-indigo-500 text-base font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all cursor-pointer ${className}`}
      title="Share this page"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      Share
    </button>
  );
}
