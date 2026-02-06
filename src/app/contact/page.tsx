'use client';

import { useState } from 'react';
import { Header } from '@/components/shared/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageCircle, Github, Send } from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // TODO: 实现真实的联系表单提交
    setTimeout(() => {
      toast({
        title: '消息已发送',
        description: '我们会尽快回复您',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">联系我们</h1>
            <p className="text-xl text-muted-foreground">
              有任何问题或建议？我们随时为您提供帮助
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>联系方式</CardTitle>
                <CardDescription>
                  通过以下方式与我们取得联系
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">邮箱</p>
                    <p className="text-sm text-muted-foreground">support@cmamsys.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Github className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">GitHub</p>
                    <a
                      href="https://github.com/your-org/cmamsys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      github.com/your-org/cmamsys
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Discord</p>
                    <p className="text-sm text-muted-foreground">加入我们的 Discord 社区</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>发送消息</CardTitle>
                <CardDescription>
                  填写表单，我们会尽快回复您
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名 *</Label>
                    <Input id="name" placeholder="您的姓名" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">主题 *</Label>
                    <Input id="subject" placeholder="消息主题" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">消息 *</Label>
                    <Textarea
                      id="message"
                      placeholder="请输入您的消息内容..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '发送中...' : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        发送消息
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">CMAMSys 是免费的吗？</h4>
                <p className="text-sm text-muted-foreground">
                  CMAMSys 提供 Community 版本，完全开源免费使用。Professional 和 Enterprise 版本需要付费订阅，
                  提供更多高级功能和企业级支持。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">如何获得技术支持？</h4>
                <p className="text-sm text-muted-foreground">
                  您可以通过 GitHub Issues 提交问题，或发送邮件到 support@cmamsys.com。
                  企业用户可以享受专属的技术支持服务。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">支持私有化部署吗？</h4>
                <p className="text-sm text-muted-foreground">
                  是的，Enterprise 版本支持私有化部署，可以部署到您的自有服务器或 NAS 上，
                  数据完全自主可控。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
