# Troubleshooting Guide

## Login Issues

### "Cannot log in" or Login page not loading

#### Problem: Middleware crashes on every request
**Symptoms:**
- App won't load at all
- Error mentioning "Supabase URL and Key are required"

**Solution:**
The middleware was trying to initialize Supabase with `undefined` environment variables. This has been fixed with proper error handling in `lib/supabase/proxy.ts`. If you still see this error:

1. Clear your browser cache
2. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. If that doesn't work, check that your Supabase environment variables are set in Vercel project settings

#### Problem: "User not found" after entering username
**Symptoms:**
- You enter a username and get "User not found" error

**Solution:**
This means:
1. No test user exists yet. Create one:
   ```bash
   node scripts/seed-test-user.mjs
   ```

2. Or create a user manually:
   - Go to your Supabase dashboard
   - Authentication → Users
   - Click "Add user"
   - Create a user with email `student@test.com` and any password

3. Try logging in with the email instead of username

#### Problem: "Invalid login credentials"
**Symptoms:**
- Error appears after you enter email and password

**Solution:**
1. Check that the email and password are correct
2. The test user has:
   - Email: `student@test.com`
   - Password: `TestPassword123!`
3. Emails are case-sensitive in Supabase

#### Problem: Blank page after clicking Login
**Symptoms:**
- Login page loads, form works, but after submitting you see a blank page

**Solution:**
1. This likely means `/api/auth/lookup` is failing silently
2. Check your browser console for errors (F12 → Console tab)
3. Try logging in directly with an email instead of username
4. Verify SUPABASE_SERVICE_ROLE_KEY is set in your environment variables

### Problem: Can't access dashboard after logging in
**Symptoms:**
- Login succeeds but you can't see the dashboard

**Solution:**
1. Redirect back to `/dashboard` might be broken
2. Try manually navigating to `http://localhost:3000/dashboard`
3. If that still doesn't work, check browser console for errors

## Database Issues

### "Database schema not found" errors

**Problem:**
The database tables haven't been created yet.

**Solution:**
Execute the schema migration:
```bash
# Option 1: Using the SQL file directly (if your Supabase is configured)
node scripts/001_create_schema.sql

# Option 2: Using the migrate script
node scripts/migrate.js
```

If both fail, you can manually run the SQL in your Supabase dashboard:
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Paste the contents of `scripts/001_create_schema.sql`
4. Run the query

### "Row Level Security" errors when accessing dashboard

**Problem:**
You can log in but get permission errors when accessing dashboard

**Solution:**
1. The database tables were created without proper RLS policies
2. Re-run the schema migration to add RLS policies:
   ```bash
   node scripts/migrate.js
   ```

3. Or manually verify RLS is enabled:
   - Supabase Dashboard → SQL Editor
   - Run: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
   - For each table, run: `SELECT are_rls_enabled(tablename) FROM table_name;`

## Environment Variables

### Missing Environment Variables

**Check if your env vars are set:**

1. In Vercel:
   - Go to Settings → Environment Variables
   - Look for:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (for API routes)

2. Locally (if running `npm run dev`):
   - Create `.env.local` file in project root
   - Add the three variables above
   - Restart dev server

### Getting Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon (public) Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Frontend Issues

### CSS not loading / Page looks broken

**Problem:**
Page loads but has no styling

**Solution:**
1. Check your browser's developer tools (F12)
2. Look at the Network tab for failed CSS loads
3. Likely causes:
   - Tailwind CSS not compiled
   - Try restarting the dev server: `npm run dev`
   - Check that `globals.css` exists and imports Tailwind

### Components not rendering

**Problem:**
You see blank areas or missing components

**Solution:**
1. Check browser console for errors (F12 → Console)
2. Check that all imports in the component are correct
3. Verify the shadcn/ui components are installed:
   ```bash
   npx shadcn-ui@latest list
   ```

## API Route Issues

### "/api/auth/lookup" returns 500 error

**Problem:**
Login fails with "Lookup failed" or "Internal server error"

**Solution:**
1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set
2. Verify it's the correct key (goes in environment variables, not as a comment)
3. The API route tries to list all users - this requires the service role key

### Other API routes returning 404

**Problem:**
Pages that call API routes show errors

**Solution:**
1. Check that the route handler file exists
2. Verify it exports the correct HTTP method (GET, POST, etc.)
3. Check the file path matches what's being called

## Still Having Issues?

1. **Check the debug logs:**
   - Open browser DevTools (F12)
   - Check the Network tab to see API responses
   - Check the Console tab for JavaScript errors

2. **Check Vercel logs:**
   - Go to your Vercel dashboard
   - Click on your project
   - Go to the "Logs" section
   - Look for errors in both "Build" and "Runtime" logs

3. **Create a test user manually:**
   - Go to Supabase Dashboard
   - Authentication → Users
   - Click "Add user"
   - Set email to `student@test.com`
   - Set password to something memorable
   - Try logging in with that

4. **Check database connectivity:**
   - Supabase Dashboard → SQL Editor
   - Run: `SELECT NOW();`
   - If this works, your database is connected

5. **Reset Supabase Integration:**
   - Go to Settings (top right) → Integrations
   - Disconnect and reconnect Supabase
   - This will refresh all environment variables
