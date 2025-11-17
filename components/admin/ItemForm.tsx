'use client';

import { useState } from 'react';
import ImageUpload from '@/components/image-upload';
import PurchaseUrlFields from './PurchaseUrlFields';
import { type Item } from '@/lib/api';

interface ItemFormProps {
  item?: Partial<Item>;
  onSubmit: (item: Partial<Item>) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  error?: string;
}

export default function ItemForm({ item, onSubmit, onCancel, mode, error }: ItemFormProps) {
  const [formData, setFormData] = useState<Partial<Item>>(
    item || {
      name: '',
      description: '',
      price: null,
      currency: 'USD',
      quantity: 1,
      imageUrl: '',
      purchaseUrls: [],
    }
  );
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-3">
        {mode === 'create' ? 'Add New Item' : 'Edit Item'}
      </h5>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-base">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            required
            className="w-full px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
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
            value={formData.price || ''}
            onChange={(e) =>
              setFormData((prev) => ({
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
            value={formData.description || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <ImageUpload
            currentImageUrl={formData.imageUrl || ''}
            onImageChange={(url) =>
              setFormData((prev) => ({ ...prev, imageUrl: url }))
            }
            onUploadStateChange={setIsImageUploading}
            type="item"
            label="Item Image"
          />
        </div>
        <div className="md:col-span-2">
          <PurchaseUrlFields
            purchaseUrls={formData.purchaseUrls || []}
            onChange={(urls) =>
              setFormData((prev) => ({ ...prev, purchaseUrls: urls }))
            }
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isImageUploading}
          className="px-4 py-2 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isImageUploading ? 'Uploading...' : mode === 'create' ? 'Add Item' : 'Save'}
        </button>
      </div>
    </form>
  );
}
