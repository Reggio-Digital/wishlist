'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { wishlistsApi, itemsApi, type Wishlist } from '@/lib/api';
import Link from 'next/link';

export default function WishlistsPage() {
  const { accessToken } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlist, setNewWishlist] = useState({
    name: '',
    slug: '',
    description: '',
    isPublic: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchWishlists();
  }, [accessToken]);

  const fetchWishlists = async () => {
    if (!accessToken) return;

    try {
      const data = await wishlistsApi.getAll(accessToken);
      setWishlists(data);

      // Fetch item counts for each wishlist
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (w) => {
          const items = await itemsApi.getAll(w.id, accessToken);
          counts[w.id] = items.length;
        })
      );
      setItemCounts(counts);
    } catch (error) {
      console.error('Failed to fetch wishlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setIsCreating(true);

    try {
      if (!accessToken) return;
      await wishlistsApi.create(accessToken, newWishlist);
      setShowCreateModal(false);
      setNewWishlist({ name: '', slug: '', description: '', isPublic: true });
      fetchWishlists();
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create wishlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWishlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;
    if (!accessToken) return;

    try {
      await wishlistsApi.delete(accessToken, id);
      fetchWishlists();
    } catch (error) {
      alert('Failed to delete wishlist');
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setNewWishlist((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                Wishlists
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-6">
                Manage all your wishlists
              </p>
              <div className="flex flex-col items-center gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  + Create Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : wishlists.length === 0 ? (
              <div className="bg-white shadow-md rounded-xl border border-gray-100 p-8">
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-6 text-lg">No wishlists yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Create Your First Wishlist
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-xl border border-gray-100 p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlists.map((wishlist) => (
                    <div
                      key={wishlist.id}
                      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Link
                        href={`/admin/wishlists/${wishlist.id}`}
                        className="block p-6"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {wishlist.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              wishlist.isPublic
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {wishlist.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          /{wishlist.slug}
                        </p>
                        {wishlist.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {wishlist.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {itemCounts[wishlist.id] || 0} items
                        </p>
                      </Link>
                      <div className="border-t px-6 py-3 flex justify-end space-x-2">
                        <Link
                          href={`/admin/wishlists/${wishlist.id}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteWishlist(wishlist.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Create New Wishlist</h2>
              <form onSubmit={handleCreateWishlist}>
                {createError && (
                  <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                    {createError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newWishlist.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL-friendly)
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newWishlist.slug}
                      onChange={(e) =>
                        setNewWishlist((prev) => ({ ...prev, slug: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={newWishlist.description}
                      onChange={(e) =>
                        setNewWishlist((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      className="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      checked={newWishlist.isPublic}
                      onChange={(e) =>
                        setNewWishlist((prev) => ({
                          ...prev,
                          isPublic: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="isPublic"
                      className="ml-2 block text-sm font-medium text-gray-700"
                    >
                      Make Public
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError('');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-3 border border-transparent rounded-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
