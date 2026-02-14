'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TokenExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'unauthorized' | 'expired' | 'invalid';
}

export function TokenExpiredDialog({
  open,
  onOpenChange,
  reason = 'unauthorized',
}: TokenExpiredDialogProps) {
  const router = useRouter();

  const handleGoToLogin = () => {
    // 清除本地存储的 token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 跳转到登录页面
    router.push('/auth/login');
    
    // 关闭弹窗
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (reason) {
      case 'expired':
        return '登录已过期';
      case 'invalid':
        return '登录无效';
      default:
        return '未登录';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'expired':
        return '您的登录已过期，请重新登录以继续操作。';
      case 'invalid':
        return '您的登录状态无效，请重新登录以继续操作。';
      default:
        return '您当前未登录，请先登录以访问此功能。';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleGoToLogin} className="w-full sm:w-auto">
            前往登录
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
