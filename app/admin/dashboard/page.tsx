'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { wishlistsApi, itemsApi, type Wishlist, type Item } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        const wishlistsData = await wishlistsApi.getAll(accessToken);
        setWishlists(wishlistsData);

        // Fetch items for all wishlists
        const itemsPromises = wishlistsData.map((w) =>
          itemsApi.getAll(w.id, accessToken)
        );
        const itemsArrays = await Promise.all(itemsPromises);
        const items = itemsArrays.flat();
        setAllItems(items);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const stats = {
    totalWishlists: wishlists.length,
    publicWishlists: wishlists.filter((w) => w.isPublic).length,
    totalItems: allItems.length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                Dashboard
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-6">
                Manage your wishlists and items
              </p>
              <div className="flex flex-col items-center gap-3 mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-semibold rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all"
                >
                  View Public Site
                </Link>
                <p className="text-sm text-gray-500 italic max-w-xs">
                  ⚠️ Warning: Viewing public wishlists may spoil surprises
                </p>
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
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                  <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-4xl">📋</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate uppercase tracking-wide">
                              Total Wishlists
                            </dt>
                            <dd className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.totalWishlists}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-4xl">🌐</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate uppercase tracking-wide">
                              Public Wishlists
                            </dt>
                            <dd className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.publicWishlists}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-4xl">🎁</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-semibold text-gray-500 truncate uppercase tracking-wide">
                              Total Items
                            </dt>
                            <dd className="text-3xl font-bold text-gray-900 mt-1">
                              {stats.totalItems}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Wishlists */}
                <div className="bg-white shadow-md rounded-xl border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recent Wishlists
                    </h2>
                    <Link
                      href="/admin/wishlists"
                      className="text-base text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  {wishlists.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-6 text-lg">No wishlists yet</p>
                      <Link
                        href="/admin/wishlists"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
                      >
                        Create Your First Wishlist
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlists.slice(0, 5).map((wishlist) => {
                        const itemCount = allItems.filter(
                          (i) => i.wishlistId === wishlist.id
                        ).length;
                        return (
                          <Link
                            key={wishlist.id}
                            href={`/admin/wishlists/${wishlist.id}`}
                            className="block hover:bg-gray-50 p-5 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md hover:scale-105"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {wishlist.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {wishlist.slug} • {itemCount} items •{' '}
                                  {wishlist.isPublic ? 'Public' : 'Private'}
                                </p>
                              </div>
                              <div className="text-gray-400 text-xl">→</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
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
