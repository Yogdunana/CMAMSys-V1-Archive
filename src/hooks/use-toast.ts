'use client';

import { useState, useEffect } from 'react';

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Render toasts to DOM
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const renderToasts = () => {
      toastContainer.innerHTML = toasts
        .map(
          (t) => `
          <div class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            t.variant === 'destructive'
              ? 'bg-destructive text-destructive-foreground border-destructive'
              : 'bg-background text-foreground border-border'
          }">
            ${t.title ? `<div class="font-semibold mb-1">${t.title}</div>` : ''}
            ${t.description ? `<div class="text-sm">${t.description}</div>` : ''}
            ${t.action ? `<div class="mt-2">${t.action}</div>` : ''}
          </div>
        `
        )
        .join('');
    };

    renderToasts();
  }, [toasts]);

  return { toast, dismiss, toasts };
}
