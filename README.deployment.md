# 🚀 Deployment Guide

## 📋 Prerequisites

- Docker & Docker Compose installed
- `.env` file configured (see `.env.example`)

## 🛠️ Development Mode

Development mode uses `synchronize: true` for automatic schema updates.

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

**Development Features:**

- ✅ Hot reload enabled
- ✅ Auto schema synchronization
- ✅ Database logging enabled
- ✅ Source code mounted as volume
- ✅ CORS allows localhost origins

## 🏭 Production Mode

Production mode uses migrations for safe database schema management.

```bash
# Start production environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Production Features:**

- ✅ Optimized Docker image (multi-stage build)
- ✅ Database migrations run automatically
- ✅ No auto-synchronization (safe)
- ✅ Health checks enabled
- ✅ Restart policies configured
- ✅ CORS restricted to production domains

## 🔄 Database Migrations

### Generate Migration (after entity changes)

```bash
# Generate migration based on entity changes
npm run migration:generate -- src/migrations/MigrationName

# Example:
npm run migration:generate -- src/migrations/AddIndexesToEntities
```

### Create Empty Migration

```bash
npm run migration:create -- src/migrations/MigrationName
```

### Run Migrations

```bash
# Development (local)
npm run migration:run

# Production (Docker handles this automatically)
docker-compose up moneychange_migration
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
npm run migration:show
```

## 🔧 Environment Variables

### Required Variables

| Variable                      | Description               | Example                                       |
| ----------------------------- | ------------------------- | --------------------------------------------- |
| `NODE_ENV`                    | Environment mode          | `development` or `production`                 |
| `PORT`                        | Application port          | `3000`                                        |
| `MONEYCHANGE_DB_URL`          | PostgreSQL connection URL | `postgresql://user:pass@host:5432/db`         |
| `MONEYCHANGE_JWT_SECRET`      | JWT secret key            | Strong random string                          |
| `REGISTRATION_SECRET_DEFAULT` | User registration secret  | Strong random string                          |
| `ALLOWED_ORIGINS`             | CORS allowed origins      | `https://example.com,https://www.example.com` |

### Database Variables (for Docker)

| Variable            | Description       | Example            |
| ------------------- | ----------------- | ------------------ |
| `POSTGRES_USER`     | Database user     | `moneychange_user` |
| `POSTGRES_PASSWORD` | Database password | Strong password    |
| `POSTGRES_DB`       | Database name     | `moneychange`      |

## 📊 Database Schema Management

### Development Workflow

1. **Make entity changes** in `src/**/*.entity.ts`
2. **Auto-sync** handles it automatically (synchronize: true)
3. **Before production**, generate migration:
   ```bash
   npm run migration:generate -- src/migrations/YourChanges
   ```

### Production Workflow

1. **Generate migration** after entity changes
2. **Commit migration** files to git
3. **Deploy** - migrations run automatically
4. **Verify** migration success in logs

## 🔒 Security Checklist

- [ ] Change `MONEYCHANGE_JWT_SECRET` to strong random value
- [ ] Change `REGISTRATION_SECRET_DEFAULT` to strong random value
- [ ] Update `ALLOWED_ORIGINS` to your production domains
- [ ] Set `NODE_ENV=production` in production
- [ ] Use strong database password
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Regular database backups

## 🐛 Troubleshooting

### Migration Fails

```bash
# Check migration status
npm run migration:show

# Revert last migration
npm run migration:revert

# Check database connection
docker-compose exec moneychange_db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

### Container Won't Start

```bash
# Check logs
docker-compose logs moneychange_api

# Check database health
docker-compose ps
```

### CORS Issues

Verify `ALLOWED_ORIGINS` in `.env` includes your frontend URL.

## 📦 Backup & Restore

### Backup Database

```bash
docker-compose exec moneychange_db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql
```

### Restore Database

```bash
docker-compose exec -T moneychange_db psql -U $POSTGRES_USER $POSTGRES_DB < backup.sql
```

## 🔄 Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Migrations run automatically
```

## 📈 Monitoring

### Check Application Health

```bash
curl http://localhost:3001/health
```

### View API Documentation

```
http://localhost:3001/api/docs
```

### Database Connection

```bash
docker-compose exec moneychange_db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

## 🎯 Quick Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d

# View logs
docker-compose logs -f moneychange_api

# Restart API
docker-compose restart moneychange_api

# Stop everything
docker-compose down

# Clean everything (including volumes)
docker-compose down -v
```

## ✅ Deployment Verification

After deployment, verify:

1. ✅ API is running: `curl http://localhost:3001/health`
2. ✅ Swagger docs accessible: `http://localhost:3001/api/docs`
3. ✅ Database connected: Check logs for connection success
4. ✅ Migrations applied: Check `moneychange_migration` container logs
5. ✅ CORS working: Test from frontend
6. ✅ Authentication working: Test login endpoint

## 🆘 Support

For issues, check:

- Application logs: `docker-compose logs moneychange_api`
- Migration logs: `docker-compose logs moneychange_migration`
- Database logs: `docker-compose logs moneychange_db`
