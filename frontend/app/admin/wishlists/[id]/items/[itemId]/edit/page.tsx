'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import AdminNav from '@/components/admin-nav';
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
          <AdminNav />
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
        <AdminNav />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-4">
              <Link
                href={`/admin/wishlists/${params.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Back to Wishlist
              </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit {item.name}</h1>
              <ItemForm
                initialData={item}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
