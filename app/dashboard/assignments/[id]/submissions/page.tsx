'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'

export default function SubmissionsPage() {
  const params = useParams()
  const assignmentId = params.id as string
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [gradingScore, setGradingScore] = useState('')
  const [gradingFeedback, setGradingFeedback] = useState('')
  const [gradingLoading, setGradingLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // Get assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*, courses(title, code)')
          .eq('id', assignmentId)
          .single()

        if (assignmentError) throw assignmentError
        setAssignment(assignmentData)

        // Get all submissions for this assignment
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*, grades(*), profiles:student_id(full_name, email)')
          .eq('assignment_id', assignmentId)
          .order('submitted_at', { ascending: false })

        if (submissionsError) throw submissionsError
        setSubmissions(submissionsData || [])
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (assignmentId) {
      fetchSubmissions()
    }
  }, [assignmentId])

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission) return

    setGradingLoading(true)

    try {
      const score = parseFloat(gradingScore)
      if (isNaN(score) || score < 0 || score > 100) {
        alert('Score must be between 0 and 100')
        return
      }

      const gradeId = selectedSubmission.grades?.[0]?.id

      if (gradeId) {
        // Update existing grade
        const { error } = await supabase
          .from('grades')
          .update({
            score,
            feedback: gradingFeedback,
            graded_at: new Date().toISOString(),
          })
          .eq('id', gradeId)

        if (error) throw error
      } else {
        // Create new grade
        const { error } = await supabase.from('grades').insert({
          submission_id: selectedSubmission.id,
          score,
          feedback: gradingFeedback,
          graded_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      // Refresh submissions
      const { data: updatedSubmissions } = await supabase
        .from('submissions')
        .select('*, grades(*), profiles:student_id(full_name, email)')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })

      setSubmissions(updatedSubmissions || [])
      setSelectedSubmission(null)
      setGradingScore('')
      setGradingFeedback('')
    } catch (error) {
      console.error('Error saving grade:', error)
      alert('Error saving grade')
    } finally {
      setGradingLoading(false)
    }
  }

  if (loading) {
    return <div>Loading submissions...</div>
  }

  if (!assignment) {
    return <div>Assignment not found</div>
  }

  const selectedGrade = selectedSubmission?.grades?.[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Submissions</h1>
        <p className="text-muted-foreground">{assignment.title}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Submissions</p>
            <p className="text-3xl font-bold">{submissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Graded</p>
            <p className="text-3xl font-bold">{submissions.filter(s => s.grades?.length > 0).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold">{submissions.filter(s => !s.grades?.length).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id} className={selectedSubmission?.id === submission.id ? 'bg-muted' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{submission.profiles?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{submission.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {submission.grades?.[0]?.score ? (
                            <span className="font-medium">{submission.grades[0].score}%</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {submission.file_path && (
                              <a href={`/api/file?pathname=${encodeURIComponent(submission.file_path)}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant={selectedSubmission?.id === submission.id ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                setGradingScore(submission.grades?.[0]?.score?.toString() || '')
                                setGradingFeedback(submission.grades?.[0]?.feedback || '')
                              }}
                            >
                              Grade
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grading Panel */}
        {selectedSubmission && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedSubmission.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.profiles?.email}</p>
                </div>

                <form onSubmit={handleGradeSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="score">Score (0-100) *</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      required
                      value={gradingScore}
                      onChange={(e) => setGradingScore(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Write feedback for the student..."
                      value={gradingFeedback}
                      onChange={(e) => setGradingFeedback(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={gradingLoading}>
                    {gradingLoading ? 'Saving...' : 'Save Grade'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedSubmission(null)
                      setGradingScore('')
                      setGradingFeedback('')
                    }}
                  >
                    Close
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
