'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { claimingApi } from '@/lib/api';

interface MyClaim {
  token: string;
  itemName: string;
  wishlistSlug: string;
}

export default function MyClaimsPage() {

  const [claims, setClaims] = useState<Record<string, MyClaim>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedClaims = localStorage.getItem('myClaims');
    if (storedClaims) {
      setClaims(JSON.parse(storedClaims));
    }
    setIsLoading(false);
  }, []);

  const handleUnclaim = async (itemId: string, token: string) => {
    if (!confirm('Are you sure you want to unclaim this item?')) return;

    try {
      await claimingApi.unclaim(token);
      const updatedClaims = { ...claims };
      delete updatedClaims[itemId];
      setClaims(updatedClaims);
      localStorage.setItem('myClaims', JSON.stringify(updatedClaims));
    } catch (error: any) {
      alert(error.message || 'Failed to unclaim item');
    }
  };

  const handleMarkPurchased = async (itemId: string, token: string) => {
    try {
      await claimingApi.updateClaim(token, undefined, undefined, true);
      alert('Item marked as purchased successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to update claim');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const claimsList = Object.entries(claims);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Claims</h1>
          <p className="text-gray-600">
            Track items you've claimed to buy for others
          </p>
        </div>

        {claimsList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No claims yet</p>
            <p className="text-sm text-gray-400">
              When you claim items from wishlists, they will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claimsList.map(([itemId, claim]) => (
              <div key={itemId} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {claim.itemName}
                    </h3>
                    <Link
                      href={`/${claim.wishlistSlug}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Wishlist
                    </Link>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleMarkPurchased(itemId, claim.token)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Mark Purchased
                    </button>
                    <button
                      onClick={() => handleUnclaim(itemId, claim.token)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Unclaim
                    </button>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                  <p>
                    <strong>Claim Token:</strong> {claim.token.substring(0, 16)}...
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Save this token to access your claim on other devices
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            About Claims
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Claims are stored locally in your browser
            </p>
            <p>
              • Use your token to access claims on other devices
            </p>
            <p>
              • This is an honor system - please respect other people's claims
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
