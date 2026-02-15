/**
 * Password Strength Indicator Component
 * 密码强度指示器组件
 */

'use client';

import { PasswordStrengthResult } from '@/lib/password-strength';
import { Progress } from '@/components/ui/progress';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface PasswordStrengthProps {
  result: PasswordStrengthResult;
  showDetails?: boolean;
}

export function PasswordStrength({ result, showDetails = false }: PasswordStrengthProps) {
  const percentage = (result.score / 4) * 100;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <StrengthIcon score={result.score} />
        <div className="flex-1">
          <Progress value={percentage} className="h-2" style={{
            '--progress-background': result.color
          } as React.CSSProperties} />
        </div>
        <span className="text-sm font-medium" style={{ color: result.color }}>
          {result.label}
        </span>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2">
          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="text-sm text-red-500 space-y-1">
              <p className="font-medium">Please fix the following:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Crack Time Estimate */}
          {result.isValid && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Estimated crack time: </span>
              <span>{estimateCrackTime(result.score)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StrengthIcon({ score }: { score: number }) {
  switch (score) {
    case 0:
    case 1:
      return <ShieldX className="h-4 w-4 text-red-500" />;
    case 2:
      return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
    case 3:
    case 4:
      return <ShieldCheck className="h-4 w-4 text-green-500" />;
    default:
      return <Shield className="h-4 w-4 text-gray-500" />;
  }
}

function estimateCrackTime(score: number): string {
  const estimates = {
    0: 'Instantly',
    1: 'Less than a minute',
    2: 'A few minutes to hours',
    3: 'Weeks to years',
    4: 'Centuries to never',
  };

  return estimates[score as keyof typeof estimates] || 'Unknown';
}
