'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get courses created by this professor
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('professor_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setCourses(data || [])
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId)
      if (error) throw error
      setCourses(courses.filter((c) => c.id !== courseId))
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  if (loading) {
    return <div>Loading courses...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your courses and students</p>
        </div>
        <Link href="/dashboard/create-course">
          <Button>Create Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">No courses yet</p>
            <div className="text-center">
              <Link href="/dashboard/create-course">
                <Button variant="outline">Create Your First Course</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                {course.enrollment_code && (
                  <div className="bg-muted p-2 rounded mb-4">
                    <p className="text-xs text-muted-foreground">Enrollment Code</p>
                    <p className="font-mono font-bold">{course.enrollment_code}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Course
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
