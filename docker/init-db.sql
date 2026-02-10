-- CMAMSys Database Initialization Script
-- This script is executed when PostgreSQL container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if not exists (already created by docker-entrypoint)
-- CREATE DATABASE IF NOT EXISTS cmamsys;

-- Connect to the database
\c cmamsys

-- Enable additional extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For GIN indexes

-- Create admin user (default password: REDACTED_PASSWORD)
-- This user will be created by the application on first run
-- You can also create it manually here:
-- INSERT INTO "User" (id, email, "passwordHash", name, role, "isEmailVerified", "createdAt", "updatedAt")
-- VALUES (
--   uuid_generate_v4(),
--   'admin@cmamsys.com',
--   '$2b$10$rKZ/...',
--   'System Administrator',
--   'ADMIN',
--   true,
--   NOW(),
--   NOW()
-- );

-- Create initial system settings
INSERT INTO "SystemSetting" (id, key, value, description, "category", "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'site_name', 'CMAMSys', 'Site name displayed in header', 'general', NOW(), NOW()),
  (uuid_generate_v4(), 'site_description', 'CompetiMath AutoModel System', 'Site description', 'general', NOW(), NOW()),
  (uuid_generate_v4(), 'allow_registration', 'true', 'Allow new user registration', 'registration', NOW(), NOW()),
  (uuid_generate_v4(), 'require_email_verification', 'true', 'Require email verification for new users', 'registration', NOW(), NOW()),
  (uuid_generate_v4(), 'default_user_role', 'USER', 'Default role for new users', 'registration', NOW(), NOW()),
  (uuid_generate_v4(), 'max_team_size', '3', 'Maximum team size for competitions', 'competition', NOW(), NOW()),
  (uuid_generate_v4(), 'max_file_size', '104857600', 'Maximum file upload size in bytes (100MB)', 'upload', NOW(), NOW()),
  (uuid_generate_v4(), 'allowed_file_types', 'pdf,doc,docx,zip,rar,xlsx,csv', 'Allowed file types for upload', 'upload', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Create initial AI provider templates (user can configure these in the UI)
-- DeepSeek
INSERT INTO "AIProvider" (id, name, provider, "apiKey", "apiEndpoint", "models", "isEnabled", "priority", "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'DeepSeek Default', 'DEEPSEEK', '', 'https://api.deepseek.com', '["deepseek-chat", "deepseek-coder"]', false, 10, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- VolcEngine
INSERT INTO "AIProvider" (id, name, provider, "apiKey", "apiEndpoint", "models", "isEnabled", "priority", "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'VolcEngine Default', 'VOLCENGINE', '', 'https://ark.cn-beijing.volces.com/api/v3', '["ep-20250101000000-xxxxx"]', false, 20, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Aliyun
INSERT INTO "AIProvider" (id, name, provider, "apiKey", "apiEndpoint", "models", "isEnabled", "priority", "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'Aliyun DashScope Default', 'ALIYUN', '', 'https://dashscope.aliyuncs.com/compatible-mode/v1', '["qwen-turbo", "qwen-plus", "qwen-max"]', false, 30, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Note: Community license is configured in src/lib/license.ts (hardcoded)
-- License features are available by default in the self-hosted edition

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_team_owner ON "Team"(ownerId);
CREATE INDEX IF NOT EXISTS idx_competition_status ON "Competition"(status);
CREATE INDEX IF NOT EXISTS idx_ai_request_provider ON "AIRequest"(provider);
CREATE INDEX IF NOT EXISTS idx_ai_request_created ON "AIRequest"(createdAt);

-- Grant permissions (if using a non-superuser)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cmamsys_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cmamsys_user;

-- Output success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CMAMSys Database Initialized Successfully';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: User, Team, Competition, AIProvider, etc.';
  RAISE NOTICE 'Initial settings configured';
  RAISE NOTICE 'AI provider templates created';
  RAISE NOTICE '========================================';
END $$;
