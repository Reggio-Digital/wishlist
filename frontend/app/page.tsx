import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Wishlist App
          </h1>
          <p className="text-xl text-gray-600">
            Self-hosted wishlist application for families
          </p>
          <p className="text-gray-500">
            Create wishlists, share them with friends and family, and let them claim items with our honor-based system
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/admin/login"
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Admin Login
          </Link>
          <Link
            href="/my-claims"
            className="w-full sm:w-auto px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
          >
            My Claims
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Create Wishlists
            </h3>
            <p className="text-sm text-gray-600">
              Organize your wishes into multiple lists with custom slugs and share them easily
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Claim Items
            </h3>
            <p className="text-sm text-gray-600">
              Let others claim items with our honor-based system - no account required
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privacy Focused
            </h3>
            <p className="text-sm text-gray-600">
              Self-hosted and secure. You own your data and control who sees what
            </p>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-sm text-gray-500">
            Open source • Self-hosted • Built for families
          </p>
        </div>
      </div>
    </div>
  );
}
