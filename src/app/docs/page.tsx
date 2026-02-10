'use client';

import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Zap, Shield, Database } from 'lucide-react';

export default function DocsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">API 文档</h1>
            <p className="text-muted-foreground">
              CMAMSys REST API 完整文档
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="authentication">认证</TabsTrigger>
              <TabsTrigger value="endpoints">API 端点</TabsTrigger>
              <TabsTrigger value="examples">示例</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      API 概览
                    </CardTitle>
                    <CardDescription>
                      CMAMSys 提供 RESTful API 接口，支持建模任务管理、AI Provider 集成、自动化建模等功能。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">基础 URL</h3>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        https://api.cmamsys.com/api/v1
                      </code>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">版本</h3>
                      <p>当前版本: v1.0.0</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">支持的功能</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>用户认证和授权</li>
                        <li>建模任务管理</li>
                        <li>AI Provider 集成</li>
                        <li>自动化建模流程</li>
                        <li>竞赛和题目管理</li>
                        <li>知识库和学习</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>特性</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">CSRF 保护</h4>
                          <p className="text-sm text-muted-foreground">
                            所有写操作都需要 CSRF Token
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">速率限制</h4>
                          <p className="text-sm text-muted-foreground">
                            防止 API 滥用和攻击
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">分页支持</h4>
                          <p className="text-sm text-muted-foreground">
                            列表接口支持分页查询
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">版本控制</h4>
                          <p className="text-sm text-muted-foreground">
                            支持多版本 API 并存
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="authentication" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>认证方式</CardTitle>
                  <CardDescription>
                    API 使用 Bearer Token 进行身份验证
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">获取 Token</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <p><strong>请求:</strong></p>
                      <pre className="bg-background p-2 rounded">
{`POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}`}
                      </pre>
                      <p><strong>响应:</strong></p>
                      <pre className="bg-background p-2 rounded">
{`{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "username"
    }
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">使用 Token</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <pre className="bg-background p-2 rounded">
{`GET /api/v1/dashboard/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">刷新 Token</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                      <pre className="bg-background p-2 rounded">
{`POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="mt-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>认证 API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="font-mono font-semibold">POST /api/v1/auth/login</p>
                        <p className="text-muted-foreground">用户登录</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="font-mono font-semibold">POST /api/v1/auth/register</p>
                        <p className="text-muted-foreground">用户注册</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="font-mono font-semibold">POST /api/v1/auth/logout</p>
                        <p className="text-muted-foreground">用户登出</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="font-mono font-semibold">POST /api/v1/auth/refresh</p>
                        <p className="text-muted-foreground">刷新令牌</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="font-mono font-semibold">GET /api/v1/auth/csrf-token</p>
                        <p className="text-muted-foreground">获取 CSRF Token</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>建模任务 API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="font-mono font-semibold">GET /api/v1/modeling-tasks</p>
                        <p className="text-muted-foreground">获取任务列表（支持分页）</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="font-mono font-semibold">POST /api/v1/modeling-tasks</p>
                        <p className="text-muted-foreground">创建任务</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="font-mono font-semibold">GET /api/v1/modeling-tasks/[id]</p>
                        <p className="text-muted-foreground">获取任务详情</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-3">
                        <p className="font-mono font-semibold">PATCH /api/v1/modeling-tasks/[id]</p>
                        <p className="text-muted-foreground">更新任务</p>
                      </div>
                      <div className="border-l-4 border-red-500 pl-3">
                        <p className="font-mono font-semibold">DELETE /api/v1/modeling-tasks/[id]</p>
                        <p className="text-muted-foreground">删除任务</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>仪表盘 API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="font-mono font-semibold">GET /api/v1/dashboard/stats</p>
                        <p className="text-muted-foreground">获取统计数据</p>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="font-mono font-semibold">GET /api/v1/dashboard/activities</p>
                        <p className="text-muted-foreground">获取最近活动</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Provider API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-blue-500 pl-3">
                        <p className="font-mono font-semibold">GET /api/v1/ai-providers</p>
                        <p className="text-muted-foreground">获取 Provider 列表</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>自动化建模 API</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="border-l-4 border-green-500 pl-3">
                        <p className="font-mono font-semibold">POST /api/v1/auto-modeling/start</p>
                        <p className="text-muted-foreground">启动全自动化建模流程</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript 示例</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// 使用 API 客户端
import api from '@/lib/api-service';

// 获取仪表盘统计
const result = await api.dashboard.getStats();
if (result.success) {
  console.log(result.data);
}

// 创建建模任务
const task = await api.modelingTasks.create({
  name: '新任务',
  description: '任务描述',
  problemType: 'EVALUATION',
});`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>cURL 示例</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`# 获取仪表盘统计
curl -X GET http://localhost:5000/api/v1/dashboard/stats \\
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建建模任务
curl -X POST http://localhost:5000/api/v1/modeling-tasks \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \\
  -d '{
    "name": "新任务",
    "description": "任务描述",
    "problemType": "EVALUATION"
  }'`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
