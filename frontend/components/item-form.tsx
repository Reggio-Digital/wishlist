'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';
import { scrapingApi, type Item } from '@/lib/api';

interface ItemFormProps {
  initialData?: Partial<Item>;
  onSubmit: (data: Partial<Item>) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ItemForm({ initialData, onSubmit, onCancel, isEditing = false }: ItemFormProps) {
  const t = useTranslations('item');
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    currency: initialData?.currency || 'USD',
    quantity: initialData?.quantity?.toString() || '1',
    priority: initialData?.priority || 'medium',
    imageUrl: initialData?.imageUrl || '',
    purchaseUrl: initialData?.purchaseUrls?.[0]?.url || '',
    purchaseLabel: initialData?.purchaseUrls?.[0]?.label || '',
    notes: initialData?.notes || '',
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
      setScrapeError(error.message || t('failedToScrape'));
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
        priority: formData.priority as 'low' | 'medium' | 'high',
        imageUrl: formData.imageUrl || null,
        purchaseUrls,
        notes: formData.notes || null,
      });
    } catch (error: any) {
      setSubmitError(error.message || t('failedToSave'));
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
            {t('autoFillUrl')}
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              placeholder={t('urlPlaceholder')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
            />
            <button
              type="button"
              onClick={handleScrape}
              disabled={isScraping || !scrapeUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isScraping ? t('scraping') : t('scrape')}
            </button>
          </div>
          {scrapeError && (
            <p className="mt-2 text-sm text-red-600">{scrapeError}</p>
          )}
          <p className="mt-2 text-xs text-gray-600">
            {t('scrapeSupport')}
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('nameRequired')}
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('description')}
        </label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            {t('price')}
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('currency')}
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('quantity')}
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quantity: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('priority')}
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, priority: e.target.value }))
            }
          >
            <option value="low">{t('priorityLow')}</option>
            <option value="medium">{t('priorityMedium')}</option>
            <option value="high">{t('priorityHigh')}</option>
          </select>
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('imageUrl')}
        </label>
        <input
          type="url"
          placeholder={t('imageUrlPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
          }
        />
        {formData.imageUrl && (
          <img
            src={formData.imageUrl}
            alt={t('preview')}
            className="mt-2 max-w-xs h-32 object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Purchase Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('purchaseLink')}
        </label>
        <input
          type="url"
          placeholder={t('purchaseLinkPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
          value={formData.purchaseUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, purchaseUrl: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder={t('linkLabel')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.purchaseLabel}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, purchaseLabel: e.target.value }))
          }
        />
      </div>

      {/* Private Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('privateNotes')}
        </label>
        <textarea
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t('saving') : isEditing ? t('updateItem') : t('createItem')}
        </button>
      </div>
    </form>
  );
}
