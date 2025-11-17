'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { wishlistsApi, itemsApi, settingsApi, type Wishlist, type Settings } from '@/lib/api';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import StatsGrid from '@/components/admin/StatsGrid';
import SettingsSection from '@/components/admin/SettingsSection';
import WishlistCard from '@/components/admin/WishlistCard';
import CreateWishlistModal from '@/components/admin/CreateWishlistModal';
import ShareButton from '@/components/share-button';

export default function AdminPage() {
  const { logout } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    siteTitle: 'Wishlist',
    homepageSubtext: 'Browse and explore available wishlists',
    passwordLockEnabled: false,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchWishlists();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchWishlists = async () => {
    try {
      const data = await wishlistsApi.getAll();
      setWishlists(data);

      // Fetch item counts for each wishlist
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (w) => {
          const items = await itemsApi.getAll(w.id);
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

  const handleUpdateSettings = async (updatedSettings: Settings) => {
    await settingsApi.updateSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  const handleCreateWishlist = async (data: any) => {
    setCreateError('');
    try {
      await wishlistsApi.create(data);
      setShowCreateModal(false);
      fetchWishlists();
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create wishlist');
      throw error;
    }
  };

  const handleUpdateWishlist = async (id: string, data: Partial<Wishlist>) => {
    await wishlistsApi.update(id, data);
    fetchWishlists();
  };

  const handleDeleteWishlist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      await wishlistsApi.delete(id);
      fetchWishlists();
    } catch (error) {
      alert('Failed to delete wishlist');
    }
  };

  const handleMoveWishlistUp = async (wishlistId: string) => {
    const currentIndex = wishlists.findIndex((w) => w.id === wishlistId);
    if (currentIndex <= 0) return;

    try {
      await wishlistsApi.reorder(wishlistId, currentIndex - 1);
      await fetchWishlists();
    } catch (error: any) {
      alert(`Error: ${error?.message || 'Failed to reorder wishlist'}`);
    }
  };

  const handleMoveWishlistDown = async (wishlistId: string) => {
    const currentIndex = wishlists.findIndex((w) => w.id === wishlistId);
    if (currentIndex === -1 || currentIndex === wishlists.length - 1) return;

    try {
      await wishlistsApi.reorder(wishlistId, currentIndex + 1);
      await fetchWishlists();
    } catch (error: any) {
      alert(`Error: ${error?.message || 'Failed to reorder wishlist'}`);
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
              <ShareButton
                title="Check out my wishlist site!"
                text="I wanted to share my wishlist site with you."
                url="https://wishlist.tieso.co/"
              />
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
                <StatsGrid stats={stats} />

                {/* Settings Section */}
                <SettingsSection settings={settings} onUpdate={handleUpdateSettings} />

                {/* Wishlists Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Your Wishlists
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      + Create Wishlist
                    </button>
                  </div>
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
                      {wishlists.map((wishlist, index) => (
                        <WishlistCard
                          key={wishlist.id}
                          wishlist={wishlist}
                          itemCount={itemCounts[wishlist.id] || 0}
                          onUpdate={handleUpdateWishlist}
                          onDelete={handleDeleteWishlist}
                          onMoveUp={handleMoveWishlistUp}
                          onMoveDown={handleMoveWishlistDown}
                          isFirst={index === 0}
                          isLast={index === wishlists.length - 1}
                          onItemsChange={fetchWishlists}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Create Modal */}
        <CreateWishlistModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setCreateError('');
          }}
          onCreate={handleCreateWishlist}
          error={createError}
        />

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
