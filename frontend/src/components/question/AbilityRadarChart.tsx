import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { CoreAbilities } from '../../types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AbilityRadarChartProps {
  data: CoreAbilities;
  className?: string;
  size?: number;
  showValues?: boolean;
  showGrid?: boolean;
}

const AbilityRadarChart: React.FC<AbilityRadarChartProps> = ({
  data,
  className = '',
  size = 300,
  showValues = true,
  showGrid = true,
}) => {
  // 能力标签映射
  const labels = [
    '逻辑思维',
    '数学直观', 
    '问题解决',
    '分析能力',
    '创造性思维',
    '计算技能'
  ];

  // 颜色配置
  const colors = {
    border: '#3B82F6',
    fill: 'rgba(59, 130, 246, 0.2)',
    point: '#3B82F6',
    text: '#6B7280'
  };

  // 准备图表数据
  const chartData = {
    labels,
    datasets: [
      {
        label: '能力评估',
        data: [
          data.logicalThinking,
          data.mathematicalIntuition,
          data.problemSolving,
          data.analyticalSkills,
          data.creativeThinking,
          data.computationalSkills,
        ],
        backgroundColor: colors.fill,
        borderColor: colors.border,
        borderWidth: 2,
        pointBackgroundColor: colors.point,
        pointBorderColor: colors.border,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: colors.point,
        pointHoverBorderColor: colors.border,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  // 图表配置选项
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        min: 0,
        ticks: {
          stepSize: 2,
          color: colors.text,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          callback: function(tickValue: string | number) {
            return Number(tickValue);
          },
        },
        grid: {
          color: showGrid ? 'rgba(156, 163, 175, 0.2)' : 'transparent',
          lineWidth: 1,
        },
        angleLines: {
          color: showGrid ? 'rgba(156, 163, 175, 0.2)' : 'transparent',
          lineWidth: 1,
        },
        pointLabels: {
          color: colors.text,
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          padding: 20,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed.r || 0;
            return `${label}: ${value}/10`;
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  // 计算平均分
  const averageScore = Object.values(data).reduce((sum, score) => sum + score, 0) / 6;

  return (
    <div className={`relative ${className}`}>
      {/* 雷达图 */}
      <div style={{ width: '100%', height: size }}>
        <Radar data={chartData} options={options} />
      </div>
      
      {/* 平均分显示 */}
      {showValues && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {averageScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              平均分
            </div>
          </div>
        </div>
      )}
      
      {/* 能力分数详情 */}
      {showValues && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-300">
                {labels[Object.keys(data).indexOf(key)]}
              </span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {value}/10
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AbilityRadarChart;
