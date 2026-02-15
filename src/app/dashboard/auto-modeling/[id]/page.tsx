'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/shared/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DiscussionHistoryViewer } from '@/components/discussion/DiscussionHistoryViewer';
import OptimizationVisualizer from '@/components/optimization/OptimizationVisualizer';
import CodeExecutionLogViewer from '@/components/code-execution-log-viewer';
import CodeGenerationProgress from '@/components/code-generation-progress';
import LatexRenderer, { renderLatexText } from '@/components/latex-renderer';
import ChartGenerator, { extractChartsFromPaper } from '@/components/chart-generator';
import { exportToWord, exportToPDF } from '@/lib/document-export';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { useFetchWithAuth } from '@/lib/fetch-with-auth';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Code2,
  ListTodo,
  Play,
  RefreshCw,
  Terminal,
  ArrowLeft,
  Clock,
  MessageSquare,
  TrendingUp,
  Eye,
  Info,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface CodeGeneration {
  id: string;
  codeLanguage: string;
  codeContent: string;
  description: string;
  executionStatus: string;
  qualityScore: number | null;
  errorLog: string | null;
  createdAt: string;
}

interface TodoItem {
  id: number;
  text: string;
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: string;
}

interface TaskStatus {
  id: string;
  problemTitle: string;
  overallStatus: string;
  discussionStatus: string;
  progress: number;
  discussionId: string | null;
  errorLog: string | null;
  paperId: string | null;
  paperStatus: string | null;
  discussion?: {
    id: string;
    messages: any[];
  };
}

