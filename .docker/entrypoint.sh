#!/bin/sh
set -e

# Run database migrations
echo "Running migrations..."
php artisan migrate --force

# Remove any development Vite hot file
rm -f /var/www/html/public/hot

# Clear and cache configurations for production
echo "Caching configurations..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Execute the CMD
echo "Starting Supervisord..."
exec "$@"
