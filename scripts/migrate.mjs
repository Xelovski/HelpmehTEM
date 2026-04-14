import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schema = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'professor', 'admin')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_number INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_score INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  file_name TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_late BOOLEAN DEFAULT FALSE,
  UNIQUE(assignment_id, student_id)
);

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  score INT,
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_view_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_view_all_profiles" ON public.profiles FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Courses RLS policies
CREATE POLICY "courses_professors_view_own" ON public.courses FOR SELECT USING (professor_id = auth.uid());
CREATE POLICY "courses_students_view_enrolled" ON public.courses FOR SELECT USING (id IN (SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()));
CREATE POLICY "professor_create_courses" ON public.courses FOR INSERT WITH CHECK (professor_id = auth.uid());
CREATE POLICY "professor_update_own_courses" ON public.courses FOR UPDATE USING (professor_id = auth.uid());

-- Enrollments RLS policies
CREATE POLICY "enrollments_students_view_own" ON public.enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "enrollments_professor_view_course" ON public.enrollments FOR SELECT USING (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));
CREATE POLICY "professor_manage_enrollments" ON public.enrollments FOR INSERT WITH CHECK (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));
CREATE POLICY "professor_delete_enrollments" ON public.enrollments FOR DELETE USING (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));

-- Lessons RLS policies
CREATE POLICY "lessons_public_view" ON public.lessons FOR SELECT USING (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid() OR id IN (SELECT course_id FROM public.enrollments WHERE student_id = auth.uid())));
CREATE POLICY "professor_manage_lessons" ON public.lessons FOR INSERT WITH CHECK (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));
CREATE POLICY "professor_update_lessons" ON public.lessons FOR UPDATE USING (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));

-- Assignments RLS policies
CREATE POLICY "assignments_professor_create" ON public.assignments FOR INSERT WITH CHECK (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));
CREATE POLICY "assignments_view" ON public.assignments FOR SELECT USING (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid() OR id IN (SELECT course_id FROM public.enrollments WHERE student_id = auth.uid())));
CREATE POLICY "assignments_professor_update" ON public.assignments FOR UPDATE USING (course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()));

-- Submissions RLS policies
CREATE POLICY "submissions_student_view_own" ON public.submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "submissions_professor_view_course" ON public.submissions FOR SELECT USING (assignment_id IN (SELECT id FROM public.assignments WHERE course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid())));
CREATE POLICY "submissions_student_insert" ON public.submissions FOR INSERT WITH CHECK (student_id = auth.uid());

-- Grades RLS policies
CREATE POLICY "grades_student_view_own" ON public.grades FOR SELECT USING (submission_id IN (SELECT id FROM public.submissions WHERE student_id = auth.uid()));
CREATE POLICY "grades_professor_view" ON public.grades FOR SELECT USING (submission_id IN (SELECT id FROM public.submissions WHERE assignment_id IN (SELECT id FROM public.assignments WHERE course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()))));
CREATE POLICY "grades_professor_insert_update" ON public.grades FOR INSERT WITH CHECK (submission_id IN (SELECT id FROM public.submissions WHERE assignment_id IN (SELECT id FROM public.assignments WHERE course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()))));
CREATE POLICY "grades_professor_update_own" ON public.grades FOR UPDATE USING (submission_id IN (SELECT id FROM public.submissions WHERE assignment_id IN (SELECT id FROM public.assignments WHERE course_id IN (SELECT id FROM public.courses WHERE professor_id = auth.uid()))));
`;

async function runMigration() {
  try {
    console.log('[v0] Starting database migration...');
    
    // Split schema into individual statements and execute them
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`[v0] Executing: ${statement.substring(0, 80)}...`);
        const { error } = await supabase.rpc('exec', { sql: statement });
        if (error) {
          console.error(`[v0] Error executing statement:`, error);
        } else {
          console.log(`[v0] Statement executed successfully`);
        }
      }
    }
    
    console.log('[v0] Migration completed');
  } catch (error) {
    console.error('[v0] Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
