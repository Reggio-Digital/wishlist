'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { wishlistsApi, itemsApi, type Wishlist } from '@/lib/api';
import Footer from '@/components/footer';

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
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
              Wishlists
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Browse and explore available wishlists
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : wishlists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No public wishlists available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {wishlists.map((wishlist) => (
                <Link
                  key={wishlist.id}
                  href={`/${wishlist.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 hover:scale-105 border border-gray-100"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {wishlist.name}
                  </h3>
                  {wishlist.description && (
                    <p className="text-base text-gray-600 mb-4 line-clamp-3">
                      {wishlist.description}
                    </p>
                  )}
                  <p className="text-base text-gray-500 font-medium">
                    {itemCounts[wishlist.id] || 0} items
                  </p>
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
