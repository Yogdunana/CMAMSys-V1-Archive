/**
 * Dashboard Page
 * Main dashboard for authenticated users
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Database,
  FileText,
  Plus,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">CMAMSys</h1>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's an overview of your mathematical modeling activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">+1 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Competitions</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Total participated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Models Trained</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+5 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Learning items stored</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">Modeling Tasks</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Your latest modeling tasks and their status
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/competitions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">MCM 2025 Problem A</CardTitle>
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                      Completed
                    </span>
                  </div>
                  <CardDescription>
                    Electricity price forecasting using XGBoost
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">CUMCM 2024 Problem B</CardTitle>
                    <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                      In Progress
                    </span>
                  </div>
                  <CardDescription>
                    Urban traffic flow optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: '67%' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Shenzhen Cup 2025</CardTitle>
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                      Processing
                    </span>
                  </div>
                  <CardDescription>
                    Data preprocessing and feature engineering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">Preprocessing</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Started</span>
                      <span className="font-medium">5 minutes ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Competitions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your competition history and projects
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/competitions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Competition
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-4">
                <p className="text-center text-muted-foreground">
                  No competitions yet. Create your first one!
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Learning Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Track your knowledge base growth
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Learning Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">XGBoost for Time Series Forecasting</p>
                      <p className="text-sm text-muted-foreground">
                        Learned from Bilibili • 32 minutes
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">MCM 2024 Award-Winning Papers Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded PDF • 45 minutes
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">1d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Team Members</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your team collaboration
                </p>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>
                  3 members in your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      Y
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">You (Team Lead)</p>
                      <p className="text-sm text-muted-foreground">
                        admin@example.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold">
                      A
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Alice Chen</p>
                      <p className="text-sm text-muted-foreground">
                        alice@example.com
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Member
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold">
                      B
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Bob Wang</p>
                      <p className="text-sm text-muted-foreground">
                        bob@example.com
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Member
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
