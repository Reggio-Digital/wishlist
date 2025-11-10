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
- **Framework**: SvelteKit or Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
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

### 1. User Management

#### Registration & Authentication
- Sign up with email and password
- Email verification (optional, requires SMTP)
- Password reset flow (with/without SMTP)
- Invite-only mode option (admin can generate invite links)
- First user becomes admin automatically

#### Profile Management
- Profile picture upload
- Display name
- Email address
- Password change
- Account deletion

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
- Generate shareable link for each list
- Share with specific users (if they have accounts)
- Public link option (no login required to view)
- Link expiration option
- Revoke access anytime

#### Claiming Items
- Other users can "claim" items to avoid duplicate purchases
- Claimed items show "claimed by" (name hidden from list owner)
- Claimer can mark item as "purchased"
- Claimer can unclaim if plans change
- List owner cannot see who claimed what (surprise preserved)

#### Suggestions
- Users can suggest items to add to someone else's list
- Three suggestion modes:
  1. **Approval required**: Suggestee must approve before item appears
  2. **Auto-approve visible**: Item appears, suggestee can edit/delete
  3. **Auto-approve hidden**: Item appears only for others, hidden from suggestee (surprise gifts)

### 4. Groups

#### Group Management
- Create groups (e.g., "Family", "Friends", "Work Team")
- Each group has its own set of wishlists
- Group roles:
  - **Owner**: Full control, can delete group
  - **Manager**: Can invite users, manage members
  - **Member**: Can view and interact with lists

#### Group Features
- Invite users to group via email or link
- Remove users from group
- Switch between groups via UI
- Each group is completely isolated (separate wishlists)

### 5. Registry Mode

Special mode for events like weddings, baby showers:
- Single list for the event
- Public link sharing (no login required to view)
- Guests can claim items by entering:
  - Email or identifier
  - Name (optional)
- No account creation needed for guests
- No way to unclaim (prevents confusion)
- Owner can see total claimed/unclaimed stats

### 6. Administration

#### Admin Panel
- User management:
  - View all users
  - Disable/enable accounts
  - Reset passwords
  - Delete users
- Group management:
  - View all groups
  - Delete groups
  - View group members
- System settings:
  - Enable/disable public registration
  - Configure SMTP settings
  - Set default currency
  - Configure session timeout
  - Enable/disable features (suggestions, groups, etc.)
- Statistics:
  - Total users
  - Total wishlists
  - Total items
  - Storage usage

### 7. Optional Features

#### SMTP Configuration (Optional)
- Send email invites
- Password reset emails
- Notification emails (configurable):
  - When someone claims your item
  - When someone suggests an item
  - When someone shares a list with you

#### OAuth/SSO Support (Optional)
- OpenID Connect support
- Works with: Authelia, Authentik, Keycloak, Google
- Configuration via admin panel

#### Proxy Authentication (Advanced)
- Header-based authentication
- For advanced users with reverse proxy SSO

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
1. **Landing page**: Clean hero section explaining the app
2. **Login page**: Email/password or OAuth buttons
3. **Signup page**: Registration form
4. **Public wishlist view**: View shared list without login

#### Authenticated Pages
1. **Dashboard/Home**:
   - Quick stats
   - Recent activity
   - Your lists overview
   - Lists shared with you

2. **My Wishlists**:
   - Grid or list view toggle
   - Create new list button (prominent)
   - Search/filter lists
   - Quick actions (share, edit, delete)

3. **Wishlist Detail**:
   - List header (name, description, stats)
   - Add item button (floating or fixed)
   - Items displayed as cards or table rows
   - Filter by claimed/unclaimed
   - Sort options (priority, price, date added)

4. **Add/Edit Item**:
   - Form with all item fields
   - Image upload with preview
   - URL paste with auto-fetch button
   - Save draft option

5. **Browse Others' Lists**:
   - See lists shared with you
   - Group members' lists
   - Claim/unclaim items
   - Add suggestions

6. **Profile Settings**:
   - Profile info
   - Change password
   - Notification preferences
   - Theme selection

7. **Groups**:
   - List of your groups
   - Create group
   - Group switcher (dropdown or modal)

8. **Admin Panel** (admin only):
   - Dashboard with stats
   - User management table
   - System settings form

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

