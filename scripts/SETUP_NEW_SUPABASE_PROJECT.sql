-- ============================================================
-- SETUP SCRIPT FOR NEW SUPABASE PROJECT
-- ============================================================
-- Copy and paste this entire script into your Supabase SQL editor
-- at: https://ybikkprfmcrbgvicohtd.supabase.co/project/default/sql/new
--
-- This script will:
-- 1. Create all database tables (profiles, courses, enrollments, etc.)
-- 2. Set up Row Level Security (RLS) policies
-- 3. Create triggers for auto-profile creation on signup
-- 4. Seed test users (admin@school.local and student@example.com)
-- ============================================================

-- Create profiles table with username support for login
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'professor', 'admin')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

-- Allow anyone to select profiles (needed for username lookup during login)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_professor" ON public.courses;
DROP POLICY IF EXISTS "courses_update_professor" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_professor" ON public.courses;

CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT USING (TRUE);

CREATE POLICY "courses_insert_professor" ON public.courses
  FOR INSERT WITH CHECK (
    auth.uid() = professor_id AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('professor', 'admin')
  );

CREATE POLICY "courses_update_professor" ON public.courses
  FOR UPDATE USING (
    auth.uid() = professor_id AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('professor', 'admin')
  );

CREATE POLICY "courses_delete_professor" ON public.courses
  FOR DELETE USING (
    auth.uid() = professor_id AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('professor', 'admin')
  );

-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_student" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_own" ON public.enrollments;

CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT USING (
    auth.uid() = student_id OR
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

CREATE POLICY "enrollments_insert_student" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "enrollments_delete_own" ON public.enrollments
  FOR DELETE USING (
    auth.uid() = student_id OR
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select_enrolled" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert_professor" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update_professor" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete_professor" ON public.lessons;

CREATE POLICY "lessons_select_enrolled" ON public.lessons
  FOR SELECT USING (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id) OR
    course_id IN (
      SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "lessons_insert_professor" ON public.lessons
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

CREATE POLICY "lessons_update_professor" ON public.lessons
  FOR UPDATE USING (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

CREATE POLICY "lessons_delete_professor" ON public.lessons
  FOR DELETE USING (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_select_enrolled" ON public.assignments;
DROP POLICY IF EXISTS "assignments_insert_professor" ON public.assignments;
DROP POLICY IF EXISTS "assignments_update_professor" ON public.assignments;
DROP POLICY IF EXISTS "assignments_delete_professor" ON public.assignments;

CREATE POLICY "assignments_select_enrolled" ON public.assignments
  FOR SELECT USING (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id) OR
    course_id IN (
      SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "assignments_insert_professor" ON public.assignments
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

CREATE POLICY "assignments_update_professor" ON public.assignments
  FOR UPDATE USING (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

CREATE POLICY "assignments_delete_professor" ON public.assignments
  FOR DELETE USING (
    auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
  );

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_select_own_or_professor" ON public.submissions;
DROP POLICY IF EXISTS "submissions_insert_student" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_student" ON public.submissions;
DROP POLICY IF EXISTS "submissions_delete_student" ON public.submissions;

CREATE POLICY "submissions_select_own_or_professor" ON public.submissions
  FOR SELECT USING (
    auth.uid() = student_id OR
    auth.uid() = (
      SELECT professor_id FROM public.courses
      WHERE id = (SELECT course_id FROM public.assignments WHERE id = assignment_id)
    )
  );

CREATE POLICY "submissions_insert_student" ON public.submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "submissions_update_student" ON public.submissions
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "submissions_delete_student" ON public.submissions
  FOR DELETE USING (auth.uid() = student_id);

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  score DECIMAL(5, 2),
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id)
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grades_select_own_or_professor" ON public.grades;
DROP POLICY IF EXISTS "grades_insert_professor" ON public.grades;
DROP POLICY IF EXISTS "grades_update_professor" ON public.grades;

CREATE POLICY "grades_select_own_or_professor" ON public.grades
  FOR SELECT USING (
    auth.uid() = (SELECT student_id FROM public.submissions WHERE id = submission_id) OR
    auth.uid() = (
      SELECT professor_id FROM public.courses
      WHERE id = (
        SELECT course_id FROM public.assignments
        WHERE id = (SELECT assignment_id FROM public.submissions WHERE id = submission_id)
      )
    )
  );

CREATE POLICY "grades_insert_professor" ON public.grades
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT professor_id FROM public.courses
      WHERE id = (
        SELECT course_id FROM public.assignments
        WHERE id = (SELECT assignment_id FROM public.submissions WHERE id = submission_id)
      )
    )
  );

CREATE POLICY "grades_update_professor" ON public.grades
  FOR UPDATE USING (
    auth.uid() = (
      SELECT professor_id FROM public.courses
      WHERE id = (
        SELECT course_id FROM public.assignments
        WHERE id = (SELECT assignment_id FROM public.submissions WHERE id = submission_id)
      )
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_professor_id ON public.courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_submission_id ON public.grades(submission_id);

-- ============================================================
-- SEED TEST USERS
-- ============================================================
-- These are pre-created auth users with hashed passwords
-- Both use password: "VeryStrongPassword"

-- Create admin user: admin@school.local / Administrator username
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, is_sso_user
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@school.local',
  crypt('VeryStrongPassword', gen_salt('bf')),
  NOW(),
  jsonb_build_object('username', 'Administrator', 'full_name', 'Admin User', 'role', 'admin'),
  'authenticated', 'authenticated', NOW(), NOW(),
  '', '', false
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile for admin
INSERT INTO public.profiles (id, email, username, full_name, role)
VALUES ('10000000-0000-0000-0000-000000000001', 'admin@school.local', 'Administrator', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Create student user: student@example.com / JohnStudent username
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, is_sso_user
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'student@example.com',
  crypt('VeryStrongPassword', gen_salt('bf')),
  NOW(),
  jsonb_build_object('username', 'JohnStudent', 'full_name', 'John Student', 'role', 'student'),
  'authenticated', 'authenticated', NOW(), NOW(),
  '', '', false
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile for student
INSERT INTO public.profiles (id, email, username, full_name, role)
VALUES ('10000000-0000-0000-0000-000000000002', 'student@example.com', 'JohnStudent', 'John Student', 'student')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
-- You can now login with:
-- Email: admin@school.local | Password: VeryStrongPassword
-- Username: Administrator | Password: VeryStrongPassword
--
-- Or as student:
-- Email: student@example.com | Password: VeryStrongPassword
-- Username: JohnStudent | Password: VeryStrongPassword
-- ============================================================
