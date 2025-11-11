'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/protected-route';
import AdminNav from '@/components/admin-nav';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';

export default function SettingsPage() {
  const { accessToken } = useAuth();
  const tAdmin = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(tAdmin('passwordsNoMatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(tAdmin('passwordMinLengthError'));
      return;
    }

    if (!accessToken) return;

    setIsSubmitting(true);

    try {
      await authApi.changePassword(accessToken, currentPassword, newPassword);
      setSuccess(tAdmin('passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || tAdmin('failedToChangePassword'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{tAdmin('settings')}</h1>

            {/* Change Password Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {tAdmin('changePassword')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                {error && (
                  <div className="p-4 bg-red-50 text-red-800 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 text-green-800 rounded-md text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tAdmin('currentPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tAdmin('newPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {tAdmin('passwordMinLength')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {tAdmin('confirmPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? tAdmin('changingPassword') : tAdmin('changePassword')}
                  </button>
                </div>
              </form>
            </div>

            {/* App Information */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {tAdmin('appInfo')}
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>{tAdmin('version')}</strong> 0.1.0
                </p>
                <p>
                  <strong>{tAdmin('environment')}</strong>{' '}
                  {process.env.NODE_ENV || 'development'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
