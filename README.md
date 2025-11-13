# Wishlist App

Self-hosted wishlist manager for families and friends. Create wishlists for birthdays, holidays, weddings, and more. Share them via simple URLs with an honor-based claiming system.

## Quick Start

### Using Docker (Recommended)

```bash
# Clone and configure
git clone <repository-url>
cd wishlist-app
cp .env.example .env

# Edit .env with your admin credentials
nano .env

# Start with Docker
docker-compose up -d
```

Visit http://localhost:3000

### Using Pre-built Docker Image

```bash
# Pull from Docker Hub (coming soon)
docker pull <your-dockerhub-username>/wishlist-app:latest

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  -v wishlist-data:/app/data \
  --name wishlist-app \
  <your-dockerhub-username>/wishlist-app:latest
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file:

```env
# Required - Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

# Optional - JWT Secrets (auto-generated if not provided)
SECRET=
REFRESH_SECRET=
```

## Features

- **Admin Dashboard**: Manage wishlists and items
- **Public Wishlist View**: Share wishlists with custom slugs
- **Claim System**: Honor-based claiming with local storage
- **URL Scraping**: Auto-fill item details from product URLs (Amazon, Target, Walmart, Best Buy)
- **Responsive Design**: Works on desktop and mobile
- **Single Container**: Easy Docker deployment

## Pages

- `/admin/login` - Admin authentication
- `/admin/dashboard` - Overview and stats
- `/admin/wishlists` - Manage wishlists
- `/admin/wishlists/[id]` - Wishlist detail with items
- `/admin/settings` - Change password
- `/[slug]` - Public wishlist view
- `/my-claims` - Manage claimed items

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4
- **Database**: SQLite with Drizzle ORM
- **Auth**: JWT with bcrypt
- **Scraping**: Cheerio + Axios

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Docker setup
- SSL/TLS configuration
- Database backups
- Monitoring

## License

MIT
