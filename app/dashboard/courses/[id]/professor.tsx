'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Pencil, X, ChevronDown, ChevronUp, BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProfessorCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Get course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()

        if (courseError) throw courseError
        setCourse(courseData)

        // Get lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })

        setLessons(lessonsData || [])

        // Get assignments
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)
          .order('due_date', { ascending: true })

        setAssignments(assignmentsData || [])

        // Get enrollments
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('*, profiles:student_id(email, full_name)')
          .eq('course_id', courseId)

        setEnrollments(enrollmentsData || [])
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    try {
      await supabase.from('lessons').delete().eq('id', lessonId)
      setLessons(lessons.filter((l) => l.id !== lessonId))
    } catch (error) {
      console.error('Error deleting lesson:', error)
    }
  }

  const saveEditLesson = async () => {
    if (!editingLesson) return
    setEditLoading(true)
    setEditError(null)
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: editingLesson.title,
          description: editingLesson.description,
          content: editingLesson.content,
          order_index: editingLesson.order_index,
        })
        .eq('id', editingLesson.id)
      if (error) throw error
      setLessons(lessons.map((l) => l.id === editingLesson.id ? editingLesson : l))
      setEditingLesson(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setEditLoading(false)
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment?')) return
    try {
      await supabase.from('assignments').delete().eq('id', assignmentId)
      setAssignments(assignments.filter((a) => a.id !== assignmentId))
    } catch (error) {
      console.error('Error deleting assignment:', error)
    }
  }

  if (loading) {
    return <div>Loading course...</div>
  }

  if (!course) {
    return <div>Course not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground">{course.code}</p>
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="assignments">Assignments ({assignments.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({enrollments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lessons</h2>
            <Link href={`/dashboard/courses/${courseId}/create-lesson`}>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Lesson
              </Button>
            </Link>
          </div>

          {/* Edit Lesson Modal */}
          {editingLesson && (
            <Card className="border-primary/40 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Edit Lesson</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingLesson(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[80px_1fr] gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-order" className="text-xs">Order</Label>
                    <Input
                      id="edit-order"
                      type="number"
                      min="1"
                      value={editingLesson.order_index}
                      onChange={(e) => setEditingLesson({ ...editingLesson, order_index: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-title" className="text-xs">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingLesson.title}
                      onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-description" className="text-xs">Short Description</Label>
                  <Textarea
                    id="edit-description"
                    rows={2}
                    value={editingLesson.description || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-content" className="text-xs">Content</Label>
                  <Textarea
                    id="edit-content"
                    rows={8}
                    className="font-mono text-sm"
                    value={editingLesson.content || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  />
                </div>
                {editError && <p className="text-sm text-destructive">{editError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEditLesson} disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {lessons.length === 0 ? (
            <Card>
              <CardContent className="py-10 flex flex-col items-center gap-3">
                <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No lessons yet. Add your first lesson to get started.</p>
                <Link href={`/dashboard/courses/${courseId}/create-lesson`}>
                  <Button size="sm" variant="outline">Add First Lesson</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="overflow-hidden">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="flex items-center gap-3 flex-1 text-left"
                        onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                      >
                        <Badge variant="outline" className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs p-0">
                          {lesson.order_index}
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm leading-tight truncate">{lesson.title}</p>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.description}</p>
                          )}
                        </div>
                        {expandedLesson === lesson.id
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </button>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingLesson({ ...lesson })}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => deleteLesson(lesson.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {expandedLesson === lesson.id && lesson.content && (
                    <CardContent className="pt-0 pb-4 border-t bg-muted/30">
                      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed pt-4">
                        {lesson.content}
                      </pre>
                    </CardContent>
                  )}
                  {expandedLesson === lesson.id && !lesson.content && (
                    <CardContent className="pt-0 pb-4 border-t bg-muted/30">
                      <p className="text-sm text-muted-foreground italic pt-4">No content added yet.</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Assignments</h2>
            <Link href={`/dashboard/courses/${courseId}/create-assignment`}>
              <Button>Create Assignment</Button>
            </Link>
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
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/assignments/${assignment.id}/submissions`}>
                          <Button variant="outline" size="sm">
                            View Submissions
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAssignment(assignment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <h2 className="text-2xl font-bold">Enrolled Students</h2>

          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No students enrolled yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {enrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{enrollment.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.profiles?.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
