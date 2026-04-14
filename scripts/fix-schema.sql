-- Fix database schema issues for TEM Project

-- 1. Add enrollment_code column to courses table for student enrollment
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS enrollment_code TEXT UNIQUE;

-- 2. Create a function to generate enrollment codes for existing courses
CREATE OR REPLACE FUNCTION generate_enrollment_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.courses WHERE enrollment_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$;

-- 3. Update existing courses with enrollment codes
UPDATE public.courses 
SET enrollment_code = generate_enrollment_code() 
WHERE enrollment_code IS NULL;

-- 4. Create trigger to auto-generate enrollment code for new courses
CREATE OR REPLACE FUNCTION set_enrollment_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.enrollment_code IS NULL THEN
    NEW.enrollment_code := generate_enrollment_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS courses_enrollment_code_trigger ON public.courses;

CREATE TRIGGER courses_enrollment_code_trigger
  BEFORE INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION set_enrollment_code();

-- 5. Create profile trigger to auto-create profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Fix RLS policies for courses to be more permissive for professors
-- Drop existing policies first
DROP POLICY IF EXISTS "courses_insert_professor" ON public.courses;

-- Create updated insert policy that checks user_metadata directly
CREATE POLICY "courses_insert_professor" ON public.courses
  FOR INSERT WITH CHECK (
    auth.uid() = professor_id
  );

-- 7. Fix enrollments RLS to allow students to enroll themselves
DROP POLICY IF EXISTS "enrollments_insert_professor" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_student" ON public.enrollments;

-- Students can enroll themselves in any course
CREATE POLICY "enrollments_insert_student" ON public.enrollments
  FOR INSERT WITH CHECK (
    auth.uid() = student_id
  );

-- 8. Add admin select all policy for profiles to allow admin access
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;

CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  );

-- 9. Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'full_name',
  COALESCE(au.raw_user_meta_data ->> 'role', 'student')
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