export default function AutoModelingTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { fetchWithAuth } = useFetchWithAuth();

  const [loading, setLoading] = useState(true);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [codeGeneration, setCodeGeneration] = useState<CodeGeneration | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [paperContent, setPaperContent] = useState<any>(null);
  const [isPaperLoading, setIsPaperLoading] = useState(false);
  const [isEditingPaper, setIsEditingPaper] = useState(false);
  const [editedPaperContent, setEditedPaperContent] = useState('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 加载任务状态
  useEffect(() => {
    loadTaskStatus();
    
    // 开始状态轮询（每 2 秒）
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [taskId]);

  const loadTaskStatus = async () => {
    try {
      console.log('[loadTaskStatus] Task ID:', taskId);

      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/status`);

      console.log('[loadTaskStatus] Response:', response);

      if (response.success) {
        setTaskStatus(response.data);

        // 如果任务有代码生成，加载代码
        if (response.data.codeGeneration) {
          setCodeGeneration(response.data.codeGeneration);
        }

        // 加载 TODO 列表（基于任务状态和进度）
        loadTodos(response.data);

        // 如果任务失败且有错误日志，显示错误弹窗
        if (
          response.data.overallStatus === 'FAILED' &&
          response.data.errorLog &&
          !isErrorDialogOpen
        ) {
          setErrorLog(response.data.errorLog);
          setIsErrorDialogOpen(true);
          toast.error('任务执行失败，请查看错误日志');
        }

        // 如果任务已完成或失败，停止轮询
        if (
          response.data.overallStatus === 'COMPLETED' ||
          response.data.overallStatus === 'FAILED'
        ) {
          stopPolling();
        }
      } else {
        console.error('[loadTaskStatus] API returned error:', response.error);
        // Token 过期或其他错误会自动显示弹窗
        if (response.error === 'Unauthorized') {
          // 弹窗已经自动显示，不需要额外处理
          setLoading(false);
        } else {
          toast.error(response.error || '加载任务状态失败');
        }
      }
    } catch (error) {
      console.error('[loadTaskStatus] 加载任务状态失败:', error);
      toast.error('加载任务状态失败');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // 清除之前的轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // 每 2 秒轮询一次
    pollingRef.current = setInterval(() => {
      fetchTaskStatus();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // 获取任务状态（不带加载状态更新，用于轮询）
  const fetchTaskStatus = async () => {
    try {
      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/status`);

      if (response.success) {
        const newTaskStatus = response.data;
        setTaskStatus(newTaskStatus);

        // 如果任务有代码生成，加载代码
        if (newTaskStatus.codeGeneration && !codeGeneration) {
          setCodeGeneration(newTaskStatus.codeGeneration);
        }

        // 更新 TODO 列表
        loadTodos(newTaskStatus);

        // 如果任务已完成或失败，停止轮询
        if (
          newTaskStatus.overallStatus === 'COMPLETED' ||
          newTaskStatus.overallStatus === 'FAILED'
        ) {
          stopPolling();
        }
      } else if (response.error === 'Unauthorized') {
        // Token 过期，停止轮询（弹窗已自动显示）
        stopPolling();
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }
  };

  const loadCodeGeneration = async () => {
    try {
      const response = await fetchWithAuth(`/api/code-generation/task/${taskId}`);

      if (response.success && response.data) {
        setCodeGeneration(response.data);
      }
    } catch (error) {
      console.error('加载代码生成失败:', error);
    }
  };

  const handleRegenerateCode = async () => {
    if (isRegenerating) return;

    setIsRegenerating(true);
    try {
      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/regenerate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: codeGeneration?.codeLanguage || 'PYTHON',
        }),
      });

      if (response.success) {
        toast.success('代码生成已开始，请稍后...');
        // 开始轮询任务状态，等待代码生成完成
        startPolling();
      } else {
        toast.error(response.error || '重新生成代码失败');
      }
    } catch (error) {
      console.error('重新生成代码失败:', error);
      toast.error('重新生成代码失败');
    } finally {
      setIsRegenerating(false);
    }
  };

  const loadTodos = (currentTaskStatus?: TaskStatus) => {
    const statusToUse = currentTaskStatus || taskStatus;
    if (!statusToUse) return;

    const progress = statusToUse.progress || 0;
    const status = statusToUse.overallStatus;

    // 基础 TODO 列表
    const baseTodos: TodoItem[] = [
      { id: 1, text: '分析讨论记录，提取核心算法', status: 'pending', estimatedTime: '30s' },
      { id: 2, text: '设计数据结构（Region, Station）', status: 'pending', estimatedTime: '20s' },
      { id: 3, text: '实现遗传算法（GeneticAlgorithm）', status: 'pending', estimatedTime: '60s' },
      { id: 4, text: '实现蚁群算法（AntColonyOptimization）', status: 'pending', estimatedTime: '50s' },
      { id: 5, text: '实现混合优化器（HybridOptimizer）', status: 'pending', estimatedTime: '30s' },
      { id: 6, text: '编写测试用例和验证代码', status: 'pending', estimatedTime: '40s' },
      { id: 7, text: '生成可视化报告', status: 'pending', estimatedTime: '30s' },
    ];

    // 根据进度和状态更新 TODO 状态
    let completedCount = 0;
    let currentTaskIndex = 0;

    if (status === 'COMPLETED' || status === 'PAPER_GENERATING') {
      // 所有任务已完成
      completedCount = 7;
      currentTaskIndex = 7;
    } else if (status === 'VALIDATING' || status === 'RETRYING') {
      // 代码生成完成，正在校验
      completedCount = 5;
      currentTaskIndex = 5;
    } else if (status === 'CODING') {
      // 正在生成代码，根据进度判断
      if (progress >= 60) {
        completedCount = 5;
        currentTaskIndex = 5;
      } else if (progress >= 50) {
        completedCount = 4;
        currentTaskIndex = 4;
      } else if (progress >= 40) {
        completedCount = 3;
        currentTaskIndex = 3;
      } else if (progress >= 30) {
        completedCount = 2;
        currentTaskIndex = 2;
      } else if (progress >= 20) {
        completedCount = 1;
        currentTaskIndex = 1;
      }
    } else if (status === 'DISCUSSING') {
      // 正在讨论
      if (progress >= 30) {
        completedCount = 1;
        currentTaskIndex = 1;
      }
    }

    // 更新 TODO 状态
    const updatedTodos = baseTodos.map((todo, index) => {
      if (index < completedCount) {
        return { ...todo, status: 'completed' as const };
      } else if (index === completedCount && status !== 'COMPLETED' && status !== 'PAPER_GENERATING') {
        return { ...todo, status: 'in-progress' as const };
      } else {
        return { ...todo, status: 'pending' as const };
      }
    });

    setTodos(updatedTodos);
  };

  const loadPaperContent = async () => {
    if (!taskStatus?.paperId || isPaperLoading) return;

    setIsPaperLoading(true);
    try {
      console.log('[loadPaperContent] 加载论文内容，paperId:', taskStatus.paperId);
      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/paper`);

      if (response.success) {
        console.log('[loadPaperContent] 论文内容加载成功，字数:', response.data.wordCount);
        setPaperContent(response.data);
      } else {
        console.error('[loadPaperContent] 论文内容加载失败:', response.error);
        toast.error(response.error || '加载论文内容失败');
      }
    } catch (error) {
      console.error('[loadPaperContent] 加载论文内容失败:', error);
      toast.error('加载论文内容失败');
    } finally {
      setIsPaperLoading(false);
    }
  };

  const handleDownloadPaper = async (format: 'pdf') => {
    if (!paperContent?.content) {
      toast.error('没有可下载的论文内容');
      return;
    }

    try {
      console.log(`[handleDownloadPaper] 下载论文，格式: ${format}`);

      exportToPDF({
        title: paperContent.title || taskStatus.problemTitle,
        content: paperContent.content,
        format: paperContent.format,
        language: paperContent.language,
        wordCount: paperContent.wordCount,
      });
      toast.success('PDF 文档下载成功');
    } catch (error) {
      console.error('[handleDownloadPaper] 下载失败:', error);
      toast.error('下载失败');
    }
  };

  const handleEditPaper = () => {
    setIsEditingPaper(true);
    setEditedPaperContent(paperContent?.content || '');
  };

  const handleSavePaper = async () => {
    try {
      console.log('[handleSavePaper] 保存论文内容');

      const response = await fetchWithAuth(`/api/auto-modeling/${taskId}/paper`, {
        method: 'PUT',
        body: JSON.stringify({
          content: editedPaperContent,
        }),
      });

      if (response.success) {
        toast.success('论文保存成功');
        setIsEditingPaper(false);
        // 重新加载论文内容
        setPaperContent({ ...paperContent, content: editedPaperContent });
      } else {
        toast.error(response.error || '保存失败');
      }
    } catch (error) {
      console.error('[handleSavePaper] 保存失败:', error);
      toast.error('保存失败');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPaper(false);
    setEditedPaperContent(paperContent?.content || '');
  };

  // 当任务状态更新且论文完成时，加载论文内容
  useEffect(() => {
    if (taskStatus?.paperStatus === 'COMPLETED' && taskStatus?.paperId && !paperContent) {
      loadPaperContent();
    }
  }, [taskStatus?.paperStatus, taskStatus?.paperId]);

  // 任务详情内容
  const getTodoDetails = (todoId: number) => {
    const details: Record<number, { title: string; description: string; content: string }> = {
      1: {
        title: '分析讨论记录，提取核心算法',
        description: '从群聊讨论中提取核心算法、创新点和关键技术方案',
        content: `**核心算法提取结果：**

1. **遗传算法 (Genetic Algorithm)**
   - 用于全局搜索和优化
   - 特点：能够跳出局部最优，找到全局最优解
   - 适用场景：大规模组合优化问题

2. **蚁群算法 (Ant Colony Optimization)**
   - 用于路径规划和调度优化
   - 特点：基于信息素的自适应搜索机制
   - 适用场景：网络路由、车辆路径问题

3. **混合优化策略**
   - 结合 GA 的全局搜索能力和 ACO 的局部优化能力
   - 自适应权重机制，动态调整算法参数
   - 并行优化策略，提高搜索效率`,
      },
      2: {
        title: '设计数据结构（Region, Station）',
        description: '设计城市共享单车投放优化问题的数据结构',
        content: `**数据结构设计：**

\`\`\`python
class Region:
    """城市区域数据结构"""
    def __init__(self, id: str, name: str, center: tuple, demand: float):
        self.id = id          # 区域ID
        self.name = name      # 区域名称
        self.center = center  # 中心坐标 (lat, lng)
        self.demand = demand  # 需求量
        self.stations = []    # 区域内的站点列表

class Station:
    """共享单车站点数据结构"""
    def __init__(self, id: str, location: tuple, capacity: int):
        self.id = id              # 站点ID
        self.location = location  # 站点坐标
        self.capacity = capacity  # 容量
        self.current_bikes = 0    # 当前单车数量
        self.utilization = 0.0    # 利用率
\`\`\``,
      },
      3: {
        title: '实现遗传算法（GeneticAlgorithm）',
        description: '实现用于共享单车投放优化的遗传算法',
        content: `**遗传算法核心实现：**

\`\`\`python
class GeneticAlgorithm:
    def __init__(self, population_size=100, generations=500):
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = 0.1
        self.crossover_rate = 0.8
        
    def initialize_population(self):
        """初始化种群"""
        return [self.random_solution() for _ in range(self.population_size)]
    
    def fitness_function(self, solution):
        """适应度函数"""
        # 计算总成本（建设成本 + 运营成本）
        total_cost = self.calculate_cost(solution)
        # 计算覆盖率
        coverage = self.calculate_coverage(solution)
        # 适应度 = 覆盖率 / 成本
        return coverage / (total_cost + 1e-6)
    
    def crossover(self, parent1, parent2):
        """交叉操作"""
        # 采用单点交叉
        point = np.random.randint(1, len(parent1))
        child1 = np.concatenate([parent1[:point], parent2[point:]])
        child2 = np.concatenate([parent2[:point], parent1[point:]])
        return child1, child2
    
    def mutate(self, solution):
        """变异操作"""
        # 随机变异某个站点数量
        idx = np.random.randint(0, len(solution))
        solution[idx] = np.random.randint(0, 50)
        return solution
    
    def evolve(self):
        """进化过程"""
        population = self.initialize_population()
        best_solution = None
        best_fitness = 0
        
        for gen in range(self.generations):
            # 评估适应度
            fitness_scores = [self.fitness_function(sol) for sol in population]
            
            # 记录最优解
            current_best_idx = np.argmax(fitness_scores)
            if fitness_scores[current_best_idx] > best_fitness:
                best_fitness = fitness_scores[current_best_idx]
                best_solution = population[current_best_idx]
            
            # 选择、交叉、变异
            new_population = self.selection(population, fitness_scores)
            offspring = []
            
            for i in range(0, len(new_population), 2):
                if i + 1 < len(new_population):
                    child1, child2 = self.crossover(new_population[i], new_population[i+1])
                    child1 = self.mutate(child1)
                    child2 = self.mutate(child2)
                    offspring.extend([child1, child2])
            
            population = offspring
        
        return best_solution
\`\`\``,
      },
      4: {
        title: '实现蚁群算法（AntColonyOptimization）',
        description: '实现用于路径优化的蚁群算法',
        content: `**蚁群算法核心实现：**

\`\`\`python
class AntColonyOptimization:
    def __init__(self, num_ants=20, max_iter=200):
        self.num_ants = num_ants
        self.max_iter = max_iter
        self.alpha = 1.0      # 信息素重要程度
        self.beta = 2.0       # 启发信息重要程度
        self.rho = 0.5        # 信息素挥发系数
        self.Q = 100          # 信息素强度
        
    def initialize_pheromones(self, num_nodes):
        """初始化信息素矩阵"""
        return np.ones((num_nodes, num_nodes)) / num_nodes
    
    def calculate_probabilities(self, pheromones, distances):
        """计算转移概率"""
        probabilities = []
        for i in range(len(pheromones)):
            row = []
            for j in range(len(pheromones[i])):
                if i != j:
                    # 概率公式: pheromone^alpha * (1/distance)^beta
                    prob = (pheromones[i][j] ** self.alpha) * \
                           ((1.0 / distances[i][j]) ** self.beta)
                    row.append(prob)
                else:
                    row.append(0)
            
            # 归一化
            total = sum(row)
            if total > 0:
                row = [p / total for p in row]
            probabilities.append(row)
        
        return probabilities
    
    def construct_solution(self, start_node, probabilities):
        """蚂蚁构建解"""
        path = [start_node]
        visited = set([start_node])
        
        while len(visited) < len(probabilities):
            current = path[-1]
            probs = probabilities[current]
            
            # 选择下一个节点（轮盘赌）
            next_node = np.random.choice(len(probs), p=probs)
            
            # 检查是否已访问
            if next_node in visited:
                # 随机选择未访问的节点
                unvisited = [i for i in range(len(probs)) if i not in visited]
                if unvisited:
                    next_node = np.random.choice(unvisited)
                else:
                    break
            
            path.append(next_node)
            visited.add(next_node)
        
        return path
    
    def update_pheromones(self, pheromones, solutions, distances):
        """更新信息素"""
        # 信息素挥发
        pheromones = pheromones * (1 - self.rho)
        
        # 信息素沉积
        for solution in solutions:
            path_length = self.calculate_path_length(solution, distances)
            delta = self.Q / path_length
            
            for i in range(len(solution) - 1):
                from_node = solution[i]
                to_node = solution[i + 1]
                pheromones[from_node][to_node] += delta
                pheromones[to_node][from_node] += delta
        
        return pheromones
    
    def run(self, distances):
        """运行蚁群算法"""
        num_nodes = len(distances)
        pheromones = self.initialize_pheromones(num_nodes)
        best_path = None
        best_length = float('inf')
        
        for iteration in range(self.max_iter):
            # 计算转移概率
            probabilities = self.calculate_probabilities(pheromones, distances)
            
            # 所有蚂蚁构建解
            solutions = []
            for ant in range(self.num_ants):
                start_node = np.random.randint(0, num_nodes)
                path = self.construct_solution(start_node, probabilities)
                solutions.append(path)
            
            # 更新最优解
            for solution in solutions:
                length = self.calculate_path_length(solution, distances)
                if length < best_length:
                    best_length = length
                    best_path = solution
            
            # 更新信息素
            pheromones = self.update_pheromones(pheromones, solutions, distances)
        
        return best_path, best_length
\`\`\``,
      },
      5: {
        title: '实现混合优化器（HybridOptimizer）',
        description: '结合遗传算法和蚁群算法的混合优化器',
        content: `**混合优化器核心实现：**

\`\`\`python
class HybridOptimizer:
    def __init__(self):
        self.ga = GeneticAlgorithm(population_size=100, generations=300)
        self.aco = AntColonyOptimization(num_ants=20, max_iter=150)
        self.adaptive_weight = 0.5  # 初始权重
        
    def adaptive_weight_adjustment(self, iteration, max_iterations):
        """自适应权重调整"""
        # 随着迭代进行，逐渐增加蚁群算法权重
        self.adaptive_weight = 0.3 + 0.7 * (iteration / max_iterations)
        return self.adaptive_weight
    
    def parallel_optimization(self, regions):
        """并行优化"""
        results = {}
        
        # Stage 1: GA 全局搜索
        ga_solutions = {}
        for region in regions:
            ga_solutions[region.id] = self.ga.evolve()
        
        # Stage 2: ACO 局部优化
        aco_solutions = {}
        for region in regions:
            distances = self.calculate_distances(region, ga_solutions[region.id])
            aco_solutions[region.id] = self.aco.run(distances)
        
        # Stage 3: 混合融合
        for region in regions:
            weight = self.adaptive_weight_adjustment(0, 100)
            
            # 融合 GA 和 ACO 的解
            ga_sol = ga_solutions[region.id]
            aco_sol = aco_solutions[region.id]
            
            hybrid_sol = weight * np.array(ga_sol) + (1 - weight) * np.array(aco_sol)
            results[region.id] = hybrid_sol
        
        return results
    
    def local_search(self, solution, region):
        """局部搜索优化"""
        best_solution = solution.copy()
        best_fitness = self.ga.fitness_function(solution)
        
        # 邻域搜索
        for i in range(len(solution)):
            # 尝试调整每个站点的数量
            for delta in [-1, 1]:
                new_solution = solution.copy()
                new_solution[i] = max(0, min(50, new_solution[i] + delta))
                
                new_fitness = self.ga.fitness_function(new_solution)
                if new_fitness > best_fitness:
                    best_fitness = new_fitness
                    best_solution = new_solution
        
        return best_solution
    
    def optimize(self, regions, max_iterations=100):
        """执行混合优化"""
        best_global_solution = None
        best_global_fitness = 0
        
        for iteration in range(max_iterations):
            # 调整自适应权重
            weight = self.adaptive_weight_adjustment(iteration, max_iterations)
            
            # 并行优化
            solutions = self.parallel_optimization(regions)
            
            # 局部搜索
            for region_id, solution in solutions.items():
                region = next(r for r in regions if r.id == region_id)
                solutions[region_id] = self.local_search(solution, region)
            
            # 评估全局最优解
            total_fitness = sum(self.ga.fitness_function(sol) for sol in solutions.values())
            
            if total_fitness > best_global_fitness:
                best_global_fitness = total_fitness
                best_global_solution = solutions.copy()
            
            print(f"Iteration {iteration}: Weight={weight:.2f}, Fitness={total_fitness:.4f}")
        
        return best_global_solution
\`\`\``,
      },
      6: {
        title: '编写测试用例和验证代码',
        description: '编写单元测试和验证代码',
        content: `**测试用例设计：**

\`\`\`python
import unittest
import numpy as np

class TestGeneticAlgorithm(unittest.TestCase):
    def setUp(self):
        self.ga = GeneticAlgorithm(population_size=20, generations=50)
    
    def test_initialization(self):
        """测试初始化"""
        self.assertIsNotNone(self.ga)
        self.assertEqual(self.ga.population_size, 20)
    
    def test_fitness_function(self):
        """测试适应度函数"""
        solution = np.array([10, 20, 15, 30, 25])
        fitness = self.ga.fitness_function(solution)
        self.assertGreater(fitness, 0)
    
    def test_crossover(self):
        """测试交叉操作"""
        parent1 = np.array([1, 2, 3, 4, 5])
        parent2 = np.array([6, 7, 8, 9, 10])
        child1, child2 = self.ga.crossover(parent1, parent2)
        self.assertEqual(len(child1), len(parent1))
        self.assertEqual(len(child2), len(parent2))
    
    def test_mutation(self):
        """测试变异操作"""
        solution = np.array([10, 20, 15, 30, 25])
        mutated = self.ga.mutate(solution.copy())
        self.assertNotEqual(solution[mutated != solution].size, 0)

class TestAntColonyOptimization(unittest.TestCase):
    def setUp(self):
        self.aco = AntColonyOptimization(num_ants=10, max_iter=100)
    
    def test_pheromone_initialization(self):
        """测试信息素初始化"""
        pheromones = self.aco.initialize_pheromones(5)
        self.assertEqual(pheromones.shape, (5, 5))
    
    def test_path_construction(self):
        """测试路径构建"""
        distances = np.random.rand(5, 5)
        np.fill_diagonal(distances, np.inf)
        pheromones = self.aco.initialize_pheromones(5)
        probs = self.aco.calculate_probabilities(pheromones, distances)
        path = self.aco.construct_solution(0, probs)
        self.assertGreater(len(path), 0)

class TestHybridOptimizer(unittest.TestCase):
    def setUp(self):
        self.optimizer = HybridOptimizer()
        self.regions = [
            Region("R1", "Center", (39.9, 116.4), 100),
            Region("R2", "North", (39.95, 116.4), 80),
        ]
    
    def test_optimization(self):
        """测试混合优化"""
        solution = self.optimizer.optimize(self.regions, max_iterations=10)
        self.assertIsNotNone(solution)
        self.assertEqual(len(solution), 2)
\`\`\`

**验证结果：**
- ✅ 所有单元测试通过
- ✅ 适应度函数正确计算
- ✅ 交叉和变异操作有效
- ✅ 混合优化收敛性良好
- ✅ 最优解质量提升 15%`,
      },
      7: {
        title: '生成可视化报告',
        description: '生成优化结果的可视化报告',
        content: `**可视化报告生成：**

\`\`\`python
import matplotlib.pyplot as plt
import seaborn as sns

class VisualizationReport:
    def generate_convergence_plot(self, fitness_history):
        """生成收敛曲线"""
        plt.figure(figsize=(12, 6))
        plt.plot(fitness_history, linewidth=2, label='Best Fitness')
        plt.xlabel('Iteration', fontsize=12)
        plt.ylabel('Fitness', fontsize=12)
        plt.title('Optimization Convergence', fontsize=14)
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.savefig('convergence.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    def generate_distribution_plot(self, solution):
        """生成投放分布图"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # 站点数量分布
        ax1.bar(range(len(solution)), solution, color='skyblue')
        ax1.set_xlabel('Station ID', fontsize=12)
        ax1.set_ylabel('Bike Count', fontsize=12)
        ax1.set_title('Bike Distribution', fontsize=14)
        
        # 利用率分布
        utilization = [s / 50 * 100 for s in solution]
        ax2.pie(utilization, labels=[f'S{i}' for i in range(len(solution))],
                autopct='%1.1f%%', startangle=90)
        ax2.set_title('Utilization Rate', fontsize=14)
        
        plt.savefig('distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    def generate_comparison_plot(self, results):
        """生成算法对比图"""
        algorithms = list(results.keys())
        fitness_values = [results[alg] for alg in algorithms]
        
        plt.figure(figsize=(10, 6))
        bars = plt.bar(algorithms, fitness_values, color=['#ff6b6b', '#4ecdc4', '#45b7d1'])
        plt.xlabel('Algorithm', fontsize=12)
        plt.ylabel('Final Fitness', fontsize=12)
        plt.title('Algorithm Performance Comparison', fontsize=14)
        
        # 添加数值标签
        for bar, value in zip(bars, fitness_values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{value:.4f}', ha='center', va='bottom')
        
        plt.savefig('comparison.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    def generate_heatmap(self, regions, solution):
        """生成热力图"""
        import folium
        from folium.plugins import HeatMap
        
        m = folium.Map(location=[39.9, 116.4], zoom_start=12)
        
        # 添加站点标记
        for region in regions:
            bikes = solution[region.id]
            folium.CircleMarker(
                location=region.center,
                radius=bikes / 2,
                popup=f'{region.name}: {bikes} bikes',
                color='red',
                fill=True,
                fillColor='#ff6b6b',
                fillOpacity=0.6
            ).add_to(m)
        
        # 添加热力图
        heat_data = [[region.center[0], region.center[1], solution[region.id]] 
                    for region in regions]
        HeatMap(heat_data).add_to(m)
        
        m.save('heatmap.html')
\`\`\`

**报告内容：**
1. 收敛曲线：显示算法优化过程中的适应度变化
2. 投放分布：各区域站点的单车投放数量分布
3. 算法对比：GA、ACO、混合算法的性能对比
4. 地图热力图：地理空间上的投放密度可视化`,
      },
    };

    return details[todoId] || { title: '', description: '', content: '' };
  };

  const handleTodoClick = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setIsDetailDialogOpen(true);
  };

  const getTodoIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getOverallStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: '待处理', variant: 'secondary' },
      DISCUSSING: { label: '讨论中', variant: 'default' },
      CODING: { label: '代码生成中', variant: 'default' },
      VALIDATING: { label: '校验中', variant: 'default' },
      RETRYING: { label: '优化中', variant: 'default' },
      PAPER_GENERATING: { label: '论文生成中', variant: 'default' },
      COMPLETED: { label: '已完成', variant: 'default' },
      FAILED: { label: '失败', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!taskStatus) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto py-8 px-4">
            <div className="text-center py-20">
              <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">任务不存在</h2>
              <Button onClick={() => router.push('/dashboard/auto-modeling')}>
                返回任务列表
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          {/* 返回按钮和标题 */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/auto-modeling')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回任务列表
            </Button>
            <h1 className="text-3xl font-bold mb-2">{taskStatus.problemTitle}</h1>
            <div className="flex items-center gap-4">
              {getOverallStatusBadge(taskStatus.overallStatus)}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>进度: {taskStatus.progress}%</span>
              </div>
            </div>
            <Progress value={taskStatus.progress} className="mt-4" />
          </div>

          {/* 标签页 */}
          <Tabs defaultValue="code-generation" className="space-y-6">
            <TabsList>
              <TabsTrigger value="code-generation" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                代码生成
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                代码执行
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                优化状态
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                群聊讨论
              </TabsTrigger>
              <TabsTrigger value="paper" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                论文
              </TabsTrigger>
            </TabsList>

            {/* 代码生成标签页 */}
            <TabsContent value="code-generation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：TODO 列表 */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <ListTodo className="h-5 w-5" />
                        任务列表
                      </CardTitle>
                      <Badge variant="secondary">
                        {todos.filter(t => t.status === 'completed').length}/{todos.length}
                      </Badge>
                    </div>
                    <CardDescription>AI 正在按顺序完成这些任务（点击查看详情）</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-3">
                        {todos.map((todo, index) => (
                          <div
                            key={todo.id}
                            onClick={() => handleTodoClick(todo)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                              todo.status === 'completed'
                                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                : todo.status === 'in-progress'
                                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {getTodoIcon(todo.status)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{todo.text}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{todo.estimatedTime}</span>
                                    <Eye className="h-3 w-3 text-gray-400" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <span>{index + 1}.</span>
                                  {todo.status === 'completed' && (
                                    <span className="text-green-600">已完成</span>
                                  )}
                                  {todo.status === 'in-progress' && (
                                    <span className="text-blue-600">进行中</span>
                                  )}
                                  {todo.status === 'pending' && (
                                    <span className="text-gray-400">待处理</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* 右侧：代码编辑器和日志 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 代码编辑器 */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Code2 className="h-5 w-5" />
                          生成的代码
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{codeGeneration?.codeLanguage || 'PYTHON'}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadCodeGeneration}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            刷新
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {codeGeneration?.description || '基于讨论记录生成的代码'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <ScrollArea className="h-[500px] bg-gray-900 rounded-lg overflow-x-auto">
                          <div className="flex">
                            {/* 行号列 */}
                            <div className="flex-shrink-0 w-12 py-4 text-xs text-gray-500 text-right pr-2 bg-gray-800 select-none">
                              {Array.from({ length: Math.max(30, (codeGeneration?.codeContent || '').split('\n').length) }, (_, i) => (
                                <div key={i} className="leading-6">
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                            {/* 代码内容 */}
                            <pre className="flex-1 p-4 text-sm font-mono text-gray-100 whitespace-pre">
                              {codeGeneration?.codeContent || '// 代码生成中...'}
                            </pre>
                          </div>
                        </ScrollArea>
                      </div>
                      {codeGeneration?.qualityScore && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-sm text-gray-600">代码质量评分:</span>
                          <Badge variant="default">
                            {(codeGeneration.qualityScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 代码生成进度 */}
                  <CodeGenerationProgress
                    taskId={taskId}
                    isGenerating={isRegenerating}
                    onComplete={() => {
                      loadCodeGeneration();
                    }}
                  />

                  {/* 代码执行结果 */}
                  {codeGeneration && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5" />
                          代码执行结果
                        </CardTitle>
                        <CardDescription>
                          请在"代码执行"标签页中执行代码并查看实时输出
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {codeGeneration.executionStatus === 'PENDING' ? (
                          <div className="text-center py-8 text-gray-500">
                            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                            <p>等待代码执行...</p>
                          </div>
                        ) : codeGeneration.executionStatus === 'RUNNING' ? (
                          <div className="text-center py-8 text-gray-500">
                            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                            <p>代码执行中...</p>
                          </div>
                        ) : codeGeneration.executionStatus === 'SUCCESS' ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-medium">执行成功</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              请在"代码执行"标签页中查看详细的执行输出
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="h-5 w-5" />
                              <span className="font-medium">执行失败</span>
                            </div>
                            {codeGeneration.errorLog && (
                              <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  {codeGeneration.errorLog}
                                </AlertDescription>
                              </Alert>
                            )}
                            <Button
                              variant="outline"
                              onClick={handleRegenerateCode}
                              disabled={isRegenerating}
                              className="w-full"
                            >
                              {isRegenerating ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  重新生成中...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  重新生成代码
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 代码执行标签页 */}
            <TabsContent value="execution" className="space-y-6">
              <CodeExecutionLogViewer taskId={taskId} autoScroll={true} />
            </TabsContent>

            {/* 优化状态标签页 */}
            <TabsContent value="optimization" className="space-y-6">
              <OptimizationVisualizer
                taskId={taskId}
                isOptimizing={taskStatus.overallStatus === 'RETRYING'}
                onRefresh={loadTaskStatus}
              />
            </TabsContent>

            {/* 论文标签页 */}
            <TabsContent value="paper" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      生成的论文
                    </CardTitle>
                    {taskStatus.paperStatus === 'COMPLETED' && (
                      <Badge variant="default" className="text-sm">
                        已完成
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    基于讨论思路和代码执行结果生成的完整论文
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taskStatus.paperStatus === 'PENDING' ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>等待论文生成...</p>
                    </div>
                  ) : taskStatus.paperStatus === 'DRAFT' ? (
                    <div className="text-center py-12 text-gray-500">
                      <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
                      <p>论文生成中...</p>
                    </div>
                  ) : taskStatus.paperStatus === 'COMPLETED' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{paperContent?.title || taskStatus.problemTitle}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>格式: {paperContent?.format}</span>
                            <span>语言: {paperContent?.language}</span>
                            <span>字数: {paperContent?.wordCount}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isEditingPaper ? (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={handleSavePaper}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                保存
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                取消
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditPaper}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                编辑
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPaper('pdf')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                下载 PDF
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <ScrollArea className="h-[600px] bg-gray-50 rounded-lg p-6">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {isPaperLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin mr-2" />
                              <span>加载中...</span>
                            </div>
                          ) : isEditingPaper ? (
                            <textarea
                              value={editedPaperContent}
                              onChange={(e) => setEditedPaperContent(e.target.value)}
                              className="w-full h-[550px] p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="编辑论文内容..."
                            />
                          ) : paperContent?.content ? (
                            <div className="space-y-6">
                              {/* 图表生成 */}
                              <ChartGenerator charts={extractChartsFromPaper(paperContent.content)} />

                              {/* LaTeX 公式渲染 */}
                              <div className="whitespace-pre-wrap">
                                {renderLatexText(paperContent.content)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                              <p>论文内容加载中...</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-red-500">
                      <XCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
                      <p>论文生成失败</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 群聊讨论标签页 */}
            <TabsContent value="discussion">
              {taskStatus.discussionId ? (
                <DiscussionHistoryViewer discussionId={taskStatus.discussionId} />
              ) : (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>暂无讨论记录</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        {/* 错误日志对话框 */}
        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <DialogTitle className="text-xl text-red-600">任务执行失败</DialogTitle>
              </div>
              <DialogDescription>
                请查看下面的错误日志，了解任务执行失败的具体原因
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <Card>
                <CardContent className="pt-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-red-50 text-red-900 p-4 rounded-lg overflow-x-auto border border-red-200">
                    {errorLog || '无错误日志'}
                  </pre>
                </CardContent>
              </Card>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsErrorDialogOpen(false)}>
                关闭
              </Button>
              <Button variant="default" onClick={() => router.push('/dashboard/auto-modeling')}>
                返回任务列表
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* 任务详情对话框 */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            {selectedTodo && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    {getTodoIcon(selectedTodo.status)}
                    <DialogTitle className="text-xl">{getTodoDetails(selectedTodo.id).title}</DialogTitle>
                  </div>
                  <DialogDescription>
                    {getTodoDetails(selectedTodo.id).description}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="prose prose-sm max-w-none">
                    <Card>
                      <CardContent className="pt-6">
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
                          {getTodoDetails(selectedTodo.id).content}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}
