'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import AdminNav from '@/components/admin-nav';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <AdminNav />
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
        <AdminNav />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Breadcrumb */}
            <div className="mb-4">
              <Link
                href="/admin/wishlists"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Back to Wishlists
              </Link>
            </div>

            {/* Wishlist Header */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={editForm.isPublic}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            isPublic: e.target.checked,
                          }))
                        }
                      />
                      <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                        Make Public
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingWishlist(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                  {wishlist.description && (
                    <p className="text-gray-700 mb-2">{wishlist.description}</p>
                  )}
                  {wishlist.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Private Notes:</strong> {wishlist.notes}
                      </p>
                    </div>
                  )}
                  {wishlist.isPublic && (
                    <div className="mt-4">
                      <a
                        href={`/${wishlist.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View Public Page →
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Items Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Items ({items.length})
                </h2>
                <Link
                  href={`/admin/wishlists/${params.id}/items/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Item
                </Link>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No items yet</p>
                  <Link
                    href={`/admin/wishlists/${params.id}/items/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add First Item
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
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
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
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
      </div>
    </ProtectedRoute>
  );
}
