'use client';

/**
 * System Settings Page
 * 系统设置页面（仅管理员可访问）
 */

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Database, Shield, Bell, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SystemConfig {
  appName: string;
  appUrl: string;
  port: string;
  nodeEnv: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  mfaEnabled: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  logLevel: string;
  bcryptRounds: number;
  databaseType: string;
}

// Helper function to fetch with authentication
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('accessToken');
  const csrfToken = localStorage.getItem('csrfToken');

  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...options, headers });
}

export default function SystemSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetchWithAuth('/api/settings/system');
      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Failed to load configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load system configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetchWithAuth('/api/settings/system', {
        method: 'PUT',
        body: JSON.stringify({
          appName: config.appName,
          appUrl: config.appUrl,
          jwtAccessExpiry: config.jwtAccessExpiry,
          jwtRefreshExpiry: config.jwtRefreshExpiry,
          mfaEnabled: config.mfaEnabled,
          maxLoginAttempts: config.maxLoginAttempts,
          lockoutDuration: config.lockoutDuration,
          logLevel: config.logLevel,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `${result.data.message}. Please restart the service to apply changes.`,
        });
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save system configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load system configuration</AlertDescription>
      </Alert>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage system-wide configuration and settings
              </p>
            </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure general application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input
              id="appName"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="appUrl">Application URL</Label>
            <Input
              id="appUrl"
              type="url"
              value={config.appUrl}
              onChange={(e) => setConfig({ ...config, appUrl: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logLevel">Log Level</Label>
            <Select
              value={config.logLevel}
              onValueChange={(value) => setConfig({ ...config, logLevel: value })}
            >
              <SelectTrigger id="logLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Multi-Factor Authentication (MFA)</Label>
              <p className="text-sm text-muted-foreground">
                Enable MFA for additional security
              </p>
            </div>
            <Switch
              checked={config.mfaEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, mfaEnabled: checked })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              min="1"
              max="10"
              value={config.maxLoginAttempts}
              onChange={(e) =>
                setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) })
              }
            />
            <p className="text-sm text-muted-foreground">
              Number of failed login attempts before account lockout
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lockoutDuration">Lockout Duration (ms)</Label>
            <Input
              id="lockoutDuration"
              type="number"
              min="60000"
              max="3600000"
              value={config.lockoutDuration}
              onChange={(e) =>
                setConfig({ ...config, lockoutDuration: parseInt(e.target.value) })
              }
            />
            <p className="text-sm text-muted-foreground">
              Duration of account lockout in milliseconds
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jwtAccessExpiry">JWT Access Token Expiry</Label>
            <Input
              id="jwtAccessExpiry"
              value={config.jwtAccessExpiry}
              onChange={(e) => setConfig({ ...config, jwtAccessExpiry: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jwtRefreshExpiry">JWT Refresh Token Expiry</Label>
            <Input
              id="jwtRefreshExpiry"
              value={config.jwtRefreshExpiry}
              onChange={(e) => setConfig({ ...config, jwtRefreshExpiry: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Information
          </CardTitle>
          <CardDescription>
            Current database configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Database Type</p>
              <p className="text-sm text-muted-foreground">{config.databaseType}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Environment</p>
              <p className="text-sm text-muted-foreground">{config.nodeEnv}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Port</p>
              <p className="text-sm text-muted-foreground">{config.port}</p>
            </div>
            <div>
              <p className="text-sm font-medium">BCrypt Rounds</p>
              <p className="text-sm text-muted-foreground">{config.bcryptRounds}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href="/settings/database">Configure Database</a>
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadConfig}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
