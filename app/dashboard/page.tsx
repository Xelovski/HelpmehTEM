'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const redirect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const role = user.user_metadata?.role || 'student'
      if (role === 'admin') {
        router.push('/dashboard/admin/overview')
      } else if (role === 'professor') {
        router.push('/dashboard/my-courses')
      } else {
        router.push('/dashboard/courses')
      }
    }

    redirect()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  )
}
