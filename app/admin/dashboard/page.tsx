'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/protected-route';
import AdminNav from '@/components/admin-nav';
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
    claimedItems: allItems.filter((i) => i.claimedByName).length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading...</p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-3xl">📋</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Wishlists
                            </dt>
                            <dd className="text-2xl font-semibold text-gray-900">
                              {stats.totalWishlists}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-3xl">🌐</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Public Wishlists
                            </dt>
                            <dd className="text-2xl font-semibold text-gray-900">
                              {stats.publicWishlists}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-3xl">🎁</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Items
                            </dt>
                            <dd className="text-2xl font-semibold text-gray-900">
                              {stats.totalItems}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="text-3xl">✓</div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Claimed Items
                            </dt>
                            <dd className="text-2xl font-semibold text-gray-900">
                              {stats.claimedItems}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Wishlists */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Wishlists
                    </h2>
                    <Link
                      href="/admin/wishlists"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  {wishlists.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No wishlists yet</p>
                      <Link
                        href="/admin/wishlists"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Create Your First Wishlist
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlists.slice(0, 5).map((wishlist) => {
                        const itemCount = allItems.filter(
                          (i) => i.wishlistId === wishlist.id
                        ).length;
                        return (
                          <Link
                            key={wishlist.id}
                            href={`/admin/wishlists/${wishlist.id}`}
                            className="block hover:bg-gray-50 p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {wishlist.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {wishlist.slug} • {itemCount} items •{' '}
                                  {wishlist.isPublic ? 'Public' : 'Private'}
                                </p>
                              </div>
                              <div className="text-gray-400">→</div>
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
      </div>
    </ProtectedRoute>
  );
}
