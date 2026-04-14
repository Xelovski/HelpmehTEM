# 📚 Online School Management System

> A modern, production-ready Learning Management System built with Next.js, React, and Supabase

## 🚀 Quick Links

| Document | Purpose |
|----------|---------|
| **[QUICKSTART.md](./QUICKSTART.md)** | ⚡ Get running in 30 seconds |
| **[README.md](./README.md)** | 📖 Full documentation & features |
| **[SETUP.md](./SETUP.md)** | 🔧 Configure Supabase locally |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 🚀 Deploy to production |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | 💻 Contributing guidelines |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | 📋 Project status & completion |

## ✨ Features at a Glance

- 👥 **User Management** - Students, Professors, Admins
- 📚 **Courses** - Create, browse, enroll
- ✍️ **Lessons** - Organize course content
- 📝 **Assignments** - Create with due dates
- 📤 **Submissions** - Submit work with files
- 📊 **Grading** - Grade and provide feedback
- 🔐 **Secure** - Authentication & RLS
- 📱 **Responsive** - Works on all devices

## 🏃 Get Started (30 Seconds)

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase (see SETUP.md)
# Create .env.local with your Supabase keys

# 3. Run the app
npm run dev

# 4. Visit http://localhost:3000
```

👉 **New here?** Start with [QUICKSTART.md](./QUICKSTART.md)

## 📋 Project Status

✅ **Complete and Ready to Use**
- All core features implemented
- Production-ready code
- Comprehensive documentation
- Ready for deployment
- Secure and scalable

📊 **Project Metrics**
- 15+ dashboard pages
- 10+ API endpoints
- 7 database tables
- 40+ TypeScript files
- ~150KB bundle size
- 4 comprehensive guides

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 with App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Shadcn UI Components

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL + Auth)
- Row Level Security
- Vercel Blob for files

**Deployment:**
- Vercel (hosting)
- Supabase (database)
- GitHub (version control)

## 📁 Project Structure

```
app/                    # Next.js application
├── page.tsx            # Home page
├── auth/               # Login/Signup
└── dashboard/          # Main application
    ├── courses/        # Course management
    ├── assignments/    # Assignment management
    ├── grades/         # Grade tracking
    └── admin/          # Admin panel

lib/                    # Utilities
├── supabase/           # Supabase client setup
└── types.ts            # TypeScript types

scripts/                # Database scripts
├── 001_create_schema.sql
└── 002_seed_data.sql

components/ui/          # Shadcn UI components
```

## 🚀 Deployment

**Local Development**
```bash
npm run dev
# Starts on http://localhost:3000
```

**Production (Vercel)**
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for details

## 🔒 Security

- ✅ Secure authentication
- ✅ Row Level Security (RLS)
- ✅ Environment secrets
- ✅ HTTPS/TLS encryption
- ✅ Input validation
- ✅ CSRF protection

## 📚 Documentation

| Document | Details |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 30-second setup guide |
| [README.md](./README.md) | Full documentation |
| [SETUP.md](./SETUP.md) | Supabase configuration |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to Vercel |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guide |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Project status |

## 🎯 What You Can Do

### As a Student
- Browse and enroll in courses
- View lessons and assignments
- Submit work
- Check grades and feedback

### As a Professor
- Create and manage courses
- Add lessons and content
- Create assignments
- Grade student submissions
- Manage enrolled students

### As an Administrator
- View system statistics
- Manage users and roles
- Manage courses
- Configure system settings

## 🐛 Troubleshooting

**App won't start?**
- Check Node.js version (need 18+)
- Run `npm install`
- Check `.env.local` file exists

**Database errors?**
- Follow [SETUP.md](./SETUP.md)
- Run SQL schema in Supabase
- Check environment variables

**Deployment issues?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check Vercel logs
- Verify environment variables

👉 See full troubleshooting in [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📖 Learning Path

1. **Understand the Project** → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. **Quick Start** → [QUICKSTART.md](./QUICKSTART.md)
3. **Local Setup** → [SETUP.md](./SETUP.md)
4. **Explore Features** → [README.md](./README.md)
5. **Deploy to Production** → [DEPLOYMENT.md](./DEPLOYMENT.md)
6. **Start Contributing** → [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📞 Support

- 📖 Check the documentation first
- 🔍 Review existing code examples
- 📚 Check Supabase/Next.js docs
- 💬 Open an issue for questions

## 📄 License

Open source and ready to use. Build amazing things! 🎓

## 🎉 Ready?

Choose your next step:

- **🚀 Deploy Now** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **🔧 Setup Locally** → [SETUP.md](./SETUP.md)
- **📖 Learn More** → [README.md](./README.md)
- **💻 Start Coding** → [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Built with ❤️ for educators and students**

*Last Updated: March 2026*
