# Wishlist App

Self-hosted wishlist application with slug-based public sharing and claim tracking using an honor system.

## About

A privacy-focused, self-hosted wishlist manager that allows you to:
- Create multiple wishlists with custom slugs
- Share public wishlists via simple URLs
- Allow others to claim items (honor system)
- Manage items with images, prices, and purchase URLs
- Single admin user model - simple and secure

## Current Status

**Implemented:**
- ✅ Basic Express server with health check
- ✅ Database setup (SQLite + Drizzle ORM)
- ✅ JWT-based authentication system
- ✅ Admin login/logout/refresh endpoints

**In Progress:**
See [TODO.md](TODO.md) for the full feature roadmap.

## Tech Stack

- **Backend:** Node.js 20+, Express.js, SQLite, Drizzle ORM
- **Frontend:** (Planned: SvelteKit or Next.js)
- **Deployment:** Docker with multi-arch support

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development

# Required for production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
JWT_SECRET=your-secret-key

# Optional
ACCESS_PASSWORD=
DEFAULT_CURRENCY=USD
TZ=America/New_York
```

## Project Structure

```
wishlist-app/
├── src/
│   ├── server.ts          # Main server file
│   ├── auth/              # Authentication system
│   │   ├── routes.ts      # Auth endpoints
│   │   ├── middleware.ts  # Auth middleware
│   │   └── utils.ts       # JWT & password utilities
│   └── db/                # Database layer
│       ├── schema.ts      # Database schema
│       └── index.ts       # DB connection & initialization
├── drizzle/               # Database migrations
├── data/                  # SQLite database (created at runtime)
├── uploads/               # Uploaded images (created at runtime)
├── package.json
└── tsconfig.json
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

### Planned
See [TODO.md](TODO.md) for the full API specification.

## Contributing

This is a self-hosted project. See [TODO.md](TODO.md) for planned features and implementation details.

## License

MIT
