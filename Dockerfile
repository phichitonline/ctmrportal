# ==========================================
# Build Stage 1: Node.js (Vite assets)
# ==========================================
FROM node:20 AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ==========================================
# Build Stage 2: Composer dependencies
# ==========================================
FROM php:8.4-cli AS composer_builder
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN apt-get update && apt-get install -y git zip unzip
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --no-progress --no-scripts --prefer-dist --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize

# ==========================================
# Final Stage: PHP-FPM + Nginx
# ==========================================
FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    libicu-dev \
    libonig-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql mbstring zip exif pcntl intl

# Set working directory
WORKDIR /var/www/html

# Copy application files from builders
COPY --from=composer_builder /app /var/www/html
COPY --from=node_builder /app/public/build /var/www/html/public/build

# Copy configuration files
COPY .docker/nginx/nginx.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

COPY .docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Setup permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose the port configured in Nginx
EXPOSE 8000

# Start Supervisor
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
