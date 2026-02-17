'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Trophy, Users, Settings, Activity, BookOpen, Sliders, LogIn, Bot, Database, Shield, FileText, BarChart3, Settings2, Code2 } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';

// 公共导航项（所有用户可见）
const publicNavItems = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/dashboard/competitions', label: '竞赛', icon: Trophy },
  { href: '/dashboard/auto-modeling', label: '自动化建模', icon: Bot },
  { href: '/dashboard/ai-providers', label: 'AI Provider', icon: Activity },
  { href: '/learning/knowledge', label: '知识库', icon: BookOpen },
  { href: '/learning/settings', label: '学习配置', icon: Sliders },
  { href: '/docs', label: 'API 文档', icon: FileText },
];

// 管理员导航项（仅管理员可见）
const adminNavItems = [
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/logs', label: '系统日志', icon: BarChart3 },
  { href: '/settings/system', label: '系统设置', icon: Settings2 },
  { href: '/settings/database', label: '数据库管理', icon: Database },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const allNavItems = isAdmin ? [...publicNavItems, ...adminNavItems] : publicNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center">
        <div className="mr-8 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <img
              src="/logo.svg"
              alt="CMAMSys"
              className="h-8 w-auto object-contain dark:invert"
            />
            <span className="hidden font-bold sm:inline-block">
              CMAMSys
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 transition-colors hover:text-foreground/80',
                    isActive ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search component could be added here */}
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                登录
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
