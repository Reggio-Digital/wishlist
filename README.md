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

## Contributing

This is a self-hosted project. See [TODO.md](TODO.md) for planned features and implementation details.

## License

MIT
