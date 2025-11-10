# TODO - Wishlist App Implementation

This document tracks all planned features and implementation tasks for the Wishlist App.

## Phase 1: Core Backend Infrastructure

### Database Setup
- [ ] Install Drizzle ORM and better-sqlite3
- [ ] Create database schema with migrations
- [ ] Implement database connection and initialization
- [ ] Create Wishlist model
- [ ] Create WishlistItem model
- [ ] Create Settings model
- [ ] Add database seed script for development

### Authentication System
- [ ] Install JWT, bcrypt, and related dependencies
- [ ] Implement admin user authentication
- [ ] Create JWT token generation and validation
- [ ] Implement refresh token rotation
- [ ] Add rate limiting on auth endpoints
- [ ] Add account lockout mechanism
- [ ] Optional: Global access password middleware
- [ ] Create auth middleware for protected routes

### API Endpoints - Authentication
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/refresh
- [ ] PATCH /api/auth/password

### API Endpoints - Wishlists
- [ ] GET /api/wishlists (authenticated)
- [ ] POST /api/wishlists (authenticated)
- [ ] GET /api/wishlists/:id (authenticated)
- [ ] PATCH /api/wishlists/:id (authenticated)
- [ ] DELETE /api/wishlists/:id (authenticated)
- [ ] GET /:slug (public, no auth)

### API Endpoints - Items
- [ ] GET /api/wishlists/:id/items (auth/public with claim data filtering)
- [ ] POST /api/wishlists/:id/items (authenticated)
- [ ] GET /api/items/:id
- [ ] PATCH /api/items/:id (authenticated)
- [ ] DELETE /api/items/:id (authenticated)
- [ ] POST /api/items/:id/reorder (authenticated, drag-and-drop support)

### API Endpoints - Claiming
- [ ] POST /api/public/items/:id/claim (no auth, body: { name?, note? })
- [ ] DELETE /api/public/claims/:claimToken (no auth)
- [ ] PATCH /api/public/claims/:claimToken (no auth, update name/note)

### API Endpoints - File Uploads
- [ ] POST /api/items/:id/image (authenticated)
- [ ] POST /api/lists/:id/cover (authenticated)
- [ ] Implement Multer for file upload handling
- [ ] Add file validation (type, size limits)
- [ ] Add image optimization with Sharp
- [ ] File cleanup on item/list deletion

### API Endpoints - Settings
- [ ] GET /api/settings (authenticated)
- [ ] PATCH /api/settings (authenticated)
- [ ] Implement settings defaults

### Security Hardening
- [ ] Add Helmet.js for security headers
- [ ] Implement input sanitization (XSS prevention)
- [ ] Add CSRF protection
- [ ] Parameterized queries (SQL injection prevention)
- [ ] File upload validation
- [ ] Set bcrypt cost to 12
- [ ] Implement proper error handling without leaking details

## Phase 2: URL Scraping

### Scraping Infrastructure
- [ ] Install Cheerio for fast HTML parsing
- [ ] Optional: Install Puppeteer/Playwright for JS-heavy sites
- [ ] Create scraper service
- [ ] POST /api/scrape endpoint (auth, body: { url })

### Site-Specific Scrapers
- [ ] Amazon scraper
- [ ] Target scraper
- [ ] Walmart scraper
- [ ] Best Buy scraper
- [ ] Generic fallback (Open Graph tags)

### Scraping Features
- [ ] Extract: title, price, currency, image, description
- [ ] Handle errors gracefully
- [ ] Add timeout limits
- [ ] Return structured data

## Phase 3: Frontend Application

### Framework Setup
- [ ] Choose framework (SvelteKit or Next.js 15+)
- [ ] Install Tailwind CSS v4
- [ ] Install Shadcn/ui components
- [ ] Install Lucide icons
- [ ] Set up project structure

### Public Pages
- [ ] Public wishlist view (/:slug)
  - [ ] Display wishlist info (name, description, cover)
  - [ ] Display items grid/list
  - [ ] Filter: show/hide claimed items toggle
  - [ ] Item card with images, price, purchase links
  - [ ] Claim button and modal
  - [ ] Show claimed badge and notes
- [ ] Claim management page (token-based URL)
  - [ ] Update claim info
  - [ ] Unclaim item

### Admin Pages
- [ ] Login page (/admin)
- [ ] Dashboard (/admin/dashboard)
  - [ ] Stats: total wishlists, items, claimed items
  - [ ] Recent activity
- [ ] Wishlists page (/admin/wishlists)
  - [ ] Grid/list view toggle
  - [ ] Search and filter
  - [ ] Create new wishlist
  - [ ] Wishlist cards
