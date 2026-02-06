'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Trophy, Users, Settings, Activity, BookOpen, Sliders } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/dashboard/competitions', label: '竞赛', icon: Trophy },
  { href: '/dashboard/teams', label: '团队', icon: Users },
  { href: '/dashboard/ai-providers', label: 'AI Provider', icon: Activity },
  { href: '/learning/knowledge', label: '知识库', icon: BookOpen },
  { href: '/learning/settings', label: '学习配置', icon: Sliders },
  { href: '/settings', label: '设置', icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center">
        <div className="mr-8 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Activity className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              CMAMSys
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => {
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
            {/* User menu could be added here */}
          </nav>
        </div>
      </div>
    </header>
  );
}
