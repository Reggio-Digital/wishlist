'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { wishlistsApi, itemsApi, settingsApi, type Wishlist, type Settings } from '@/lib/api';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Home() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({ siteTitle: 'Wishlist', homepageSubtext: 'Browse and explore available wishlists' });

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
      const data = await wishlistsApi.getAllPublic();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title={settings.siteTitle}
        subtitle={settings.homepageSubtext}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : wishlists.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">No public wishlists available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {wishlists.map((wishlist) => (
                <Link
                  key={wishlist.id}
                  href={`/${wishlist.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {wishlist.imageUrl && (
                      <div className="md:w-64 md:flex-shrink-0">
                        <img
                          src={wishlist.imageUrl}
                          alt={wishlist.name}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-8 flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {wishlist.name}
                      </h3>
                      {wishlist.description && (
                        <p className="text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {wishlist.description}
                        </p>
                      )}
                      <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                        {itemCounts[wishlist.id] || 0} items
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
