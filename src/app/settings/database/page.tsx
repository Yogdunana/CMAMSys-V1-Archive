'use client';

/**
 * Database Configuration Page
 * 数据库配置页面（仅管理员可访问）
 */

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, RefreshCw, CheckCircle, AlertCircle, Plug } from 'lucide-react';

interface DatabaseConfig {
  type: 'sqlite' | 'postgresql';
  connectionString: string;
  isConfigured: boolean;
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

export default function DatabaseConfigPage() {
  const [config, setConfig] = useState<DatabaseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetchWithAuth('/api/settings/database');
      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Failed to load configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load database configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config) return;

    setTesting(true);
    setMessage(null);

    try {
      const response = await fetchWithAuth('/api/settings/database', {
        method: 'POST',
        body: JSON.stringify({
          ...config,
          testConnection: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const testResult = result.data.testResult;
        setMessage({
          type: 'success',
          text: `Connection successful! Latency: ${testResult.latency.toFixed(2)}ms`,
        });
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Failed to test connection' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test database connection' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetchWithAuth('/api/settings/database', {
        method: 'POST',
        body: JSON.stringify({
          ...config,
          testConnection: false,
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
      setMessage({ type: 'error', text: 'Failed to save database configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: 'sqlite' | 'postgresql') => {
    if (type === 'sqlite') {
      setConfig({
        type: 'sqlite',
        connectionString: 'file:./dev.db',
        isConfigured: true,
      });
    } else {
      setConfig({
        type: 'postgresql',
        connectionString: 'postgresql://user:password@localhost:5432/database',
        isConfigured: true,
      });
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
        <AlertDescription>Failed to load database configuration</AlertDescription>
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
              <h1 className="text-3xl font-bold tracking-tight">Database Configuration</h1>
              <p className="text-muted-foreground mt-2">
                Configure database connection settings
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Configure your database connection settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="dbType">Database Type</Label>
            <Select
              value={config.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="dbType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sqlite">SQLite</SelectItem>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {config.type === 'sqlite'
                ? 'SQLite is recommended for development and testing. It requires no server setup.'
                : 'PostgreSQL is recommended for production environments.'}
            </p>
          </div>

          {config.type === 'sqlite' && (
            <div className="grid gap-2">
              <Label htmlFor="sqlitePath">Database File Path</Label>
              <Input
                id="sqlitePath"
                value={config.connectionString.replace('file:', '')}
                onChange={(e) =>
                  setConfig({ ...config, connectionString: `file:${e.target.value}` })
                }
                placeholder="./dev.db"
              />
              <p className="text-sm text-muted-foreground">
                Relative or absolute path to the SQLite database file
              </p>
            </div>
          )}

          {config.type === 'postgresql' && (
            <div className="grid gap-2">
              <Label htmlFor="postgresUrl">Connection String</Label>
              <Input
                id="postgresUrl"
                value={config.connectionString}
                onChange={(e) =>
                  setConfig({ ...config, connectionString: e.target.value })
                }
                placeholder="postgresql://user:password@localhost:5432/database"
              />
              <p className="text-sm text-muted-foreground">
                PostgreSQL connection URL
              </p>

              <div className="bg-muted p-4 rounded-md mt-2">
                <h4 className="font-semibold mb-2 text-sm">Connection String Format:</h4>
                <code className="text-xs">
                  postgresql://[user]:[password]@[host]:[port]/[database]
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Example: postgresql://postgres:password@localhost:5432/cmamsys
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Plug className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
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
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> After changing the database configuration, you need to restart the
          service for the changes to take effect. Run{' '}
          <code className="bg-muted px-1 py-0.5 rounded">pnpm run start</code> to restart the
          service.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Migration Instructions</CardTitle>
          <CardDescription>
            How to migrate data between databases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>SQLite to PostgreSQL:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Backup your SQLite database</li>
            <li>Update the database configuration to PostgreSQL</li>
            <li>Restart the service</li>
            <li>Run <code className="bg-muted px-1 py-0.5 rounded">pnpm prisma migrate deploy</code></li>
            <li>Import your data using a database migration tool</li>
          </ol>
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
