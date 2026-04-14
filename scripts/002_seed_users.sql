-- Seed test users for development/testing
-- Note: In production, users should only be created via the auth signup flow

-- Create a test user via Supabase Auth
-- Email: admin@example.com
-- Password: TestPassword123!
-- Username: Administrator

-- First, insert into auth.users directly (only for seeding - normally done via auth.signUp)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at,
  last_sign_in_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_confirm_token,
  recovery_sent_at,
  email_change_sent_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  banned_until,
  is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  -- Password: TestPassword123! (bcrypt hash)
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36YROYgm',
  NOW(),
  jsonb_build_object(
    'username', 'Administrator',
    'full_name', 'Admin User',
    'role', 'admin'
  ),
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  NULL,
  NULL,
  NULL,
  '',
  NOW(),
  NULL,
  FALSE
) ON CONFLICT (id) DO NOTHING;

-- The trigger will automatically create a profile entry
-- But let's also verify/insert it directly
INSERT INTO public.profiles (
  id,
  email,
  username,
  full_name,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'Administrator',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Also create a test student user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at,
  last_sign_in_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_confirm_token,
  recovery_sent_at,
  email_change_sent_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  banned_until,
  is_sso_user
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'student@example.com',
  -- Password: TestPassword123! (same bcrypt hash)
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36YROYgm',
  NOW(),
  jsonb_build_object(
    'username', 'JohnStudent',
    'full_name', 'John Student',
    'role', 'student'
  ),
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  NULL,
  NULL,
  NULL,
  '',
  NOW(),
  NULL,
  FALSE
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile for student
INSERT INTO public.profiles (
  id,
  email,
  username,
  full_name,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'student@example.com',
  'JohnStudent',
  'John Student',
  'student'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;
