# Wishlist App

## Project Overview

A modern, self-hosted wishlist application that allows users to create and share wishlists with friends and family. Built with a focus on beautiful UI/UX, ease of deployment, and privacy. Users can add items they want, share lists with others, and claim items to avoid duplicate gifts.

## Core Philosophy

- **Privacy-first**: Self-hosted, no data leaves your server
- **Beautiful design**: Modern, clean UI that's a joy to use
- **Simple deployment**: One docker-compose.yml file and you're running
- **Family-friendly**: Interface so simple even grandparents can use it
- **Fast & lightweight**: SQLite backend, efficient resource usage

## Technical Stack

### Backend
- **Runtime**: Node.js 20+ (or Bun for better performance)
- **Framework**: Express.js or Fastify
- **Database**: SQLite with better-sqlite3
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: JWT tokens with refresh token support
- **File uploads**: Multer for image handling
- **URL scraping**: Cheerio or Puppeteer for fetching product data from URLs

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

#### Single User Login

- One admin user configured via environment variables
- Username and password set in `.env` file
- Simple login page (no registration)
- JWT session management
- Optional password change via settings page

### 2. Wishlist Management

#### Creating Lists
- Users can create multiple wishlists
- List properties:
  - Name (e.g., "Birthday 2025", "Wedding Registry")
  - Description (optional)
  - Privacy settings (private, friends only, public link)
  - Category/tags (optional)

#### Adding Items
- Manual item entry:
  - Item name (required)
  - Description
  - Price (with currency selection)
  - Quantity needed
  - Priority (low, medium, high)
  - Image upload (or URL)
  - Product URL
  - Notes (private, only visible to list owner)

- Automatic item import from URL:
  - Paste product URL
  - App scrapes: title, price, image, description
  - User can edit scraped data before saving

- Bookmarklet support:
  - One-click add from any product page
  - Opens wishlist in new tab with pre-filled data

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
- Public lists get a unique shareable link
- No login required to view public lists
- Anyone with the link can view and claim items
- Can switch back to private anytime

#### Claiming Items (Public Lists)

- Anyone with the link can "claim" items to avoid duplicate purchases
- Claimers enter their name when claiming (no account needed)
- Claimed items show as "claimed" (name hidden from list owner)
- Claimers get a unique URL to manage their claims (unclaim if plans change)
- List owner cannot see who claimed what (surprise preserved)

## User Interface Design

### Design Principles
- **Minimalist**: Clean, uncluttered interface
- **Modern**: Current design trends (2024-2025)
- **Intuitive**: No user manual needed
- **Responsive**: Mobile-first design
- **Accessible**: WCAG 2.1 AA compliance
- **Fast**: Optimistic UI updates, smooth animations

### Color Scheme
- Light mode (default)
- Dark mode support
- System preference detection
- Accent color: Customizable (default: blue)

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
   - Filter by claimed/unclaimed
   - Sort options (priority, price, date added)

5. **Add/Edit Item**:
   - Form with all item fields
   - Image upload with preview
   - Save option

6. **Settings**:
   - Change password
   - Default currency
   - Theme selection
   - App preferences

### UI Components

#### Item Card
- Image thumbnail
- Item name (truncated if long)
- Price with currency
- Priority indicator (color-coded)
- Claimed badge (if applicable)
- Quick action buttons (edit, delete, claim)
- Hover state with more details

#### List Card
- List name
- Item count
- Preview of first few items (images)
- Share button
- Last updated timestamp
- Quick edit menu

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
  description: string (nullable),
  isPublic: boolean,
  publicToken: string (unique, for sharing when public),
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
  currency: string (ISO code),
  quantity: integer (default: 1),
  priority: enum ('low', 'medium', 'high'),
  productUrl: string (nullable),
  imageUrl: string (nullable),
  notes: string (nullable, private to owner),
  isArchived: boolean,
  claimedByName: string (nullable, name entered by claimer),
  claimedByToken: string (unique, for managing claims),
  claimedAt: timestamp (nullable),
  isPurchased: boolean,
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

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with username/password from env
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh JWT token
- `PATCH /api/auth/password` - Change password (auth required)

### Wishlists
- `GET /api/wishlists` - Get user's wishlists
- `POST /api/wishlists` - Create wishlist
- `GET /api/wishlists/:id` - Get wishlist details
- `PATCH /api/wishlists/:id` - Update wishlist (including isPublic toggle)
- `DELETE /api/wishlists/:id` - Delete wishlist
- `GET /api/public/:token` - Get public wishlist by token (no auth required)

### Wishlist Items

- `GET /api/wishlists/:id/items` - Get items in wishlist (auth required for private lists)
- `POST /api/wishlists/:id/items` - Add item to wishlist (auth required)
- `GET /api/items/:id` - Get item details
- `PATCH /api/items/:id` - Update item (auth required)
- `DELETE /api/items/:id` - Delete item (auth required)
- `POST /api/public/items/:id/claim` - Claim item on public list (no auth, provide name)
- `DELETE /api/public/claims/:claimToken` - Unclaim item using claim token (no auth)
- `POST /api/items/:id/image` - Upload item image (auth required)

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
      - JWT_SECRET=your-secret-key    # Auto-generated if not set
      - TOKEN_EXPIRY_HOURS=72         # Default: 72 hours
      - REFRESH_TOKEN_EXPIRY_DAYS=30  # Default: 30 days

      # Optional - Features
      - DEFAULT_CURRENCY=USD          # Default: USD
      - MAX_FILE_SIZE_MB=10           # Default: 10MB

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
