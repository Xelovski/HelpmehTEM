-- Complete Online School Management System Schema
-- This script consolidates and fixes all tables

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Courses table with enrollment_code
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT,
  description TEXT,
  enrollment_code TEXT UNIQUE,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add enrollment_code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'enrollment_code') THEN
    ALTER TABLE public.courses ADD COLUMN enrollment_code TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'code') THEN
    ALTER TABLE public.courses ADD COLUMN code TEXT;
  END IF;
END $$;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_professor" ON public.courses;
DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_own" ON public.courses;

CREATE POLICY "courses_select_all" ON public.courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_professor" ON public.courses FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professor', 'admin'))
  );
CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE USING (professor_id = auth.uid());
CREATE POLICY "courses_delete_own" ON public.courses FOR DELETE USING (professor_id = auth.uid());

-- 3. Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_student" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_own" ON public.enrollments;

CREATE POLICY "enrollments_select" ON public.enrollments FOR SELECT 
  USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "enrollments_insert_student" ON public.enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "enrollments_delete_own" ON public.enrollments FOR DELETE USING (student_id = auth.uid());

-- 4. Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'description') THEN
    ALTER TABLE public.lessons ADD COLUMN description TEXT;
  END IF;
END $$;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select" ON public.lessons;
DROP POLICY IF EXISTS "lessons_insert_professor" ON public.lessons;
DROP POLICY IF EXISTS "lessons_update_professor" ON public.lessons;
DROP POLICY IF EXISTS "lessons_delete_professor" ON public.lessons;

CREATE POLICY "lessons_select" ON public.lessons FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = lessons.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = lessons.course_id AND professor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "lessons_insert_professor" ON public.lessons FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()));
CREATE POLICY "lessons_update_professor" ON public.lessons FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()));
CREATE POLICY "lessons_delete_professor" ON public.lessons FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()));

-- 5. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_select" ON public.assignments;
DROP POLICY IF EXISTS "assignments_insert_professor" ON public.assignments;
DROP POLICY IF EXISTS "assignments_update_professor" ON public.assignments;
DROP POLICY IF EXISTS "assignments_delete_professor" ON public.assignments;

CREATE POLICY "assignments_select" ON public.assignments FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = assignments.course_id AND professor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "assignments_insert_professor" ON public.assignments FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()));
CREATE POLICY "assignments_update_professor" ON public.assignments FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()));
CREATE POLICY "assignments_delete_professor" ON public.assignments FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid()));

-- 6. Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  file_path TEXT,
  file_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Add file_path column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'file_path') THEN
    ALTER TABLE public.submissions ADD COLUMN file_path TEXT;
  END IF;
END $$;

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "submissions_select" ON public.submissions;
DROP POLICY IF EXISTS "submissions_insert_student" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_student" ON public.submissions;

CREATE POLICY "submissions_select" ON public.submissions FOR SELECT 
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON a.course_id = c.id
      WHERE a.id = submissions.assignment_id AND c.professor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "submissions_insert_student" ON public.submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "submissions_update_student" ON public.submissions FOR UPDATE USING (student_id = auth.uid());

-- 7. Grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE UNIQUE,
  score INTEGER NOT NULL,
  feedback TEXT,
  graded_by UUID NOT NULL REFERENCES public.profiles(id),
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grades_select" ON public.grades;
DROP POLICY IF EXISTS "grades_insert_professor" ON public.grades;
DROP POLICY IF EXISTS "grades_update_professor" ON public.grades;

CREATE POLICY "grades_select" ON public.grades FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.submissions WHERE id = grades.submission_id AND student_id = auth.uid()) OR
    graded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "grades_insert_professor" ON public.grades FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.assignments a ON s.assignment_id = a.id
      JOIN public.courses c ON a.course_id = c.id
      WHERE s.id = submission_id AND c.professor_id = auth.uid()
    )
  );
CREATE POLICY "grades_update_professor" ON public.grades FOR UPDATE USING (graded_by = auth.uid());

-- Trigger to auto-create profile on user signup
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
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers (with IF NOT EXISTS logic)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
    CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lessons_updated_at') THEN
    CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assignments_updated_at') THEN
    CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_submissions_updated_at') THEN
    CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Function to generate random enrollment code
CREATE OR REPLACE FUNCTION public.generate_enrollment_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate enrollment code for new courses
CREATE OR REPLACE FUNCTION public.set_enrollment_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.enrollment_code IS NULL THEN
    NEW.enrollment_code := public.generate_enrollment_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_course_enrollment_code ON public.courses;

CREATE TRIGGER set_course_enrollment_code
  BEFORE INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_enrollment_code();

-- Update existing courses without enrollment codes
UPDATE public.courses 
SET enrollment_code = public.generate_enrollment_code() 
WHERE enrollment_code IS NULL;
