'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CalendarDays, ClipboardList, Hash, Info } from 'lucide-react'
import Link from 'next/link'

export default function CreateAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('23:59')
  const [maxScore, setMaxScore] = useState('100')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCourse = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, code')
        .eq('id', courseId)
        .single()
      setCourse(data)
      setPageLoading(false)
    }
    if (courseId) fetchCourse()
  }, [courseId])

  // Default due date to 1 week from now
  useEffect(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    setDueDate(nextWeek.toISOString().split('T')[0])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!dueDate) {
        setError('Due date is required')
        return
      }

      const scoreNum = parseInt(maxScore)
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 1000) {
        setError('Max score must be between 1 and 1000')
        return
      }

      const dueDatetime = new Date(`${dueDate}T${dueTime}`).toISOString()

      const { error: insertError } = await supabase.from('assignments').insert({
        course_id: courseId,
        title: title.trim(),
        description: description.trim(),
        due_date: dueDatetime,
        max_score: scoreNum,
      })

      if (insertError) throw insertError

      router.push(`/dashboard/courses/${courseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isDateInPast = dueDate && new Date(`${dueDate}T${dueTime}`) < new Date()

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link */}
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to course
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
        {course && (
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">For</p>
            <Badge variant="secondary" className="font-mono">
              {course.code || course.title}
            </Badge>
            {course.code && (
              <p className="text-muted-foreground text-sm">{course.title}</p>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Assignment Details
          </CardTitle>
          <CardDescription>
            Fill in the details below. Students will see the title, description, and due date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Assignment Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Build a Personal Website"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/120
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description
                <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the assignment requirements, resources, or submission instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/2000
              </p>
            </div>

            <Separator />

            {/* Due Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-medium">Due Date &amp; Time</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due-date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="due-date"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due-time">Time</Label>
                  <Input
                    id="due-time"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>
              {isDateInPast && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">The due date is in the past. Students will see this as overdue immediately.</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Max Score */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="max-score" className="text-base font-medium">
                  Maximum Score
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="max-score"
                  type="number"
                  min="1"
                  max="1000"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">points</p>
              </div>
              <p className="text-xs text-muted-foreground">
                The total points this assignment is worth. Default is 100.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading || !title.trim()}>
                {loading ? 'Creating...' : 'Create Assignment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
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
