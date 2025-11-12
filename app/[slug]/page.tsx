'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { wishlistsApi, itemsApi, claimingApi, type Wishlist, type Item } from '@/lib/api';
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

  const handleSubmitClaim = async (e: React.FormEvent, itemId: string, itemName: string) => {
    e.preventDefault();

    setIsClaiming(true);
    setClaimError('');

    try {
      const result = await claimingApi.claim(itemId, undefined, claimNote);
      // Store claim token in localStorage for later management
      const claims = JSON.parse(localStorage.getItem('myClaims') || '{}');
      claims[itemId] = {
        token: result.claimToken,
        itemName: itemName,
        wishlistSlug: params.slug,
      };
      localStorage.setItem('myClaims', JSON.stringify(claims));

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

  const filteredItems = showClaimed
    ? items
    : items.filter((item) => !item.claimedByName);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Not Found</h1>
          <p className="text-gray-600">{error || 'This wishlist does not exist or is not public.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
              {wishlist.name}
            </h1>
            {wishlist.description && (
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
                {wishlist.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <a
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors cursor-pointer"
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
                <span className="ml-2 text-sm text-gray-700">Show claimed items</span>
              </label>
            </div>
            <div className="text-sm text-gray-600">
              {filteredItems.length} of {items.length} items
            </div>
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                {showClaimed ? 'No items in this wishlist yet' : 'All items have been claimed!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden"
                >
                  {/* Item Image */}
                  {item.imageUrl && (
                    <div className="w-full h-64 bg-gray-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-8">
                    {/* Item Header */}
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Purchase Links Section */}
                    {item.purchaseUrls && item.purchaseUrls.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Where to Buy
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {item.purchaseUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-5 py-4 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors cursor-pointer border border-gray-200 hover:border-indigo-300"
                            >
                              <span className="text-indigo-600 hover:text-indigo-800 font-semibold text-base">
                                {url.label}
                              </span>
                              <span className="text-gray-900 font-bold text-xl">
                                {item.price && formatPrice(item.price, item.currency)}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Section */}
                    <div className="pt-4 border-t border-gray-200">
                      {justClaimedItemId === item.id ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-center text-lg font-semibold text-gray-900 mb-1">
                            Item Claimed!
                          </p>
                          <p className="text-center text-sm text-gray-600 mb-2">
                            The status is now locked.
                          </p>
                          {justClaimedNote && (
                            <p className="text-center text-xs text-gray-600 italic">
                              Your Note: &quot;{justClaimedNote}&quot;
                            </p>
                          )}
                        </div>
                      ) : item.claimedByName ? (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm font-medium text-green-800">
                            Claimed by {item.claimedByName}
                          </p>
                          {item.claimedByNote && (
                            <p className="text-xs text-green-700 mt-1">
                              Note: {item.claimedByNote}
                            </p>
                          )}
                          {item.isPurchased && (
                            <p className="text-xs text-green-700 mt-1 font-medium">
                              ✓ Purchased
                            </p>
                          )}
                        </div>
                      ) : claimingItemId === item.id ? (
                        <div className="space-y-3">
                          <form onSubmit={(e) => handleSubmitClaim(e, item.id, item.name)} className="space-y-3">
                            {claimError && (
                              <div className="p-2 bg-red-50 text-red-800 rounded text-xs">
                                {claimError}
                              </div>
                            )}

                            <div>
                              <label htmlFor={`claim-note-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Optional Claim Note:
                              </label>
                              <textarea
                                id={`claim-note-${item.id}`}
                                rows={3}
                                placeholder="e.g., 'Will buy this weekend on sale' or 'Please confirm compatibility first.'"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleClaimItem(item.id)}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-lg transition-colors cursor-pointer shadow-md hover:shadow-lg min-w-[240px]"
                          >
                            Claim This Item
                          </button>
                        </div>
                      )}
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
