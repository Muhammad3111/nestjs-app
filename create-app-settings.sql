-- Create app_settings table manually
-- Run this in Docker PostgreSQL container

-- Ensure uuid extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL,
    value TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on key column
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_app_settings_key" ON app_settings(key);

-- Verify table created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'app_settings';

-- Show table structure
\d app_settings
