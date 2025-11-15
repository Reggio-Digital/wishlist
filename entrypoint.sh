#!/bin/sh
set -e

# Default to 1000:1000 (standard Linux user)
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "
-------------------------------------
User UID:    $PUID
User GID:    $PGID
-------------------------------------
"

# Create group if it doesn't exist
if ! getent group ${PGID} > /dev/null 2>&1; then
    addgroup -g ${PGID} appgroup
fi

# Create user if it doesn't exist
if ! getent passwd ${PUID} > /dev/null 2>&1; then
    adduser -S -u ${PUID} -G $(getent group ${PGID} | cut -d: -f1) -h /app appuser
fi

# Ensure data directories exist
echo "Creating data directories if they don't exist..."
mkdir -p /app/data/db /app/data/uploads

# Fix ownership of all data directories
echo "Setting ownership to ${PUID}:${PGID}..."
chown -R ${PUID}:${PGID} /app/data

# Set proper permissions
echo "Setting permissions..."
chmod -R 775 /app/data

echo "Data directory permissions configured successfully"

# Set umask for proper file creation permissions
umask 0002

# Switch to the specified user and execute the command
exec su-exec ${PUID}:${PGID} "$@"
