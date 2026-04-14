import { createClient } from '@supabase/supabase-js'
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

    // Use service role client to get stats
    const supabaseAdmin = createClient(
      "https://ybikkprfmcrbgvicohtd.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaWtrcHJmbWNyYmd2aWNvaHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzg1NDUsImV4cCI6MjA4OTkxNDU0NX0.y2ckD4oPFuZVMlXzHoV5CJAulIJgXAirku_DosO-MsE"
    )

    // Get all users
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    // if (usersError) {
    //   console.error('Error fetching users:', usersError)
    //   return NextResponse.json({ error: usersError.message }, { status: 500 })
    // }

    const users = usersData.users
    const totalUsers = users.length
    const totalStudents = users.filter((u) => u.user_metadata?.role === 'student').length
    const totalProfessors = users.filter((u) => u.user_metadata?.role === 'professor').length
    const totalAdmins = users.filter((u) => u.user_metadata?.role === 'admin').length

    // Get courses count (if table exists)
    let totalCourses = 0
    let totalEnrollments = 0
    let totalAssignments = 0

    try {
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
      totalCourses = coursesCount || 0

      const { count: enrollmentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
      totalEnrollments = enrollmentsCount || 0

      const { count: assignmentsCount } = await supabase
        .from('assignments')
        .select('*', { count: 'exact', head: true })
      totalAssignments = assignmentsCount || 0
    } catch (e) {
      // Tables may not exist yet
    }

    // Get recent users (last 5 signups)
    const recentUsers = users
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || 'N/A',
        role: u.user_metadata?.role || 'student',
        created_at: u.created_at,
      }))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalProfessors,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        totalAssignments,
      },
      recentUsers,
    })
  } catch (error) {
    console.error('Error in admin stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 507 })
  }
}
