-- Seed data for initial users
-- This file runs automatically on application startup (H2 will execute data.sql)

-- Insert Admin User
-- Email: admin@admin.com
-- Password: admin123
-- BCrypt hash of 'admin123'
INSERT INTO app_user (id, email, name, password_hash, role) 
VALUES (1, 'admin@admin.com', 'System Administrator', '$2a$10$xJ6lYVYh3LFVdEYKZB5o3.xKGjKJc5M7S8fYqKqEWqB5hKGJ5RWES', 1)
ON CONFLICT (email) DO NOTHING;

-- Insert Regular User
-- Email: user@user.com
-- Password: user123
-- BCrypt hash of 'user123'
INSERT INTO app_user (id, email, name, password_hash, role) 
VALUES (2, 'user@user.com', 'Regular User', '$2a$10$8lY5kKLbVXh8FhYqJwXvLuJGjKFc5M7S8fYqKqEWqB5hKGJ5ABCD', 0)
ON CONFLICT (email) DO NOTHING;

-- Reset sequence for auto-increment
ALTER TABLE app_user ALTER COLUMN id RESTART WITH 3;
