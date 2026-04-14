-- This script inserts sample data for testing the Online School Management System

-- Insert sample profiles (students and teachers)
INSERT INTO public.profiles (id, first_name, last_name, full_name, role, avatar_url)
SELECT 
  id,
  CASE 
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 1 THEN 'John'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 2 THEN 'Jane'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 3 THEN 'Robert'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 4 THEN 'Sarah'
    ELSE 'Student'
  END,
  CASE 
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 1 THEN 'Smith'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 2 THEN 'Doe'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 3 THEN 'Johnson'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 4 THEN 'Williams'
    ELSE 'Test'
  END,
  CASE 
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 1 THEN 'John Smith'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 2 THEN 'Jane Doe'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 3 THEN 'Robert Johnson'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 4 THEN 'Sarah Williams'
    ELSE 'Student Test'
  END,
  CASE 
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 1 THEN 'professor'
    WHEN (ROW_NUMBER() OVER (ORDER BY id)) = 2 THEN 'professor'
    ELSE 'student'
  END,
  'https://api.dicebear.com/9.x/avataaars/svg?seed=' || id
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
LIMIT 4
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses (only if we have professors)
INSERT INTO public.courses (id, title, code, description, professor_id, created_at)
SELECT
  gen_random_uuid(),
  'Introduction to Web Development',
  'WEB-101',
  'Learn the fundamentals of web development with HTML, CSS, and JavaScript.',
  (SELECT id FROM public.profiles WHERE role = 'professor' ORDER BY created_at LIMIT 1),
  NOW()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'professor')
AND NOT EXISTS (SELECT 1 FROM public.courses WHERE code = 'WEB-101')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (id, title, code, description, professor_id, created_at)
SELECT
  gen_random_uuid(),
  'Advanced Python Programming',
  'PY-201',
  'Master advanced Python concepts including OOP, decorators, and async programming.',
  (SELECT id FROM public.profiles WHERE role = 'professor' ORDER BY created_at LIMIT 1 OFFSET 1),
  NOW()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'professor')
AND NOT EXISTS (SELECT 1 FROM public.courses WHERE code = 'PY-201')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.courses (id, title, code, description, professor_id, created_at)
SELECT
  gen_random_uuid(),
  'Database Design and SQL',
  'DB-150',
  'Learn how to design and manage relational databases using SQL.',
  (SELECT id FROM public.profiles WHERE role = 'professor' ORDER BY created_at LIMIT 1),
  NOW()
WHERE EXISTS (SELECT 1 FROM public.profiles WHERE role = 'professor')
AND NOT EXISTS (SELECT 1 FROM public.courses WHERE code = 'DB-150')
ON CONFLICT (code) DO NOTHING;

-- Insert enrollments (students enrolling in courses)
INSERT INTO public.enrollments (id, student_id, course_id, enrollment_date)
SELECT
  gen_random_uuid(),
  sp.id,
  c.id,
  NOW()
FROM public.profiles sp
CROSS JOIN public.courses c
WHERE sp.role = 'student'
AND c.code IN ('WEB-101', 'PY-201', 'DB-150')
AND NOT EXISTS (
  SELECT 1 FROM public.enrollments e
  WHERE e.student_id = sp.id AND e.course_id = c.id
)
LIMIT 6
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO public.lessons (id, course_id, title, description, content, order_num, created_at)
SELECT
  gen_random_uuid(),
  c.id,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY c.id) = 1 THEN 'Getting Started with HTML'
       WHEN ROW_NUMBER() OVER (ORDER BY c.id) = 2 THEN 'Styling with CSS'
       ELSE 'Interactive JavaScript' END,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY c.id) = 1 THEN 'Learn the basics of HTML structure'
       WHEN ROW_NUMBER() OVER (ORDER BY c.id) = 2 THEN 'Master CSS for beautiful designs'
       ELSE 'Make websites interactive with JavaScript' END,
  '<p>This is the lesson content...</p>',
  ROW_NUMBER() OVER (ORDER BY c.id),
  NOW()
FROM public.courses c
WHERE c.code = 'WEB-101'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Insert sample assignments
INSERT INTO public.assignments (id, course_id, title, description, due_date, max_points, created_at)
SELECT
  gen_random_uuid(),
  c.id,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY c.id) = 1 THEN 'Build Your First Webpage'
       ELSE 'Create a CSS Portfolio' END,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY c.id) = 1 THEN 'Create a simple webpage with HTML'
       ELSE 'Build a styled portfolio page' END,
  NOW() + INTERVAL '7 days',
  100,
  NOW()
FROM public.courses c
WHERE c.code = 'WEB-101'
LIMIT 2
ON CONFLICT DO NOTHING;
