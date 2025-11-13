'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import ItemForm from '@/components/item-form';
import { useAuth } from '@/lib/auth-context';
import { itemsApi, type Item } from '@/lib/api';
import Link from 'next/link';

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!accessToken || !params.itemId) return;

      try {
        const data = await itemsApi.getOne(params.itemId as string, accessToken);
        setItem(data);
      } catch (error) {
        alert('Failed to load item');
        router.push(`/admin/wishlists/${params.id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [params.itemId, accessToken]);

  const handleSubmit = async (data: Partial<Item>) => {
    if (!accessToken || !params.itemId) return;

    await itemsApi.update(accessToken, params.itemId as string, data);
    router.push(`/admin/wishlists/${params.id}`);
  };

  const handleCancel = () => {
    router.push(`/admin/wishlists/${params.id}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!item) {
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
                Edit Item
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-6">
                Update {item.name}
              </p>
              <div className="flex flex-col items-center gap-3 mt-8">
                <Link
                  href={`/admin/wishlists/${params.id}`}
                  className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-semibold rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 transition-all"
                >
                  ← Back to Wishlist
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-12 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="bg-white shadow-md rounded-xl border border-gray-100 p-8">
              <ItemForm
                initialData={item}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing
              />
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
