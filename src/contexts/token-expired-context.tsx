'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { TokenExpiredDialog } from '@/components/auth/token-expired-dialog';

type TokenExpiredReason = 'unauthorized' | 'expired' | 'invalid' | 'invalid_signature';

interface TokenExpiredContextType {
  showTokenExpired: (reason?: TokenExpiredReason) => void;
  hideTokenExpired: () => void;
}

const TokenExpiredContext = createContext<TokenExpiredContextType | undefined>(undefined);

export function TokenExpiredProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<TokenExpiredReason>('unauthorized');

  const showTokenExpired = useCallback((newReason?: TokenExpiredReason) => {
    setReason(newReason || 'unauthorized');
    setOpen(true);
  }, []);

  const hideTokenExpired = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <TokenExpiredContext.Provider value={{ showTokenExpired, hideTokenExpired }}>
      {children}
      <TokenExpiredDialog open={open} onOpenChange={setOpen} reason={reason} />
    </TokenExpiredContext.Provider>
  );
}

export function useTokenExpired() {
  const context = useContext(TokenExpiredContext);
  if (context === undefined) {
    throw new Error('useTokenExpired must be used within a TokenExpiredProvider');
  }
  return context;
}