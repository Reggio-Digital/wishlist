import Link from 'next/link';

export default function Footer() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-3 text-gray-500">
          <p>Built for families</p>
          <span>•</span>
          <p>
            Made with ❤️ by{' '}
            <a
              href="https://reggiodigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Reggio Digital
            </a>
          </p>
        </div>
        <Link
          href="/admin/login"
          className="text-gray-400 hover:text-gray-600"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}
