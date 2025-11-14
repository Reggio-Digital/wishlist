'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { scrapingApi, type Item } from '@/lib/api';
import ImageUpload from './image-upload';

interface ItemFormProps {
  initialData?: Partial<Item>;
  onSubmit: (data: Partial<Item>) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ItemForm({ initialData, onSubmit, onCancel, isEditing = false }: ItemFormProps) {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    currency: initialData?.currency || 'USD',
    quantity: initialData?.quantity?.toString() || '1',
    imageUrl: initialData?.imageUrl || '',
    purchaseUrl: initialData?.purchaseUrls?.[0]?.url || '',
    purchaseLabel: initialData?.purchaseUrls?.[0]?.label || '',
  });

  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleScrape = async () => {
    if (!scrapeUrl || !accessToken) return;

    setIsScraping(true);
    setScrapeError('');

    try {
      const data = await scrapingApi.scrapeUrl(accessToken, scrapeUrl);

      setFormData((prev) => ({
        ...prev,
        name: data.title || prev.name,
        description: data.description || prev.description,
        price: data.price?.toString() || prev.price,
        currency: data.currency || prev.currency,
        imageUrl: data.imageUrl || prev.imageUrl,
        purchaseUrl: scrapeUrl,
        purchaseLabel: new URL(scrapeUrl).hostname.replace('www.', ''),
      }));
    } catch (error: any) {
      setScrapeError(error.message || 'Failed to scrape URL');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const purchaseUrls = formData.purchaseUrl
        ? [
            {
              url: formData.purchaseUrl,
              label: formData.purchaseLabel || 'Link',
              isPrimary: true,
            },
          ]
        : null;

      await onSubmit({
        name: formData.name,
        description: formData.description || null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        quantity: parseInt(formData.quantity) || 1,
        imageUrl: formData.imageUrl || null,
        purchaseUrls,
      });
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to save item');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">
          {submitError}
        </div>
      )}

      {/* URL Scraper */}
      {!isEditing && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-fill from URL (optional)
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
            />
            <button
              type="button"
              onClick={handleScrape}
              disabled={isScraping || !scrapeUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors"
            >
              {isScraping ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
          {scrapeError && (
            <p className="mt-2 text-sm text-red-600">{scrapeError}</p>
          )}
          <p className="mt-2 text-xs text-gray-600">
            Supports common retailers like Amazon, eBay, etc.
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Name *
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* Price & Quantity */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.currency}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, currency: e.target.value }))
            }
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={formData.quantity}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, quantity: e.target.value }))
          }
        />
      </div>

      {/* Image Upload/URL */}
      <ImageUpload
        currentImageUrl={formData.imageUrl}
        onImageChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
        type="item"
        label="Product Image"
      />

      {/* Purchase Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purchase Link
        </label>
        <input
          type="url"
          placeholder="https://example.com/product"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 mb-2"
          value={formData.purchaseUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, purchaseUrl: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Link Label"
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={formData.purchaseLabel}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, purchaseLabel: e.target.value }))
          }
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 border border-transparent rounded-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
        </button>
      </div>
    </form>
  );
}
