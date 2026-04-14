# Supabase Setup Guide

This guide walks you through setting up Supabase for the Online School Management System.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start Your Project" or sign in if you already have an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `online-school` (or your preferred name)
   - **Database Password**: Create a strong password (save this somewhere safe!)
   - **Region**: Choose the region closest to you
5. Click "Create new project"
6. Wait for the project to be created (this may take a minute)

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** (gear icon in the bottom left)
2. Click **API** in the left sidebar
3. You'll see your API keys. Copy the following:
   - **Project URL**: Copy this value
   - **Anon Key** (public key): Copy this value
   - **Service Role Key** (secret key): Copy this value (keep this safe!)

## Step 3: Configure Environment Variables

### For Local Development

1. In the project root directory, create a `.env.local` file
2. Add the following variables (paste your values from Step 2):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser (safe for the anonymous key). The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side.

### For Vercel Deployment

1. Go to your Vercel project
2. Click **Settings** (top menu)
3. Click **Environment Variables** in the left sidebar
4. Add the same three variables above
5. Make sure all are set for all environments (Development, Preview, Production)

## Step 4: Initialize the Database Schema

Once environment variables are configured, the database schema will be created automatically when you first run the app.

If you want to manually initialize the schema:

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `scripts/001_create_schema.sql` from this repository
5. Copy the entire SQL code
6. Paste it into the Supabase SQL Editor
7. Click **Run**

You should see success messages for all tables and policies created.

## Step 5: (Optional) Add Sample Data

To add sample data for testing:

1. In Supabase SQL Editor, click **New Query**
2. Open the file `scripts/002_seed_data.sql`
3. Copy and paste the SQL
4. Click **Run**

This will create:
- 2 professor accounts
- 2 student accounts
- 3 sample courses
- Some enrollments and assignments

## Step 6: Create Test Accounts

You can now create user accounts directly through the app's Sign Up page, or use Supabase to create test accounts:

1. Go to your Supabase project dashboard
2. Click **Authentication** in the left sidebar
3. Click **Users**
4. Click **Add User** (top right)
5. Enter an email and password
6. Click **Create User**

Users created this way will have a `role` of 'student' by default. To change a user's role:

1. Click the user in the users list
2. Click **User Metadata** tab
3. Add or edit the metadata JSON:

```json
{
  "role": "professor"
}
```

Available roles:
- `student` - Can enroll in courses and submit assignments
- `professor` - Can create courses and grade submissions
- `admin` - Can manage the system (set manually)

## Step 7: Start the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Troubleshooting

### "Connection refused" when connecting to Supabase

- Make sure your Supabase project is running (check your Supabase dashboard)
- Check that your `NEXT_PUBLIC_SUPABASE_URL` is correct (should be in format: `https://xxxx.supabase.co`)

### "Invalid credentials" or "Missing environment variables"

- Make sure you've added all three environment variables
- After adding `.env.local`, restart your development server
- Make sure there are no extra spaces in the variable values

### RLS Policy Errors

- These errors mean a user is trying to access data they don't have permission for
- This is normal behavior - RLS is protecting your data
- Make sure the user is enrolled in the course they're trying to access

### "Table does not exist"

- Run the schema initialization from Step 4 again
- Check the Supabase SQL Editor for error messages

## Database Schema Overview

### Profiles Table
Extends Supabase's built-in `auth.users` table with additional user information:
- `id` - User ID (references auth.users)
- `email` - User's email
- `first_name` / `last_name` - User's name
- `full_name` - Full name
- `avatar_url` - Avatar image URL
- `role` - User role (student, professor, admin)

### Courses Table
- `id` - Course ID
- `title` - Course title
- `code` - Unique course code (like "CS-101")
- `description` - Course description
- `professor_id` - ID of the professor teaching the course
- `created_at` / `updated_at` - Timestamps

### Enrollments Table
- `id` - Enrollment ID
- `student_id` - Student's ID
- `course_id` - Course's ID
- `enrollment_date` - When student enrolled
- Unique constraint on (student_id, course_id)

### Lessons Table
- `id` - Lesson ID
- `course_id` - Course this lesson belongs to
- `title` - Lesson title
- `description` - Lesson description
- `content` - Lesson content (HTML)
- `order_num` - Display order in course

### Assignments Table
- `id` - Assignment ID
- `course_id` - Course this assignment belongs to
- `title` - Assignment title
- `description` - Assignment description
- `due_date` - When the assignment is due
- `max_points` / `max_score` - Maximum points possible

### Submissions Table
- `id` - Submission ID
- `assignment_id` - Which assignment this is for
- `student_id` - Student who submitted
- `content` - Text submission content
- `file_url` / `file_name` - Uploaded file details
- `submitted_at` - When submitted
- Unique constraint on (assignment_id, student_id)

### Grades Table
- `id` - Grade ID
- `submission_id` - Submission being graded
- `score` - Grade/score given
- `feedback` - Comments from grader
- `graded_by` - Professor who graded it
- `graded_at` - When grading was done

## Advanced Configuration

### Enable Email Notifications (Optional)

1. In Supabase, go to **Authentication** → **Email Templates**
2. Customize the email templates as needed
3. In **Settings** → **Auth** → **Email Config**, set up your email provider

### Configure Realtime (Optional)

To enable real-time updates:

1. Go to **Replication** in your Supabase dashboard
2. Select the tables you want to enable realtime for
3. Update your code to use the realtime subscription

Example:
```typescript
const channel = supabase
  .channel('courses')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'courses' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

## Next Steps

- Read the [main README.md](./README.md) for application usage
- Check the [Next.js documentation](https://nextjs.org/docs)
- Explore the [Supabase documentation](https://supabase.com/docs)

## Support

If you encounter issues:

1. Check the [Supabase Status Page](https://status.supabase.com/)
2. Review the [Supabase Discord Community](https://discord.supabase.com)
3. Check the application logs in your development console
