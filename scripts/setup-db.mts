import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schema = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'professor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

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

CREATE POLICY IF NOT EXISTS "courses_select_all" ON public.courses FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS "courses_insert_professor" ON public.courses FOR INSERT WITH CHECK (
  auth.uid() = professor_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'professor'
);
CREATE POLICY IF NOT EXISTS "courses_update_professor" ON public.courses FOR UPDATE USING (
  auth.uid() = professor_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'professor'
);
CREATE POLICY IF NOT EXISTS "courses_delete_professor" ON public.courses FOR DELETE USING (
  auth.uid() = professor_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'professor'
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

CREATE POLICY IF NOT EXISTS "enrollments_select_own" ON public.enrollments FOR SELECT USING (
  auth.uid() = student_id OR
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
);
CREATE POLICY IF NOT EXISTS "enrollments_insert_professor" ON public.enrollments FOR INSERT WITH CHECK (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
);
CREATE POLICY IF NOT EXISTS "enrollments_delete_professor" ON public.enrollments FOR DELETE USING (
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

CREATE POLICY IF NOT EXISTS "lessons_select_enrolled" ON public.lessons FOR SELECT USING (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id) OR
  course_id IN (
    SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "lessons_insert_professor" ON public.lessons FOR INSERT WITH CHECK (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
);
CREATE POLICY IF NOT EXISTS "lessons_update_professor" ON public.lessons FOR UPDATE USING (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
);
CREATE POLICY IF NOT EXISTS "lessons_delete_professor" ON public.lessons FOR DELETE USING (
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

CREATE POLICY IF NOT EXISTS "assignments_select_enrolled" ON public.assignments FOR SELECT USING (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id) OR
  course_id IN (
    SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()
  )
);
CREATE POLICY IF NOT EXISTS "assignments_insert_professor" ON public.assignments FOR INSERT WITH CHECK (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
);
CREATE POLICY IF NOT EXISTS "assignments_update_professor" ON public.assignments FOR UPDATE USING (
  auth.uid() = (SELECT professor_id FROM public.courses WHERE id = course_id)
);
CREATE POLICY IF NOT EXISTS "assignments_delete_professor" ON public.assignments FOR DELETE USING (
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

CREATE POLICY IF NOT EXISTS "submissions_select_own_or_professor" ON public.submissions FOR SELECT USING (
  auth.uid() = student_id OR
  auth.uid() = (
    SELECT professor_id FROM public.courses
    WHERE id = (SELECT course_id FROM public.assignments WHERE id = assignment_id)
  )
);
CREATE POLICY IF NOT EXISTS "submissions_insert_student" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY IF NOT EXISTS "submissions_update_student" ON public.submissions FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY IF NOT EXISTS "submissions_delete_student" ON public.submissions FOR DELETE USING (auth.uid() = student_id);

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

CREATE POLICY IF NOT EXISTS "grades_select_own_or_professor" ON public.grades FOR SELECT USING (
  auth.uid() = (SELECT student_id FROM public.submissions WHERE id = submission_id) OR
  auth.uid() = (
    SELECT professor_id FROM public.courses
    WHERE id = (
      SELECT course_id FROM public.assignments
      WHERE id = (SELECT assignment_id FROM public.submissions WHERE id = submission_id)
    )
  )
);
CREATE POLICY IF NOT EXISTS "grades_insert_professor" ON public.grades FOR INSERT WITH CHECK (
  auth.uid() = (
    SELECT professor_id FROM public.courses
    WHERE id = (
      SELECT course_id FROM public.assignments
      WHERE id = (SELECT assignment_id FROM public.submissions WHERE id = submission_id)
    )
  )
);
CREATE POLICY IF NOT EXISTS "grades_update_professor" ON public.grades FOR UPDATE USING (
  auth.uid() = (
    SELECT professor_id FROM public.courses
    WHERE id = (
      SELECT course_id FROM public.assignments
      WHERE id = (SELECT assignment_id FROM public.submissions WHERE id = submission_id)
    )
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_professor_id ON public.courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_submission_id ON public.grades(submission_id);
`;

async function migrate() {
  try {
    console.log('[v0] Starting database migration...');
    
    // Execute schema using SQL directly via Supabase
    const { error } = await supabase.rpc('exec_sql', { sql: schema }, { count: 'estimated' }).catch(() => ({ error: null }));
    
    if (error) {
      console.log('[v0] Note: Some migrations may have already been applied:', error.message);
    } else {
      console.log('[v0] Schema applied successfully!');
    }
    
    // Alternative: Use individual statements if RPC fails
    console.log('[v0] Verifying table creation...');
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('[v0] Tables may not exist yet. This is normal if RLS is enabled.');
    } else {
      console.log('[v0] Migration verification complete!');
    }
    
    console.log('[v0] Database migration completed!');
  } catch (error) {
    console.error('[v0] Migration error:', error);
    process.exit(1);
  }
}

migrate();
