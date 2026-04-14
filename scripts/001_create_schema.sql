-- Online School Management System Database Schema

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for displaying names)
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Insert handled by trigger
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view courses
CREATE POLICY "courses_select_all" ON public.courses FOR SELECT USING (true);
-- Only professors can create courses
CREATE POLICY "courses_insert_professor" ON public.courses FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor')
  );
-- Only the course professor can update
CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE 
  USING (professor_id = auth.uid());
-- Only the course professor can delete
CREATE POLICY "courses_delete_own" ON public.courses FOR DELETE 
  USING (professor_id = auth.uid());

-- 3. Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Students can see their own enrollments, professors can see enrollments in their courses
CREATE POLICY "enrollments_select" ON public.enrollments FOR SELECT 
  USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );
-- Students can enroll themselves
CREATE POLICY "enrollments_insert_student" ON public.enrollments FOR INSERT 
  WITH CHECK (student_id = auth.uid());
-- Students can unenroll themselves
CREATE POLICY "enrollments_delete_own" ON public.enrollments FOR DELETE 
  USING (student_id = auth.uid());

-- 4. Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Everyone can view lessons (enrolled students or course professors)
CREATE POLICY "lessons_select" ON public.lessons FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = lessons.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = lessons.course_id AND professor_id = auth.uid())
  );
-- Only course professor can create lessons
CREATE POLICY "lessons_insert_professor" ON public.lessons FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );
-- Only course professor can update lessons
CREATE POLICY "lessons_update_professor" ON public.lessons FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );
-- Only course professor can delete lessons
CREATE POLICY "lessons_delete_professor" ON public.lessons FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );

-- 5. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_points INTEGER DEFAULT 100,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Enrolled students and course professor can view assignments
CREATE POLICY "assignments_select" ON public.assignments FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = assignments.course_id AND professor_id = auth.uid())
  );
-- Only course professor can create assignments
CREATE POLICY "assignments_insert_professor" ON public.assignments FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );
-- Only course professor can update assignments
CREATE POLICY "assignments_update_professor" ON public.assignments FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );
-- Only course professor can delete assignments
CREATE POLICY "assignments_delete_professor" ON public.assignments FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND professor_id = auth.uid())
  );

-- 6. Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Students can see their own submissions, professors can see all submissions for their courses
CREATE POLICY "submissions_select" ON public.submissions FOR SELECT 
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON a.course_id = c.id
      WHERE a.id = submissions.assignment_id AND c.professor_id = auth.uid()
    )
  );
-- Students can create their own submissions
CREATE POLICY "submissions_insert_student" ON public.submissions FOR INSERT 
  WITH CHECK (student_id = auth.uid());
-- Students can update their own submissions (before deadline handled in app)
CREATE POLICY "submissions_update_student" ON public.submissions FOR UPDATE 
  USING (student_id = auth.uid());

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

-- Students can see their own grades, professors can see grades they gave
CREATE POLICY "grades_select" ON public.grades FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.submissions WHERE id = grades.submission_id AND student_id = auth.uid()) OR
    graded_by = auth.uid()
  );
-- Only professors can create grades
CREATE POLICY "grades_insert_professor" ON public.grades FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.assignments a ON s.assignment_id = a.id
      JOIN public.courses c ON a.course_id = c.id
      WHERE s.id = submission_id AND c.professor_id = auth.uid()
    )
  );
-- Only the grading professor can update grades
CREATE POLICY "grades_update_professor" ON public.grades FOR UPDATE 
  USING (graded_by = auth.uid());

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

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
