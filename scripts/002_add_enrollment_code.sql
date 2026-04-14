-- Add enrollment_code column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS enrollment_code TEXT UNIQUE;

-- Create function to generate enrollment code
CREATE OR REPLACE FUNCTION generate_enrollment_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.enrollment_code IS NULL THEN
    NEW.enrollment_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate enrollment code
DROP TRIGGER IF EXISTS set_enrollment_code ON public.courses;
CREATE TRIGGER set_enrollment_code
  BEFORE INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION generate_enrollment_code();

-- Update existing courses with enrollment codes
UPDATE public.courses
SET enrollment_code = UPPER(SUBSTRING(MD5(id::text || created_at::text) FROM 1 FOR 8))
WHERE enrollment_code IS NULL;

-- Allow students to enroll themselves with a valid enrollment code
DROP POLICY IF EXISTS "enrollments_insert_student" ON public.enrollments;
CREATE POLICY "enrollments_insert_student" ON public.enrollments FOR INSERT WITH CHECK (
  auth.uid() = student_id
);
