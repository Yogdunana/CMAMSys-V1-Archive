import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inspector } from 'react-dev-inspector';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CMAMSys - 数学建模自动化系统',
    template: '%s | CMAMSys',
  },
  description:
    'CompetiMath AutoModel System - 企业级数学建模竞赛平台，支持从数据预处理到报告生成的全流程自动化。支持 MCM/ICM/CUMCM 等多种竞赛类型。',
  keywords: [
    'CMAMSys',
    '数学建模',
    'MCM',
    'ICM',
    'CUMCM',
    '数学建模竞赛',
    '自动化建模',
    'AI 模型',
    '机器学习',
    '数据分析',
    '团队协作',
  ],
  authors: [{ name: 'CMAMSys Team', url: 'https://cmamsys.com' }],
  generator: 'CMAMSys',
  openGraph: {
    title: 'CMAMSys - 企业级数学建模竞赛平台',
    description:
      'CompetiMath AutoModel System - 从数据预处理到报告生成的全流程自动化',
    url: 'https://cmamsys.com',
    siteName: 'CMAMSys',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {isDev && <Inspector />}
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
