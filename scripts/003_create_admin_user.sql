-- Create admin user directly in auth.users table
-- Email: admin@school.local
-- Password will be hashed using pgcrypto

-- First, ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert the admin user into auth.users
-- The password will be hashed with bcrypt by Supabase automatically through the API,
-- so we'll use the standard Supabase format

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@school.local',
  crypt('VeryStrongPassword', gen_salt('bf', 10)),
  NOW(),
  jsonb_build_object(
    'username', 'admin',
    'is_admin', true
  ),
  NOW(),
  NOW(),
  NOW(),
  'authenticated'
)
ON CONFLICT (email) DO NOTHING;

-- Get the user ID we just created
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@school.local';
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (admin_user_id, 'admin', true)
  ON CONFLICT (id) DO UPDATE SET username = 'admin', is_admin = true;
  
  RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END
$$;
