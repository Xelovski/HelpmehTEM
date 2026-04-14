'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalProfessors: 0,
    totalAdmins: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalEnrollments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await res.json()
        
        setStats({
          totalUsers: data.stats.totalUsers,
          totalStudents: data.stats.totalStudents,
          totalProfessors: data.stats.totalProfessors,
          totalAdmins: data.stats.totalAdmins,
          totalCourses: data.stats.totalCourses,
          totalAssignments: data.stats.totalAssignments,
          totalEnrollments: data.stats.totalEnrollments,
        })
        
        setRecentUsers(data.recentUsers || [])
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ icon: Icon, label, value, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>
  )

  if (loading) {
    return <div className="p-8">Loading overview...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading dashboard: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">System overview and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          trend={`${stats.totalStudents} students, ${stats.totalProfessors} professors`}
        />
        <StatCard
          icon={Users}
          label="Students"
          value={stats.totalStudents}
          trend="Enrolled learners"
        />
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={stats.totalCourses}
          trend={`${stats.totalEnrollments} total enrollments`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Assignments"
          value={stats.totalAssignments}
          trend="Active & completed"
        />
        <StatCard
          icon={AlertCircle}
          label="Professors"
          value={stats.totalProfessors}
          trend="Teaching & content creators"
        />
        <StatCard
          icon={ShieldCheck}
          label="Administrators"
          value={stats.totalAdmins}
          trend="System managers"
        />
      </div>

      {/* Recent Users */}
      {recentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>Latest users who joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current platform status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Database Status</p>
              <p className="text-sm text-muted-foreground">Connected to Supabase</p>
            </div>
            <Badge variant="default" className="bg-green-600">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">File Storage</p>
              <p className="text-sm text-muted-foreground">Vercel Blob enabled</p>
            </div>
            <Badge variant="default" className="bg-green-600">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">Supabase Auth</p>
            </div>
            <Badge variant="default" className="bg-green-600">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Navigate to management sections</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/dashboard/admin/users" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <p className="font-medium">👥 Manage Users</p>
            <p className="text-sm text-muted-foreground">View, edit, and manage user accounts</p>
          </a>
          <a href="/dashboard/admin/courses" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <p className="font-medium">📚 Manage Courses</p>
            <p className="text-sm text-muted-foreground">Monitor courses and enrollments</p>
          </a>
          <a href="/dashboard/admin/settings" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <p className="font-medium">⚙️ System Settings</p>
            <p className="text-sm text-muted-foreground">Configure platform settings</p>
          </a>
          <a href="/dashboard" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <p className="font-medium">📊 Reports</p>
            <p className="text-sm text-muted-foreground">View system analytics and reports</p>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
