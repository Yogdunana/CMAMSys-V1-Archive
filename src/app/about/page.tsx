'use client';

import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Shield, Users, Target, Code, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">About CMAMSys</h1>
            <p className="text-xl text-muted-foreground">
              CompetiMath AutoModel System - 下一代数学建模竞赛平台
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>使命与愿景</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Target className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">我们的使命</h3>
                  <p className="text-muted-foreground">
                    CMAMSys 致力于为数学建模竞赛参与者提供一站式的自动化建模平台，降低技术门槛，
                    提升建模效率，让参赛者能够专注于创新和问题解决。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Rocket className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">我们的愿景</h3>
                  <p className="text-muted-foreground">
                    成为全球领先的数学建模竞赛平台，赋能数百万学生和研究人员，
                    推动数学建模教育的发展和应用。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>核心价值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">企业级安全</h3>
                    <p className="text-sm text-muted-foreground">
                      采用业界领先的安全技术，保护用户数据和知识产权
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Code className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">自动化流水线</h3>
                    <p className="text-sm text-muted-foreground">
                      从数据处理到报告生成的全流程自动化
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">团队协作</h3>
                    <p className="text-sm text-muted-foreground">
                      支持多用户协作，提升团队效率
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Globe className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">全球支持</h3>
                    <p className="text-sm text-muted-foreground">
                      支持 MCM/ICM、CUMCM 等 10+ 国际竞赛
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>技术栈</CardTitle>
              <CardDescription>我们使用业界最前沿的技术构建平台</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">前端技术</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Next.js 16</Badge>
                    <Badge variant="secondary">React 19</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Tailwind CSS</Badge>
                    <Badge variant="secondary">shadcn/ui</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">后端技术</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Next.js API Routes</Badge>
                    <Badge variant="secondary">Prisma ORM</Badge>
                    <Badge variant="secondary">PostgreSQL</Badge>
                    <Badge variant="secondary">JWT Auth</Badge>
                    <Badge variant="secondary">Redis</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI 集成</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">DeepSeek</Badge>
                    <Badge variant="secondary">OpenAI</Badge>
                    <Badge variant="secondary">Anthropic</Badge>
                    <Badge variant="secondary">VolcEngine</Badge>
                    <Badge variant="secondary">Aliyun</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>开源与商业</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                CMAMSys 提供三个版本，满足不同用户的需求：
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Community</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    完全开源，免费使用
                  </p>
                  <Badge variant="outline">MIT License</Badge>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Professional</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    付费订阅，高级功能
                  </p>
                  <Badge variant="secondary">Commercial</Badge>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Enterprise</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    私有化部署，企业服务
                  </p>
                  <Badge variant="default">Enterprise</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
