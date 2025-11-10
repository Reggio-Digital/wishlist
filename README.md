# Wishlist App

## Project Overview

A modern, self-hosted wishlist application that allows users to create and share wishlists with friends and family. Built with a focus on beautiful UI/UX, ease of deployment, and privacy. Users can add items they want, share lists with others, and claim items to avoid duplicate gifts.

## Core Philosophy

- **Privacy-first**: Self-hosted, no data leaves your server, optional blocking of search engines and AI crawlers
- **Beautiful design**: Modern, clean UI that's a joy to use
- **Simple deployment**: One docker-compose.yml file and you're running
- **Family-friendly**: Interface so simple even grandparents can use it, designed for friends/family sharing
- **Fast & lightweight**: SQLite backend, efficient resource usage

## Technical Stack

### Backend
- **Runtime**: Node.js 20+ (or Bun for better performance)
- **Framework**: Express.js or Fastify
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: JWT tokens with refresh token support
- **File uploads**: Multer for image handling
- **URL scraping**:
  - Cheerio for fast HTML parsing (simple sites)
  - Puppeteer or Playwright for JavaScript-heavy sites (Amazon, Target)
  - Custom parsers for each major retailer (Amazon, Walmart, Target, Best Buy)

### Frontend
- **Framework**: SvelteKit or Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn/ui or similar modern component library
- **Icons**: Lucide icons
- **State Management**: Built-in framework state management
- **PWA**: Support for Progressive Web App features
- **Image optimization**: Sharp for server-side processing

### DevOps
- **Containerization**: Docker with multi-stage builds
- **Multi-arch support**: AMD64 and ARM64 (Raspberry Pi support)
- **Reverse proxy compatible**: Works behind Nginx, Traefik, Caddy
- **Health checks**: Docker health check endpoints

## Core Features

### 1. Authentication

#### Global Access Password (Optional)

Optionally protect the **entire app** with a single shared password for family/friends:

- **When enabled**: All visitors (including public wishlist viewers) must enter the password before accessing any page
- **Password prompt**: Simple one-field form asking for the access password
- **Session**: Password stored in session/cookie, doesn't require re-entry on every page
- **Use case**: Keep your wishlist app completely hidden from the public internet while sharing with trusted family/friends
- **Configuration**: Set via `ACCESS_PASSWORD` environment variable in `.env` file
- **Note**: This is separate from admin login - it's a simple "gate" before anyone can view anything

**When to use:**
- ✅ Want to share wishlists with family/friends only
- ✅ Don't want the app indexed or discovered by strangers
- ✅ Self-hosted on public internet without VPN
- ❌ Not needed if using VPN/Tailscale or fully private network

#### Admin Login

- **Login URL**: `/admin` - Admin-only access for list management
- One admin user configured via environment variables
- Username and password set in `.env` file
- Simple login page at `/admin` (no registration)
- JWT session management
- Optional password change via settings page
- **Note**: Admin login is separate from global access password (if enabled)

#### Admin Visibility Rules

When logged in as admin to manage your own wishlists:

**What Admin CAN See:**
- All your wishlists (public and private)
- All items in your lists
- Item details (name, description, price, images, purchase URLs, notes)
- List statistics (total items, last updated)

**What Admin CANNOT See:**
- **Claimed status** - Items show as unclaimed even if someone has claimed them
- **Claimer names** - No indication of who claimed what
- **Claim timestamps** - No data about when items were claimed

This preserves the surprise while allowing full list management. The honor system warning still applies - clicking into list details will show all item information except claim status.

### 2. Wishlist Management

#### Creating Lists
- Users can create multiple wishlists
- List properties:
  - **Name** (e.g., "Birthday 2025", "Wedding Registry") - required
  - **Description** (optional) - Public description shown to everyone viewing the list
  - **Notes** (optional) - Private notes only visible to the list owner (admin)
    - Gift coordination notes
    - Special instructions
    - Budget constraints
    - Any private context about the list
  - **Cover Image** (optional) - Visual representation of the list:
    - Upload local image file (JPG, PNG, WebP)
    - OR provide image URL (external hotlink)
    - Displayed as hero image on list detail page
    - Used as thumbnail in list grid view
    - Suggested dimensions: 1200x630px (social media share format)
  - **Privacy settings** (private, friends only, public link)
  - **Category/tags** (optional)

