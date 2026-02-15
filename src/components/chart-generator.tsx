'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Scatter, Radar, Doughnut, Pie, Bubble, PolarArea } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

interface ChartData {
  type: 'line' | 'bar' | 'scatter' | 'radar' | 'pie' | 'doughnut' | 'bubble' | 'area' | 'polarArea' | 'stackedBar' | 'horizontalBar';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[] | { x: number; y: number; r?: number }[];
    borderColor?: string;
    backgroundColor?: string;
    backgroundColors?: string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
  }[];
}

interface ChartGeneratorProps {
  charts: ChartData[];
}

/**
 * 图表生成器
 * 支持折线图、柱状图、散点图、雷达图
 */
export default function ChartGenerator({ charts }: ChartGeneratorProps) {
  if (!charts || charts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {charts.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {renderChart(chart)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function renderChart(chart: ChartData) {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  switch (chart.type) {
    case 'line':
    case 'area':
      return (
        <Line
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              borderColor: ds.borderColor || 'rgb(59, 130, 246)',
              backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.1)',
              borderWidth: ds.borderWidth || 2,
              fill: chart.type === 'area' ? true : (ds.fill ?? true),
              tension: ds.tension ?? 0.4,
              pointRadius: ds.pointRadius ?? 3,
              pointHoverRadius: ds.pointHoverRadius ?? 5,
            })),
          }}
          options={commonOptions}
        />
      );

    case 'bar':
      return (
        <Bar
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColors || [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
              ],
              borderWidth: ds.borderWidth ?? 1,
            })),
          }}
          options={commonOptions}
        />
      );

    case 'scatter':
      return (
        <Scatter
          data={{
            datasets: chart.datasets.map(ds => ({
              ...ds,
              data: ds.data.map((val, i) => ({
                x: i,
                y: val as number,
              })),
              borderColor: ds.borderColor || 'rgb(59, 130, 246)',
              backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.8)',
              borderWidth: ds.borderWidth || 2,
              pointRadius: ds.pointRadius ?? 5,
              pointHoverRadius: ds.pointHoverRadius ?? 7,
            })),
          }}
          options={{
            ...commonOptions,
            scales: {
              x: {
                type: 'linear' as const,
                position: 'bottom' as const,
              },
            },
          }}
        />
      );

    case 'radar':
      return (
        <Radar
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              borderColor: ds.borderColor || 'rgb(59, 130, 246)',
              backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.2)',
              borderWidth: ds.borderWidth ?? 2,
              fill: ds.fill ?? true,
              pointRadius: ds.pointRadius ?? 3,
              pointHoverRadius: ds.pointHoverRadius ?? 5,
            })),
          }}
          options={commonOptions}
        />
      );

    case 'pie':
      return (
        <Pie
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColors || [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(20, 184, 166, 0.8)',
              ],
              borderWidth: ds.borderWidth ?? 2,
            })),
          }}
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              legend: {
                position: 'right' as const,
              },
            },
          }}
        />
      );

    case 'doughnut':
      return (
        <Doughnut
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColors || [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(20, 184, 166, 0.8)',
              ],
              borderWidth: ds.borderWidth ?? 2,
              cutout: '50%',
            })),
          }}
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              legend: {
                position: 'right' as const,
              },
            },
          }}
        />
      );

    case 'bubble':
      return (
        <Bubble
          data={{
            datasets: chart.datasets.map(ds => ({
              ...ds,
              data: ds.data as { x: number; y: number; r?: number }[],
              backgroundColor: ds.backgroundColor || 'rgba(59, 130, 246, 0.6)',
              borderColor: ds.borderColor || 'rgb(59, 130, 246)',
              borderWidth: ds.borderWidth ?? 1,
            })),
          }}
          options={commonOptions}
        />
      );

    case 'polarArea':
      return (
        <PolarArea
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColors || [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(20, 184, 166, 0.8)',
              ],
              borderWidth: ds.borderWidth ?? 2,
            })),
          }}
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              legend: {
                position: 'right' as const,
              },
            },
          }}
        />
      );

    case 'stackedBar':
      return (
        <Bar
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColors || [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
              ],
              borderWidth: ds.borderWidth ?? 1,
            })),
          }}
          options={{
            ...commonOptions,
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
          }}
        />
      );

    case 'horizontalBar':
      return (
        <Bar
          data={{
            labels: chart.labels,
            datasets: chart.datasets.map(ds => ({
              ...ds,
              backgroundColor: ds.backgroundColors || [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)',
              ],
              borderWidth: ds.borderWidth ?? 1,
            })),
          }}
          options={{
            ...commonOptions,
            indexAxis: 'y',
          }}
        />
      );

    default:
      return null;
  }
}

/**
 * 从论文内容中自动提取并生成图表数据
 * 检测常见的图表格式标记，如：
 * - [CHART:LINE:标题]
 * - [CHART:BAR:标题]
 * - [DATA:标签1,标签2,标签3]
 * - [VALUES:10,20,30]
 */
export function extractChartsFromPaper(paperContent: string): ChartData[] {
  const charts: ChartData[] = [];
  const lines = paperContent.split('\n');
  let currentChart: Partial<ChartData> | null = null;
  let currentDataset: Partial<ChartData['datasets'][0]> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检测图表开始标记
    const chartMatch = line.match(/\[CHART:(LINE|BAR|SCATTER|RADAR|PIE|DOUGHNUT|BUBBLE|AREA|POLARAREA|STACKEDBAR|HORIZONTALBAR):(.+)\]/i);
    if (chartMatch) {
      if (currentChart) {
        // 保存上一个图表
        if (currentChart.type && currentChart.title) {
          charts.push(currentChart as ChartData);
        }
      }

      currentChart = {
        type: chartMatch[1].toLowerCase() as any,
        title: chartMatch[2],
        labels: [],
        datasets: [],
      };
      continue;
    }

    // 检测数据集标记
    const datasetMatch = line.match(/\[DATASET:(.+)\]/);
    if (datasetMatch && currentChart) {
      if (currentDataset) {
        // 保存上一个数据集
        if (currentDataset.label && currentDataset.data) {
          if (currentChart.datasets) {
            currentChart.datasets.push(currentDataset as ChartData['datasets'][0]);
          }
        }
      }

      currentDataset = {
        label: datasetMatch[1],
        data: [],
      };
      continue;
    }

    // 检测标签标记
    const labelsMatch = line.match(/\[LABELS:(.+)\]/);
    if (labelsMatch && currentChart) {
      currentChart.labels = labelsMatch[1].split(',').map(l => l.trim());
      continue;
    }

    // 检测值标记
    const valuesMatch = line.match(/\[VALUES:(.+)\]/);
    if (valuesMatch && currentDataset) {
      currentDataset.data = valuesMatch[1].split(',').map(v => parseFloat(v.trim()));
      continue;
    }

    // 检测图表结束标记
    if (line === '[/CHART]' && currentChart) {
      if (currentDataset) {
        if (currentDataset.label && currentDataset.data) {
          currentChart.datasets?.push(currentDataset as ChartData['datasets'][0]);
        }
      }

      if (currentChart.type && currentChart.title && currentChart.datasets && currentChart.datasets.length > 0) {
        charts.push(currentChart as ChartData);
      }

      currentChart = null;
      currentDataset = null;
      continue;
    }
  }

  return charts;
}
