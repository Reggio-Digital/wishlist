# Wishlist App

Self-hosted wishlist application. Single admin user, slug-based public sharing, claim tracking with honor system.

## Technical Stack

### Backend
- Node.js 20+ or Bun
- Express.js or Fastify
- SQLite with better-sqlite3
- Drizzle ORM
- JWT authentication with refresh tokens
- Multer for file uploads
- URL scraping: Cheerio (fast), Puppeteer/Playwright (JS-heavy sites)

### Frontend
- SvelteKit or Next.js 15+ (App Router)
- Tailwind CSS v4
- Shadcn/ui
- Lucide icons
- Sharp for image optimization

### DevOps
- Docker multi-stage builds
- Multi-arch: AMD64, ARM64
- Health check endpoints

## Authentication

### Global Access Password (Optional)
- Environment variable: `ACCESS_PASSWORD`
- All visitors must enter password before accessing anything
- Session-based, no re-entry
- Separate from admin login

### Admin Login
- URL: `/admin`
- Single admin user from environment variables
- JWT session management
- Admin cannot see claim data (claimedByName, claimedAt, claimedByNote)

## Data Models

### Wishlist
```javascript
{
  id: string (uuid),
  name: string,
  slug: string (unique, URL-friendly),
  description: string (nullable, public),
  notes: string (nullable, private admin-only),
  coverImage: {
    type: 'upload' | 'url',
    url: string
  } (nullable),
  isPublic: boolean (default: false),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### WishlistItem
```javascript
{
  id: string (uuid),
  wishlistId: string (foreign key),
  name: string,
  description: string (nullable),
  price: decimal (nullable),
  currency: string (ISO code, default: 'USD'),
  quantity: integer (default: 1),
  priority: enum ('low', 'medium', 'high'),

  images: [
    {
      type: 'upload' | 'url',
      url: string,
      isPrimary: boolean,
      order: integer
    }
  ] (nullable),

  purchaseUrls: [
    {
      label: string,
      url: string,
      isPrimary: boolean,
      wasUsedForPurchase: boolean
    }
  ] (nullable),

  notes: string (nullable, private owner-only),
  isArchived: boolean (default: false),

  claimedByName: string (nullable),
  claimedByNote: string (nullable, visible to other gift buyers),
  claimedByToken: string (unique),
  claimedAt: timestamp (nullable),
  isPurchased: boolean (default: false),

  sortOrder: integer,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Settings
```javascript
{
  key: string (primary key),
  value: string (JSON),
  updatedAt: timestamp
}
```

**Settings Keys:**
- `default_currency` - e.g., "USD"
- `timezone` - e.g., "America/New_York"
- `theme_toggle_enabled` - boolean, default: true
- `default_theme` - "light", "dark", "auto", default: "auto"
- `accent_color` - hex code, default: "#3b82f6"
- `date_format` - "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"
- `time_format` - "12h", "24h"
- `block_search_engines` - boolean
- `block_ai_crawlers` - boolean

## Features

### Wishlist Management
- Create multiple wishlists
- Properties: name, slug, description, private notes, cover image, privacy (private/public)
- Cover image: upload or URL
- Public lists accessible via `/{slug}`

### Item Management
- Manual entry: name, description, price, currency, quantity, priority, images, purchase URLs, notes
- Multiple images per item (upload or URL)
- Multiple purchase URLs with labels
- Drag-and-drop reorder
- Archive items

### URL Scraping (One-Time Only)
- Paste URL when adding item
- Scrapes: title, price, image, description
- Supported: Amazon, Target, Walmart, Best Buy, generic fallback (Open Graph)
- Uses Cheerio or Puppeteer/Playwright
- Scraping happens ONCE during item creation
- Additional URLs added manually (no scraping)

### Claiming (Public Lists)
- Claim button on each item
- Optional name field (defaults to "Anonymous")
- Optional note field (visible to other gift buyers, hidden from list owner)
- Unique claim token for management (unclaim, update)
- Claimed items show badge: "✓ Claimed by [Name]"
- Note button: "💬 Note" (hidden by default, click to reveal)

### Claim Visibility (Honor System)
**Admin view:**
- No claim data visible (items always appear unclaimed)
- Full list management

**Public view:**
- Default: Only unclaimed items shown
- Toggle "Show Claimed": Reveals claimed items with badges
- Click "💬 Note" to reveal coordination messages

### Theme Switching
- Light, Dark, Auto (system)
- Theme toggle in header (can be hidden via admin settings)
- Admin controls: enable/disable toggle, default theme, accent color

### Settings (`/admin/settings`)
**Account:**
- Change admin password

**Security:**
- Display ACCESS_PASSWORD status (read-only, change via environment variable)

**Preferences:**
- Language (read-only, set via DEFAULT_LANGUAGE env)
- Supported: en, es, fr, de, it, pt, ja, zh-CN, zh-TW, ko, ru, ar
- Default currency dropdown
- Timezone dropdown (or TZ env)
- Theme settings (toggle enable/disable, default theme, accent color)
- Date/time format

**Privacy:**
- Block search engines (noindex/nofollow meta tags)
- Block AI crawlers (robots.txt, meta tags)

**Advanced:**
- Clear cache
- Export data

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `PATCH /api/auth/password`

### Wishlists
- `GET /api/wishlists` (auth)
- `POST /api/wishlists` (auth)
- `GET /api/wishlists/:id` (auth)
- `PATCH /api/wishlists/:id` (auth)
- `DELETE /api/wishlists/:id` (auth)
- `GET /:slug` (public, no auth)

### Items
- `GET /api/wishlists/:id/items` (auth for private, admin = no claim data, public = with claim data)
- `POST /api/wishlists/:id/items` (auth)
- `GET /api/items/:id`
- `PATCH /api/items/:id` (auth)
- `DELETE /api/items/:id` (auth)
- `POST /api/public/items/:id/claim` (no auth, body: `{ name?, note? }`)
- `DELETE /api/public/claims/:claimToken` (no auth)
- `PATCH /api/public/claims/:claimToken` (no auth, body: `{ name?, note? }`)
- `POST /api/items/:id/image` (auth)
- `POST /api/lists/:id/cover` (auth)

### Scraping
- `POST /api/scrape` (auth, body: `{ url }`, response: `{ title, price, currency, image, description }`)
- One-time scraping only

### Settings
- `GET /api/settings` (auth)
- `PATCH /api/settings` (auth)

## Docker Deployment

### docker-compose.yml
```yaml
version: '3.8'

services:
  wishlist:
    image: ghcr.io/yourusername/wishlist:latest
    container_name: wishlist
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      # Required
      - ORIGIN=http://localhost:3000
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=changeme

      # Optional - Authentication
      - ACCESS_PASSWORD=
      - JWT_SECRET=your-secret-key
      - TOKEN_EXPIRY_HOURS=72
      - REFRESH_TOKEN_EXPIRY_DAYS=30

      # Optional - Localization
      - DEFAULT_LANGUAGE=en
      - TZ=America/New_York
      - DEFAULT_CURRENCY=USD
      - MAX_FILE_SIZE_MB=10

      # Optional - Advanced
      - NODE_ENV=production
      - LOG_LEVEL=info

    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Multi-Architecture
- AMD64, ARM64
- Use Docker buildx

### Volumes
- `/app/data` - SQLite database and uploaded images

## Security

### Authentication
- Bcrypt (cost: 12)
- JWT with short expiry
- Refresh token rotation
- Rate limiting on auth endpoints
- Account lockout

### Data Protection
- Parameterized queries (SQL injection prevention)
- Input sanitization (XSS)
- CSRF protection
- Helmet.js headers
- File upload validation

### Privacy
- No analytics
- No external API calls (except one-time URL scraping)
- Claim data hidden from admin
- Optional data export

## Performance Targets
- Page load: < 1s
- API response: < 200ms (p95)
- 100+ concurrent users
- 10,000+ items
- Docker image: < 200MB
- Memory: < 512MB
- CPU: < 10% idle, < 50% load

## UI Requirements

### Design
- Minimalist, modern (2024-2025)
- Mobile-first responsive
- WCAG 2.1 AA compliance
- Optimistic UI updates

### Key Pages
**Public:**
- Public wishlist view (claim items)
- Claim management (via token URL)

**Admin:**
- Login
- Dashboard (stats, recent activity)
- Wishlists (grid/list view, search/filter)
- Wishlist detail (add items, show/hide claimed toggle for public view)
- Add/edit item
- Settings

### Components
**Item Card:**
- Image thumbnail
- Name, price, currency
- Priority badge (color-coded)
- Claimed badge (public view only)
- Purchase links count
- Quick actions (edit, delete, claim)

**List Card:**
- Cover image
- Name, item count
- Public/private indicator
- Last updated
- Quick actions

### Mobile
- Bottom navigation
- Swipe gestures
- Touch-friendly (min 44px)

## Testing

### Unit Tests
- API endpoints
- Auth middleware
- Database queries
- >80% coverage

### Integration Tests
- Login flow
- CRUD operations
- Claiming workflow
- Sharing

## Documentation

### User Docs
- Docker setup
- User manual
- FAQ
- Reverse proxy examples

### Developer Docs
- Architecture
- API (OpenAPI/Swagger)
- Database schema
- Development setup
