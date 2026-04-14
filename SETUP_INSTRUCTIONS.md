# Login System Setup Instructions

## Current Status
✅ **Supabase Integration**: Connected  
✅ **Blob Storage**: Installed  
✅ **Login System**: Ready for configuration  

## Setup Steps

### Step 1: Set Environment Variables
You've requested to add these environment variables. Please set them to:

```
NEXT_PUBLIC_SUPABASE_URL=https://ybikkprfmcrbgvicohtd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaWtrcHJmbWNyYmd2aWNvaHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzg1NDUsImV4cCI6MjA4OTkxNDU0NX0.y2ckD4oPFuZVMlXzHoV5CJAulIJgXAirku_DosO-MsE
```

### Step 2: Run Database Setup on Your New Supabase Project

1. Go to: https://ybikkprfmcrbgvicohtd.supabase.co
2. Click on **"SQL"** in the left sidebar
3. Click **"New Query"**
4. Copy the entire contents from: `/scripts/SETUP_NEW_SUPABASE_PROJECT.sql`
5. Paste it into the SQL editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for completion (you'll see green checkmarks)

### Step 3: Test Login

Once setup is complete, you can login with:

**Admin Account:**
- Username or Email: `Administrator` / `admin@school.local`
- Password: `VeryStrongPassword`

**Student Account:**
- Username or Email: `JohnStudent` / `student@example.com`
- Password: `VeryStrongPassword`

### Step 4: Create New Accounts (Optional)

Users can self-register at `/auth/signup` with their own:
- Email address
- Username
- Password

After email confirmation, they can login using either email or username.

## How Login Works

1. **Email Login**: If you enter an email address, it directly authenticates with Supabase Auth
2. **Username Login**: If you enter a username (no @ symbol), the app:
   - Looks up your username in the `profiles` table
   - Finds your associated email
   - Authenticates using that email + password

## File Structure

```
app/
  auth/
    login/page.tsx              # Login page (supports email or username)
    signup/page.tsx             # Sign up page
    signup-success/page.tsx      # After signup confirmation
  api/
    auth/
      lookup/route.ts           # API that converts username → email
  dashboard/page.tsx            # Protected dashboard after login

lib/
  supabase/
    client.ts                   # Browser-side Supabase client
    server.ts                   # Server-side Supabase client

scripts/
  001_create_tables.sql         # Original migration (for first project)
  SETUP_NEW_SUPABASE_PROJECT.sql # Setup script for your new project
```

## Troubleshooting

**"Database error querying schema"**
- The environment variables may not be set yet
- Verify them in project Settings → Vars

**"User not found"**
- Check if you ran the SQL setup on the new Supabase project
- Verify the username matches exactly (case-sensitive during lookup, case-insensitive during auth)

**Login page doesn't load**
- Check browser console for errors (F12)
- Verify Supabase URL and keys are correct

## Features Included

✅ Email authentication  
✅ Username-based login  
✅ Secure password hashing (bcrypt)  
✅ Auto-profile creation on signup  
✅ Row Level Security (RLS) policies  
✅ Blob storage for file uploads  
✅ Student/Professor/Admin roles  
✅ Course management (ready for implementation)  

---

For more help, check the [Supabase documentation](https://supabase.com/docs)
