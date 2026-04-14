'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, Loader2 } from 'lucide-react'

export default function AssignmentDetailPage() {
  const params = useParams()
  const assignmentId = params.id as string
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [grade, setGrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*, courses(title, code)')
          .eq('id', assignmentId)
          .single()

        if (assignmentError) throw assignmentError
        setAssignment(assignmentData)

        // Get student's submission
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('student_id', user.id)
          .single()
          .catch(() => ({ data: null, error: null }))

        if (submissionData) {
          setSubmission(submissionData)

          // Get grade for submission
          const { data: gradeData } = await supabase
            .from('grades')
            .select('*')
            .eq('submission_id', submissionData.id)
            .single()
            .catch(() => ({ data: null }))

          if (gradeData) {
            setGrade(gradeData)
          }
        }
      } catch (error) {
        console.error('Error fetching assignment:', error)
      } finally {
        setLoading(false)
      }
    }

    if (assignmentId) {
      fetchAssignment()
    }
  }, [assignmentId])

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setUploading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const fileInput = (e.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement
      const file = fileInput?.files?.[0]

      if (!file) throw new Error('No file selected')

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      const { pathname } = await uploadRes.json()

      // Create or update submission
      if (submission) {
        // Update existing submission
        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            file_path: pathname,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', submission.id)

        if (updateError) throw updateError
      } else {
        // Create new submission
        const { data: newSubmission, error: createError } = await supabase
          .from('submissions')
          .insert({
            assignment_id: assignmentId,
            student_id: user.id,
            file_path: pathname,
          })
          .select()
          .single()

        if (createError) throw createError
        setSubmission(newSubmission)
      }

      // Reset form and refresh data
      (e.target as HTMLFormElement).reset()
      
      // Re-fetch submission data
      const { data: updatedSubmission } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.id)
        .single()

      setSubmission(updatedSubmission)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    if (!submission?.file_path) return
    try {
      window.location.href = `/api/file?pathname=${encodeURIComponent(submission.file_path)}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  const isOverdue = assignment && new Date(assignment.due_date) < new Date()
  const isSubmitted = !!submission

  if (loading) {
    return <div>Loading assignment...</div>
  }

  if (!assignment) {
    return <div>Assignment not found</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground">
              {assignment.courses?.code} - {assignment.courses?.title}
            </p>
          </div>
          {isSubmitted && (
            <Badge variant="default">Submitted</Badge>
          )}
          {!isSubmitted && isOverdue && (
            <Badge variant="destructive">Overdue</Badge>
          )}
        </div>
      </div>

      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p>{assignment.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Due Date</p>
            <p>
              {new Date(assignment.due_date).toLocaleDateString()} at{' '}
              {new Date(assignment.due_date).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSubmitted ? (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p>{new Date(submission.submitted_at).toLocaleDateString()} at {new Date(submission.submitted_at).toLocaleTimeString()}</p>
              </div>
              {submission.file_path && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Submitted File</p>
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Submission
                  </Button>
                </div>
              )}

              {!isOverdue && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-4">Resubmit (updates your submission)</p>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="file-resubmit">Upload New File</Label>
                      <Input
                        id="file-resubmit"
                        name="file"
                        type="file"
                        required
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Resubmit
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {grade ? (
                <div className="space-y-2 mt-4 p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">Grade: {grade.score}%</p>
                  {grade.feedback && (
                    <>
                      <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                      <p className="text-sm">{grade.feedback}</p>
                    </>
                  )}
                  {grade.graded_at && (
                    <p className="text-xs text-muted-foreground">
                      Graded: {new Date(grade.graded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not graded yet</p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">You haven&apos;t submitted this assignment yet.</p>
              {isOverdue ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">This assignment is overdue. Late submissions may not be accepted.</p>
                </div>
              ) : (
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="file">Upload Your Submission *</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
