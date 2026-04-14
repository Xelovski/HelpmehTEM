'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, ChevronDown, ChevronUp, Clock, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()
        if (courseError) throw courseError
        setCourse(courseData)

        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })
        setLessons(lessonsData || [])

        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)
          .order('due_date', { ascending: true })
        setAssignments(assignmentsData || [])
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) fetchCourse()
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading course...
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Course not found.
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Course Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-balance">{course.title}</h1>
          {course.code && <Badge variant="secondary">{course.code}</Badge>}
        </div>
        {course.description && (
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
        )}
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lessons" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Lessons
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{lessons.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <FileText className="w-4 h-4" />
            Assignments
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{assignments.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-3">
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center gap-2">
                <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No lessons available yet.</p>
                <p className="text-xs text-muted-foreground">Check back soon — your professor will add lessons here.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in this course</p>
              <div className="space-y-2">
                {lessons.map((lesson, idx) => (
                  <Card
                    key={lesson.id}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                    >
                      <CardHeader className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {lesson.order_index}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-snug truncate">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{lesson.description}</p>
                            )}
                          </div>
                          {lesson.content ? (
                            expandedLesson === lesson.id
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <span className="text-xs text-muted-foreground shrink-0 italic">No content yet</span>
                          )}
                        </div>
                      </CardHeader>
                    </button>

                    {expandedLesson === lesson.id && (
                      <CardContent className="pt-0 pb-5 border-t bg-muted/20">
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mb-3 pt-4 font-medium">{lesson.description}</p>
                        )}
                        {lesson.content ? (
                          <div className="bg-background rounded-md border p-4">
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-foreground">
                              {lesson.content}
                            </pre>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic pt-4">
                            Your professor hasn&apos;t added content to this lesson yet.
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-3">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No assignments yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const due = new Date(assignment.due_date)
                const isOverdue = due < now
                const isDueSoon = !isOverdue && (due.getTime() - now.getTime()) < 1000 * 60 * 60 * 48
                return (
                  <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{assignment.title}</p>
                            {assignment.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{assignment.description}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            {isOverdue ? (
                              <Badge variant="destructive" className="text-xs">Overdue</Badge>
                            ) : isDueSoon ? (
                              <Badge className="text-xs bg-amber-500 hover:bg-amber-500 text-white">Due Soon</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Upcoming</Badge>
                            )}
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {assignment.max_score && (
                              <p className="text-xs text-muted-foreground">{assignment.max_score} pts</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
