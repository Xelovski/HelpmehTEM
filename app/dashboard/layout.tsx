'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LogOut, Menu, X } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      // Get user role from metadata
      const userRole = user.user_metadata?.role || 'student'
      setRole(userRole)
      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } border-r bg-card transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Online School</h2>
        </div>
        <nav className="p-4 space-y-2">
          {role === 'student' ? (
            <>
              <Link href="/dashboard/courses">
                <Button variant="ghost" className="w-full justify-start">
                  📚 My Courses
                </Button>
              </Link>
              <Link href="/dashboard/assignments">
                <Button variant="ghost" className="w-full justify-start">
                  ✅ Assignments
                </Button>
              </Link>
              <Link href="/dashboard/grades">
                <Button variant="ghost" className="w-full justify-start">
                  📊 Grades
                </Button>
              </Link>
            </>
          
          ) : role === 'admin' ? (
            <>
              <Link href="/dashboard/admin/overview">
                <Button variant="ghost" className="w-full justify-start">
                  📊 Overview
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="ghost" className="w-full justify-start">
                  👥 Users
                </Button>
              </Link>
              <Link href="/dashboard/admin/courses">
                <Button variant="ghost" className="w-full justify-start">
                  📚 Courses
                </Button>
              </Link>
              <Link href="/dashboard/admin/settings">
                <Button variant="ghost" className="w-full justify-start">
                  ⚙️ Settings
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/my-courses">
                <Button variant="ghost" className="w-full justify-start">
                  📚 My Courses
                </Button>
              </Link>
              <Link href="/dashboard/create-course">
                <Button variant="ghost" className="w-full justify-start">
                  ➕ Create Course
                </Button>
              </Link>
              <Link href="/dashboard/professor-lessons">
                <Button variant="ghost" className="w-full justify-start">
                  📖 Lessons
                </Button>
              </Link>
              <Link href="/dashboard/professor-assignments">
                <Button variant="ghost" className="w-full justify-start">
                  ✅ Assignments
                </Button>
              </Link>
              <Link href="/dashboard/students">
                <Button variant="ghost" className="w-full justify-start">
                  👥 Students
                </Button>
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-md"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {user?.user_metadata?.full_name || 'User'} ▼
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  {role === 'admin' ? '🔐 Administrator' : role === 'professor' ? '🎓 Professor' : '👤 Student'}
                </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
