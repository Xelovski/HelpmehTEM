import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check user is a student
    if (user.user_metadata?.role !== 'student') {
      return NextResponse.json({ error: 'Only students can enroll in courses' }, { status: 403 })
    }

    const { enrollmentCode } = await request.json()

    if (!enrollmentCode) {
      return NextResponse.json({ error: 'Enrollment code required' }, { status: 400 })
    }

    // Find course by enrollment code
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, code')
      .eq('enrollment_code', enrollmentCode.toUpperCase())
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Invalid enrollment code' }, { status: 404 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', course.id)
      .eq('student_id', user.id)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
    }

    // Create enrollment
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        course_id: course.id,
        student_id: user.id,
      })

    if (enrollError) {
      console.error('Enrollment error:', enrollError)
      return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        code: course.code,
      },
    })
  } catch (error) {
    console.error('Error in enroll API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
