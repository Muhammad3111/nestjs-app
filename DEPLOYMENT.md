# 🚀 Production Deployment Guide

Complete step-by-step guide for deploying the NestJS MoneyChange API to production.

---

## 📋 Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Docker Deployment](#docker-deployment)
5. [Manual Deployment](#manual-deployment)
6. [Post-deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Database is set up and accessible
- [ ] SSL certificates are ready (for HTTPS)
- [ ] Domain/subdomain is configured
- [ ] Firewall rules are set
- [ ] Backup strategy is in place
- [ ] Monitoring tools are configured

---

## 🔧 Environment Setup

### Step 1: Clone Repository

```bash
# On your production server
git clone https://github.com/your-username/nestjs-app.git
cd nestjs-app
```

### Step 2: Create Production Environment File

```bash
# Copy the production example
cp .env.production.example .env

# Edit with your production values
nano .env
```

### Step 3: Generate Strong Secrets

```bash
# Generate JWT secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate registration secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Configure Environment Variables

Edit `.env` file with your production values:

```env
NODE_ENV=production
PORT=3001

# Database - Use your production PostgreSQL credentials
MONEYCHANGE_DB_URL=postgresql://prod_user:STRONG_PASSWORD@db-host:5432/moneychange_prod

POSTGRES_USER=prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=moneychange_prod

# JWT - Use generated secret from Step 3
MONEYCHANGE_JWT_SECRET=your_generated_64_byte_secret_here

# Registration - Use generated secret from Step 3
REGISTRATION_SECRET_DEFAULT=your_generated_32_byte_secret_here

# CORS - Add your production frontend URLs
ALLOWED_ORIGINS=https://moneychange.uz,https://www.moneychange.uz,https://app.moneychange.uz
```

---

## 🗄️ Database Setup

### Option 1: Managed Database (Recommended)

Use a managed PostgreSQL service:

- **AWS RDS**
- **DigitalOcean Managed Databases**
- **Google Cloud SQL**
- **Azure Database for PostgreSQL**

### Option 2: Self-hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE moneychange_prod;
CREATE USER prod_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE moneychange_prod TO prod_user;
\q
```

### Configure PostgreSQL for Remote Access

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Change:
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add:
host    moneychange_prod    prod_user    0.0.0.0/0    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 🐳 Docker Deployment (Recommended)

### Step 1: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Build and Run

```bash
# Build the production image
docker-compose build

# Run migrations
docker-compose run --rm migrations

# Start the application
docker-compose up -d

# Check logs
docker-compose logs -f api
```

### Step 3: Verify Deployment

```bash
# Check running containers
docker-compose ps

# Test API
curl http://localhost:3001/api/analytics/global
```

---

## 🔨 Manual Deployment (Without Docker)

### Step 1: Install Node.js

```bash
# Install Node.js 18.x or higher
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 2: Install Dependencies

```bash
# Install production dependencies
npm ci --only=production
```

### Step 3: Build Application

```bash
# Build TypeScript to JavaScript
npm run build
```

### Step 4: Run Migrations

```bash
# Run database migrations
npm run migration:run
```

### Step 5: Start Application

```bash
# Start with PM2 (recommended)
npm install -g pm2
pm2 start dist/main.js --name moneychange-api

# Or start directly
node dist/main.js
```

### Step 6: Configure PM2 for Auto-restart

```bash
# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup

# Follow the instructions shown
```

---

## 🌐 Nginx Reverse Proxy Setup

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Step 2: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/moneychange-api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.moneychange.uz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/moneychange-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 4: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.moneychange.uz

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## ✅ Post-deployment Verification

### 1. Health Check

```bash
# Check if API is running
curl https://api.moneychange.uz/api/analytics/global

# Expected response:
{
  "totalIncome": 0,
  "totalExpense": 0,
  "totalBalanceUZS": 0,
  "totalBalanceUSD": 0,
  "totalRegions": 0,
  "totalOrders": 0
}
```

### 2. Test Authentication

```bash
# Register a user
curl -X POST https://api.moneychange.uz/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "phone": "+998901234567",
    "password": "SecurePassword123!",
    "role": "admin",
    "secretKey": "YOUR_REGISTRATION_SECRET"
  }'

# Login
curl -X POST https://api.moneychange.uz/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+998901234567",
    "password": "SecurePassword123!"
  }'