### User
```javascript
{
  id: string (uuid),
  email: string (unique),
  passwordHash: string,
  name: string,
  profilePicture: string (url),
  isAdmin: boolean,
  emailVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Wishlist
```javascript
{
  id: string (uuid),
  userId: string (foreign key),
  groupId: string (foreign key, nullable),
  name: string,
  description: string (nullable),
  isPublic: boolean,
  publicToken: string (unique, for sharing),
  isRegistry: boolean,
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
  isSuggestion: boolean,
  suggestionStatus: enum ('pending', 'approved', 'hidden'),
  suggestedBy: string (foreign key, nullable),
  claimedBy: string (foreign key, nullable),
  claimedAt: timestamp (nullable),
  isPurchased: boolean,
  sortOrder: integer,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Group
```javascript
{
  id: string (uuid),
  name: string,
  ownerId: string (foreign key),
  inviteCode: string (unique),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### GroupMember
```javascript
{
  id: string (uuid),
  groupId: string (foreign key),
  userId: string (foreign key),
  role: enum ('owner', 'manager', 'member'),
  joinedAt: timestamp
}
```

### WishlistShare
```javascript
{
  id: string (uuid),
  wishlistId: string (foreign key),
  sharedWithUserId: string (foreign key, nullable),
  sharedByUserId: string (foreign key),
  canSuggest: boolean,
  sharedAt: timestamp
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
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update profile
- `POST /api/users/me/avatar` - Upload profile picture
- `DELETE /api/users/me` - Delete account
- `PATCH /api/users/me/password` - Change password

### Wishlists
- `GET /api/wishlists` - Get user's wishlists
- `POST /api/wishlists` - Create wishlist
- `GET /api/wishlists/:id` - Get wishlist details
- `PATCH /api/wishlists/:id` - Update wishlist
- `DELETE /api/wishlists/:id` - Delete wishlist
- `GET /api/wishlists/:id/share` - Generate share link
- `DELETE /api/wishlists/:id/share` - Revoke share link
- `GET /api/wishlists/shared` - Get wishlists shared with user
- `GET /api/wishlists/public/:token` - Get public wishlist (no auth)

### Wishlist Items
- `GET /api/wishlists/:id/items` - Get items in wishlist
- `POST /api/wishlists/:id/items` - Add item to wishlist
- `GET /api/items/:id` - Get item details
- `PATCH /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/claim` - Claim item
- `DELETE /api/items/:id/claim` - Unclaim item
- `POST /api/items/:id/purchase` - Mark as purchased
- `POST /api/items/scrape` - Scrape product data from URL
- `POST /api/items/:id/image` - Upload item image

### Suggestions
- `POST /api/wishlists/:id/suggest` - Suggest item to list
- `GET /api/suggestions/pending` - Get pending suggestions
- `POST /api/suggestions/:id/approve` - Approve suggestion
- `DELETE /api/suggestions/:id` - Reject suggestion

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/invite` - Invite user to group
- `POST /api/groups/join/:inviteCode` - Join group via invite
- `GET /api/groups/:id/members` - Get group members
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `PATCH /api/groups/:id/members/:userId` - Update member role

### Admin
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id` - Update user (disable/enable)
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/groups` - Get all groups
- `DELETE /api/admin/groups/:id` - Delete group
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/settings` - Get system settings
- `PATCH /api/admin/settings` - Update system settings

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

      # Optional - Authentication
      - JWT_SECRET=your-secret-key    # Auto-generated if not set
      - TOKEN_EXPIRY_HOURS=72         # Default: 72 hours
      - REFRESH_TOKEN_EXPIRY_DAYS=30  # Default: 30 days

      # Optional - Features
      - REGISTRATION_ENABLED=true     # Allow public registration
      - DEFAULT_CURRENCY=USD          # Default: USD
      - MAX_FILE_SIZE_MB=10           # Default: 10MB

      # Optional - SMTP (for emails)
      - SMTP_HOST=smtp.gmail.com
      - SMTP_PORT=587
      - SMTP_SECURE=false
      - SMTP_USER=your-email@gmail.com
      - SMTP_PASSWORD=your-password
      - SMTP_FROM=noreply@yourdomain.com

      # Optional - OAuth (OpenID Connect)
      - OAUTH_ENABLED=false
      - OAUTH_ISSUER_URL=
      - OAUTH_CLIENT_ID=
      - OAUTH_CLIENT_SECRET=

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
- `/app/data` - SQLite database file (`wishlist.db`)
- `/app/uploads` - User uploaded images and product images
- `/app/backups` - Automated SQLite backups (optional)

### Reverse Proxy Configuration

#### Nginx Example
```nginx
server {
    listen 443 ssl http2;
    server_name wishlist.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Increase buffer sizes for large headers
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Traefik Example (labels)
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.wishlist.rule=Host(`wishlist.yourdomain.com`)"
  - "traefik.http.routers.wishlist.entrypoints=websecure"
  - "traefik.http.routers.wishlist.tls.certresolver=letsencrypt"
  - "traefik.http.services.wishlist.loadbalancer.server.port=3000"
```

### Unraid Template
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

---

## Getting Started (For Developers)

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Run migrations: `npm run db:migrate`
5. Start dev server: `npm run dev`
6. Build for production: `npm run build`
7. Build Docker image: `docker build -t wishlist .`

## License

Choose an appropriate open-source license (MIT, GPL, Apache 2.0)
