interface PurchaseUrl {
  label: string;
  url: string;
}

interface PurchaseUrlFieldsProps {
  purchaseUrls: PurchaseUrl[];
  onChange: (urls: PurchaseUrl[]) => void;
}

export default function PurchaseUrlFields({ purchaseUrls, onChange }: PurchaseUrlFieldsProps) {
  const handleAdd = () => {
    onChange([...purchaseUrls, { label: '', url: '' }]);
  };

  const handleRemove = (index: number) => {
    onChange(purchaseUrls.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...purchaseUrls];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
        Purchase URLs
      </label>
      <div className="space-y-2">
        {purchaseUrls.map((urlObj, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
            <input
              type="text"
              placeholder="Label (e.g., Amazon)"
              value={urlObj.label}
              onChange={(e) => handleUpdate(index, 'label', e.target.value)}
              className="w-full sm:w-1/3 px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={urlObj.url}
              onChange={(e) => handleUpdate(index, 'url', e.target.value)}
              className="flex-1 px-2 py-1.5 text-base border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
              title="Remove URL"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="w-full px-3 py-2 text-base border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          + Add URL
        </button>
      </div>
    </div>
  );
}
