'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, TrendingDown, Activity, Clock } from 'lucide-react';
import { formatCost, formatDuration } from '@/lib/performance';

interface CostBreakdown {
  name: string;
  value: number;
  color: string;
}

interface CostComparison {
  functionType: string;
  activeCpuCost: number;
  memoryCost: number;
  invocationCost: number;
  totalCost: number;
  executionTime: number;
  cpuUtilization: number;
}

// const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CostTracker() {
  const [costData, setCostData] = useState<CostComparison[]>([]);
  // const [selectedFunction] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCostData = async () => {
    setIsLoading(true);
    try {
      const endpoints = [
        { name: 'Fluid CPU Intensive', url: '/api/fluid/cpu-intensive', payload: { iterations: 35 } },
        { name: 'Fluid I/O Bound', url: '/api/fluid/io-bound', payload: { delay: 2000 } },
        { name: 'AI Text Generation', url: '/api/ai/text-generation', payload: { tokens: 100 } },
        { name: 'AI Agent Simulation', url: '/api/ai/agent-simulation', payload: { steps: 3 } },
      ];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(endpoint.payload),
          });
          const data = await response.json();
          return {
            functionType: endpoint.name,
            activeCpuCost: data.costMetrics?.activeCpuMs * 0.128 / (1000 * 60 * 60) || 0,
            memoryCost: data.costMetrics?.provisionedMemoryGbHours * 0.0106 || 0,
            invocationCost: data.costMetrics?.invocations * 0.0000002 || 0,
            totalCost: data.costMetrics?.totalCost || 0,
            executionTime: data.executionTime || 0,
            cpuUtilization: data.fluidMetrics?.cpuUtilization || 0,
          };
        })
      );

      setCostData(results);
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, []);

  const getTotalCostBreakdown = (): CostBreakdown[] => {
    const totalActiveCpu = costData.reduce((sum, item) => sum + item.activeCpuCost, 0);
    const totalMemory = costData.reduce((sum, item) => sum + item.memoryCost, 0);
    const totalInvocations = costData.reduce((sum, item) => sum + item.invocationCost, 0);
    const total = totalActiveCpu + totalMemory + totalInvocations;

    if (total === 0) {
      return [
        { name: 'Active CPU', value: 0, color: '#3b82f6' },
        { name: 'Memory', value: 0, color: '#10b981' },
        { name: 'Invocations', value: 0, color: '#f59e0b' },
      ];
    }

    return [
      { name: 'Active CPU', value: (totalActiveCpu / total) * 100, color: '#3b82f6' },
      { name: 'Memory', value: (totalMemory / total) * 100, color: '#10b981' },
      { name: 'Invocations', value: (totalInvocations / total) * 100, color: '#f59e0b' },
    ];
  };

  // const getSelectedFunctionData = () => {
  //   if (selectedFunction === 'all') return costData;
  //   return costData.filter(item => item.functionType === selectedFunction);
  // };

  const calculateSavings = () => {
    const totalFluidCost = costData.reduce((sum, item) => sum + item.totalCost, 0);
    const estimatedTraditionalCost = costData.reduce((sum, item) => {
      // Traditional serverless would charge for full execution time
      const traditionalCost = (item.executionTime / (1000 * 60 * 60)) * 0.128 * 2; // Simplified calculation
      return sum + traditionalCost;
    }, 0);
    
    const savings = estimatedTraditionalCost - totalFluidCost;
    const savingsPercentage = estimatedTraditionalCost > 0 
      ? ((estimatedTraditionalCost - totalFluidCost) / estimatedTraditionalCost) * 100 
      : 0;
    
    return {
      fluidCost: totalFluidCost,
      traditionalCost: estimatedTraditionalCost,
      savings,
      savingsPercentage,
    };
  };

  const costBreakdown = getTotalCostBreakdown();
  // const selectedData = getSelectedFunctionData();
  const savings = calculateSavings();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Cost Analysis & Savings
        </h2>
        <button
          onClick={fetchCostData}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Activity className="w-4 h-4" />
          <span>{isLoading ? 'Loading...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Cost Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Savings</p>
              <p className="text-2xl font-bold text-green-800">{formatCost(savings.savings)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-1">{savings.savingsPercentage.toFixed(1)}% reduction</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Fluid Cost</p>
              <p className="text-2xl font-bold text-blue-800">{formatCost(savings.fluidCost)}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-blue-600 mt-1">Active CPU pricing</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Traditional Cost</p>
              <p className="text-2xl font-bold text-gray-800">{formatCost(savings.traditionalCost)}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-sm text-gray-600 mt-1">Full execution time</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Avg CPU Usage</p>
              <p className="text-2xl font-bold text-purple-800">
                {costData.length > 0 
                  ? (costData.reduce((sum, item) => sum + item.cpuUtilization, 0) / costData.length).toFixed(0)
                  : '0'
                }%
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-purple-600 mt-1">Efficiency metric</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Pie Chart */}
        <div>
          <h3 className="text-lg font-medium mb-4">Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Function Comparison Table */}
        <div>
          <h3 className="text-lg font-medium mb-4">Function Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Function</th>
                  <th className="text-left p-2">CPU Usage</th>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {costData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.functionType.split(' ').slice(0, 2).join(' ')}</td>
                    <td className="p-2">{item.cpuUtilization.toFixed(0)}%</td>
                    <td className="p-2">{formatDuration(item.executionTime)}</td>
                    <td className="p-2">{formatCost(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Cost Optimization Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Fluid Compute saves most on I/O-bound workloads with low CPU utilization</li>
          <li>• AI workloads benefit significantly from Active CPU pricing during inference wait times</li>
          <li>• Memory costs are only ~10% of Active CPU costs due to resource sharing</li>
          <li>• Function concurrency can reduce costs by up to 85% through resource reuse</li>
        </ul>
      </div>
    </div>
  );
}