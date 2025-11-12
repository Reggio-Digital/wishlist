# Wishlist App

A simple, self-hosted wishlist manager for families and friends. Create wishlists, share them with a link, and let people claim items without needing accounts.

## Why?

Ever wanted to share a wishlist for birthdays, holidays, or weddings without giving your data to a company? This is for you. It's designed to be dead simple to self-host and use.

**Features:**
- Create unlimited wishlists with custom URLs (e.g., yoursite.com/christmas-2024)
- Share lists publicly with a simple link
- People can claim items using the honor system - no accounts needed
- Paste a product URL and auto-fill details (works with Amazon, Target, Walmart, etc.)
- Drag-and-drop to reorder items
- Works great on mobile and desktop
- One admin user (you), keeps things simple

**Built with:** Node.js, Express, SQLite, Next.js, Tailwind CSS

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

## Quick Start

### Docker (Recommended)

```bash
# Clone and setup
git clone <repository-url>
cd wishlist-app

# Set your admin credentials
cp .env.example .env
nano .env  # Edit ADMIN_USERNAME and ADMIN_PASSWORD

# Start it up
docker-compose up -d

# Visit http://localhost:3001
```

That's it! Your wishlist app is running.

**Useful commands:**
```bash
docker-compose logs -f              # View logs
docker-compose down                 # Stop everything
docker-compose up -d --build        # Rebuild after updates

# Backup your database
docker cp wishlist-backend:/app/data/wishlist.db ./backup.db
```

**Using Nginx for production?** Uncomment the nginx service in `docker-compose.yml` and see `nginx/README.md` for SSL setup.

### Manual Setup (without Docker)

If you prefer to run it directly:

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Setup environment
cp .env.example .env
nano .env  # Set ADMIN_USERNAME and ADMIN_PASSWORD

# Run backend (terminal 1)
npm run dev

# Run frontend (terminal 2)
cd frontend && npm run dev
```

Visit http://localhost:3001 to use the app.

**Sample Data Included!**

When you first start the app, it automatically creates two sample wishlists (Dad's and Mom's) with 5 items each. This helps you see the app in action right away. You can delete or modify these through the admin dashboard once you're familiar with how everything works.

### Configuration

Your `.env` file needs at minimum:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

Optional settings:
```env
# Server configuration
PORT=3000
NODE_ENV=development

# Access control
ACCESS_PASSWORD=                    # Add a password for public access if you want

# Localization
DEFAULT_CURRENCY=USD                # Currency for prices
TZ=America/New_York                 # Your timezone

# JWT secrets are auto-generated and saved to data/secrets.json
# Only set SECRET manually for multi-instance deployments
# SECRET=your-secret-here
```

Environment variables you can set:
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `DEFAULT_CURRENCY` - Default currency (e.g., USD)
- `TZ` - Timezone (e.g., America/New_York)

JWT secrets are auto-generated on first run and saved to `data/secrets.json`.

## How It Works

**For admins (you):**
1. Log in at `/admin/login`
2. Create wishlists and add items
3. Share the wishlist URL with family/friends
4. Items always appear unclaimed to you (honor system works both ways!)

**For everyone else:**
1. Visit the shared wishlist URL (no login needed)
2. See what's available and what's already claimed
3. Claim an item by adding your name
4. Get a special URL to manage your claims later

The claiming system runs on trust - perfect for families and close friends.

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

## A Few Tips

**Security basics:**
- Use a strong admin password
- Run behind HTTPS in production (use Caddy or Let's Encrypt with nginx)
- Keep your `.env` file private (it's gitignored by default)
- Back up your `data/` folder - that's where your database lives

**Updating:**
```bash
git pull
docker-compose up -d --build
```

**If something breaks:**
- Check logs: `docker-compose logs -f`
- Make sure your `.env` file is set up correctly
- Database is SQLite, stored in `data/wishlist.db` - you can inspect it with any SQLite tool

## Contributing

This is a simple self-hosted app built for personal use. If you find bugs or want to add features, feel free to open an issue or PR. See [TODO.md](TODO.md) for ideas.

## License

MIT - use it however you want!
