export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  functionType: 'fluid' | 'edge' | 'serverless';
}

export interface CostMetric {
  activeCpuMs: number;
  provisionedMemoryGbHours: number;
  invocations: number;
  totalCost: number;
}

export interface BenchmarkResult {
  functionType: 'fluid' | 'edge' | 'serverless';
  coldStart: number;
  warmStart: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cost: CostMetric;
  timestamp: number;
}

export interface FluidComputeMetrics {
  activeCpuTime: number;
  totalExecutionTime: number;
  memoryUsed: number;
  cpuUtilization: number;
  concurrentRequests: number;
  idleTime: number;
}

export interface TestScenario {
  name: string;
  description: string;
  type: 'cpu-intensive' | 'io-bound' | 'memory-heavy' | 'ai-inference';
  duration: number;
  payload?: Record<string, unknown>;
}