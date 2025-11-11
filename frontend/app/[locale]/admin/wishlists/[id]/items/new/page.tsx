'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/protected-route';
import AdminNav from '@/components/admin-nav';
import ItemForm from '@/components/item-form';
import { useAuth } from '@/lib/auth-context';
import { itemsApi, type Item } from '@/lib/api';
import Link from 'next/link';

export default function NewItemPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const tAdmin = useTranslations('admin');

  const handleSubmit = async (data: Partial<Item>) => {
    if (!accessToken || !params.id) return;

    await itemsApi.create(accessToken, params.id as string, data);
    router.push(`/admin/wishlists/${params.id}`);
  };

  const handleCancel = () => {
    router.push(`/admin/wishlists/${params.id}`);
  };

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
                {tAdmin('backToWishlist')}
              </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{tAdmin('addNewItem')}</h1>
              <ItemForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