#### Adding Items
- Manual item entry:
  - **Item name** (required)
  - **Description** - Detailed description of the item
  - **Price** (with currency selection)
  - **Quantity needed** - How many of this item you want
  - **Priority** (low, medium, high)
  - **Image** - Flexible image handling:
    - Upload local image file (JPG, PNG, WebP)
    - OR provide image URL (hotlink from product page)
    - Image preview before saving
    - Optional: Multiple images per item (carousel in detail view)
  - **Purchase URLs** - Multiple links where item can be purchased:
    - Add multiple retailer URLs (Amazon, Target, Walmart, etc.)
    - Each URL can have a label (e.g., "Amazon", "Best Buy", "Official Store")
    - Display as clickable buttons/chips in item view
    - Smart URL detection (auto-add "https://" if missing)
    - Optional: Track which URL was used for purchase
  - **Notes** (private, only visible to list owner)
    - Size/color preferences
    - "Must have" vs "nice to have" details
    - Why you want this item
    - Any special instructions for gift buyer

- **Automatic item import from URL**:
  - Paste product URL from supported retailers
  - App scrapes and auto-fills: title, price, image, description
  - User can edit scraped data before saving
  - Automatically adds the source URL to purchase URLs list

  **Supported Retailers:**
  - **Amazon** (amazon.com, amazon.ca, amazon.co.uk, etc.)
    - Product title
    - Current price (handles both regular and sale prices)
    - Primary product image (high resolution)
    - Product description
    - ASIN for future price tracking
  - **Target** (target.com)
    - Product name
    - Current price
    - Primary image
    - Product details
  - **Walmart** (walmart.com)
    - Item name
    - Price
    - Product image
    - Description
  - **Best Buy** (bestbuy.com)
    - Product title
    - Price
    - Image
    - SKU for tracking
  - **Generic fallback** (any other URL):
    - Uses Open Graph meta tags (`og:title`, `og:image`, `og:description`)
    - Looks for common price patterns in HTML
    - Extracts page title as item name if no OG tags

  **Technical Implementation:**
  - Uses Cheerio for fast HTML parsing (most sites)
  - Puppeteer/Playwright as fallback for JavaScript-heavy sites (Amazon, Target)
  - Respects `robots.txt` and rate limiting
  - User-agent header identifies as personal wishlist app
  - Caches scraped data for 24 hours to reduce repeated requests

- **Bookmarklet support**:
  - One-click "Add to Wishlist" bookmarklet
  - Drag to bookmarks bar: `javascript:(function(){...})();`
  - Opens wishlist in new tab with pre-filled data from current page
  - Auto-detects product images and pricing
  - Works on all supported retailer sites

#### Managing Items
- Edit item details
- Delete items
- Mark items as purchased (for own tracking)
- Reorder items (drag and drop)
- Archive items (keep for reference but hide from active list)
- Duplicate items to other lists

### 3. Sharing & Collaboration

#### Sharing Wishlists

- Toggle list between private (only you can see) and public
- Public lists get a clean, shareable URL using the list slug:
  - Format: `https://yourdomain.com/{list-slug}`
  - Example: `https://yourdomain.com/mikes-birthday-2025`
  - Slug auto-generated from list name (e.g., "Mike's Birthday 2025" → "mikes-birthday-2025")
  - Slug must be unique across all public lists
  - User can customize slug when creating/editing list
- No login required to view public lists
- Anyone with the link can view and claim items
- Can switch back to private anytime (slug is preserved if made public again)

#### Claiming Items (Public Lists)

**Claim Button & Flow:**
- Each item displays a "Claim" button when viewing public wishlists
- Click "Claim" → Modal/form appears with:
  - **Name field** (optional): "Who is claiming this?"
    - Examples: "Sarah", "Mom & Dad", "The Smith Family"
    - If left blank: Item shows as "Claimed by Anonymous"
    - No account/login required
  - **Note field** (optional): Private message to other gift buyers
    - Examples: "I'm getting the blue one", "Bought on sale at Target", "Splitting cost with John"
    - Visible to other people viewing the list (coordination)
    - **Hidden from list owner** (preserves surprise)
  - **Confirm** button to finalize claim

