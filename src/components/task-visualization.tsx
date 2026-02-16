'use client';

import { TaskWithDependencies } from '@/services/task-dependencies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaskVisualizationProps {
  tasks: TaskWithDependencies[];
}

export function TaskVisualization({ tasks }: TaskVisualizationProps) {
  // 计算统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 任务状态数据
  const statusData = [
    { name: '已完成', value: completedTasks, color: '#22c55e' },
    { name: '进行中', value: inProgressTasks, color: '#3b82f6' },
    { name: '待开始', value: pendingTasks, color: '#6b7280' },
  ].filter(d => d.value > 0);

  // 每个任务的依赖数量
  const dependencyData = tasks.map(task => ({
    name: `任务 ${task.id}`,
    dependencies: task.dependencies.length,
    status: task.status,
  }));

  // 任务复杂度（基于依赖数量）
  const complexityData = [
    { name: '简单', value: tasks.filter(t => t.dependencies.length === 0).length },
    { name: '中等', value: tasks.filter(t => t.dependencies.length > 0 && t.dependencies.length <= 2).length },
    { name: '复杂', value: tasks.filter(t => t.dependencies.length > 2).length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* 进度概览 */}
      <Card>
        <CardHeader>
          <CardTitle>任务进度概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">总体进度</span>
                <span className="text-sm text-muted-foreground">
                  {completedTasks}/{totalTasks} 已完成 ({Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">已完成</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">进行中</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{pendingTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">待开始</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 任务状态分布 */}
      <Card>
        <CardHeader>
          <CardTitle>任务状态分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 依赖关系分析 */}
      <Card>
        <CardHeader>
          <CardTitle>任务依赖分析</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dependencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dependencies" name="依赖数量" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 任务复杂度分布 */}
      <Card>
        <CardHeader>
          <CardTitle>任务复杂度分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={complexityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {complexityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#22c55e', '#eab308', '#ef4444'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 关键指标 */}
      <Card>
        <CardHeader>
          <CardTitle>关键指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">平均依赖数</div>
              <div className="text-2xl font-bold">
                {(dependencyData.reduce((sum, d) => sum + d.dependencies, 0) / totalTasks).toFixed(1)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">最大依赖数</div>
              <div className="text-2xl font-bold">
                {Math.max(...dependencyData.map(d => d.dependencies))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">无依赖任务</div>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.dependencies.length === 0).length}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">高依赖任务</div>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.dependencies.length > 2).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
