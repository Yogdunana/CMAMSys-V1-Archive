'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { Search, Download, Filter, RefreshCw } from 'lucide-react';

interface LearningLog {
  id: string;
  action: string;
  taskType: string | null;
  videoId: string | null;
  videoTitle: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const LOG_STATUS_COLORS: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const ACTION_ICONS: Record<string, string> = {
  TASK_COMPLETED: '✓',
  VIDEO_WATCHED: '▶',
  CODE_SUBMITTED: '💻',
  MODELING_STARTED: '🔬',
  MODELING_COMPLETED: '📊',
  REPORT_GENERATED: '📄',
  LOGIN: '🔑',
  LOGOUT: '🚪',
};

export default function LearningLogsPage() {
  const t = useTranslations('learningLogs');
  const { user } = useAuth();
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/learning-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch learning logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.taskType && log.taskType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.videoTitle && log.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesAction && matchesStatus;
  });

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/learning-logs/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learning-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));
  const uniqueStatuses = Array.from(new Set(logs.map((log) => log.status)));

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">{t('description')}</p>
          </div>
          <Button onClick={fetchLogs} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="min-w-[180px]">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAction')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allActions')}</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {ACTION_ICONS[action] || '📌'} {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatuses')}</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={exportLogs} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t('export')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('activityHistory')}</CardTitle>
            <CardDescription>
              {t('totalRecords', { count: filteredLogs.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('noRecords')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">{t('action')}</TableHead>
                      <TableHead className="w-[250px]">{t('message')}</TableHead>
                      <TableHead className="w-[150px]">{t('taskType')}</TableHead>
                      <TableHead className="w-[200px]">{t('details')}</TableHead>
                      <TableHead className="w-[120px]">{t('status')}</TableHead>
                      <TableHead className="w-[180px]">{t('timestamp')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {ACTION_ICONS[log.action] || '📌'}
                            </span>
                            <span className="font-medium">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          {log.taskType ? (
                            <Badge variant="outline">{log.taskType}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.videoTitle || log.videoId || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={LOG_STATUS_COLORS[log.status] || LOG_STATUS_COLORS.info}
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