**After Claiming:**
- Claimed items show badge: "✓ Claimed by [Name]" or "✓ Claimed (Anonymous)"
- If note was added: Shows "💬 Note" button/link next to claim badge
  - **Hidden by default** - note text not visible until clicked
  - Click "💬 Note" → Expands/reveals note text (e.g., "Getting the blue one")
  - Click again to collapse/hide note
  - Use case: Prevents spoilers if list owner accidentally sees the page, adds extra privacy layer
- Claimer receives unique claim management URL:
  - Bookmark this URL to manage your claim later
  - Can unclaim if plans change
  - Can update your note
- Other visitors see claim status to prevent duplicates
- **List owner sees nothing** - items appear unclaimed when admin is logged in

#### Claim/Purchase Visibility Strategy

**The "Honor System" Approach:**

This app uses a simple, transparent approach to handling purchase visibility that balances surprise preservation with practicality:

**Homepage/List Overview:**
- List owner sees all their lists (e.g., "Birthday 2025", "Christmas List")
- **No item-level claim status shown** on the homepage
- Only displays: list name, total item count, last updated, preview images
- This prevents accidental spoilers when casually browsing

**Detailed List View (when clicking into a specific list as admin):**
- Items display with full details (name, description, price, images, notes)
- **Claim status is HIDDEN** - admin never sees if items are claimed
- No "✓ Claimed by [Name]" badges shown to admin
- Admin can fully manage lists without spoilers

**Detailed List View (when viewing as public visitor):**
- Items display with full details including "✓ Claimed by [Name]" badges
- Visitors can see who claimed what to coordinate gift purchases
- Prevents duplicate purchases

**Why This Approach:**

1. **Transparency over Security Theater**: Since all data is client-side accessible (browser dev tools, network requests, localStorage), attempting to hide purchased items from the owner is futile. Any motivated user could bypass frontend restrictions.

2. **Accidental Spoiler Prevention**: The homepage doesn't show claim details, so casual browsing won't spoil surprises.

3. **Intentional Viewing Allowed**: If the list owner needs to check status (tracking down duplicate purchases, coordinating with family), they can click into the list.

4. **Social Contract**: The warning message sets expectations and respects user agency. Users who want surprises will avoid clicking; users who need to manage their list can do so.

5. **Simpler Implementation**: No complex server-side filtering based on user identity, no half-measures that provide false security.

**Alternative Considered (and Rejected):**

**For Other Users (Gift Buyers):**
- Always see full claim status to prevent duplicate purchases
- Can see who claimed what (names are visible to other gift buyers)
- No restrictions—they need this info to coordinate

## User Interface Design

### Design Principles
- **Minimalist**: Clean, uncluttered interface
- **Modern**: Current design trends (2024-2025)
- **Intuitive**: No user manual needed
- **Responsive**: Mobile-first design
- **Accessible**: WCAG 2.1 AA compliance
- **Fast**: Optimistic UI updates, smooth animations

### Color Scheme & Theme Switching

**Theme Options:**
- **Light mode** - Clean, bright interface
- **Dark mode** - Easy on the eyes for night browsing
- **Auto (system preference)** - Follows OS theme setting (default)

**Theme Toggle:**
- **Menu/Header Toggle**: Sun/moon icon in top navigation bar
  - Click to cycle: Light → Dark → Auto → Light
  - Shows current theme with icon (☀️ Light, 🌙 Dark, 🔄 Auto)
  - Immediately applies theme change (no page reload)
  - Persists selection in localStorage

**Admin Settings Control:**
- **Enable Theme Toggle**: Setting in `/admin/settings` → Preferences
  - Default: **Enabled** (toggle visible to all users)
  - When disabled: Theme toggle hidden from UI, all users see default theme
  - Use case: Force consistent theme across all users (branding/accessibility)
- **Default Theme**: Select what theme to use when toggle is disabled
  - Options: Light, Dark, Auto
  - Only applies when theme toggle is disabled

