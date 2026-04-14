'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentCode, setEnrollmentCode] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCourses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get enrolled courses
      const { data, error } = await supabase
        .from('enrollments')
        .select('courses(*)')
        .eq('student_id', user.id)

      if (error) throw error

      const courseList = data?.map((e: any) => e.courses) || []
      setCourses(courseList)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnrolling(true)
    setEnrollError(null)
    setEnrollSuccess(null)

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentCode: enrollmentCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Enrollment failed')
      }

      setEnrollSuccess(`Successfully enrolled in ${data.course.title}!`)
      setEnrollmentCode('')
      
      // Refresh courses list
      await fetchCourses()
    } catch (error) {
      setEnrollError(error instanceof Error ? error.message : 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return <div>Loading courses...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">View all your enrolled courses</p>
      </div>

      {/* Enrollment Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Join a Course</CardTitle>
          <CardDescription>Enter the enrollment code provided by your professor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEnroll} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="enrollment-code" className="sr-only">Enrollment Code</Label>
              <Input
                id="enrollment-code"
                placeholder="Enter enrollment code (e.g., ABC12345)"
                value={enrollmentCode}
                onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
                required
                className="uppercase"
              />
            </div>
            <Button type="submit" disabled={enrolling || !enrollmentCode.trim()}>
              {enrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll'
              )}
            </Button>
          </form>
          {enrollError && (
            <p className="text-sm text-red-500 mt-2">{enrollError}</p>
          )}
          {enrollSuccess && (
            <p className="text-sm text-green-600 mt-2">{enrollSuccess}</p>
          )}
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">No courses yet</p>
            <p className="text-center text-sm text-muted-foreground">Use an enrollment code above to join a course</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
