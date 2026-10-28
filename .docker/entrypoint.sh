#!/bin/sh
set -e

# 1. Create required storage & cache directories
mkdir -p /var/www/html/storage/app/public/soc_reports
mkdir -p /var/www/html/storage/app/public/agency_docs
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs

# 2. Create symbolic link from public/storage -> storage/app/public
echo "Linking public storage..."
php artisan storage:link --force || true

# 3. Run database migrations
echo "Running migrations..."
php artisan migrate --force

# 4. Remove any development Vite hot file
rm -f /var/www/html/public/hot

# 5. Clear and cache configurations for production
echo "Caching configurations..."
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Ensure www-data owns storage and cache (must run after artisan commands)
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
if [ -L /var/www/html/public/storage ] || [ -d /var/www/html/public/storage ]; then
    chown -h www-data:www-data /var/www/html/public/storage || true
fi

# 7. Execute the CMD
echo "Starting Supervisord..."
exec "$@"