**Accent Color:**
- Customizable accent color (default: blue)
- Can be changed in admin settings

### Key Pages/Views

#### Public Pages

1. **Public wishlist view**: View shared list without login, claim items
2. **Claim management page**: Manage your claims with unique token URL

#### Authenticated Pages (Single User)

1. **Login page**: Simple username/password form

2. **Dashboard/Home**:
   - Quick stats (total lists, total items, claimed items)
   - Recent activity
   - Your lists overview with quick actions

3. **My Wishlists**:
   - Grid or list view toggle
   - Create new list button (prominent)
   - Search/filter lists
   - Quick actions (toggle public/private, edit, delete, copy link)

4. **Wishlist Detail**:
   - List header (name, description, stats, public toggle)
   - Add item button (floating or fixed)
   - Items displayed as cards or table rows
   - **Show/Hide Claimed Items Toggle**:
     - Toggle button in toolbar: "Show Claimed" / "Hide Claimed"
     - Default: **Hidden** (claimed items not visible)
     - When enabled: Shows all items including claimed ones with "✓ Claimed by [Name]" badges
     - Use case: Gift buyers can toggle to see what's already claimed
     - Only visible when viewing public lists (not shown to admin)
   - Filter by priority, price range
   - Sort options (priority, price, date added)

5. **Add/Edit Item**:
   - Form with all item fields
   - Image upload with preview
   - Save option

6. **Settings** (`/admin/settings`):
   - **Account**:
     - Change admin password
   - **Security**:
     - **Global Access Password Status**: Display-only section showing if `ACCESS_PASSWORD` is configured
       - Shows "✅ Enabled" or "❌ Disabled"
       - If enabled: "Global access password is active. All visitors must enter the password before viewing anything."
       - If disabled: "No global access password set. Anyone can view public wishlists without entering a password."
       - **Note**: This password can only be changed via environment variable (requires container restart)
       - Provides instructions: "To enable/change: Set `ACCESS_PASSWORD` in your `.env` file or Docker environment and restart the container"
   - **Preferences**:
     - **Default Currency**: Dropdown to select default currency for new items
       - Common options: USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, etc.
       - Uses ISO 4217 currency codes
       - Affects new items only (existing items unchanged)
       - Currency symbol displayed based on selection
     - **Timezone**: Dropdown to select timezone for timestamps
       - Auto-detects from browser by default
       - Override with manual selection (e.g., "America/New_York", "Europe/London")
       - Can also be set via `TZ` environment variable in Docker
       - Affects display of created/updated timestamps
     - **Theme Settings**:
       - **Enable Theme Toggle**: Toggle to show/hide theme switcher in UI
         - Default: **Enabled** (users can switch themes via menu)
         - When disabled: Theme toggle hidden, everyone sees default theme
       - **Default Theme**: Select default theme when toggle is disabled
         - Options: Light, Dark, Auto (follow system)
         - Only applies when theme toggle is disabled
       - **Accent Color**: Color picker for primary accent color (default: blue)
     - **Date Format**: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
     - **Time Format**: 12-hour or 24-hour
   - **Privacy**:
     - **Block Search Engines**: Toggle to add `<meta name="robots" content="noindex, nofollow">` to all public pages
     - **Block AI Crawlers**: Toggle to add AI-specific blocking via:
       - `robots.txt` entries for known AI crawlers (GPTBot, Google-Extended, CCBot, etc.)
       - `<meta name="robots" content="noai, noimageai">` tags
       - `X-Robots-Tag` headers
     - **Note**: These are for privacy-conscious family/friend instances, not commercial use
   - **Advanced**:
     - Backup/restore database
     - Clear cache
     - Export data

### UI Components

#### Item Card
- **Image thumbnail** (primary image, with indicator if multiple images exist)
- **Item name** (truncated if long)
- **Price with currency**
- **Priority indicator** (color-coded badge: red=high, yellow=medium, green=low)
- **Claimed badge** (if applicable: "✓ Claimed by [Name]")
- **Purchase links** (show count: "3 stores" or display retailer icons)
- **Quick action buttons** (edit, delete, claim)
- **Hover state** with more details:
  - Full description preview
  - Notes preview (if viewing own list)
  - All purchase links as clickable chips
