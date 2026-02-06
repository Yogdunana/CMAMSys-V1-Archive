'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function DocPage({ params }: { params: { slug: string } }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadDoc() {
      try {
        setLoading(true);
        const response = await fetch(`/docs/${params.slug}.md`);
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
  }, [params.slug]);

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
            <div className="p-8 prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => <h1 className="text-4xl font-bold mb-6">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-xl font-semibold mt-4 mb-2">{children}</h4>,
                  p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:underline flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ),
                  code: ({ inline, className, children }: any) => {
                    if (inline) {
                      return (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={className}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-6">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                  th: ({ children }) => (
                    <th className="border px-4 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border px-4 py-2">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
