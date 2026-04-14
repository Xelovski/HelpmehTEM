'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get submissions for this student first
        const { data: studentSubmissions } = await supabase
          .from('submissions')
          .select('id')
          .eq('student_id', user.id)

        const submissionIds = studentSubmissions?.map((s: any) => s.id) || []

        // If no submissions, skip the grades query
        if (submissionIds.length === 0) {
          setGrades([])
          setLoading(false)
          return
        }

        // Get grades for submissions
        const { data, error } = await supabase
          .from('grades')
          .select(
            `
            id,
            score,
            feedback,
            graded_at,
            submissions(
              id,
              assignment_id,
              student_id,
              assignments(
                title,
                courses(title, code)
              )
            )
          `
          )
          .in('submission_id', submissionIds)
          .order('graded_at', { ascending: false })

        if (error) throw error
        setGrades(data || [])
      } catch (error) {
        console.error('Error fetching grades:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  if (loading) {
    return <div>Loading grades...</div>
  }

  const averageScore =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length).toFixed(2)
      : '0.00'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grades</h1>
        <p className="text-muted-foreground">View your grades and feedback</p>
      </div>

      {grades.length > 0 && (
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm opacity-90">Average Grade</p>
              <p className="text-4xl font-bold">{averageScore}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {grades.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No grades yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Grades</CardTitle>
            <CardDescription>All your graded assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Graded Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      {grade.submissions?.assignments?.courses?.code} -{' '}
                      {grade.submissions?.assignments?.courses?.title}
                    </TableCell>
                    <TableCell>{grade.submissions?.assignments?.title}</TableCell>
                    <TableCell>
                      <Badge variant={grade.score >= 70 ? 'default' : 'secondary'}>
                        {grade.score}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grade.graded_at
                        ? new Date(grade.graded_at).toLocaleDateString()
                        : 'Not graded'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {grades.length > 0 && grades.some((g) => g.feedback) && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades
                .filter((g) => g.feedback)
                .map((grade) => (
                  <div key={grade.id} className="border-l-4 pl-4 py-2">
                    <p className="font-medium">{grade.submissions?.assignments?.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{grade.feedback}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
