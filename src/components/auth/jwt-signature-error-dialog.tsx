'use client';

import { useEffect } from 'react';
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

export function JWTSignatureErrorDialog({
  isOpen,
  onLogout,
}: {
  isOpen: boolean;
  onLogout: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>登录已失效</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="text-base">
            <div className="space-y-2">
              <p>
                您的登录信息已过期，这通常是因为：
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>系统密钥已更新</li>
                <li>登录凭证过期</li>
                <li>环境发生变更</li>
              </ul>
              <p className="pt-2">
                请退出登录后重新登录以继续使用系统。
              </p>
            </div>
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button onClick={onLogout} className="w-full sm:w-auto">
            退出登录并重新登录
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to detect JWT signature errors and show dialog
 */
export function useJWTSignatureErrorHandler() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Listen for custom event indicating JWT signature error
    const handleJWTSignatureError = () => {
      setShowDialog(true);
    };

    window.addEventListener('jwt-signature-error', handleJWTSignatureError);

    return () => {
      window.removeEventListener('jwt-signature-error', handleJWTSignatureError);
    };
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Close dialog
    setShowDialog(false);
    
    // Reload page
    window.location.href = '/auth/login';
  };

  return {
    showDialog,
    JWTSignatureErrorDialog: () => (
      <JWTSignatureErrorDialog
        isOpen={showDialog}
        onLogout={handleLogout}
      />
    ),
  };
}

// Add useState import
import { useState } from 'react';
