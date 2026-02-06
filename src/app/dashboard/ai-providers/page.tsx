/**
 * AI Providers Management Page
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Zap,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

interface AIProvider {
  id: string;
  name: string;
  type: string;
  status: string;
  priority: number;
  isDefault: boolean;
  totalRequests: number;
  totalTokensUsed: number;
  lastUsedAt: string | null;
  supportedModels: string[];
  capabilities: string[];
}

interface ProviderType {
  type: string;
  name: string;
  description: string;
  requiresKey: boolean;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [providerTypes, setProviderTypes] = useState<ProviderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [hasAccess, setHasAccess] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
    endpoint: '',
    region: '',
    priority: 0,
  });

  // Load providers and types
  useEffect(() => {
    loadProviders();
    loadProviderTypes();
  }, []);

  const loadProviders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/ai-providers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === 'FEATURE_NOT_AVAILABLE') {
          setHasAccess(false);
          return;
        }
        throw new Error(data.error?.message || 'Failed to load providers');
      }

      setProviders(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviderTypes = async () => {
    try {
      const response = await fetch('/api/ai-providers/types');
      const data = await response.json();
      setProviderTypes(data.data || []);
    } catch (err) {
      console.error('Failed to load provider types:', err);
    }
  };

  const handleCreateProvider = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/ai-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create provider');
      }

      await loadProviders();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider');
    }
  };

  const handleUpdateProvider = async () => {
    if (!editingProvider) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/ai-providers/${editingProvider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update provider');
      }

      await loadProviders();
      setIsDialogOpen(false);
      setEditingProvider(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/ai-providers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to delete provider');
      }

      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  const handleEditClick = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: '',
      endpoint: '',
      region: '',
      priority: provider.priority,
    });
    setIsDialogOpen(true);
  };

  const handleNewProvider = () => {
    setEditingProvider(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      apiKey: '',
      endpoint: '',
      region: '',
      priority: 0,
    });
    setError('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>;
      case 'ERROR':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>;
      case 'QUOTA_EXCEEDED':
        return <Badge className="bg-yellow-500"><Zap className="w-3 h-3 mr-1" /> Quota Exceeded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading AI providers...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-muted/10">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Upgrade Required</h1>
            <p className="text-muted-foreground mb-8">
              Multiple AI Providers feature is available in Professional and Enterprise plans.
              This feature allows you to configure and use multiple AI providers for your modeling tasks.
            </p>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <CardDescription>Best for teams and small organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Multiple AI Providers
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Team Collaboration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unlimited Competitions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Email Notifications
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      All Professional Features
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      SSO Integration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      API Access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      On-Premise Deployment
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" asChild>
              <Link href="/settings/license">View Licensing Options</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Providers</h1>
            <p className="text-muted-foreground">
              Manage AI service providers for modeling, learning, and coding tasks
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewProvider}>
                <Plus className="mr-2 h-4 w-4" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProvider ? 'Edit AI Provider' : 'Add AI Provider'}
                </DialogTitle>
                <DialogDescription>
                  Configure an AI service provider for use in your modeling tasks
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My DeepSeek Account"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Provider Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerTypes.map((pt) => (
                        <SelectItem key={pt.type} value={pt.type}>
                          <div>
                            <div className="font-medium">{pt.name}</div>
                            <div className="text-xs text-muted-foreground">{pt.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Custom Endpoint (Optional)</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.example.com/v1"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region (Optional)</Label>
                  <Input
                    id="region"
                    placeholder="e.g., us-east-1"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    placeholder="0 (highest priority)"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority providers will be used first. 0 = highest.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingProvider ? handleUpdateProvider : handleCreateProvider}>
                  {editingProvider ? 'Update Provider' : 'Create Provider'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Providers List */}
        <Card>
          <CardHeader>
            <CardTitle>Your AI Providers</CardTitle>
            <CardDescription>
              Configure and manage your AI service providers. The system will automatically
              select the best provider based on task requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {providers.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AI providers configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add an AI provider to start using AI-powered features
                </p>
                <Button onClick={handleNewProvider}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Provider
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Models</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {provider.name}
                          {provider.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{provider.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(provider.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {provider.supportedModels.slice(0, 2).map((model) => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                          {provider.supportedModels.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{provider.supportedModels.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{provider.totalRequests} requests</div>
                          <div className="text-muted-foreground">
                            {provider.totalTokensUsed.toLocaleString()} tokens
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{provider.priority}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(provider)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProvider(provider.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
