#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Run migrations
node dist/config/typeorm.config.js migration:run || {
  echo "❌ Migration failed"
  exit 1
}

echo "✅ Migrations completed successfully"
