# Contributing Guide

Thank you for your interest in contributing to the Online School Management System! This guide will help you get started.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
4. Set up your development environment following [SETUP.md](./SETUP.md)
5. Make your changes
6. Test thoroughly
7. Push to your fork and submit a pull request

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables (see SETUP.md)
cp .env.local.example .env.local

# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm build
```

## Project Structure Guidelines

Follow these patterns when adding new features:

### Adding a New Page

1. Create a new folder in `app/dashboard/[feature]/`
2. Add `page.tsx` with your component
3. Use server components for data fetching
4. Add proper TypeScript types
5. Include proper error handling

Example:
```typescript
// app/dashboard/my-feature/page.tsx
import { createClient } from '@/lib/supabase/server'
import { UserProfile } from '@/lib/types'

export default async function MyFeaturePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch data
  const { data, error } = await supabase
    .from('my_table')
    .select()
    .eq('user_id', user?.id)
  
  if (error) {
    return <div>Error loading data</div>
  }
  
  return <div>{/* Your component */}</div>
}
```

### Adding a New API Route

1. Create a new file in `app/api/[resource]/route.ts`
2. Implement proper HTTP methods (GET, POST, PUT, DELETE)
3. Add authentication checks
4. Return proper error codes
5. Add JSDoc comments

Example:
```typescript
// app/api/my-resource/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/my-resource
 * Fetches all resources for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { data, error } = await supabase
      .from('my_table')
      .select()
      .eq('user_id', user.id)
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/my-resource
 * Creates a new resource
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validate input
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('my_table')
      .insert([
        {
          ...body,
          user_id: user.id,
        },
      ])
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Database Changes

When adding new tables or columns:

1. Create a new SQL migration file in `scripts/`
2. Follow naming: `XXX_description.sql`
3. Include both schema creation and RLS policies
4. Test locally in Supabase before pushing
5. Document changes in PR description

Example:
```sql
-- scripts/005_add_notifications_table.sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_read_own_notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

## Code Style

### TypeScript

- Use strict mode: `"strict": true` in tsconfig.json
- Always add proper types, no `any`
- Use interfaces for complex objects
- Add JSDoc comments to functions

```typescript
interface User {
  id: string
  email: string
  role: 'student' | 'professor' | 'admin'
}

/**
 * Fetches a user by their ID
 * @param userId - The user's ID
 * @returns The user object or null if not found
 */
async function getUser(userId: string): Promise<User | null> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components focused and reusable
- Use TypeScript for props
- Add descriptive names

```typescript
interface UserCardProps {
  user: User
  onSelect?: (user: User) => void
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{user.email}</h3>
      {onSelect && (
        <button onClick={() => onSelect(user)}>
          Select
        </button>
      )}
    </div>
  )
}
```

### CSS/Tailwind

- Use Tailwind classes for styling
- Keep component styles in JSX when possible
- Use CSS variables for theming
- Avoid hardcoding colors

```tsx
// Good
<div className="p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
  Content
</div>

// Avoid
<div style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #ddd' }}>
  Content
</div>
```

## Testing

While this project doesn't have automated tests yet, test your changes manually:

1. Test happy path (normal usage)
2. Test error cases (missing data, permissions)
3. Test edge cases (empty lists, large datasets)
4. Test on mobile viewport
5. Test with different user roles

Example testing checklist for a new feature:
- [ ] Component renders without errors
- [ ] Can perform main action (create, update, delete)
- [ ] Error messages display properly
- [ ] Unauthorized users are blocked
- [ ] Works on mobile
- [ ] Works with slow network (test in DevTools)

## Git Workflow

### Commit Messages

Use clear, descriptive commit messages:

```
Good:
- "Add notification system for assignment due dates"
- "Fix: Prevent duplicate course enrollments"
- "docs: Update deployment guide for Vercel"

Bad:
- "fix stuff"
- "update"
- "asdf"
```

### Branching

Use descriptive branch names:

```
feature/add-notifications
fix/enrollment-bug
docs/improve-readme
refactor/dashboard-layout
```

### Pull Requests

When submitting a PR:

1. Provide a clear description of changes
2. Reference any related issues
3. Include a testing checklist
4. Add screenshots for UI changes
5. Keep PRs focused (one feature per PR)

PR Template:
```markdown
## Description
Brief description of what this PR does

## Related Issues
Fixes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement

## Testing Done
- [ ] Tested locally
- [ ] Works on mobile
- [ ] Tested error cases
- [ ] Database migrations tested

## Screenshots
(if applicable)
```

## Documentation

Keep documentation up-to-date:

1. Update README.md if adding features
2. Update SETUP.md if changing setup process
3. Update DEPLOYMENT.md if changing deployment
4. Add code comments for complex logic
5. Add JSDoc comments to functions

## Performance Considerations

- Minimize database queries (use selects wisely)
- Implement pagination for large lists
- Cache frequently accessed data
- Use database indexes for common queries
- Avoid N+1 query problems

## Security Best Practices

1. Never expose secrets in code
2. Validate all user input
3. Use RLS for database access control
4. Check user permissions before operations
5. Use environment variables for config
6. Keep dependencies updated

## Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Add alt text to images
- Ensure color contrast meets WCAG standards
- Use ARIA labels when needed
- Test with keyboard navigation

## Performance Tips

1. Use `next/image` for images
2. Lazy load components with `dynamic()`
3. Optimize database queries
4. Use proper indexes
5. Implement pagination
6. Cache static content

## Debugging

### Common Issues

**Page not loading:**
- Check browser console for errors
- Check server logs: `npm run dev` output
- Check Supabase dashboard for connection issues

**Data not saving:**
- Check RLS policies allow the operation
- Check that user_id is being passed correctly
- Look at Supabase SQL logs for query errors

**Performance problems:**
- Check DevTools Network tab
- Look at database query performance
- Check for unnecessary re-renders

### Debugging Tools

```typescript
// Log Supabase operations
const { data, error } = await supabase.from('table').select()
console.log('[DEBUG] Query result:', data, error)

// Log component renders
useEffect(() => {
  console.log('[DEBUG] Component mounted')
  return () => console.log('[DEBUG] Component unmounted')
}, [])

// Log user session
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log('[DEBUG] Session:', data)
```

## Questions or Need Help?

1. Check existing documentation
2. Look at similar code in the project
3. Review Supabase/Next.js docs
4. Open an issue for discussion
5. Ask in pull request comments

## Thank You!

Your contributions make this project better. Thank you for helping! 🙏

---

**Happy coding!** ✨
