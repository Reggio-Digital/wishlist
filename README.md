# Wishlist App

Self-hosted wishlist application with slug-based public sharing and claim tracking using an honor system.

## About

A privacy-focused, self-hosted wishlist manager designed for families. Simple and practical:
- Create multiple wishlists with custom slugs (e.g., /christmas-2024)
- Share public wishlists via simple URLs
- Allow others to claim items (honor system - no account required)
- Manage items with image URLs, prices, and purchase links
- Single admin user model - keep it simple and secure
- Lightweight and easy to self-host

## Current Status

**Implemented:**
- ✅ Backend Express server with full REST API
- ✅ Database setup (SQLite + Drizzle ORM)
- ✅ JWT-based authentication system
- ✅ Admin authentication and password management
- ✅ Wishlists CRUD (admin + public)
- ✅ Items CRUD (admin + public)
- ✅ Drag-and-drop item reordering
- ✅ Public claiming system (honor-based, no auth)
- ✅ URL scraping for auto-filling item details
- ✅ **Next.js 15 frontend with full UI**
- ✅ **Admin dashboard and management interface**
- ✅ **Public wishlist viewing and claiming**
- ✅ **Responsive design for mobile and desktop**

**Next Up:**
- 🚧 Docker deployment configuration
- 🚧 Testing and security hardening

See [TODO.md](TODO.md) for the full feature roadmap.

## Tech Stack

- **Backend:** Node.js 20+, Express.js, SQLite, Drizzle ORM
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Deployment:** Docker (planned)

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

This project has both a backend and frontend that need to be run separately.

**Backend Setup:**
```bash
# Install backend dependencies
npm install

# Create .env file with admin credentials
cp .env.example .env
# Edit .env and set ADMIN_USERNAME and ADMIN_PASSWORD

# Run backend server (port 3000)
npm run dev
```

**Frontend Setup:**
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Run frontend server (port 3001)
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Admin login: http://localhost:3001/admin/login

**Production Build:**
```bash
# Build backend
npm run build
npm start

# Build frontend (from frontend directory)
cd frontend
npm run build
npm start
```

### Docker Deployment (Recommended)

The easiest way to deploy is using Docker Compose:

**Quick Start:**
```bash
# 1. Clone the repository
git clone <repository-url>
cd wishlist-app

# 2. Create .env file
cp .env.example .env
# Edit .env and set ADMIN_USERNAME and ADMIN_PASSWORD

# 3. Start with Docker Compose
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
```

**Production Deployment with Nginx:**
```bash
# 1. Uncomment nginx service in docker-compose.yml

# 2. Configure SSL (optional but recommended)
# See nginx/README.md for SSL setup instructions

# 3. Update nginx.conf with your domain

# 4. Start the stack
docker-compose up -d

# 5. Your app is now available at http://your-domain.com
```

**Docker Commands:**
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Backup database
docker cp wishlist-backend:/app/data/wishlist.db ./backup.db
```

**Environment Variables for Docker:**

Set these in your `.env` file or in `docker-compose.yml`:
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `DEFAULT_CURRENCY` - Default currency (e.g., USD)
- `TZ` - Timezone (e.g., America/New_York)

See `.env.example` for all available options.

### Environment Variables

Create a `.env` file with your admin credentials:

```env
# Required
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

# Optional
PORT=3000
NODE_ENV=development
ACCESS_PASSWORD=
DEFAULT_CURRENCY=USD
TZ=America/New_York

# JWT secrets are auto-generated and saved to data/secrets.json
# Only set SECRET manually for multi-instance deployments
# SECRET=your-secret-here
```

**Note:** JWT secrets are automatically generated and persisted on first run. You don't need to configure them unless running multiple instances.

## Project Structure

```
wishlist-app/
├── src/                   # Backend (Express API)
│   ├── server.ts          # Main server file
│   ├── auth/              # Authentication system
│   ├── wishlists/         # Wishlist routes
│   ├── items/             # Item routes
│   ├── claiming/          # Public claiming system
│   ├── scraping/          # URL scraping service
│   └── db/                # Database layer
├── frontend/              # Frontend (Next.js)
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/               # API client & utilities
│   └── Dockerfile         # Frontend Docker image
├── nginx/                 # Reverse proxy configs
│   ├── nginx.conf         # Nginx configuration
│   └── Caddyfile.example  # Caddy configuration
├── drizzle/               # Database migrations
├── data/                  # SQLite database (runtime)
├── Dockerfile             # Backend Docker image
├── docker-compose.yml     # Docker orchestration
├── .env.example           # Environment template
├── package.json           # Backend dependencies
└── tsconfig.json          # Backend TypeScript config
```

## API Endpoints

### Currently Available

**Health:**
- `GET /api/health` - Health check

**Authentication:**
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout (clears tokens)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info (requires auth)
- `PATCH /api/auth/password` - Change password (requires auth)

**Wishlists:**
- `GET /api/wishlists` - List all wishlists (admin only)
- `POST /api/wishlists` - Create wishlist (admin only)
- `GET /api/wishlists/:id` - Get single wishlist (admin only)
- `PATCH /api/wishlists/:id` - Update wishlist (admin only)
- `DELETE /api/wishlists/:id` - Delete wishlist (admin only)
- `GET /:slug` - Public wishlist view (no auth required if public)

**Items:**
- `GET /api/wishlists/:id/items` - List items (public if wishlist is public)
- `POST /api/wishlists/:id/items` - Create item (admin only)
- `GET /api/items/:id` - Get single item (public if wishlist is public)
- `PATCH /api/items/:id` - Update item (admin only)
- `DELETE /api/items/:id` - Delete item (admin only)
- `POST /api/items/:id/reorder` - Reorder item for drag-and-drop (admin only)

**Claiming (Public, no auth required):**
- `POST /api/public/items/:id/claim` - Claim an item (returns claim token)
- `DELETE /api/public/claims/:claimToken` - Unclaim an item
- `PATCH /api/public/claims/:claimToken` - Update claim info (name, note, isPurchased)

**Scraping (Admin only):**
- `POST /api/scrape` - Scrape product info from URL (returns title, description, price, currency, imageUrl)
  - Supports: Amazon, Target, Walmart, Best Buy, and generic sites via Open Graph tags

### Planned
See [TODO.md](TODO.md) for the full API specification.

## Security

### JWT Secrets
- **Auto-generated**: Cryptographically secure 512-bit secrets using `crypto.randomBytes(64)`
- **Persistent**: Saved to `data/secrets.json` with file permissions `0600` (owner read/write only)
- **Gitignored**: `data/` directory is excluded from version control
- **Rotation**: To rotate secrets, delete `data/secrets.json` and restart (invalidates all existing tokens)

### Deployment Security Checklist
- [ ] Set strong `ADMIN_PASSWORD` in production
- [ ] Ensure `data/` directory is not publicly accessible
- [ ] Use HTTPS in production (set `NODE_ENV=production`)
- [ ] Consider setting `SECRET` manually for multi-instance deployments
- [ ] Keep dependencies updated (`npm audit` and `npm update`)
- [ ] Review file permissions on `data/` directory

### Password Storage
- Admin password is stored in environment variables (not hashed in this simple auth model)
- Ensure `.env` file has restricted permissions: `chmod 600 .env`
- Never commit `.env` file to version control

### Database Migrations
- Migrations are in `drizzle/` directory
- Run automatically on server start
- Migration 0001 removes the old Settings table (now using env vars)

## Contributing

This is a self-hosted project. See [TODO.md](TODO.md) for planned features and implementation details.

## License

MIT