```

### 3. Test Protected Endpoints

```bash
# Get current user (use token from login)
curl https://api.moneychange.uz/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Monitoring & Maintenance

### Application Logs

```bash
# Docker logs
docker-compose logs -f api

# PM2 logs
pm2 logs moneychange-api

# System logs
journalctl -u moneychange-api -f
```

### Database Backups

```bash
# Create backup script
nano /opt/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="moneychange_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U prod_user -d moneychange_prod > $BACKUP_DIR/$FILENAME

# Keep only last 7 days of backups
find $BACKUP_DIR -name "moneychange_backup_*.sql" -mtime +7 -delete

echo "Backup completed: $FILENAME"
```

```bash
# Make executable
chmod +x /opt/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add line:
0 2 * * * /opt/backup-db.sh
```

### Performance Monitoring

Install monitoring tools:

```bash
# Install htop for system monitoring
sudo apt install htop

# Install PostgreSQL monitoring
sudo apt install postgresql-contrib

# Use pg_stat_statements for query analysis
```

---

## 🔥 Troubleshooting

### Issue: API not starting

**Check logs:**

```bash
docker-compose logs api
# or
pm2 logs moneychange-api
```

**Common causes:**

- Database connection failed
- Port already in use
- Missing environment variables

### Issue: Database connection failed

**Verify connection:**

```bash
psql -h localhost -U prod_user -d moneychange_prod
```

**Check:**

- Database credentials in `.env`
- PostgreSQL is running
- Firewall allows connection
- `pg_hba.conf` allows remote connections

### Issue: CORS errors

**Update ALLOWED_ORIGINS:**

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Restart application:**

```bash
docker-compose restart api
# or
pm2 restart moneychange-api
```

### Issue: JWT token invalid

**Causes:**

- Different JWT_SECRET between deployments
- Token expired (15 minutes for access token)
- Clock skew between servers

**Solution:**

- Use same JWT_SECRET across all instances
- Implement token refresh mechanism
- Sync server time with NTP

---

## 🔄 Updates & Rollbacks

### Deploy New Version

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (Docker)
docker-compose down
docker-compose build
docker-compose run --rm migrations
docker-compose up -d

# Or with PM2
npm ci --only=production
npm run build
npm run migration:run
pm2 restart moneychange-api
```

### Rollback

```bash
# Git rollback
git checkout <previous-commit-hash>

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Rollback migrations if needed
npm run migration:revert
```

---

## 📞 Support

For issues or questions:

- Check logs first
- Review this guide
- Check API documentation: `API-COMPLETE.json`
- Review optimization guide: `OPTIMIZATIONS.md`

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to git**
2. **Use strong, random secrets for JWT and registration**
3. **Keep dependencies updated:** `npm audit fix`
4. **Enable HTTPS only in production**
5. **Implement rate limiting** (consider using nginx or API gateway)
6. **Regular security audits:** `npm audit`
7. **Monitor logs for suspicious activity**
8. **Backup database regularly**
9. **Use environment-specific configurations**
10. **Rotate secrets periodically**

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] Migrations run successfully
- [ ] Application starts without errors
- [ ] Health check endpoint responds
- [ ] Authentication works
- [ ] CORS configured correctly
- [ ] SSL certificate installed
- [ ] Nginx reverse proxy configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team notified of deployment

---

**Deployment Date:** ********\_********

**Deployed By:** ********\_********

**Version:** ********\_********

**Notes:** ********\_********
