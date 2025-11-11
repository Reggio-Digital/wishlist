# Nginx Reverse Proxy Configuration

This directory contains Nginx configuration examples for deploying Wishlist App behind a reverse proxy.

## Quick Start

To enable Nginx in docker-compose:

1. Uncomment the `nginx` service in `docker-compose.yml`
2. Place your SSL certificates in `nginx/ssl/` (if using HTTPS)
3. Update `server_name` in `nginx.conf` with your domain
4. Restart the stack: `docker-compose down && docker-compose up -d`

## SSL/TLS Setup

### Option 1: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

### Option 2: Self-Signed Certificate (Development Only)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

## Configuration Features

- **Rate Limiting**: Protects against abuse
  - General API: 10 requests/second
  - Login endpoint: 5 requests/minute
- **Gzip Compression**: Reduces bandwidth usage
- **Security Headers**: Enhances security
- **HTTPS Support**: SSL/TLS configuration ready

## Customization

Edit `nginx.conf` to:
- Change rate limits
- Add custom headers
- Configure caching
- Add additional routes
- Adjust timeouts

## Testing Configuration

```bash
# Test nginx configuration
docker exec wishlist-nginx nginx -t

# Reload nginx
docker exec wishlist-nginx nginx -s reload
```
