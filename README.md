<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**MoneyChange API** - A comprehensive NestJS-based REST API for managing money exchange operations, orders, regions, and analytics.

### Features

- 🔐 **JWT Authentication** - Secure login with access & refresh tokens
- 👥 **User Management** - Complete CRUD operations with role-based access
- 📦 **Order Management** - Track UZS & USD transactions with flow balances
- 🌍 **Region Management** - Multi-region support with balance tracking
- 📊 **Analytics** - Real-time global statistics and insights
- 🗄️ **PostgreSQL** - Robust database with TypeORM
- 🐳 **Docker Support** - Easy deployment with Docker Compose
- 🔄 **Database Migrations** - Version-controlled schema changes
- 📝 **API Documentation** - Complete endpoint documentation in JSON format

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete production deployment guide
- **[API-COMPLETE.json](./API-COMPLETE.json)** - Full API documentation with examples
- **[OPTIMIZATIONS.md](./OPTIMIZATIONS.md)** - Performance optimizations applied
- **[README.deployment.md](./README.deployment.md)** - Deployment configuration details

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/nestjs-app.git
cd nestjs-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration
```

## 🏃 Running the Application

### Option 1: Docker (Recommended)

```bash
# Start all services (API + PostgreSQL)
docker-compose -f docker-compose.dev.yml up

# Run migrations
docker-compose -f docker-compose.dev.yml run --rm migrations

# View logs
docker-compose -f docker-compose.dev.yml logs -f api
```

### Option 2: Local Development

```bash
# Start PostgreSQL (ensure it's running)

# Run migrations
npm run migration:run

# Start in development mode
npm run start:dev

# Start in production mode
npm run build
npm run start:prod
```

API will be available at: `http://localhost:3001`

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🚀 Production Deployment

For complete production deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy with Docker

```bash
# 1. Setup environment
cp .env.production.example .env
# Edit .env with production values

# 2. Build and deploy
docker-compose build
docker-compose run --rm migrations
docker-compose up -d

# 3. Verify
curl http://localhost:3001/api/analytics/global
```

### Environment Variables

Required environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - API port (default: 3001)
- `MONEYCHANGE_DB_URL` - PostgreSQL connection string
- `MONEYCHANGE_JWT_SECRET` - JWT signing secret (64+ chars)
- `REGISTRATION_SECRET_DEFAULT` - User registration secret
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

See `.env.example` for development and `.env.production.example` for production.

## 📡 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh tokens

### Users

- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (paginated)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Regions

- `POST /api/regions` - Create region
- `GET /api/regions` - Get all regions (paginated)
- `GET /api/regions/:id` - Get region by ID
- `PUT /api/regions/:id` - Update region
- `DELETE /api/regions/:id` - Delete region

### Analytics

- `GET /api/analytics/global` - Get global statistics

For detailed API documentation with request/response examples, see **[API-COMPLETE.json](./API-COMPLETE.json)**

## 🗄️ Database Migrations

```bash
# Generate new migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔒 Security

- JWT-based authentication with access & refresh tokens
- Password hashing with bcrypt
- Role-based access control (admin/user)
- CORS configuration for allowed origins
- Environment-based configuration
- SQL injection protection via TypeORM

## 📊 Tech Stack

- **Framework:** NestJS 10.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 14.x
- **ORM:** TypeORM 0.3.x
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger/OpenAPI
- **Containerization:** Docker & Docker Compose

## 📝 Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── orders/         # Order management
├── regions/        # Region management
├── analiytics/     # Analytics module
├── common/         # Shared utilities
├── config/         # Configuration files
└── migrations/     # Database migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
