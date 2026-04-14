// Creates the single admin user: login = "admin", password = "VeryStrongPassword"
// The Supabase email field must be a valid email, so we use admin@school.local.
// Run once: node scripts/seed-admin.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use the service-role client so we can call auth.admin.*
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = 'admin@school.local'
const ADMIN_PASSWORD = 'VeryStrongPassword'

async function seedAdmin() {
  console.log('[v0] Checking for existing admin user...')

  // List all users and look for one with email = ADMIN_EMAIL
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('[v0] Failed to list users:', listError.message)
    process.exit(1)
  }

  const existing = listData.users.find((u) => u.email === ADMIN_EMAIL)
  if (existing) {
    console.log('[v0] Admin user already exists – updating password & metadata...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      user_metadata: { full_name: 'Administrator', role: 'admin' },
      email_confirm: true,
    })
    if (updateError) {
      console.error('[v0] Failed to update admin:', updateError.message)
      process.exit(1)
    }
    console.log('[v0] Admin user updated successfully.')
    return
  }

  console.log('[v0] Creating admin user...')
  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,          // Skip email verification
    user_metadata: {
      full_name: 'Administrator',
      role: 'admin',
    },
  })

  if (error) {
    console.error('[v0] Failed to create admin user:', error.message)
    process.exit(1)
  }

  console.log('[v0] Admin user created!')
  console.log('  Email (username):', ADMIN_EMAIL)
  console.log('  Password:        VeryStrongPassword')
  console.log('  User ID:         ', data.user.id)
}

seedAdmin()