- **Click to expand** for full detail view with:
  - Image carousel (if multiple images)
  - Full description
  - All purchase URLs as prominent buttons
  - Full notes section

#### List Card
- **Cover image** (if set, otherwise show preview of first few item images)
- **List name**
- **Item count** (e.g., "12 items")
- **Share button** with public/private indicator
- **Last updated timestamp**
- **Quick edit menu** (edit, delete, toggle public/private, copy link)

#### Mobile Considerations
- Bottom navigation bar
- Swipe gestures (delete, archive)
- Touch-friendly button sizes (min 44px)
- Simplified forms for small screens

## Data Models

### Wishlist
```javascript
{
  id: string (uuid),
  name: string,
  slug: string (unique, URL-friendly version of name, e.g., "mikes-birthday-2025"),
  description: string (nullable, public-facing description),
  notes: string (nullable, private notes only visible to admin/owner),

  // Cover image - supports both uploaded files and external URLs
  coverImage: object (nullable) {
    type: 'upload' | 'url',
    url: string  // For 'upload': relative path like '/uploads/lists/abc123.jpg'
                 // For 'url': full external URL like 'https://example.com/cover.jpg'
  },

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

  // Image handling - supports both uploaded files and external URLs
  images: JSON array (nullable) [
    {
      type: 'upload' | 'url',
      url: string,  // For 'upload': relative path like '/uploads/items/abc123.jpg'
                    // For 'url': full external URL like 'https://example.com/product.jpg'
      isPrimary: boolean,  // One image marked as primary for thumbnails
      order: integer       // Display order for image carousel
    }
  ],
  // Deprecated but kept for backward compatibility:
  imageUrl: string (nullable),  // Legacy single image field

  // Purchase URLs - multiple retailers supported
  purchaseUrls: JSON array (nullable) [
    {
      label: string,  // e.g., "Amazon", "Best Buy", "Official Store"
      url: string,    // Full product URL
      isPrimary: boolean,  // One URL marked as primary/preferred
      wasUsedForPurchase: boolean  // Track which URL was actually used
    }
  ],
  // Deprecated but kept for backward compatibility:
  productUrl: string (nullable),  // Legacy single URL field

  notes: string (nullable, private to owner),
  isArchived: boolean (default: false),

  // Claiming/purchase tracking
  claimedByName: string (nullable, name entered by claimer, e.g., "Sarah" or "Anonymous"),
  claimedByNote: string (nullable, optional note from claimer visible to other gift buyers),
  claimedByToken: string (unique, for managing claims),
  claimedAt: timestamp (nullable),
  isPurchased: boolean (default: false),

  sortOrder: integer,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### WishlistItemImage (Alternative relational approach)
```javascript
// Optional: If you prefer normalized tables over JSON
{
  id: string (uuid),
  itemId: string (foreign key),
  type: enum ('upload', 'url'),
  url: string,
  isPrimary: boolean,
  sortOrder: integer,
  createdAt: timestamp
}
```

### WishlistItemPurchaseUrl (Alternative relational approach)
```javascript
// Optional: If you prefer normalized tables over JSON
{
  id: string (uuid),
  itemId: string (foreign key),
  label: string,
  url: string,
  isPrimary: boolean,
  wasUsedForPurchase: boolean,
  sortOrder: integer,
  createdAt: timestamp
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

**Common Settings Keys:**
- `default_currency` - Default currency for new items (e.g., "USD", "EUR", "GBP"), default: "USD"
- `timezone` - Timezone for timestamp display (e.g., "America/New_York", "Europe/London"), default: "UTC"
- `theme_toggle_enabled` - Boolean, show/hide theme switcher in UI for all users, default: true
- `default_theme` - Default theme when toggle is disabled ("light", "dark", "auto"), default: "auto"
- `accent_color` - Hex color code for primary accent color (e.g., "#3b82f6"), default: "#3b82f6" (blue)
- `date_format` - Date display format (e.g., "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"), default: "MM/DD/YYYY"
- `time_format` - Time format ("12h", "24h"), default: "12h"
- `block_search_engines` - Boolean, adds noindex/nofollow meta tags to public pages, default: false
- `block_ai_crawlers` - Boolean, blocks AI crawlers via robots.txt and meta tags, default: false
- `backup_enabled` - Boolean, enable automatic database backups, default: true
- `backup_retention_days` - Integer, days to keep backups, default: 7

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with username/password from env
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh JWT token
- `PATCH /api/auth/password` - Change password (auth required)

### Wishlists
- `GET /api/wishlists` - Get user's wishlists (auth required)
- `POST /api/wishlists` - Create wishlist (auth required)
- `GET /api/wishlists/:id` - Get wishlist details (auth required)
- `PATCH /api/wishlists/:id` - Update wishlist (auth required, including slug and isPublic toggle)
- `DELETE /api/wishlists/:id` - Delete wishlist (auth required)
- `GET /:slug` - Get public wishlist by slug (no auth required, root-level route)
  - Example: `GET /mikes-birthday-2025`
  - Returns 404 if list doesn't exist or is private

### Wishlist Items

- `GET /api/wishlists/:id/items` - Get items in wishlist
  - **Auth required for private lists**
  - **Admin authenticated**: Returns items WITHOUT claim data (claimedByName, claimedAt hidden)
  - **Public access (via slug)**: Returns items WITH claim data (shows who claimed what)
- `POST /api/wishlists/:id/items` - Add item to wishlist (auth required)
- `GET /api/items/:id` - Get item details
- `PATCH /api/items/:id` - Update item (auth required)
- `DELETE /api/items/:id` - Delete item (auth required)
- `POST /api/public/items/:id/claim` - Claim item on public list (no auth)
  - **Request body**: `{ "name": "Sarah" (optional), "note": "Getting the blue one" (optional) }`
  - **Response**: `{ "claimToken": "unique-token-here", "message": "Item claimed successfully" }`
  - If name is omitted, displays as "Anonymous"
  - Note is visible to other gift buyers but hidden from list owner
- `DELETE /api/public/claims/:claimToken` - Unclaim item using claim token (no auth)
- `PATCH /api/public/claims/:claimToken` - Update claim name/note using claim token (no auth)
  - **Request body**: `{ "name": "Sarah & John" (optional), "note": "Updated note" (optional) }`
- `POST /api/items/:id/image` - Upload item image (auth required)
- `POST /api/lists/:id/cover` - Upload list cover image (auth required)

### URL Scraping

- `POST /api/scrape` - Scrape product data from URL (auth required)
  - **Request body**: `{ "url": "https://amazon.com/product/..." }`
  - **Response**: `{ "title": "Product Name", "price": 29.99, "currency": "USD", "image": "https://...", "description": "..." }`
  - **Note**: Only scrapes ONE URL at a time for initial item import. Additional purchase URLs are added manually without scraping.
  - **Supported retailers**: Amazon, Target, Walmart, Best Buy, or generic fallback

### App Settings

- `GET /api/settings` - Get app settings (auth required)
- `PATCH /api/settings` - Update app settings (auth required)

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
      - ./data:/app/data              # SQLite database
      - ./uploads:/app/uploads        # User uploaded images
      - ./backups:/app/backups        # Database backups (optional)
    environment:
      # Required
      - ORIGIN=http://localhost:3000  # URL users will connect to
      - ADMIN_USERNAME=admin          # Admin login username
      - ADMIN_PASSWORD=changeme       # Admin login password (change this!)

      # Optional - Authentication
      - ACCESS_PASSWORD=               # Global access password (optional). If set, all visitors must enter this password before viewing anything
      - JWT_SECRET=your-secret-key    # Auto-generated if not set
      - TOKEN_EXPIRY_HOURS=72         # Default: 72 hours
      - REFRESH_TOKEN_EXPIRY_DAYS=30  # Default: 30 days

      # Optional - Localization
      - TZ=America/New_York           # Timezone (default: UTC). Examples: America/Los_Angeles, Europe/London, Asia/Tokyo
      - DEFAULT_CURRENCY=USD          # Default currency for new items (default: USD)
      - MAX_FILE_SIZE_MB=10           # Max upload size (default: 10MB)

      # Optional - Advanced
      - NODE_ENV=production
      - LOG_LEVEL=info               # debug, info, warn, error
      - DATABASE_BACKUP_ENABLED=true # Auto backup SQLite
      - BACKUP_RETENTION_DAYS=7      # Keep backups for 7 days

    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Multi-Architecture Support
- Build for AMD64 (x86_64)
- Build for ARM64 (Raspberry Pi 4, Apple Silicon)
- Use Docker buildx for multi-platform builds

### Volume Mounts
- `/app/data` - SQLite database file (`wishlist.db`) and User uploaded images and product images. Perhaps we can have /app/data/database and /app/data/images.
- `/app/backups` - Automated SQLite backups (optional)

## Unraid Template
Provide an XML template for Unraid Community Applications:
- Icon URL
- Description
- Categories: Tools, Productivity
- WebUI: http://[IP]:[PORT:3000]
- All environment variables as form fields

## Security Considerations

### Authentication
- Bcrypt password hashing (cost factor: 12)
- JWT tokens with short expiry
- Refresh token rotation
- Rate limiting on auth endpoints
- Account lockout after failed attempts

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)
- CSRF protection
- Secure headers (helmet.js)
- File upload validation (type, size)

