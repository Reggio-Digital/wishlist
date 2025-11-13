# Deployment Guide

This guide covers deploying the Wishlist App in production.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Reverse Proxy Setup](#reverse-proxy-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Database Backup](#database-backup)
- [Monitoring](#monitoring)

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Domain name (for production with SSL)

### Publishing to Docker Hub

To share your Docker image publicly:

1. **Build the image**
   ```bash
   docker build -t <your-dockerhub-username>/wishlist-app:latest .
   ```

2. **Test locally**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e ADMIN_USERNAME=admin \
     -e ADMIN_PASSWORD=test123 \
     -v wishlist-data:/app/data \
     --name wishlist-test \
     <your-dockerhub-username>/wishlist-app:latest
   ```

3. **Login to Docker Hub**
   ```bash
   docker login
   ```

4. **Push to Docker Hub**
   ```bash
   docker push <your-dockerhub-username>/wishlist-app:latest
   ```

5. **Tag versions (recommended)**
   ```bash
   # Tag with version number
   docker tag <your-dockerhub-username>/wishlist-app:latest \
              <your-dockerhub-username>/wishlist-app:v1.0.0

   docker push <your-dockerhub-username>/wishlist-app:v1.0.0
   ```

**Multi-platform builds** (for ARM/AMD support):
```bash
# Create buildx builder (one-time setup)
docker buildx create --name multiplatform --use

# Build and push for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 \
  -t <your-dockerhub-username>/wishlist-app:latest \
  --push .
```

### Quick Start

1. **Clone and Configure**
   ```bash
   git clone <repository-url>
   cd wishlist-app
   cp .env.example .env
   ```

2. **Edit `.env` file**
   ```env
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_secure_password
   DEFAULT_CURRENCY=USD
   TZ=America/New_York
   ```

3. **Start Service**
   ```bash
   docker-compose up -d
   ```

4. **Verify Deployment**
   ```bash
   # Check service health
   docker-compose ps

   # View logs
   docker-compose logs -f

   # Test health endpoint
   curl http://localhost:3000/api/health
   ```

The app runs on port 3000. For production, use a reverse proxy (Nginx or Caddy) with SSL - see [Reverse Proxy Setup](#reverse-proxy-setup) below.

## Manual Deployment

### Prerequisites
- Node.js 20+
- Process manager (PM2 recommended)
- Nginx or Apache (optional)

### Setup

1. **Install Dependencies**
   ```bash
   npm ci --only=production
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name wishlist-app -- start
   pm2 save
   pm2 startup
   ```

## Reverse Proxy Setup

### Nginx

**Basic setup:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy

**Basic setup:**
```caddy
your-domain.com {
    reverse_proxy localhost:3000
}
```

Caddy automatically handles HTTPS with Let's Encrypt!

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate (Nginx)
sudo certbot --nginx -d your-domain.com

# Or standalone
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet
```

### Caddy (Automatic HTTPS)

Caddy automatically obtains and renews SSL certificates. Just use your domain in the Caddyfile:

```caddy
your-domain.com {
    # Caddy handles HTTPS automatically
    reverse_proxy localhost:3000
}
```

## Database Backup

### Docker Setup

**Manual Backup:**
```bash
# Backup database
docker cp wishlist-app:/app/data/wishlist.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db wishlist-app:/app/data/wishlist.db
docker-compose restart
```

**Automated Backup Script:**
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker cp wishlist-app:/app/data/wishlist.db \
  "$BACKUP_DIR/wishlist-$DATE.db"

# Keep only last 30 days
find "$BACKUP_DIR" -name "wishlist-*.db" -mtime +30 -delete
```

**Add to crontab:**
```bash
0 2 * * * /path/to/backup.sh
```

### Manual Setup

```bash
# Backup
cp data/wishlist.db backups/wishlist-$(date +%Y%m%d).db

# Restore
cp backups/wishlist-backup.db data/wishlist.db
pm2 restart wishlist-app
```

## Monitoring

### Health Checks

```bash
curl http://localhost:3000/api/health
```

### Docker Health Status

```bash
# Check service health
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats wishlist-app
```

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs wishlist-app

# Monitoring dashboard
pm2 monit

# Web dashboard
pm2 install pm2-server-monit
```

### Log Rotation

**Docker:**
Add to `docker-compose.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

**PM2:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Locked
```bash
# Stop service
docker-compose down
# Or
pm2 stop wishlist-app

# Restart
docker-compose up -d
# Or
pm2 start wishlist-app
```

### Permission Issues
```bash
# Fix data directory permissions
sudo chown -R $(whoami):$(whoami) data/

# Docker: ensure volume permissions
docker-compose down
docker volume rm wishlist-app_wishlist-data
docker-compose up -d
```

## Security Checklist

- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Use HTTPS in production
- [ ] Configure firewall (allow only 80, 443)
- [ ] Enable rate limiting (Nginx/Caddy)
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity
- [ ] Restrict SSH access
- [ ] Use fail2ban or similar
- [ ] Regular security audits

## Performance Tuning

### Docker
- Use production images (smaller size)
- Limit container resources in docker-compose.yml
- Use volumes for persistent data

### Database
- Regular VACUUM for SQLite:
  ```bash
  sqlite3 data/wishlist.db "VACUUM;"
  ```

### Nginx
- Enable gzip compression
- Configure caching headers
- Use HTTP/2

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_USERNAME` | Yes | `admin` | Admin login username |
| `ADMIN_PASSWORD` | Yes | `changeme` | Admin login password |
| `DEFAULT_CURRENCY` | No | `USD` | Default currency for items |
| `TZ` | No | `America/New_York` | Timezone for logs |
| `SECRET` | No | auto-generated | JWT access token secret |
| `REFRESH_SECRET` | No | auto-generated | JWT refresh token secret |
| `NODE_ENV` | No | `production` | Node environment |
| `PORT` | No | `3000` | Server port |

## Architecture

This is a **single-service application**:
- Next.js 16 (App Router) handles both frontend and API routes
- SQLite database stored in `/app/data` volume
- Port 3000 serves everything (HTML pages + API endpoints)
- Standalone Next.js build for optimized Docker deployment

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: See README.md
