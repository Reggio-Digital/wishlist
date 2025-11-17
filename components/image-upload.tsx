'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  type: 'wishlist' | 'item';
  label?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
}

export default function ImageUpload({
  currentImageUrl,
  onImageChange,
  type,
  label = 'Image',
  onUploadStateChange,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [useUrl, setUseUrl] = useState(!!currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > maxSize) {
      setUploadError('File is too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    onUploadStateChange?.(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/uploads', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrl(data.url);
      onImageChange(data.url);
    } catch (error: any) {
      console.error('Image upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      onUploadStateChange?.(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onImageChange(url);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {imageUrl ? (
        /* Image Preview with Remove Button */
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors"
            title="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          {/* Toggle between URL and File Upload */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setUseUrl(true)}
              className={`px-3 py-2 text-base rounded cursor-pointer transition-colors ${
                useUrl
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Use URL
            </button>
            <button
              type="button"
              onClick={() => setUseUrl(false)}
              className={`px-3 py-2 text-base rounded cursor-pointer transition-colors ${
                !useUrl
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Upload File
            </button>
          </div>

          {useUrl ? (
            /* URL Input */
            <div>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </div>
          ) : (
            /* File Upload */
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={isUploading}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Max 5MB. Allowed: JPEG, PNG, WebP, GIF. Images will be resized to max 800x800px and optimized.
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded text-base">
              {uploadError}
            </div>
          )}

          {/* Uploading Status */}
          {isUploading && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-base">
              Uploading...
            </div>
          )}
        </>
      )}
    </div>
  );
}
