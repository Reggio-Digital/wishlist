'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { wishlistsApi, itemsApi, type Wishlist, type Item } from '@/lib/api';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import ImageUpload from '@/components/image-upload';

export default function AdminPage() {
  const { accessToken, logout, username } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlist, setNewWishlist] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isPublic: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isPublic: true,
  });
  const [editError, setEditError] = useState('');
  const [expandedWishlistId, setExpandedWishlistId] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Record<string, Item[]>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<Partial<Item>>({});
  const [showAddItemForm, setShowAddItemForm] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState<Partial<Item>>({
    name: '',
    description: '',
    price: null,
    currency: 'USD',
    quantity: 1,
    imageUrl: '',
    purchaseUrls: [],
  });

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
      setNewWishlist({ name: '', slug: '', description: '', imageUrl: '', isPublic: true });
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

  const startEditing = (wishlist: Wishlist) => {
    setEditingId(wishlist.id);
    setEditForm({
      name: wishlist.name,
      slug: wishlist.slug,
      description: wishlist.description || '',
      imageUrl: wishlist.imageUrl || '',
      isPublic: wishlist.isPublic,
    });
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError('');
  };

  const handleEditNameChange = (name: string) => {
    setEditForm((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  const handleUpdateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !accessToken) return;

    setEditError('');

    try {
      await wishlistsApi.update(accessToken, editingId, editForm);
      setEditingId(null);
      fetchWishlists();
    } catch (error: any) {
      setEditError(error.message || 'Failed to update wishlist');
    }
  };

  const toggleWishlistExpand = async (wishlistId: string) => {
    if (expandedWishlistId === wishlistId) {
      setExpandedWishlistId(null);
    } else {
      setExpandedWishlistId(wishlistId);
      // Fetch items if not already loaded
      if (!wishlistItems[wishlistId] && accessToken) {
        const items = await itemsApi.getAll(wishlistId, accessToken);
        setWishlistItems((prev) => ({ ...prev, [wishlistId]: items }));
      }
    }
  };

  const startEditingItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditItemForm(item);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditItemForm({});
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId || !accessToken) return;

    try {
      await itemsApi.update(accessToken, editingItemId, editItemForm);
      setEditingItemId(null);
      // Refresh items for the wishlist
      const item = wishlistItems[expandedWishlistId!].find((i) => i.id === editingItemId);
      if (item && expandedWishlistId) {
        const items = await itemsApi.getAll(expandedWishlistId, accessToken);
        setWishlistItems((prev) => ({ ...prev, [expandedWishlistId]: items }));
      }
      fetchWishlists(); // Refresh counts
    } catch (error: any) {
      alert(error.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: string, wishlistId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (!accessToken) return;

    try {
      await itemsApi.delete(accessToken, itemId);
      const items = await itemsApi.getAll(wishlistId, accessToken);
      setWishlistItems((prev) => ({ ...prev, [wishlistId]: items }));
      fetchWishlists(); // Refresh counts
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleCreateItem = async (e: React.FormEvent, wishlistId: string) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      await itemsApi.create(accessToken, wishlistId, newItemForm);
      setShowAddItemForm(null);
      setNewItemForm({
        name: '',
        description: '',
        price: null,
        currency: 'USD',
        quantity: 1,
        imageUrl: '',
        purchaseUrls: [],
      });
      const items = await itemsApi.getAll(wishlistId, accessToken);
      setWishlistItems((prev) => ({ ...prev, [wishlistId]: items }));
      fetchWishlists(); // Refresh counts
    } catch (error: any) {
      alert(error.message || 'Failed to create item');
    }
  };

  const stats = {
    totalWishlists: wishlists.length,
    publicWishlists: wishlists.filter((w) => w.isPublic).length,
    totalItems: Object.values(itemCounts).reduce((sum, count) => sum + count, 0),
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header
          title="Dashboard"
          subtitle="Manage your wishlists and items"
          actions={
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                + Create Wishlist
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 dark:border-indigo-500 text-base font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
              >
                View Public Site
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-6 py-3 border-2 border-red-600 dark:border-red-500 text-base font-semibold rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                title="Logout"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </>
          }
        />

        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 text-3xl">📋</div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total Wishlists
                            </dt>
                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stats.totalWishlists}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 text-3xl">🌐</div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400 truncate">
                              Public Wishlists
                            </dt>
                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stats.publicWishlists}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 text-3xl">🎁</div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total Items
                            </dt>
                            <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stats.totalItems}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wishlists Section */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Wishlists
                  </h2>
                  {wishlists.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                        No wishlists yet
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                      >
                        Create Your First Wishlist
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlists.map((wishlist) => (
                        <div
                          key={wishlist.id}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          {/* Display View */}
                          <>
                              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                {editError && (
                                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-base">
                                    {editError}
                                  </div>
                                )}
                                <div className="flex items-stretch -m-5">
                                  <div
                                    className="flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 p-5 transition-colors"
                                    onClick={() => editingId !== wishlist.id && toggleWishlistExpand(wishlist.id)}
                                  >
                                    {editingId === wishlist.id ? (
                                      // Inline Edit Mode
                                      <div className="space-y-3">
                                        {/* Image Upload */}
                                        <ImageUpload
                                          currentImageUrl={editForm.imageUrl}
                                          onImageChange={(url) =>
                                            setEditForm((prev) => ({ ...prev, imageUrl: url }))
                                          }
                                          type="wishlist"
                                          label="Wishlist Image"
                                        />
                                        {/* Form Fields */}
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="text"
                                              value={editForm.name}
                                              onChange={(e) => handleEditNameChange(e.target.value)}
                                              className="text-lg font-bold px-2 py-1 border-2 border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white flex-1"
                                              placeholder="Wishlist name"
                                            />
                                            <label className="flex items-center gap-2 text-base">
                                              <input
                                                type="checkbox"
                                                checked={editForm.isPublic}
                                                onChange={(e) =>
                                                  setEditForm((prev) => ({
                                                    ...prev,
                                                    isPublic: e.target.checked,
                                                  }))
                                                }
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                              />
                                              <span className="text-gray-700 dark:text-gray-300">Public</span>
                                            </label>
                                          </div>
                                          <input
                                            type="text"
                                            value={editForm.slug}
                                            onChange={(e) =>
                                              setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                                            }
                                            className="text-base px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white w-full"
                                            placeholder="url-slug"
                                          />
                                          <textarea
                                            value={editForm.description}
                                            onChange={(e) =>
                                              setEditForm((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                              }))
                                            }
                                            className="text-base px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white w-full"
                                            placeholder="Description"
                                            rows={2}
                                          />
                                          <p className="text-base text-gray-500 dark:text-gray-500">
                                            {itemCounts[wishlist.id] || 0} items
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      // Display Mode
                                      <div className="flex items-start gap-3">
                                        <span className="text-lg text-gray-400 dark:text-gray-500 mt-1">
                                          {expandedWishlistId === wishlist.id ? '▼' : '▶'}
                                        </span>
                                        {/* Image on Left */}
                                        {wishlist.imageUrl && (
                                          <img
                                            src={wishlist.imageUrl}
                                            alt={wishlist.name}
                                            className="w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                                          />
                                        )}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                              {wishlist.name}
                                            </h3>
                                            <span
                                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-base font-medium ${
                                                wishlist.isPublic
                                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                              }`}
                                            >
                                              {wishlist.isPublic ? 'Public' : 'Private'}
                                            </span>
                                          </div>
                                          <p className="text-base text-gray-600 dark:text-gray-400 mb-1">
                                            /{wishlist.slug}
                                          </p>
                                          {wishlist.description && (
                                            <p className="text-base text-gray-600 dark:text-gray-400 mb-1">
                                              {wishlist.description}
                                            </p>
                                          )}
                                          <p className="text-base text-gray-500 dark:text-gray-500">
                                            {itemCounts[wishlist.id] || 0} items
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col w-24 border-l border-gray-200 dark:border-gray-700">
                                    {editingId === wishlist.id ? (
                                      <>
                                        <button
                                          onClick={cancelEditing}
                                          className="flex-1 flex items-center justify-center text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700"
                                          title="Cancel"
                                        >
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleUpdateWishlist(e as any);
                                          }}
                                          className="flex-1 flex items-center justify-center text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                          title="Save"
                                        >
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startEditing(wishlist);
                                          }}
                                          className="flex-1 flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                          title="Edit wishlist"
                                        >
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedIsPublic = !wishlist.isPublic;
                                            handleUpdateWishlist({
                                              preventDefault: () => {},
                                            } as any);
                                            // Update the wishlist's public status
                                            wishlistsApi.update(accessToken!, wishlist.id, {
                                              name: wishlist.name,
                                              slug: wishlist.slug,
                                              description: wishlist.description || '',
                                              isPublic: updatedIsPublic,
                                            }).then(() => fetchWishlists());
                                          }}
                                          className="flex-1 flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                          title={wishlist.isPublic ? "Make private" : "Make public"}
                                        >
                                          {wishlist.isPublic ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                          )}
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteWishlist(wishlist.id);
                                          }}
                                          className="flex-1 flex items-center justify-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                                          title="Delete wishlist"
                                        >
                                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Items Section */}
                              {expandedWishlistId === wishlist.id && (
                                <div className="p-5 bg-gray-50 dark:bg-gray-900/50">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      Items ({wishlistItems[wishlist.id]?.length || 0})
                                    </h4>
                                    <button
                                      onClick={() => setShowAddItemForm(wishlist.id)}
                                      className="px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                                    >
                                      + Add Item
                                    </button>
                                  </div>

                                  {/* Add Item Form */}
                                  {showAddItemForm === wishlist.id && (
                                    <form
                                      onSubmit={(e) => handleCreateItem(e, wishlist.id)}
                                      className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                                        Add New Item
                                      </h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Name *
                                          </label>
                                          <input
                                            type="text"
                                            required
                                            className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                            value={newItemForm.name}
                                            onChange={(e) =>
                                              setNewItemForm((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Price
                                          </label>
                                          <input
                                            type="number"
                                            step="0.01"
                                            className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                            value={newItemForm.price || ''}
                                            onChange={(e) =>
                                              setNewItemForm((prev) => ({
                                                ...prev,
                                                price: e.target.value ? parseFloat(e.target.value) : null,
                                              }))
                                            }
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                          </label>
                                          <textarea
                                            rows={2}
                                            className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                            value={newItemForm.description || ''}
                                            onChange={(e) =>
                                              setNewItemForm((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <ImageUpload
                                            currentImageUrl={newItemForm.imageUrl || ''}
                                            onImageChange={(url) =>
                                              setNewItemForm((prev) => ({ ...prev, imageUrl: url }))
                                            }
                                            type="item"
                                            label="Item Image"
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Purchase URLs
                                          </label>
                                          <div className="space-y-2">
                                            {(newItemForm.purchaseUrls || []).map((urlObj, index) => (
                                              <div key={index} className="flex gap-2 items-start">
                                                <input
                                                  type="text"
                                                  placeholder="Label (e.g., Amazon)"
                                                  value={urlObj.label}
                                                  onChange={(e) => {
                                                    const updated = [...(newItemForm.purchaseUrls || [])];
                                                    updated[index] = { ...updated[index], label: e.target.value };
                                                    setNewItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                  }}
                                                  className="w-1/3 px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                  type="url"
                                                  placeholder="https://example.com"
                                                  value={urlObj.url}
                                                  onChange={(e) => {
                                                    const updated = [...(newItemForm.purchaseUrls || [])];
                                                    updated[index] = { ...updated[index], url: e.target.value };
                                                    setNewItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                  }}
                                                  className="flex-1 px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <label className="flex items-center gap-1 whitespace-nowrap">
                                                  <input
                                                    type="checkbox"
                                                    checked={urlObj.isPrimary}
                                                    onChange={(e) => {
                                                      const updated = (newItemForm.purchaseUrls || []).map((u, i) => ({
                                                        ...u,
                                                        isPrimary: i === index ? e.target.checked : false,
                                                      }));
                                                      setNewItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                    }}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                  />
                                                  <span className="text-sm text-gray-600 dark:text-gray-400">Primary</span>
                                                </label>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const updated = (newItemForm.purchaseUrls || []).filter((_, i) => i !== index);
                                                    setNewItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                  }}
                                                  className="px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                                                  title="Remove URL"
                                                >
                                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                  </svg>
                                                </button>
                                              </div>
                                            ))}
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = [...(newItemForm.purchaseUrls || []), { label: '', url: '', isPrimary: false }];
                                                setNewItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                              }}
                                              className="w-full px-3 py-2 text-base border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                            >
                                              + Add URL
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setShowAddItemForm(null)}
                                          className="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="submit"
                                          className="px-4 py-2 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                                        >
                                          Add Item
                                        </button>
                                      </div>
                                    </form>
                                  )}

                                  {/* Items List */}
                                  {wishlistItems[wishlist.id]?.length === 0 ? (
                                    <p className="text-base text-gray-500 dark:text-gray-400 text-center py-4">
                                      No items yet
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {wishlistItems[wishlist.id]?.map((item) => (
                                        <div
                                          key={item.id}
                                          className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden"
                                        >
                                          {editingItemId === item.id ? (
                                            // Edit Item Form
                                            <form onSubmit={handleUpdateItem} className="p-4">
                                              <div className="space-y-3">
                                                {/* Image Upload */}
                                                <ImageUpload
                                                  currentImageUrl={editItemForm.imageUrl || ''}
                                                  onImageChange={(url) =>
                                                    setEditItemForm((prev) => ({ ...prev, imageUrl: url }))
                                                  }
                                                  type="item"
                                                  label="Item Image"
                                                />
                                                {/* Purchase URLs */}
                                                <div>
                                                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Purchase URLs
                                                  </label>
                                                  <div className="space-y-2">
                                                    {(editItemForm.purchaseUrls || []).map((urlObj, index) => (
                                                      <div key={index} className="flex gap-2 items-start">
                                                        <input
                                                          type="text"
                                                          placeholder="Label (e.g., Amazon)"
                                                          value={urlObj.label}
                                                          onChange={(e) => {
                                                            const updated = [...(editItemForm.purchaseUrls || [])];
                                                            updated[index] = { ...updated[index], label: e.target.value };
                                                            setEditItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                          }}
                                                          className="w-1/3 px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                        />
                                                        <input
                                                          type="url"
                                                          placeholder="https://example.com"
                                                          value={urlObj.url}
                                                          onChange={(e) => {
                                                            const updated = [...(editItemForm.purchaseUrls || [])];
                                                            updated[index] = { ...updated[index], url: e.target.value };
                                                            setEditItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                          }}
                                                          className="flex-1 px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                        />
                                                        <label className="flex items-center gap-1 whitespace-nowrap">
                                                          <input
                                                            type="checkbox"
                                                            checked={urlObj.isPrimary}
                                                            onChange={(e) => {
                                                              const updated = (editItemForm.purchaseUrls || []).map((u, i) => ({
                                                                ...u,
                                                                isPrimary: i === index ? e.target.checked : false,
                                                              }));
                                                              setEditItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                            }}
                                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                          />
                                                          <span className="text-sm text-gray-600 dark:text-gray-400">Primary</span>
                                                        </label>
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            const updated = (editItemForm.purchaseUrls || []).filter((_, i) => i !== index);
                                                            setEditItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                          }}
                                                          className="px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                                                          title="Remove URL"
                                                        >
                                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                          </svg>
                                                        </button>
                                                      </div>
                                                    ))}
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const updated = [...(editItemForm.purchaseUrls || []), { label: '', url: '', isPrimary: false }];
                                                        setEditItemForm((prev) => ({ ...prev, purchaseUrls: updated }));
                                                      }}
                                                      className="w-full px-3 py-2 text-base border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                                    >
                                                      + Add URL
                                                    </button>
                                                  </div>
                                                </div>
                                                {/* Form Fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                  <div>
                                                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                      Name *
                                                    </label>
                                                    <input
                                                      type="text"
                                                      required
                                                      className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                      value={editItemForm.name}
                                                      onChange={(e) =>
                                                        setEditItemForm((prev) => ({ ...prev, name: e.target.value }))
                                                      }
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                      Price
                                                    </label>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                      value={editItemForm.price || ''}
                                                      onChange={(e) =>
                                                        setEditItemForm((prev) => ({
                                                          ...prev,
                                                          price: e.target.value ? parseFloat(e.target.value) : null,
                                                        }))
                                                      }
                                                    />
                                                  </div>
                                                  <div className="md:col-span-2">
                                                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                      Description
                                                    </label>
                                                    <textarea
                                                      rows={2}
                                                      className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                                      value={editItemForm.description || ''}
                                                      onChange={(e) =>
                                                        setEditItemForm((prev) => ({ ...prev, description: e.target.value }))
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="mt-3 flex justify-end gap-2">
                                                <button
                                                  type="button"
                                                  onClick={cancelEditingItem}
                                                  className="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                                >
                                                  Cancel
                                                </button>
                                                <button
                                                  type="submit"
                                                  className="px-4 py-2 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                                                >
                                                  Save
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            // Display Item
                                            <div className="flex items-stretch">
                                              <div className="flex-1 p-4 flex gap-3">
                                                {/* Image on Left */}
                                                {item.imageUrl && (
                                                  <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
                                                  />
                                                )}
                                                <div className="flex-1">
                                                  <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {item.name}
                                                  </h5>
                                                  {item.description && (
                                                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                                                      {item.description}
                                                    </p>
                                                  )}
                                                  {item.price && (
                                                    <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                                                      ${item.price.toFixed(2)} {item.currency}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex flex-col w-16 border-l border-gray-200 dark:border-gray-700">
                                                <button
                                                  onClick={() => startEditingItem(item)}
                                                  className="flex-1 flex items-center justify-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                                                  title="Edit item"
                                                >
                                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                  </svg>
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteItem(item.id, wishlist.id)}
                                                  className="flex-1 flex items-center justify-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                                                  title="Delete item"
                                                >
                                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                  </svg>
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Create New Wishlist
              </h2>
              <form onSubmit={handleCreateWishlist}>
                {createError && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-base">
                    {createError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-900 dark:text-gray-200 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700"
                      value={newWishlist.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-900 dark:text-gray-200 mb-1">
                      Slug (URL-friendly)
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700"
                      value={newWishlist.slug}
                      onChange={(e) =>
                        setNewWishlist((prev) => ({ ...prev, slug: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-900 dark:text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700"
                      value={newWishlist.description}
                      onChange={(e) =>
                        setNewWishlist((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <ImageUpload
                    currentImageUrl={newWishlist.imageUrl}
                    onImageChange={(url) => setNewWishlist((prev) => ({ ...prev, imageUrl: url }))}
                    type="wishlist"
                    label="Wishlist Image"
                  />
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
                      className="ml-2 block text-base font-medium text-gray-900 dark:text-gray-200"
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
                      setNewWishlist({ name: '', slug: '', description: '', imageUrl: '', isPublic: true });
                    }}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
