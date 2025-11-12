'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { wishlistsApi, itemsApi, type Wishlist } from '@/lib/api';

export default function Home() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlists();
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Wishlist App</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/my-claims"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              My Claims
            </Link>
            <Link
              href="/admin/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Wishlists</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : wishlists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No public wishlists available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlists.map((wishlist) => (
                <Link
                  key={wishlist.id}
                  href={`/${wishlist.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {wishlist.name}
                  </h3>
                  {wishlist.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {wishlist.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {itemCounts[wishlist.id] || 0} items
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <p>Powered by Wishlist App</p>
          <span>•</span>
          <a
            href="/admin/login"
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Admin
          </a>
        </div>
      </div>
    </div>
  );
}
