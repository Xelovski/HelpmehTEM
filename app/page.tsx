import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Online School</h1>
            <nav className="flex gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center py-20">
          <h2 className="text-5xl font-bold mb-6">Learn & Teach Online</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            A comprehensive platform for managing courses, assignments, and grades. Connect with students and professors in a seamless learning environment.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Get Started as Student
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="px-8">
                Get Started as Professor
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">📚 Course Management</h3>
              <p className="text-sm text-muted-foreground">Create and manage courses with detailed lessons and content</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">✅ Assignments</h3>
              <p className="text-sm text-muted-foreground">Create assignments and track student submissions</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">📊 Grading</h3>
              <p className="text-sm text-muted-foreground">Grade submissions and provide feedback to students</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2034 Online School. All rights reserved.</p>
      </footer>
    </div>
  )
}
