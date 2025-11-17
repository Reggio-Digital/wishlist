'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [useUrl, setUseUrl] = useState(!!currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const uploadFile = (file: File) => {
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
    setUploadProgress(0);
    setUploadError('');
    onUploadStateChange?.(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          setImageUrl(data.url);
          onImageChange(data.url);
          setUploadProgress(100);
        } catch (error) {
          console.error('Failed to parse response:', error);
          setUploadError('Failed to parse server response');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadError(data.error || 'Upload failed');
        } catch {
          setUploadError(`Upload failed with status ${xhr.status}`);
        }
      }
      setIsUploading(false);
      onUploadStateChange?.(false);
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      console.error('Upload error');
      setUploadError('Network error occurred during upload');
      setIsUploading(false);
      onUploadStateChange?.(false);
    });

    // Handle abort
    xhr.addEventListener('abort', () => {
      setUploadError('Upload was cancelled');
      setIsUploading(false);
      onUploadStateChange?.(false);
    });

    xhr.open('POST', '/uploads');
    xhr.send(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    // Only handle paste if we're in upload mode (not URL mode)
    if (useUrl || imageUrl) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if the item is an image
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();

        const file = item.getAsFile();
        if (file) {
          uploadFile(file);
        }
        break;
      }
    }
  };

  // Add paste event listener
  useEffect(() => {
    const handlePasteEvent = (e: Event) => handlePaste(e as ClipboardEvent);

    // Listen for paste events on the component's container
    const pasteArea = pasteAreaRef.current;
    if (pasteArea) {
      pasteArea.addEventListener('paste', handlePasteEvent);
    }

    // Also listen globally when in upload mode and no image is set
    if (!useUrl && !imageUrl) {
      document.addEventListener('paste', handlePasteEvent);
    }

    return () => {
      if (pasteArea) {
        pasteArea.removeEventListener('paste', handlePasteEvent);
      }
      document.removeEventListener('paste', handlePasteEvent);
    };
  }, [useUrl, imageUrl]);

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
    <div ref={pasteAreaRef} className="space-y-3" tabIndex={-1}>
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
              <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                💡 Tip: You can also paste an image directly (Ctrl+V / Cmd+V)
              </p>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded text-base">
              {uploadError}
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                <span>Uploading...</span>
                <span className="font-medium">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
