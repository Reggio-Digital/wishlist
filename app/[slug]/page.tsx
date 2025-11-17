'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { wishlistsApi, itemsApi, claimingApi, type Wishlist, type Item } from '@/lib/api';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PublicWishlistPage() {
  const params = useParams();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showClaimed, setShowClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim form state
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
  const [claimNote, setClaimNote] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [justClaimedItemId, setJustClaimedItemId] = useState<string | null>(null);
  const [justClaimedNote, setJustClaimedNote] = useState('');

  // Unclaim state
  const [isUnclaiming, setIsUnclaiming] = useState(false);
  const [unclaimError, setUnclaimError] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, [params.slug]);

  const fetchWishlist = async () => {
    if (!params.slug) return;

    try {
      const wishlistData = await wishlistsApi.getBySlug(params.slug as string);
      setWishlist(wishlistData);

      const itemsData = await itemsApi.getAll(wishlistData.id);
      setItems(itemsData.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err: any) {
      setError(err.message || 'Wishlist not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimItem = (itemId: string) => {
    setClaimingItemId(itemId);
    setClaimError('');
    setClaimNote('');
    setJustClaimedItemId(null);
  };

  const handleSubmitClaim = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();

    setIsClaiming(true);
    setClaimError('');

    try {
      await claimingApi.claim(itemId, undefined, claimNote);

      setJustClaimedItemId(itemId);
      setJustClaimedNote(claimNote);
      setClaimingItemId(null);
      setClaimNote('');
      fetchWishlist();
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim item');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleUnclaim = async (itemId: string) => {
    if (!confirm('Are you sure you want to unclaim this item?')) {
      return;
    }

    setIsUnclaiming(true);
    setUnclaimError('');

    try {
      await claimingApi.unclaim(itemId);
      fetchWishlist();
    } catch (err: any) {
      setUnclaimError(err.message || 'Failed to unclaim item');
    } finally {
      setIsUnclaiming(false);
    }
  };

  const filteredItems = showClaimed
    ? items
    : items.filter((item) => !item.claimedAt || item.id === justClaimedItemId);

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Wishlist Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">{error || 'This wishlist does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title={wishlist.name}
        subtitle={wishlist.description || undefined}
        imageUrl={wishlist.imageUrl || undefined}
        maxWidth="max-w-5xl"
      />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <a
            href="/"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6 transition-colors cursor-pointer"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </a>
          {/* Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showClaimed}
                  onChange={(e) => setShowClaimed(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show claimed items</span>
              </label>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredItems.length} of {items.length} items
            </div>
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">
                {showClaimed ? 'No items in this wishlist yet' : 'All items have been claimed!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Image */}
                    {item.imageUrl && (
                      <div className="md:w-48 md:flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Middle: Item Details */}
                    <div className="flex-1 p-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Right: Action Area */}
                    <div className="md:w-80 md:flex-shrink-0 p-6 bg-gray-50 dark:bg-gray-900/50 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 flex flex-col">
                      <div className="mb-4">
                        {item.purchaseUrls && item.purchaseUrls.length > 0 && (
                          <div className="space-y-2">
                            {item.purchaseUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-base px-4 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
                              >
                                <span className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                                  {url.label}
                                </span>
                                <span className="text-gray-900 dark:text-white font-bold text-lg">
                                  {item.price && formatPrice(item.price, item.currency)}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Claimed Badge, Success Message, or Claim Button/Form */}
                      <div className="mt-auto">
                      {justClaimedItemId === item.id ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Item Claimed!
                          </p>
                          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                            The status is now locked.
                          </p>
                          {justClaimedNote && (
                            <p className="text-center text-xs text-gray-600 dark:text-gray-400 italic">
                              Your Note: &quot;{justClaimedNote}&quot;
                            </p>
                          )}
                        </div>
                      ) : item.claimedAt ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Claimed by {item.claimedByName}
                          </p>
                          {item.claimedByNote && (
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              Note: {item.claimedByNote}
                            </p>
                          )}
                          {item.isPurchased && (
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-medium">
                              ✓ Purchased
                            </p>
                          )}
                          {showClaimed && (
                            <button
                              onClick={() => handleUnclaim(item.id)}
                              disabled={isUnclaiming}
                              className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium disabled:opacity-50 transition-colors cursor-pointer text-sm"
                            >
                              {isUnclaiming ? 'Unclaiming...' : 'Unclaim Item'}
                            </button>
                          )}
                        </div>
                      ) : claimingItemId === item.id ? (
                        <div className="space-y-3">
                          <form onSubmit={(e) => handleSubmitClaim(e, item.id)} className="space-y-3">
                            {claimError && (
                              <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded text-xs">
                                {claimError}
                              </div>
                            )}

                            <div>
                              <label htmlFor={`claim-note-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Add a Note (Optional):
                              </label>
                              <textarea
                                id={`claim-note-${item.id}`}
                                rows={3}
                                placeholder="Let them know your plans! e.g., 'Buying this next week' or 'Found a great deal online' or 'Need to check the size first'"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
                                value={claimNote}
                                onChange={(e) => setClaimNote(e.target.value)}
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isClaiming}
                              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              {isClaiming ? 'Claiming...' : 'Confirm Claim'}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimItem(item.id)}
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors cursor-pointer"
                        >
                          Claim This Item
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
