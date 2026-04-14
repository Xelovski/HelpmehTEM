# 🎓 Online School Management System - Quick Start

Welcome! This is a complete, production-ready Learning Management System (LMS) built with modern web technologies.

## What's Included?

✅ **Authentication** - Secure login/signup with email and passwords  
✅ **Role-Based Access** - Student, Professor, and Admin roles  
✅ **Course Management** - Create, browse, and manage courses  
✅ **Student Enrollment** - Enroll in courses and track progress  
✅ **Lessons & Content** - Organize course content with lessons  
✅ **Assignments** - Create assignments with due dates  
✅ **Submissions** - Students submit work, professors review  
✅ **Grading System** - Grade submissions and track progress  
✅ **Responsive UI** - Works perfectly on desktop and mobile  

## Quick Links

- 📖 **[README.md](./README.md)** - Full documentation and features
- 🔧 **[SETUP.md](./SETUP.md)** - How to set up Supabase locally
- 🚀 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production with Vercel
- 💻 **Code** - Well-organized, type-safe TypeScript throughout

## Getting Started (30 seconds)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
- Go to [supabase.com](https://supabase.com) and create a free account
- Create a new project
- Copy your API keys
- Follow the full setup guide in [SETUP.md](./SETUP.md)

### 3. Add Environment Variables
Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

### 4. Run the App
```bash
npm run dev
```

Visit `http://localhost:3000` and you're ready to go! 🎉

## File Structure

```
📁 Online School
├── 📄 README.md              ← Full documentation
├── 📄 SETUP.md               ← Supabase configuration guide
├── 📄 DEPLOYMENT.md          ← How to deploy to Vercel
├── 📁 app/                   ← Next.js app directory
│   ├── page.tsx              ← Home page
│   ├── auth/                 ← Login/Signup pages
│   ├── dashboard/            ← Main app pages
│   │   ├── layout.tsx        ← Sidebar navigation
│   │   ├── courses/          ← Course browsing (students)
│   │   ├── my-courses/       ← Professor's courses
│   │   ├── assignments/      ← Assignment management
│   │   ├── grades/           ← Grade tracking
│   │   ├── admin/            ← Admin panel
│   │   └── students/         ← Professor's students
│   ├── api/                  ← API routes
│   │   ├── enroll/           ← Course enrollment
│   │   ├── upload/           ← File uploads
│   │   └── admin/            ← Admin endpoints
│   └── layout.tsx            ← Root layout
├── 📁 lib/
│   ├── supabase/             ← Supabase client setup
│   ├── types.ts              ← TypeScript types
│   └── utils.ts              ← Helper functions
├── 📁 components/            ← UI components
│   └── ui/                   ← Shadcn UI components
├── 📁 scripts/               ← Database setup
│   ├── 001_create_schema.sql ← Create tables
│   └── 002_seed_data.sql     ← Sample data
├── 📁 public/                ← Static files
└── package.json              ← Dependencies
```

## Tech Stack

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Hook Form

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS)

**Deployment:**
- Vercel (hosting)
- Supabase (database)

## Key Features Explained

### 🔐 Authentication
- Email/password signup and login
- Secure session management
- Automatic profile creation

### 👥 Roles & Permissions
- **Students**: Can enroll in courses, submit assignments
- **Professors**: Can create courses, grade submissions
- **Admins**: Can manage system settings

### 📚 Course Management
- Create courses with unique codes
- Organize content into lessons
- Track student enrollments
- Create assignments with due dates

### ✅ Assignment & Grading
- Students submit work
- Professors grade and provide feedback
- Track grades for each course

## Common Tasks

### Create a Test Account

1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Enter your email and password
4. Choose your role (Student or Professor)
5. Click "Create Account"

### Create a Test Course (as Professor)

1. Log in as a professor
2. Click "Create Course" in the sidebar
3. Fill in course details
4. Click "Create"
5. Share the course code with students

### Enroll in a Course (as Student)

1. Log in as a student
2. Browse available courses
3. Click "Enroll"
4. Enter the course code (if required)
5. Click "Enroll" to confirm

### Create an Assignment (as Professor)

1. Go to your course
2. Click "Create Assignment"
3. Set title, description, and due date
4. Click "Create"
5. Students can now see and submit the assignment

## Troubleshooting

### App Won't Start
- Check that all environment variables are set
- Make sure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check console for specific error messages

### Can't Login
- Check that `.env.local` file exists with correct values
- Verify Supabase project is running
- Try creating a new account instead

### Database Errors
- Follow the setup guide in [SETUP.md](./SETUP.md)
- Make sure SQL schema was executed in Supabase
- Check that RLS policies are enabled

### Deployed App Not Working
- See the troubleshooting section in [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check Vercel function logs
- Verify environment variables are set in Vercel

## Next Steps

### Local Development
1. Complete the [SETUP.md](./SETUP.md) guide
2. Create some test accounts
3. Explore the dashboard pages
4. Try creating a course and assignment

### Deployment
1. Push your code to GitHub
2. Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
3. Deploy to Vercel in minutes

### Customization
- Modify branding in `app/layout.tsx`
- Update UI colors in `app/globals.css`
- Add new features using the existing patterns
- Extend the database schema as needed

## Project Status

✅ **Ready to Use** - All core features are complete and tested  
✅ **Production Ready** - Secure authentication and database  
✅ **Scalable** - Designed to handle real deployments  
✅ **Maintainable** - Clean, well-organized code  

## Getting Help

1. **Check the docs**
   - [README.md](./README.md) - Full documentation
   - [SETUP.md](./SETUP.md) - Setup instructions
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

2. **External Resources**
   - [Supabase Docs](https://supabase.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Tailwind CSS Docs](https://tailwindcss.com)
   - [React Documentation](https://react.dev)

3. **Common Issues**
   - Check the Troubleshooting section in each guide
   - Review error messages in the console
   - Check Vercel/Supabase dashboards for issues

## Tips for Success

- 💡 **Start Small** - Create one course and one assignment first
- 💡 **Test Locally** - Make sure everything works before deploying
- 💡 **Backup Data** - Regularly backup your Supabase database
- 💡 **Monitor Performance** - Check Vercel analytics for issues
- 💡 **Engage Users** - Add more students to test the system

## Support

Need help? Here's what to do:

1. **Read the relevant guide** - Start with README, SETUP, or DEPLOYMENT
2. **Check your environment variables** - Most issues are here
3. **Review error messages** - Look in browser console and terminal
4. **Check external docs** - Supabase, Next.js, React
5. **Try the demos** - Look at existing code for examples

## License

Open source and ready to use. Build amazing things! 🚀

---

**Made with ❤️ for educators and students**

**Ready to get started?** → [Go to SETUP.md](./SETUP.md)
