import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // First verify the requester is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all courses with professor info and enrollment counts
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        code,
        title,
        description,
        professor_id,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (coursesError) {
      // If table doesn't exist, return empty array
      if (coursesError.code === '42P01') {
        return NextResponse.json({ courses: [] })
      }
      console.error('Error fetching courses:', coursesError)
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }

    // Get enrollment counts for each course
    const coursesWithStats = await Promise.all(
      (courses || []).map(async (course) => {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)

        return {
          ...course,
          enrollment_count: count || 0,
        }
      })
    )

    return NextResponse.json({ courses: coursesWithStats })
  } catch (error) {
    console.error('Error in admin courses API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    // First verify the requester is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      console.error('Error deleting course:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin delete course API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
