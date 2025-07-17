'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, DollarSign, Zap, Server, Globe } from 'lucide-react';

interface MetricData {
  timestamp: number;
  fluidCost: number;
  edgeCost: number;
  serverlessCost: number;
  fluidResponseTime: number;
  edgeResponseTime: number;
  serverlessResponseTime: number;
}

interface FunctionTest {
  name: string;
  endpoint: string;
  type: 'fluid' | 'edge' | 'serverless';
  payload?: Record<string, unknown>;
}

const FUNCTION_TESTS: FunctionTest[] = [
  { name: 'Fluid CPU Intensive', endpoint: '/api/fluid/cpu-intensive', type: 'fluid', payload: { iterations: 35 } },
  { name: 'Fluid I/O Bound', endpoint: '/api/fluid/io-bound', type: 'fluid', payload: { delay: 2000 } },
  { name: 'Fluid Concurrent', endpoint: '/api/fluid/concurrent', type: 'fluid', payload: { concurrentTasks: 5 } },
  { name: 'Edge Quick Response', endpoint: '/api/edge/quick-response', type: 'edge', payload: { message: 'Performance test' } },
  { name: 'Edge Geo-Location', endpoint: '/api/edge/geo-location', type: 'edge', payload: { userMessage: 'Location test' } },
  { name: 'Serverless Traditional', endpoint: '/api/serverless/traditional', type: 'serverless', payload: { complexity: 1000 } },
];

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [lastResults, setLastResults] = useState<Array<{ testName: string; type: string; executionTime: number; costMetrics?: { totalCost: number }; fluidMetrics?: { cpuUtilization: number } }>>([]);

  const runBenchmark = async () => {
    setIsRunning(true);
    setCurrentTest('Running benchmark suite...');
    
    const results = [];
    const timestamp = Date.now();
    
    for (const test of FUNCTION_TESTS) {
      setCurrentTest(`Testing ${test.name}...`);
      
      try {
        const response = await fetch(test.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.payload || {}),
        });
        
        const data = await response.json();
        results.push({
          ...data,
          testName: test.name,
          type: test.type,
        });
      } catch (error) {
        console.error(`Error testing ${test.name}:`, error);
      }
    }
    
    setLastResults(results);
    
    // Calculate metrics for chart
    const fluidResults = results.filter(r => r.type === 'fluid');
    const edgeResults = results.filter(r => r.type === 'edge');
    const serverlessResults = results.filter(r => r.type === 'serverless');
    
    const avgFluidCost = fluidResults.reduce((sum, item) => sum + (item.costMetrics?.totalCost || 0), 0) / fluidResults.length;
    const avgEdgeCost = edgeResults.reduce((sum) => sum + 0.000001, 0) / edgeResults.length; // Simulated edge cost
    const avgServerlessCost = serverlessResults.reduce((sum, r) => sum + (r.costMetrics?.totalCost || 0), 0) / serverlessResults.length;
    
    const avgFluidTime = fluidResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / fluidResults.length;
    const avgEdgeTime = edgeResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / edgeResults.length;
    const avgServerlessTime = serverlessResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / serverlessResults.length;
    
    const newMetric: MetricData = {
      timestamp,
      fluidCost: avgFluidCost,
      edgeCost: avgEdgeCost,
      serverlessCost: avgServerlessCost,
      fluidResponseTime: avgFluidTime,
      edgeResponseTime: avgEdgeTime,
      serverlessResponseTime: avgServerlessTime,
    };
    
    setMetrics(prev => [...prev.slice(-9), newMetric]);
    setIsRunning(false);
    setCurrentTest('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vercel Functions Performance Dashboard</h1>
          <p className="text-gray-600">Real-time performance and cost comparison of Fluid Compute, Edge Functions, and Serverless</p>
          <nav className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">Dashboard</Link>
            <Link href="/cost-analysis" className="text-blue-600 hover:text-blue-800 mr-4">Cost Analysis</Link>
            <Link href="/streaming-demo" className="text-blue-600 hover:text-blue-800">Streaming Demo</Link>
          </nav>
        </div>
        
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={runBenchmark}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Activity className="w-4 h-4" />
                <span>{isRunning ? 'Running...' : 'Run Benchmark'}</span>
              </button>
              {currentTest && (
                <span className="text-sm text-gray-600 animate-pulse">{currentTest}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fluid Compute</p>
                <p className="text-2xl font-bold text-blue-600">Active CPU</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Pay only for CPU usage</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Edge Functions</p>
                <p className="text-2xl font-bold text-green-600">9x Faster</p>
              </div>
              <Globe className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Cold starts & global distribution</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Serverless</p>
                <p className="text-2xl font-bold text-purple-600">Traditional</p>
              </div>
              <Server className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">Full execution time billing</p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Cost Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  formatter={(value: number) => [`$${typeof value === 'number' ? value.toFixed(6) : '0.000000'}`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="fluidCost" stroke="#3b82f6" name="Fluid Compute" />
                <Line type="monotone" dataKey="edgeCost" stroke="#10b981" name="Edge Functions" />
                <Line type="monotone" dataKey="serverlessCost" stroke="#8b5cf6" name="Serverless" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Response Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  formatter={(value: number) => [`${typeof value === 'number' ? value.toFixed(0) : '0'}ms`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="fluidResponseTime" stroke="#3b82f6" name="Fluid Compute" />
                <Line type="monotone" dataKey="edgeResponseTime" stroke="#10b981" name="Edge Functions" />
                <Line type="monotone" dataKey="serverlessResponseTime" stroke="#8b5cf6" name="Serverless" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Latest Results */}
        {lastResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Latest Benchmark Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lastResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.testName}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.type === 'fluid' ? 'bg-blue-100 text-blue-800' :
                      result.type === 'edge' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Time: {result.executionTime}ms</div>
                    {result.costMetrics && result.costMetrics.totalCost !== undefined && (
                      <div>Cost: ${result.costMetrics.totalCost.toFixed(6)}</div>
                    )}
                    {result.fluidMetrics && (
                      <div>CPU: {result.fluidMetrics.cpuUtilization}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}