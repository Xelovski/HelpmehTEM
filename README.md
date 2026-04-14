# Online School Management System

A modern, full-stack web application for managing online courses, assignments, and grades. Built with Next.js 16, Supabase, and Tailwind CSS.

## Features

✅ **Course Management** - Create, manage, and organize courses  
✅ **Student Enrollment** - Students can enroll in courses  
✅ **Lessons** - Professors can create and organize course lessons  
✅ **Assignments** - Create assignments with due dates  
✅ **Submissions** - Students submit work, professors grade  
✅ **Grades Management** - Track and manage student grades  
✅ **User Roles** - Student, Professor, and Admin roles with different permissions  
✅ **Responsive Design** - Works on desktop and mobile  

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works great)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tem-project
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up Supabase**

   a. Go to [Supabase](https://supabase.com) and create a new project
   
   b. Get your project URL and API keys from Settings → API → API Reference
   
   c. Add the following environment variables:
      - Go to your Vercel project settings (or create a `.env.local` file locally)
      - Add these variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Initialize the database**

   The database schema will be automatically created when you run the app. If you want to manually run migrations:

   ```bash
   npm run migrate
   ```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

### For Students

1. Visit the home page and click "Sign Up"
2. Create an account (select "Student" role)
3. Once logged in, you can:
   - Browse available courses
   - Enroll in courses
   - View assignments
   - Submit assignments
   - View your grades

### For Professors

1. Sign up and select "Professor" role
2. You can now:
   - Create new courses (with unique course codes)
   - Add lessons to courses
   - Create assignments with due dates
   - View student submissions
   - Grade assignments and provide feedback

### For Administrators

1. Sign up and contact system administrators to be set as admin
2. You can:
   - View system statistics
   - Manage users
   - View all courses
   - Configure system settings

## Architecture

```
app/
├── page.tsx                 # Home page
├── auth/                    # Authentication pages
│   ├── login/
│   ├── signup/
│   └── error/
├── dashboard/               # Main dashboard
│   ├── layout.tsx          # Shared layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── courses/            # Student course views
│   ├── my-courses/         # Professor's courses
│   ├── assignments/        # Assignment management
│   ├── grades/             # Grade viewing
│   ├── admin/              # Admin panel
│   └── students/           # Professor's students
└── api/                     # API routes
    ├── enroll/             # Course enrollment
    ├── upload/             # File uploads
    ├── auth/               # Authentication endpoints
    └── admin/              # Admin endpoints

lib/
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── proxy.ts            # Middleware proxy
└── utils/

components/
└── ui/                      # Shadcn UI components

scripts/
├── 001_create_schema.sql   # Database schema
└── 002_seed_data.sql       # Sample data (optional)
```

## Database Schema

The application uses PostgreSQL with Row Level Security (RLS). Key tables:

- **profiles** - User information and roles
- **courses** - Course definitions
- **enrollments** - Student enrollments
- **lessons** - Course lessons
- **assignments** - Course assignments
- **submissions** - Student submissions
- **grades** - Assignment grades

## API Routes

### Authentication
- `POST /api/auth/lookup` - Look up user by email/username

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `POST /api/enroll` - Enroll student in course

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `POST /api/submissions` - Submit assignment

### File Management
- `POST /api/upload` - Upload file
- `GET /api/file` - Download file

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Manage users

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

### Deploy Database

The database schema will be auto-created, but you can manually apply it:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy contents of `scripts/001_create_schema.sql`
4. Run the SQL script

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |

## Development

### Code Structure

- **Server Components**: Used for data fetching and authentication checks
- **Client Components**: Used for interactivity and state management
- **API Routes**: Handle backend logic and database operations
- **Middleware**: Manages authentication and session refresh

### Common Tasks

#### Add a new course page
1. Create file: `app/dashboard/courses/[id]/page.tsx`
2. Use `createClient()` to fetch course data
3. Check user permissions with RLS

#### Add a new API route
1. Create file: `app/api/[resource]/route.ts`
2. Implement GET/POST/PUT/DELETE handlers
3. Check authentication with `supabase.auth.getUser()`

## Troubleshooting

### "Supabase environment variables not found"
- Ensure you've added the environment variables to your Vercel project
- For local development, create a `.env.local` file with the variables
- Restart your development server after adding variables

### "Row Level Security policy denies access"
- This usually means the user doesn't have permission for the operation
- Check that RLS policies are correctly configured
- Ensure the user ID is being passed to queries

### Students can't see courses
- Ensure the course RLS policy allows students to view courses
- Check that the student is enrolled in the course

## Support

For issues or questions:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Check the [Next.js documentation](https://nextjs.org/docs)
3. Open an issue on GitHub

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for educators and students**
