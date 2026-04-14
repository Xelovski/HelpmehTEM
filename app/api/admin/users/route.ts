import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // First verify the requester is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user,"--------------------------------------------------------------")
    // if (!user || user.user_metadata?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Use service role client to list all users
    const supabaseAdmin = createClient(
      "https://ybikkprfmcrbgvicohtd.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaWtrcHJmbWNyYmd2aWNvaHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzg1NDUsImV4cCI6MjA4OTkxNDU0NX0.y2ckD4oPFuZVMlXzHoV5CJAulIJgXAirku_DosO-MsE"
    )

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    // if (error) {
    //   console.error('Error fetching users:', error)
    //   return NextResponse.json({ error: error.message }, { status: 500 })
    // }

    // Map users to a cleaner format
    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || 'N/A',
      role: u.user_metadata?.role || 'student',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 507 })
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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Use service role client to delete user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin delete user API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
