# Deployment Guide

This guide explains how to deploy the Online School Management System to Vercel.

## Prerequisites

- A GitHub account with your code pushed
- A Vercel account
- A Supabase project set up (see [SETUP.md](./SETUP.md))

## Step 1: Push Code to GitHub

1. Initialize a git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: Online School Management System"
```

2. Create a repository on GitHub and push:
```bash
git remote add origin https://github.com/your-username/online-school.git
git branch -M main
git push -u origin main
```

## Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Click **"Import"**

## Step 3: Configure Environment Variables

Before deploying, add environment variables:

1. In the import dialog, scroll to **"Environment Variables"**
2. Add the following variables from your Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

3. Make sure all three are set for all environments (Development, Preview, Production)

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the deployment to complete (usually 2-5 minutes)
3. Once complete, you'll get a deployment URL

## Step 5: Configure Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow the instructions to update your domain's DNS settings

## Post-Deployment Checklist

- [ ] Visit your deployment URL and verify it loads
- [ ] Test login with a test account
- [ ] Verify database operations work (create course, enroll, etc.)
- [ ] Test file uploads if applicable
- [ ] Check that redirects work properly
- [ ] Verify error pages display correctly

## Monitoring and Logs

### View Deployment Logs

1. Go to your Vercel project
2. Click **"Deployments"**
3. Click the deployment you want to inspect
4. Click **"Logs"** to see the build output
5. Click **"Function Logs"** to see runtime errors

### Common Issues and Solutions

#### Build Fails with "Module not found"

Solution: Make sure all dependencies are listed in `package.json`
```bash
npm install missing-package
git commit -am "Add missing dependency"
git push origin main
```

#### "Environment variables not found" Error

Solution: Ensure environment variables are set in Vercel:
1. Go to **Settings** → **Environment Variables**
2. Verify all three Supabase variables are present
3. Trigger a redeploy

#### Database Connection Errors

Solution: Verify Supabase configuration:
1. Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Ensure Supabase project is running
4. Check that RLS policies aren't blocking operations

#### "Failed to build image" 

Solution: Check the build log for specific errors:
1. Go to **Deployments** → Your deployment → **Logs**
2. Look for the error message
3. Fix the error locally and push to GitHub
4. Vercel will automatically redeploy

## Automatic Deployments

After the initial setup, Vercel will automatically:
- Deploy when you push to `main` branch
- Deploy preview URLs for pull requests
- Roll back problematic deployments

## Manual Redeployment

To redeploy without pushing code:

1. Go to your Vercel project
2. Click **"Deployments"**
3. Click the three dots next to the deployment
4. Click **"Redeploy"**

## Performance Optimization

### Enable Caching

1. Go to **Settings** → **Advanced**
2. Configure cache settings as needed

### Database Connection Pooling

1. In Supabase dashboard, go to **Settings** → **Database**
2. Use the connection pooler URL for better performance
3. Update `NEXT_PUBLIC_SUPABASE_URL` if needed

### Image Optimization

The app uses Next.js Image Optimization automatically. Images are:
- Resized on-demand
- Converted to efficient WebP format
- Cached globally

## Database Backups

### Automatic Backups

Supabase provides:
- Daily backups (free tier)
- Backup retention for 7 days
- One-click restore

To restore a backup:
1. Go to your Supabase project
2. Click **Settings** → **Backups**
3. Find the backup you want to restore
4. Click **Restore**

### Manual Export

To manually export your database:

1. Go to your Supabase project
2. Click **SQL Editor**
3. Create a new query:
```sql
SELECT * FROM pg_dump;
```

## Scaling

### If You Run Into Rate Limits

1. Upgrade your Vercel plan to add more concurrent builds
2. Upgrade your Supabase plan for higher database limits
3. Consider implementing caching strategies

### Database Performance

If experiencing slow queries:

1. Go to Supabase dashboard
2. Check **Performance** settings
3. Add indexes to frequently queried columns
4. Consider query optimization in code

## Security

### Keep Secrets Secure

- **Never** commit `.env.local` to GitHub
- **Never** share `SUPABASE_SERVICE_ROLE_KEY` publicly
- Use Vercel's environment variable encryption
- Rotate keys periodically

### Enable HTTPS

Vercel provides free HTTPS automatically. To verify:
- Visit your deployment URL
- Check for the padlock icon in your browser

### Rate Limiting

Consider implementing rate limiting for API routes:

```typescript
// Simple rate limiting example
const rateLimit = new Map()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')
  const count = rateLimit.get(ip) || 0
  
  if (count > 100) {
    return new Response('Too many requests', { status: 429 })
  }
  
  rateLimit.set(ip, count + 1)
  // ... handle request
}
```

## Troubleshooting Deployment

### Application Loads But Shows Errors

1. Check browser console for errors
2. Check Vercel Function Logs
3. Verify Supabase connection in logs
4. Check that environment variables are set

### Infinite Loop on Login

1. Check middleware configuration
2. Verify session refresh logic
3. Check cookie settings
4. Clear browser cookies and retry

### Database Schema Not Created

1. Run the SQL schema manually in Supabase:
   - Open SQL Editor in Supabase
   - Paste contents of `scripts/001_create_schema.sql`
   - Run the script
2. Check for error messages
3. Ensure migrations execute in correct order

## Rolling Back

To roll back to a previous deployment:

1. Go to **Deployments**
2. Find the deployment you want to restore
3. Click the three dots
4. Click **"Promote to Production"**

## Getting Help

- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Supabase Documentation](https://supabase.com/docs)
- Review deployment logs for specific error messages
- Check [Next.js Documentation](https://nextjs.org/docs)

## Cleanup

To delete your deployment:

1. Go to your Vercel project
2. Click **Settings** → **General**
3. Scroll to bottom
4. Click **"Delete"**

Note: This will delete the Vercel project but not your GitHub repository or Supabase database.

---

**Happy Deploying!** 🚀