### Privacy
- User data isolated per user/group
- No analytics or tracking
- No external API calls (except URL scraping)
- Claimed items hidden from list owner
- Optional data export (GDPR compliance)

## Performance Targets

- Page load time: < 1 second
- API response time: < 200ms (p95)
- Support 100+ concurrent users
- Database: 10,000+ items without performance degradation
- Docker image size: < 200MB
- Memory usage: < 512MB RAM
- CPU usage: < 10% idle, < 50% under load

## Testing Requirements

### Unit Tests
- All API endpoints
- Authentication middleware
- Database queries
- Utility functions
- >80% code coverage

### Integration Tests
- User registration and login flow
- Wishlist CRUD operations
- Item claiming workflow
- Group management
- Sharing and permissions

### E2E Tests (Optional)
- Complete user journey
- Mobile responsive testing
- Cross-browser testing (Chrome, Firefox, Safari)

## Documentation

### User Documentation
- Setup guide (Docker deployment)
- User manual (how to use the app)
- FAQ
- Troubleshooting guide
- Reverse proxy examples

### Developer Documentation
- Architecture overview
- API documentation (OpenAPI/Swagger)
- Database schema
- Contributing guide
- Development setup instructions

## Future Enhancements (Post-MVP)

- [ ] Mobile apps (React Native or Flutter)
- [ ] Browser extension for easier bookmarking
- [ ] Gift budget tracking
- [ ] Price tracking and alerts
- [ ] Multi-language support (i18n)
- [ ] Custom themes/branding
- [ ] Integration with Amazon wishlist import
- [ ] Calendar integration (birthdays, events)
- [ ] Gift recommendations based on interests
- [ ] Social features (follow users, discover lists)
- [ ] API for third-party integrations
- [ ] Backup/restore functionality
- [ ] LDAP/Active Directory support
- [ ] Two-factor authentication (2FA)
- [ ] Webhooks for notifications

## Success Metrics

- Easy deployment: < 5 minutes from download to running
- User satisfaction: Positive feedback on UI/UX
- Performance: Meets all performance targets
- Adoption: Usage in homelab community
- Maintenance: Minimal bug reports, easy updates

## Project Timeline (Estimated)

### Phase 1: MVP (4-6 weeks)
- Basic authentication
- Wishlist CRUD
- Item CRUD with URL scraping
- Claiming system
- Basic sharing
- Docker deployment

### Phase 2: Enhanced Features (2-3 weeks)
- Groups
- Suggestions
- Registry mode
- Admin panel
- Email notifications

### Phase 3: Polish (1-2 weeks)
- UI/UX improvements
- Mobile optimization
- Documentation
- Testing
- Performance optimization

### Phase 4: Launch
- GitHub repository
- Docker Hub images
- Unraid template
- Blog post/announcement
