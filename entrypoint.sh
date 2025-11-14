#!/bin/sh
set -e

# Default to 1000:1000 (standard Linux user)
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "Starting with PUID=${PUID}, PGID=${PGID}"

# Create group if it doesn't exist
if ! getent group ${PGID} > /dev/null 2>&1; then
    echo "Creating group with GID ${PGID}"
    addgroup -g ${PGID} -S appgroup
fi

# Create user if it doesn't exist
if ! getent passwd ${PUID} > /dev/null 2>&1; then
    echo "Creating user with UID ${PUID}"
    adduser -S -u ${PUID} -G $(getent group ${PGID} | cut -d: -f1) -h /app appuser
fi

# Get the username for the PUID
USERNAME=$(getent passwd ${PUID} | cut -d: -f1)
GROUPNAME=$(getent group ${PGID} | cut -d: -f1)

echo "Running as ${USERNAME}:${GROUPNAME}"

# Ensure data directories exist and have correct permissions
mkdir -p /app/data/db /app/data/uploads
chown -R ${PUID}:${PGID} /app/data
chmod -R 775 /app/data

# Set umask for file creation permissions
umask 0002

# Execute the main command as the specified user
exec su-exec ${PUID}:${PGID} "$@"
