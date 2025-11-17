'use client';

import { useState } from 'react';
import { type Wishlist, type Item, itemsApi } from '@/lib/api';
import ImageUpload from '@/components/image-upload';
import RichTextEditor from '@/components/RichTextEditor';
import ItemCard from './ItemCard';
import ItemForm from './ItemForm';

interface WishlistCardProps {
  wishlist: Wishlist;
  itemCount: number;
  onUpdate: (id: string, data: Partial<Wishlist>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: (id: string) => Promise<void>;
  onMoveDown: (id: string) => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
  onItemsChange: () => void;
}

export default function WishlistCard({
  wishlist,
  itemCount,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onItemsChange,
}: WishlistCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    preferences: '',
    imageUrl: '',
    isPublic: true,
  });
  const [editError, setEditError] = useState('');
  const [isWishlistImageUploading, setIsWishlistImageUploading] = useState(false);
  const [expandedWishlistId, setExpandedWishlistId] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Item[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemError, setNewItemError] = useState<string>('');

  const startEditing = () => {
    setEditingId(wishlist.id);
    setEditForm({
      name: wishlist.name,
      slug: wishlist.slug,
      description: wishlist.description || '',
      preferences: wishlist.preferences || '',
      imageUrl: wishlist.imageUrl || '',
      isPublic: wishlist.isPublic,
    });
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError('');
  };

  const handleEditNameChange = (name: string) => {
    setEditForm((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  const handleUpdateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    try {
      await onUpdate(wishlist.id, editForm);
      setEditingId(null);
    } catch (error: any) {
      setEditError(error.message || 'Failed to update wishlist');
    }
  };

  const toggleWishlistExpand = async () => {
    if (expandedWishlistId === wishlist.id) {
      setExpandedWishlistId(null);
    } else {
      setExpandedWishlistId(wishlist.id);
      const items = await itemsApi.getAll(wishlist.id);
      setWishlistItems(items);
    }
  };

  const handleCreateItem = async (itemData: Partial<Item>) => {
    setNewItemError('');
    try {
      await itemsApi.create(wishlist.id, itemData);
      setShowAddItemForm(false);
      const items = await itemsApi.getAll(wishlist.id);
      setWishlistItems(items);
      onItemsChange();
    } catch (error: any) {
      setNewItemError(error.message || 'Failed to create item');
      throw error;
    }
  };

  const handleUpdateItem = async (itemData: Partial<Item>) => {
    if (!editingItemId) return;
    try {
      await itemsApi.update(editingItemId, itemData);
      setEditingItemId(null);
      const items = await itemsApi.getAll(wishlist.id);
      setWishlistItems(items);
      onItemsChange();
    } catch (error: any) {
      alert(error.message || 'Failed to update item');
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsApi.delete(itemId);
      const items = await itemsApi.getAll(wishlist.id);
      setWishlistItems(items);
      onItemsChange();
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleMoveItemUp = async (itemId: string) => {
    const currentIndex = wishlistItems.findIndex((item) => item.id === itemId);
    if (currentIndex <= 0) return;

    try {
      await itemsApi.reorder(itemId, currentIndex - 1);
      const updatedItems = await itemsApi.getAll(wishlist.id);
      setWishlistItems(updatedItems);
    } catch (error: any) {
      alert(error?.message || 'Failed to reorder item');
    }
  };

  const handleMoveItemDown = async (itemId: string) => {
    const currentIndex = wishlistItems.findIndex((item) => item.id === itemId);
    if (currentIndex === -1 || currentIndex === wishlistItems.length - 1) return;

    try {
      await itemsApi.reorder(itemId, currentIndex + 1);
      const updatedItems = await itemsApi.getAll(wishlist.id);
      setWishlistItems(updatedItems);
    } catch (error: any) {
      alert(error?.message || 'Failed to reorder item');
    }
  };

  const editingItem = wishlistItems.find((item) => item.id === editingItemId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        {editError && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-base">
            {editError}
          </div>
        )}
        <div className="flex items-stretch -m-5">
          {/* Arrow buttons on the left */}
          <div className="flex flex-col w-12 border-r border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(wishlist.id);
              }}
              disabled={isFirst}
              className="flex-1 flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move up"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(wishlist.id);
              }}
              disabled={isLast}
              className="flex-1 flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move down"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-5">
            {editingId === wishlist.id ? (
              // Inline Edit Mode
              <div className="space-y-3">
                <ImageUpload
                  currentImageUrl={editForm.imageUrl}
                  onImageChange={(url) =>
                    setEditForm((prev) => ({ ...prev, imageUrl: url }))
                  }
                  onUploadStateChange={setIsWishlistImageUploading}
                  type="wishlist"
                  label="Wishlist Image"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleEditNameChange(e.target.value)}
                      className="text-lg font-bold px-2 py-1 border-2 border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white flex-1"
                      placeholder="Wishlist name"
                    />
                    <label className="flex items-center gap-2 text-base">
                      <input
                        type="checkbox"
                        checked={editForm.isPublic}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            isPublic: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Public</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="text-base px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white w-full"
                    placeholder="url-slug"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="text-base px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white w-full"
                    placeholder="Description"
                    rows={2}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preferences
                    </label>
                    <RichTextEditor
                      value={editForm.preferences}
                      onChange={(html) => setEditForm((prev) => ({ ...prev, preferences: html }))}
                      placeholder="General interests and preferences..."
                    />
                  </div>
                  <p className="text-base text-gray-500 dark:text-gray-500">
                    {itemCount} items
                  </p>
                </div>
              </div>
            ) : (
              // Display Mode
              <div className="flex items-start gap-3">
                {wishlist.imageUrl && (
                  <img
                    src={wishlist.imageUrl}
                    alt={wishlist.name}
                    className="w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {wishlist.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-base font-medium ${
                        wishlist.isPublic
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {wishlist.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-1">
                    /{wishlist.slug}
                  </p>
                  {wishlist.description && (
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-1">
                      {wishlist.description}
                    </p>
                  )}
                  <p className="text-base text-gray-500 dark:text-gray-500">
                    {itemCount} items
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col w-24 border-l border-gray-200 dark:border-gray-700">
            {editingId === wishlist.id ? (
              <>
                <button
                  onClick={cancelEditing}
                  className="flex-1 flex items-center justify-center text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700"
                  title="Cancel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleUpdateWishlist(e as any);
                  }}
                  disabled={isWishlistImageUploading}
                  className="flex-1 flex items-center justify-center text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isWishlistImageUploading ? "Uploading..." : "Save"}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing();
                  }}
                  className="flex-1 flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                  title="Edit wishlist"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(wishlist.id);
                  }}
                  className="flex-1 flex items-center justify-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                  title="Delete wishlist"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Row */}
      <button
        onClick={toggleWishlistExpand}
        className="w-full px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {expandedWishlistId === wishlist.id ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>Hide Items</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>Show Items ({itemCount})</span>
          </>
        )}
      </button>

      {/* Items Section */}
      {expandedWishlistId === wishlist.id && (
        <div className="p-5 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Items ({wishlistItems.length})
            </h4>
            <button
              onClick={() => {
                setShowAddItemForm(true);
                setNewItemError('');
              }}
              className="px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              + Add Item
            </button>
          </div>

          {/* Add Item Form */}
          {showAddItemForm && (
            <ItemForm
              mode="create"
              onSubmit={handleCreateItem}
              onCancel={() => {
                setShowAddItemForm(false);
                setNewItemError('');
              }}
              error={newItemError}
            />
          )}

          {/* Items List */}
          {wishlistItems.length === 0 ? (
            <p className="text-base text-gray-500 dark:text-gray-400 text-center py-4">
              No items yet
            </p>
          ) : (
            <div className="space-y-3">
              {wishlistItems.map((item, index) => (
                <div key={item.id}>
                  {editingItemId === item.id ? (
                    <ItemForm
                      mode="edit"
                      item={editingItem}
                      onSubmit={handleUpdateItem}
                      onCancel={() => setEditingItemId(null)}
                    />
                  ) : (
                    <ItemCard
                      item={item}
                      onEdit={() => setEditingItemId(item.id)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onMoveUp={() => handleMoveItemUp(item.id)}
                      onMoveDown={() => handleMoveItemDown(item.id)}
                      isFirst={index === 0}
                      isLast={index === wishlistItems.length - 1}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
