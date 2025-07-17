'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, Activity } from 'lucide-react';

export default function StreamingDemo() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamData, setStreamData] = useState<Array<{ id: number; type: string; data?: string; elapsed?: number; totalChunks?: number; chunkId?: number; executionTime?: number; chunksStreamed?: number; fluidMetrics?: Record<string, unknown>; costMetrics?: Record<string, unknown>; averageChunkTime?: number }>>([]);
  const [metrics, setMetrics] = useState<{ executionTime: number; chunksStreamed: number; fluidMetrics: { cpuUtilization: number; activeCpuTime: number; idleTime: number; totalExecutionTime: number; memoryUsed: number }; costMetrics: { totalCost: number }; averageChunkTime: number } | null>(null);

  const startStreaming = async () => {
    setIsStreaming(true);
    setStreamData([]);
    setMetrics(null);

    try {
      const response = await fetch('/api/fluid/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks: 10, delay: 500 }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'metadata') {
                setStreamData(prev => [...prev, { ...data, id: Date.now() }]);
              } else if (data.type === 'data') {
                setStreamData(prev => [...prev, { ...data, id: Date.now() }]);
              } else if (data.type === 'metrics') {
                setMetrics(data);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const resetDemo = () => {
    setStreamData([]);
    setMetrics(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Streaming Functions Demo</h1>
          <p className="text-gray-600">Real-time HTTP response streaming with Fluid Compute</p>
          <nav className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">Dashboard</Link>
            <Link href="/cost-analysis" className="text-blue-600 hover:text-blue-800 mr-4">Cost Analysis</Link>
            <Link href="/streaming-demo" className="text-blue-600 hover:text-blue-800">Streaming Demo</Link>
          </nav>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={startStreaming}
              disabled={isStreaming}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isStreaming ? 'Streaming...' : 'Start Stream'}</span>
            </button>
            
            <button
              onClick={resetDemo}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            
            {isStreaming && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Streaming in progress...</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream Output */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Live Stream Output</h3>
            <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 font-mono text-sm">
              {streamData.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Click &quot;Start Stream&quot; to begin streaming data...
                </div>
              ) : (
                streamData.map((item) => (
                  <div key={item.id} className="mb-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.type === 'metadata' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'data' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {item.elapsed ? `${item.elapsed}ms` : ''}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-700">
                      {item.type === 'metadata' && (
                        <div>Started streaming {item.totalChunks} chunks</div>
                      )}
                      {item.type === 'data' && (
                        <div>{item.data}</div>
                      )}
                      {item.type === 'metrics' && (
                        <div>Stream completed in {item.executionTime}ms</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            
            {metrics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600">Total Time</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {metrics.executionTime}ms
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600">Chunks Streamed</div>
                    <div className="text-2xl font-bold text-green-800">
                      {metrics.chunksStreamed}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600">Avg Chunk Time</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {metrics.averageChunkTime.toFixed(0)}ms
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-sm text-yellow-600">CPU Usage</div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {metrics.fluidMetrics.cpuUtilization}%
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Fluid Compute Advantages</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Active CPU Time: {metrics.fluidMetrics.activeCpuTime}ms</li>
                    <li>• Idle Time: {metrics.fluidMetrics.idleTime}ms</li>
                    <li>• Memory Usage: {metrics.fluidMetrics.memoryUsed}MB</li>
                    <li>• Total Cost: ${metrics.costMetrics.totalCost.toFixed(6)}</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-blue-900">💡 Streaming Benefits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Low CPU usage during streaming (only {metrics.fluidMetrics.cpuUtilization}% active)</li>
                    <li>• {((metrics.fluidMetrics.idleTime / metrics.fluidMetrics.totalExecutionTime) * 100).toFixed(1)}% idle time cost savings</li>
                    <li>• Perfect for real-time applications and chat interfaces</li>
                    <li>• Persistent connections with minimal resource usage</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Stream performance metrics will appear here after streaming completes...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}