'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { wishlistsApi, itemsApi, claimingApi, type Wishlist, type Item } from '@/lib/api';

export default function PublicWishlistPage() {
  const params = useParams();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showClaimed, setShowClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim form state
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
  const [claimName, setClaimName] = useState('');
  const [claimNote, setClaimNote] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

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
    setClaimName('');
    setClaimNote('');
  };

  const handleSubmitClaim = async (e: React.FormEvent, itemId: string, itemName: string) => {
    e.preventDefault();

    setIsClaiming(true);
    setClaimError('');

    try {
      const result = await claimingApi.claim(itemId, claimName, claimNote);
      // Store claim token in localStorage for later management
      const claims = JSON.parse(localStorage.getItem('myClaims') || '{}');
      claims[itemId] = {
        token: result.claimToken,
        itemName: itemName,
        wishlistSlug: params.slug,
      };
      localStorage.setItem('myClaims', JSON.stringify(claims));

      setClaimingItemId(null);
      setClaimName('');
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{wishlist.name}</h1>
            {wishlist.description && (
              <p className="mt-2 text-gray-600">{wishlist.description}</p>
            )}
          </div>
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

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                {showClaimed ? 'No items in this wishlist yet' : 'All items have been claimed!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${getPriorityColor(
                    item.priority
                  )}`}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      {item.price && (
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      )}
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      )}
                    </div>

                    {/* Purchase Links */}
                    {item.purchaseUrls && item.purchaseUrls.length > 0 && (
                      <div className="mb-3 border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-200">
                            {item.purchaseUrls.map((url, idx) => (
                              <tr key={idx}>
                                <td className="p-0">
                                  <a
                                    href={url.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex justify-between items-center w-full px-3 py-2 hover:bg-blue-50 transition-colors"
                                  >
                                    <span className="text-gray-900 font-medium">{url.label}</span>
                                    <span className="text-gray-700">
                                      {item.price && formatPrice(item.price, item.currency)}
                                    </span>
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Claimed Badge or Claim Button/Form */}
                    {item.claimedByName ? (
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
                    ) : (
                      <>
                        <button
                          onClick={() => handleClaimItem(item.id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                          Claim This Item
                        </button>

                        {/* Inline Claim Form */}
                        {claimingItemId === item.id && (
                          <form onSubmit={(e) => handleSubmitClaim(e, item.id, item.name)} className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                            {claimError && (
                              <div className="p-2 bg-red-50 text-red-800 rounded text-xs">
                                {claimError}
                              </div>
                            )}

                            <div>
                              <input
                                type="text"
                                placeholder="Your name (optional)"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={claimName}
                                onChange={(e) => setClaimName(e.target.value)}
                              />
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="Coordination note (optional)"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={claimNote}
                                onChange={(e) => setClaimNote(e.target.value)}
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setClaimingItemId(null);
                                  setClaimError('');
                                }}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isClaiming}
                                className="px-3 py-1.5 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isClaiming ? 'Claiming...' : 'Confirm Claim'}
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <p>Built for families</p>
            <span>•</span>
            <p>Made with love by{' '}
              <a
                href="https://reggiodigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Reggio Digital
              </a>
            </p>
          </div>
          <a
            href="/admin/login"
            className="text-gray-400 hover:text-gray-600"
          >
            Admin
          </a>
        </div>
      </div>
    </div>
  );
}
