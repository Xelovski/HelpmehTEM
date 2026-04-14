import { createClient } from '@supabase/supabase-js'

// Test user credentials
const TEST_EMAIL = 'student@test.com'
const TEST_PASSWORD = 'TestPassword123!'
const TEST_FULL_NAME = 'Test Student'

async function seedDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
    console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'SET' : 'MISSING')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    console.log('Creating test user...')

    // Create a new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: TEST_FULL_NAME,
        role: 'student',
      },
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('Test user already exists')
        return
      }
      throw error
    }

    console.log('✅ Test user created successfully!')
    console.log(`Email: ${TEST_EMAIL}`)
    console.log(`Password: ${TEST_PASSWORD}`)
    console.log(`Full Name: ${TEST_FULL_NAME}`)
    console.log(`User ID: ${data.user.id}`)
  } catch (error) {
    console.error('Error creating test user:', error)
    process.exit(1)
  }
}

seedDatabase()
