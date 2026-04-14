'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowLeft, Hash, FileText, AlignLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [orderIndex, setOrderIndex] = useState('')
  const [course, setCourse] = useState<any>(null)
  const [nextOrder, setNextOrder] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('title, code')
        .eq('id', courseId)
        .single()
      if (courseData) setCourse(courseData)

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1)

      const next = lessonsData && lessonsData.length > 0
        ? lessonsData[0].order_index + 1
        : 1
      setNextOrder(next)
      setOrderIndex(String(next))
    }
    if (courseId) fetchCourseAndLessons()
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!orderIndex) {
        setError('Lesson order is required')
        return
      }
      if (!title.trim()) {
        setError('Lesson title is required')
        return
      }

      const { error: insertError } = await supabase.from('lessons').insert({
        course_id: courseId,
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
        order_index: parseInt(orderIndex),
      })

      if (insertError) throw insertError

      router.push(`/dashboard/courses/${courseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/courses/${courseId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Button>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Create Lesson</h1>
        </div>
        {course && (
          <p className="text-muted-foreground">
            Adding to <span className="font-medium text-foreground">{course.title}</span>
            {course.code && <Badge variant="outline" className="ml-2 text-xs">{course.code}</Badge>}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Fill in the information for your new lesson</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-[1fr_3fr] gap-4">
              <div className="grid gap-2">
                <Label htmlFor="order" className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="1"
                  min="1"
                  required
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Auto-set to {nextOrder}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Lesson Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Variables"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5" />
                Short Description
              </Label>
              <Textarea
                id="description"
                placeholder="A brief summary of what students will learn in this lesson"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length} characters</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">
                Lesson Content
              </Label>
              <Textarea
                id="content"
                placeholder="Write your full lesson content here. Students will read this material..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="font-mono text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground text-right">{content.length} characters</p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="gap-2">
                <BookOpen className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Lesson'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
