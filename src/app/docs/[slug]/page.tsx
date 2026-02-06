'use client';

import { useEffect, useState, use } from 'react';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadDoc() {
      try {
        setLoading(true);
        const response = await fetch(`/docs/${slug}.md`);
        if (!response.ok) {
          throw new Error('文档未找到');
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载文档失败');
      } finally {
        setLoading(false);
      }
    }

    loadDoc();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-12">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/docs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回文档中心
              </Link>
            </Button>
            <Card className="p-8">
              <h1 className="text-2xl font-bold text-destructive mb-2">错误</h1>
              <p className="text-muted-foreground">{error}</p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/docs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回文档中心
            </Link>
          </Button>

          <Card className="overflow-hidden">
            <div className="border-b px-6 py-4 bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{slug}</h2>
              </div>
            </div>
            <pre className="p-6 overflow-x-auto text-sm bg-background">
              <code>{content}</code>
            </pre>
          </Card>
        </div>
      </main>
    </div>
  );
}