- [ ] Wishlist detail page (/admin/wishlists/:id)
  - [ ] Edit wishlist info
  - [ ] Add/edit items
  - [ ] Drag-and-drop reorder
  - [ ] Archive items
  - [ ] Items appear unclaimed (no claim data visible)
- [ ] Add/Edit item page (/admin/items/new or /admin/items/:id)
  - [ ] Form fields
  - [ ] URL scraping integration
  - [ ] Image upload/URL
  - [ ] Multiple purchase URLs
- [ ] Settings page (/admin/settings)
  - [ ] Account settings (change password)
  - [ ] Security (display ACCESS_PASSWORD status)
  - [ ] Preferences (currency, timezone, theme, date/time format)
  - [ ] Privacy (block search engines, AI crawlers)
  - [ ] Advanced (clear cache, export data)

### UI Components
- [ ] Item Card component
  - [ ] Image thumbnail
  - [ ] Name, price, currency
  - [ ] Priority badge (color-coded)
  - [ ] Claimed badge (public view only)
  - [ ] Purchase links count
  - [ ] Quick actions
- [ ] List Card component
  - [ ] Cover image
  - [ ] Name, item count
  - [ ] Public/private indicator
  - [ ] Last updated
  - [ ] Quick actions
- [ ] Theme switcher component (Light/Dark/Auto)
- [ ] Navigation components (desktop/mobile)

### Theme System
- [ ] Implement light/dark/auto theme switching
- [ ] Store theme preference in localStorage
- [ ] Respect system preference
- [ ] Apply admin-configured accent color
- [ ] Conditional theme toggle visibility

### Mobile Optimizations
- [ ] Bottom navigation
- [ ] Swipe gestures
- [ ] Touch-friendly targets (min 44px)
- [ ] Responsive design testing

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] Color contrast checking

## Phase 4: Docker & Deployment

### Docker Setup
- [ ] Create Dockerfile with multi-stage build
- [ ] Create docker-compose.yml
- [ ] Configure volumes for data and uploads
- [ ] Set up health checks
- [ ] Multi-architecture builds (AMD64, ARM64)
- [ ] Optimize image size (target: <200MB)

### Environment Configuration
- [ ] Document all environment variables
- [ ] Create .env.example file
- [ ] Implement environment validation
- [ ] Set up proper defaults

### Reverse Proxy Examples
- [ ] Nginx example
- [ ] Caddy example
- [ ] Traefik example

## Phase 5: Testing

### Unit Tests
- [ ] Set up testing framework (Jest/Vitest)
- [ ] API endpoint tests
- [ ] Auth middleware tests
- [ ] Database query tests
- [ ] Scraper tests
- [ ] Target: >80% coverage

### Integration Tests
- [ ] Login flow tests
- [ ] CRUD operation tests
- [ ] Claiming workflow tests
- [ ] Sharing tests
- [ ] File upload tests

### E2E Tests
- [ ] Set up Playwright/Cypress
- [ ] Admin flow tests
- [ ] Public claiming flow tests

## Phase 6: Documentation

### User Documentation
- [ ] Docker setup guide
- [ ] User manual
- [ ] FAQ
- [ ] Reverse proxy examples
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] Architecture overview
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Development setup guide
- [ ] Contributing guide

## Phase 7: Performance & Optimization

### Performance Targets
- [ ] Page load: < 1s
- [ ] API response: < 200ms (p95)
- [ ] Test with 100+ concurrent users
- [ ] Test with 10,000+ items
- [ ] Memory usage: < 512MB
- [ ] CPU usage: < 10% idle, < 50% load

### Optimizations
- [ ] Implement optimistic UI updates
- [ ] Add request caching where appropriate
- [ ] Optimize database queries
- [ ] Implement pagination for large lists
- [ ] Image lazy loading
- [ ] Bundle size optimization

## Data Models Reference

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

## Settings Keys Reference

- `default_currency` - e.g., "USD"
- `timezone` - e.g., "America/New_York"
- `theme_toggle_enabled` - boolean, default: true
- `default_theme` - "light", "dark", "auto", default: "auto"
- `accent_color` - hex code, default: "#3b82f6"
- `date_format` - "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"
- `time_format` - "12h", "24h"
- `block_search_engines` - boolean
- `block_ai_crawlers` - boolean

## Feature Notes

### Claim Visibility (Honor System)
**Admin view:**
- No claim data visible (items always appear unclaimed)
- Full list management

**Public view:**
- Default: Only unclaimed items shown
- Toggle "Show Claimed": Reveals claimed items with badges
- Click "💬 Note" to reveal coordination messages

### URL Scraping
- Scraping happens ONCE during item creation
- Additional URLs added manually (no re-scraping)

### Supported Languages
- en, es, fr, de, it, pt, ja, zh-CN, zh-TW, ko, ru, ar
- Set via DEFAULT_LANGUAGE environment variable
