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

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Verify Deployment**
   ```bash
   # Check service health
   docker-compose ps

   # View logs
   docker-compose logs -f

   # Test health endpoints
   curl http://localhost:3000/api/health
   curl http://localhost:3001/
   ```

### Production with Nginx

1. **Enable Nginx in docker-compose.yml**
   - Uncomment the `nginx` service section

2. **Configure SSL Certificates**
   ```bash
   # Option 1: Let's Encrypt
   sudo certbot certonly --standalone -d your-domain.com
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

   # Option 2: Self-signed (development only)
   mkdir -p nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem
   ```

3. **Update nginx.conf**
   - Set your domain in `server_name`
   - Uncomment HTTPS server block
   - Configure SSL paths

4. **Deploy**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Manual Deployment

### Prerequisites
- Node.js 20+
- Process manager (PM2 recommended)
- Nginx or Apache (optional)

### Backend Setup

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
   pm2 start dist/server.js --name wishlist-backend
   pm2 save
   pm2 startup
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm ci --only=production
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name wishlist-frontend -- start
   pm2 save
   ```

## Reverse Proxy Setup

### Nginx

See `nginx/nginx.conf` for a complete configuration example.

**Basic setup:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Caddy

See `nginx/Caddyfile.example` for configuration.

**Basic setup:**
```caddy
your-domain.com {
    handle /api/* {
        reverse_proxy localhost:3000
    }

    handle {
        reverse_proxy localhost:3001
    }
}
```

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
    reverse_proxy localhost:3001
}
```

## Database Backup

### Docker Setup

**Manual Backup:**
```bash
# Backup database
docker cp wishlist-backend:/app/data/wishlist.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db wishlist-backend:/app/data/wishlist.db
docker-compose restart backend
```

**Automated Backup Script:**
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker cp wishlist-backend:/app/data/wishlist.db \
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
pm2 restart all
```

## Monitoring

### Health Checks

**Backend:**
```bash
curl http://localhost:3000/api/health
```

**Frontend:**
```bash
curl http://localhost:3001/
```

### Docker Health Status

```bash
# Check service health
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats wishlist-backend wishlist-frontend
```

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs

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
sudo lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Locked
```bash
# Stop all services
docker-compose down
# Or
pm2 stop all

# Restart
docker-compose up -d
# Or
pm2 start all
```

### Permission Issues
```bash
# Fix data directory permissions
sudo chown -R $(whoami):$(whoami) data/

# Docker: ensure volume permissions
docker-compose down
docker volume rm wishlist_wishlist-data
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

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: See README.md and TODO.md
