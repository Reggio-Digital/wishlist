# Wishlist

[![Docker Hub](https://img.shields.io/docker/pulls/reggiodigital/wishlist)](https://hub.docker.com/r/reggiodigital/wishlist)
[![License](https://img.shields.io/github/license/Reggio-Digital/wishlist)](https://github.com/Reggio-Digital/wishlist/blob/main/LICENSE)

A simple, self-hosted wishlist app for sharing gift ideas with family and friends.

## Why This App?

Most wishlist apps are bloated with features you don't need, require accounts for everyone, or lock you into a platform. This app solves a simple problem: you want to share what you'd like as gifts, and your friends and family want to claim items without spoiling the surprise.

**Features:**

- **Simple** - No complex features, just wishlists and items
- **Easy to Share** - Send a single URL, no signups required
- **Multiple Purchase Links** - Add multiple store links for each item so people can choose where to buy
- **Public/Private Wishlists** - Keep lists private while you're working on them, then make them public when ready
- **No Peeking!** - Admins can't see claimed items from the dashboard - you'd have to visit the specific wishlist's public URL to spoil the surprise
- **Privacy-Focused** - Self-hosted, your data stays with you
- **Transparent** - Anyone viewing the list can see what's been claimed to avoid duplicates
- **Low Maintenance** - Single Docker container with SQLite, no database setup needed
- **URL Scraping** - Auto-fill item details from product URLs _(Coming Soon)_

## Demo

![Demo Video](video.mp4)

## Screenshots

### Homepage

![Homepage](screenshot1.png)

### Wishlist View

![Wishlist View](screenshot2.png)

### Admin Dashboard

![Admin Dashboard](screenshot3.png)

### Admin Dashboard - Item Details

![Admin Dashboard - Item Details](screenshot4.png)

## Quick Start

### Using Docker Compose

```bash
# Clone and configure
git clone https://github.com/Reggio-Digital/wishlist
cd wishlist
cp .env.example .env

# Edit .env with your admin credentials
nano .env

# Start with Docker Compose
docker-compose up -d
```

Visit http://localhost:3000

### Using Docker Image

```bash
docker run -d \
  -p 3000:3000 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  -v wishlist-data:/app/data \
  --name wishlist \
  reggiodigital/wishlist:latest
```

**For Unraid users:** Set `-e PUID=99 -e PGID=100`

## Data Storage

Data is stored in `/app/data`:

- `/app/data/db` - SQLite database files
- `/app/data/uploads` - Uploaded images

## Environment Variables

Create a `.env` file:

```env
# Required - Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

# Optional - User/Group IDs for docker-compose (defaults to 1000:1000)
# For Unraid, use PUID=99 and PGID=100
PUID=1000
PGID=1000

# Optional - JWT Secret (auto-generated if not provided)
# Generate with: openssl rand -base64 32
SECRET=

# Optional - Cookie Security
# Set to 'false' for HTTP access (e.g., local LAN without HTTPS)
# When unset, auto-detects HTTPS via X-Forwarded-Proto header
COOKIE_SECURE=false
```

### User Permissions (PUID/PGID)

The container automatically handles file permissions using PUID/PGID environment variables (LinuxServer.io pattern):

- **Default:** `1000:1000` (standard Linux user)
- **Unraid:** Set `PUID=99` and `PGID=100` (nobody:users)
- **Find your IDs:** Run `id` on your system

Example for Unraid in `.env`:
```env
PUID=99
PGID=100
```

The entrypoint script automatically:
- Creates the user/group if needed
- Sets correct ownership on data directories
- Ensures proper file permissions for uploads

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

## Pages

- `/admin/login` - Admin authentication
- `/admin` - Admin dashboard (manage wishlists and items)
- `/[slug]` - Public wishlist view

## License

MIT

---

Made with ❤️ by [Reggio Digital](https://reggiodigital.com)
