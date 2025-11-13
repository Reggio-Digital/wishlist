'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { wishlistsApi, itemsApi, type Wishlist, type Item } from '@/lib/api';
import Link from 'next/link';

export default function WishlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingWishlist, setIsEditingWishlist] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    notes: '',
    isPublic: true,
  });

  useEffect(() => {
    fetchData();
  }, [params.id, accessToken]);

  const fetchData = async () => {
    if (!accessToken || !params.id) return;

    try {
      const wishlistData = await wishlistsApi.getOne(accessToken, params.id as string);
      setWishlist(wishlistData);
      setEditForm({
        name: wishlistData.name,
        slug: wishlistData.slug,
        description: wishlistData.description || '',
        notes: wishlistData.notes || '',
        isPublic: wishlistData.isPublic,
      });

      const itemsData = await itemsApi.getAll(params.id as string, accessToken);
      setItems(itemsData.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      alert('Failed to load wishlist');
      router.push('/admin/wishlists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !params.id) return;

    try {
      await wishlistsApi.update(accessToken, params.id as string, editForm);
      setIsEditingWishlist(false);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Failed to update wishlist');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (!accessToken) return;

    try {
      await itemsApi.delete(accessToken, itemId);
      fetchData();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!wishlist) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                {wishlist.name}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-6">
                /{wishlist.slug}
              </p>
              <div className="flex flex-col items-center gap-3 mt-8">
                <Link
                  href="/admin/wishlists"
                  className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-semibold rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all"
                >
                  ← Back to Wishlists
                </Link>
                {wishlist.isPublic && (
                  <a
                    href={`/${wishlist.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    View Public Page →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">

            {/* Wishlist Details */}
            <div className="bg-white shadow-md rounded-xl border border-gray-100 p-8 mb-10">
              {isEditingWishlist ? (
                <form onSubmit={handleUpdateWishlist}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Required)
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug (Required)
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={editForm.slug}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Public Description
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Private Notes (Admin Only)
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        className="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        checked={editForm.isPublic}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            isPublic: e.target.checked,
                          }))
                        }
                      />
                      <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-700">
                        Make Public
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingWishlist(false)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 border border-transparent rounded-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {wishlist.name}
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">/{wishlist.slug}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          wishlist.isPublic
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {wishlist.isPublic ? 'Public' : 'Private'}
                      </span>
                      <button
                        onClick={() => setIsEditingWishlist(true)}
                        className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                  {wishlist.description && (
                    <p className="text-gray-700 mb-2">{wishlist.description}</p>
                  )}
                  {wishlist.notes && (
                    <div className="mt-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <p className="text-sm text-gray-700">
                        <strong>Private Notes:</strong> {wishlist.notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Items Section */}
            <div className="bg-white shadow-md rounded-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Items ({items.length})
                </h2>
                <Link
                  href={`/admin/wishlists/${params.id}/items/new`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  Add Item
                </Link>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-6 text-lg">No items yet</p>
                  <Link
                    href={`/admin/wishlists/${params.id}/items/new`}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Add First Item
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.price, item.currency)} •{' '}
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                          {item.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {item.description}
                            </p>
                          )}
                          {item.purchaseUrls && item.purchaseUrls.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.purchaseUrls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  {url.label || 'Link'} →
                                </a>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 flex items-center space-x-3">
                            <Link
                              href={`/admin/wishlists/${params.id}/items/${item.id}/edit`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2 text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <p>Built for families</p>
              <span>•</span>
              <p>
                Made with ❤️ by{' '}
                <a
                  href="https://reggiodigital.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Reggio Digital
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
