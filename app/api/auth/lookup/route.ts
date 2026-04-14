import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint looks up a user's email by their username using the database
// Uses anon key for public username lookups (profiles table has public read RLS policy)
export async function POST(request: Request) {
  try {
    const { identifier } = await request.json()

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier required' }, { status: 400 })
    }

    // If it looks like an email, return it directly
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Use anon key client - profiles table has public read access via RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Search for user by username in the profiles table (case-insensitive)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email')
      .ilike('username', identifier)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[v0] Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ email: profile.email })
  } catch (error) {
    console.error('[v0] Error in lookup API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
