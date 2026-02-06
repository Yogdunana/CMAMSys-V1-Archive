'use client';

import Link from 'next/link';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, FileText, Settings, Database, Rocket, Shield } from 'lucide-react';

const docs = [
  {
    category: '快速开始',
    items: [
      {
        title: '安装指南',
        description: '详细的安装步骤和配置说明',
        path: '/docs/installation-guide',
        icon: Rocket,
      },
      {
        title: '部署指南',
        description: 'Docker 部署和生产环境配置',
        path: '/docs/deployment-guide',
        icon: FileText,
      },
    ],
  },
  {
    category: '数据库',
    items: [
      {
        title: 'PostgreSQL 部署',
        description: 'PostgreSQL 数据库安装和配置',
        path: '/docs/postgresql-setup',
        icon: Database,
      },
      {
        title: 'Docker PostgreSQL 部署',
        description: '使用 Docker 部署 PostgreSQL',
        path: '/docs/docker-postgres-deployment',
        icon: Database,
      },
    ],
  },
  {
    category: '功能文档',
    items: [
      {
        title: '项目总结',
        description: 'CMAMSys 项目功能概述和技术架构',
        path: '/docs/project-summary',
        icon: Book,
      },
      {
        title: 'MathModelAgent 分析',
        description: '数学建模智能体架构分析',
        path: '/docs/mathmodelagent-analysis',
        icon: FileText,
      },
      {
        title: '认证测试报告',
        description: 'JWT 认证系统测试报告',
        path: '/docs/auth-test-report',
        icon: Shield,
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">文档中心</h1>
            <p className="text-xl text-muted-foreground">
              CMAMSys 完整使用文档和技术指南
            </p>
          </div>

          <div className="mb-8 grid gap-6">
            {docs.map((category) => (
              <div key={category.category}>
                <h2 className="mb-4 text-2xl font-bold">{category.category}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.items.map((doc) => {
                    const Icon = doc.icon;
                    return (
                      <Card key={doc.title} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{doc.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {doc.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={doc.path}>
                              查看文档
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API 文档</CardTitle>
              <CardDescription>
                RESTful API 接口文档
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                CMAMSys 提供完整的 REST API，支持第三方集成。
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/competitions</code>
                  <span className="text-sm text-muted-foreground">- 获取竞赛列表</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/teams</code>
                  <span className="text-sm text-muted-foreground">- 获取团队列表</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/learning/knowledge</code>
                  <span className="text-sm text-muted-foreground">- 获取知识库</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
