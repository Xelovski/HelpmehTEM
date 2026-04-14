'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BookOpen, Plus, Search, ChevronDown, ChevronUp, Trash2, Pencil, X } from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ProfessorLessonsPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [lessonsByCourse, setLessonsByCourse] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, code')
        .eq('professor_id', user.id)
        .order('created_at', { ascending: false })

      if (!coursesData) { setLoading(false); return }
      setCourses(coursesData)

      const lessonMap: Record<string, any[]> = {}
      await Promise.all(
        coursesData.map(async (course) => {
          const { data } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', course.id)
            .order('order_index', { ascending: true })
          lessonMap[course.id] = data || []
        })
      )
      setLessonsByCourse(lessonMap)
      setLoading(false)
    }
    fetchData()
  }, [])

  const deleteLesson = async (courseId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    setLessonsByCourse((prev) => ({
      ...prev,
      [courseId]: prev[courseId].filter((l) => l.id !== lessonId),
    }))
  }

  const saveEdit = async () => {
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
      setLessonsByCourse((prev) => ({
        ...prev,
        [editingLesson.course_id]: prev[editingLesson.course_id].map((l) =>
          l.id === editingLesson.id ? editingLesson : l
        ),
      }))
      setEditingLesson(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setEditLoading(false)
    }
  }

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
  )

  const totalLessons = Object.values(lessonsByCourse).reduce((sum, arr) => sum + arr.length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading lessons...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Lessons</h1>
          <p className="text-muted-foreground mt-1">
            {totalLessons} lesson{totalLessons !== 1 ? 's' : ''} across {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      {courses.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Edit Modal */}
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
                <Label className="text-xs">Order</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingLesson.order_index}
                  onChange={(e) => setEditingLesson({ ...editingLesson, order_index: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Title</Label>
                <Input
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Short Description</Label>
              <Textarea
                rows={2}
                value={editingLesson.description || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Content</Label>
              <Textarea
                rows={10}
                className="font-mono text-sm"
                value={editingLesson.content || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
              />
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses list */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3">
            <BookOpen className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              {courses.length === 0 ? 'No courses yet. Create a course first.' : 'No courses match your search.'}
            </p>
            {courses.length === 0 && (
              <Link href="/dashboard/create-course">
                <Button size="sm" variant="outline">Create a Course</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((course) => {
            const lessons = lessonsByCourse[course.id] || []
            const isOpen = expandedCourse === course.id
            return (
              <Card key={course.id} className="overflow-hidden">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedCourse(isOpen ? null : course.id)}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{course.title}</p>
                            {course.code && <Badge variant="outline" className="text-xs">{course.code}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/dashboard/courses/${course.id}/create-lesson`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" variant="outline" className="gap-1.5 h-8">
                            <Plus className="w-3.5 h-3.5" />
                            Add Lesson
                          </Button>
                        </Link>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {isOpen && (
                  <CardContent className="pt-0 pb-4 border-t bg-muted/20 space-y-2">
                    {lessons.length === 0 ? (
                      <div className="py-6 flex flex-col items-center gap-2">
                        <p className="text-sm text-muted-foreground">No lessons in this course yet.</p>
                        <Link href={`/dashboard/courses/${course.id}/create-lesson`}>
                          <Button size="sm" variant="outline" className="gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            Add First Lesson
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      lessons.map((lesson) => (
                        <div key={lesson.id} className="mt-2 rounded-md border bg-background overflow-hidden">
                          <button
                            className="w-full text-left"
                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                          >
                            <div className="flex items-center gap-3 px-4 py-3">
                              <Badge variant="outline" className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs p-0">
                                {lesson.order_index}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => { e.stopPropagation(); setEditingLesson({ ...lesson }) }}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => { e.stopPropagation(); deleteLesson(course.id, lesson.id) }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                {expandedLesson === lesson.id
                                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                              </div>
                            </div>
                          </button>
                          {expandedLesson === lesson.id && (
                            <div className="px-4 pb-4 border-t bg-muted/30">
                              {lesson.content ? (
                                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed pt-4">
                                  {lesson.content}
                                </pre>
                              ) : (
                                <p className="text-sm text-muted-foreground italic pt-4">No content added yet.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
