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
- Basic Express server
- Health check endpoint

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
│   └── server.ts          # Main server file
├── data/                  # SQLite database (created at runtime)
├── uploads/              # Uploaded images (created at runtime)
├── package.json
└── tsconfig.json
```

## API Endpoints

### Currently Available
- `GET /api/health` - Health check

### Planned
See [TODO.md](TODO.md) for the full API specification.

## Contributing

This is a self-hosted project. See [TODO.md](TODO.md) for planned features and implementation details.

## License

MIT
