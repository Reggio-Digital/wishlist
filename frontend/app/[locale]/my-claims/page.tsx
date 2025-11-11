'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { claimingApi } from '@/lib/api';

interface MyClaim {
  token: string;
  itemName: string;
  wishlistSlug: string;
}

export default function MyClaimsPage() {
  const t = useTranslations('claims');
  const tItem = useTranslations('item');
  const tCommon = useTranslations('common');

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
    if (!confirm(tItem('unclaimConfirm'))) return;

    try {
      await claimingApi.unclaim(token);
      const updatedClaims = { ...claims };
      delete updatedClaims[itemId];
      setClaims(updatedClaims);
      localStorage.setItem('myClaims', JSON.stringify(updatedClaims));
    } catch (error: any) {
      alert(error.message || tItem('unclaimFailed'));
    }
  };

  const handleMarkPurchased = async (itemId: string, token: string) => {
    try {
      await claimingApi.updateClaim(token, undefined, undefined, true);
      alert(tItem('markPurchasedSuccess'));
    } catch (error: any) {
      alert(error.message || tItem('updateClaimFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tCommon('loading')}</p>
      </div>
    );
  }

  const claimsList = Object.entries(claims);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {claimsList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">{t('noClaimsYet')}</p>
            <p className="text-sm text-gray-400">
              {t('whenYouClaim')}
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
                      {t('viewWishlist')}
                    </Link>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleMarkPurchased(itemId, claim.token)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {tItem('markPurchased')}
                    </button>
                    <button
                      onClick={() => handleUnclaim(itemId, claim.token)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      {tItem('unclaim')}
                    </button>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                  <p>
                    <strong>{t('claimToken')}</strong> {claim.token.substring(0, 16)}...
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('saveToken')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('aboutClaims')}
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • {t('storedLocally')}
            </p>
            <p>
              • {t('useToken')}
            </p>
            <p>
              • {t('honorSystem')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
