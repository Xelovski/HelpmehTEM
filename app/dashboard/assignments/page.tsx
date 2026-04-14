'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get enrolled course IDs first
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', user.id)

        const courseIds = enrollments?.map((e: any) => e.course_id) || []

        // If no enrollments, skip the assignments query
        if (courseIds.length === 0) {
          setAssignments([])
          setLoading(false)
          return
        }

        // Get assignments for enrolled courses
        const { data, error } = await supabase
          .from('assignments')
          .select('*, courses(title, code)')
          .in('course_id', courseIds)
          .order('due_date', { ascending: true })

        if (error) throw error
        setAssignments(data || [])
      } catch (error) {
        console.error('Error fetching assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()
  const isUpcoming = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime()
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000 // Within a week
  }

  if (loading) {
    return <div>Loading assignments...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">View and submit your assignments</p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No assignments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.courses?.title} ({assignment.courses?.code})
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {isOverdue(assignment.due_date) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {isUpcoming(assignment.due_date) && !isOverdue(assignment.due_date) && (
                        <Badge variant="secondary">Upcoming</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(assignment.due_date).toLocaleDateString()} at{' '}
                    {new Date(assignment.due_date).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
