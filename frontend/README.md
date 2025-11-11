# Wishlist App Frontend

Next.js 15 frontend for the Wishlist App.

## Development

```bash
# Install dependencies
npm install

# Run development server (on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file if you need to customize the API URL:

```env
# API URL (backend) - defaults to http://localhost:3000/api
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Features

- **Admin Dashboard**: Manage wishlists and items
- **Public Wishlist View**: Share wishlists with custom slugs
- **Claim System**: Honor-based claiming with local storage
- **URL Scraping**: Auto-fill item details from product URLs
- **Responsive Design**: Works on desktop and mobile

## Pages

- `/` - Home page
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Overview and stats
- `/admin/wishlists` - Manage wishlists
- `/admin/wishlists/[id]` - Wishlist detail with items
- `/admin/settings` - Change password
- `/[slug]` - Public wishlist view
- `/my-claims` - Manage claimed items

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS 4
- **State**: React Context API
- **HTTP**: Fetch API
- **Storage**: localStorage (for claims)
