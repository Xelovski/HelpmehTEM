'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { Plus, Trash2, Users, CalendarDays, Hash, ClipboardList } from 'lucide-react'

type Assignment = {
  id: string
  title: string
  description: string
  due_date: string
  max_score: number
  course_id: string
  created_at: string
  courses: { title: string; code: string }
  submission_count?: number
}

type Course = {
  id: string
  title: string
  code: string
}

export default function ProfessorAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch professor's courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, code')
          .eq('professor_id', user.id)
          .order('created_at', { ascending: false })

        setCourses(coursesData || [])

        // Fetch assignments for all professor's courses
        const courseIds = (coursesData || []).map((c: Course) => c.id)
        if (courseIds.length === 0) {
          setAssignments([])
          setLoading(false)
          return
        }

        const { data: assignmentsData, error } = await supabase
          .from('assignments')
          .select('*, courses(title, code)')
          .in('course_id', courseIds)
          .order('due_date', { ascending: true })

        if (error) throw error

        // Fetch submission counts for each assignment
        const withCounts = await Promise.all(
          (assignmentsData || []).map(async (a: Assignment) => {
            const { count } = await supabase
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .eq('assignment_id', a.id)
            return { ...a, submission_count: count ?? 0 }
          })
        )

        setAssignments(withCounts)
      } catch (err) {
        console.error('Error fetching assignments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentId)
      if (error) throw error
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
    } catch (err) {
      console.error('Error deleting assignment:', err)
    }
  }

  const filtered = selectedCourse === 'all'
    ? assignments
    : assignments.filter((a) => a.course_id === selectedCourse)

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date()
  const isDueSoon = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime()
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
  }

  const formatDueDate = (dueDate: string) => {
    const d = new Date(dueDate)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-muted-foreground">Loading assignments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Manage assignments across all your courses</p>
        </div>
        {courses.length > 0 && (
          <Select
            value={selectedCourse === 'all' ? 'pick' : selectedCourse}
            onValueChange={(val) => {
              if (val !== 'pick') {
                window.location.href = `/dashboard/courses/${val}/create-assignment`
              }
            }}
          >
            <SelectTrigger className="w-52">
              <Plus className="w-4 h-4 mr-2" />
              <SelectValue placeholder="New Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pick" disabled>Select a course</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code ? `${c.code} — ` : ''}{c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Stats bar */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold">{assignments.length}</p>
              <p className="text-xs text-muted-foreground">Total Assignments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold">
                {assignments.reduce((sum, a) => sum + (a.submission_count ?? 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-destructive">
                {assignments.filter((a) => isOverdue(a.due_date)).length}
              </p>
              <p className="text-xs text-muted-foreground">Past Due Date</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      {courses.length > 1 && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">Filter by course:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCourse('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                selectedCourse === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground'
              }`}
            >
              All
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  selectedCourse === c.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-foreground'
                }`}
              >
                {c.code || c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No courses yet</p>
              <p className="text-sm text-muted-foreground">Create a course first, then add assignments to it.</p>
            </div>
            <Link href="/dashboard/create-course">
              <Button variant="outline" size="sm">Create a Course</Button>
            </Link>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-3 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No assignments yet</p>
              <p className="text-sm text-muted-foreground">Select a course above to create your first assignment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment) => (
            <Card key={assignment.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      {isOverdue(assignment.due_date) && (
                        <Badge variant="destructive" className="text-xs">Overdue</Badge>
                      )}
                      {isDueSoon(assignment.due_date) && (
                        <Badge variant="secondary" className="text-xs">Due Soon</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-0.5">
                      {assignment.courses?.code ? `${assignment.courses.code} — ` : ''}
                      {assignment.courses?.title}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/assignments/${assignment.id}/submissions`}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {assignment.submission_count} submissions
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{assignment.title}&quot;? This will also delete all student submissions and grades. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(assignment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {(assignment.description || true) && (
                <CardContent className="pt-0 space-y-3">
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                  )}
                  <Separator />
                  <div className="flex items-center gap-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Due: {formatDueDate(assignment.due_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      {assignment.max_score} pts
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
