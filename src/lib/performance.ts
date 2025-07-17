import { PerformanceMetric, CostMetric, FluidComputeMetrics } from './types';

export const PRICING = {
  ACTIVE_CPU_PER_HOUR: 0.128,
  PROVISIONED_MEMORY_PER_GB_HOUR: 0.0106,
  INVOCATION_COST: 0.0000002,
} as const;

export function calculateActiveCpuCost(activeCpuMs: number): number {
  const hours = activeCpuMs / (1000 * 60 * 60);
  return hours * PRICING.ACTIVE_CPU_PER_HOUR;
}

export function calculateMemoryCost(memoryGb: number, durationHours: number): number {
  return memoryGb * durationHours * PRICING.PROVISIONED_MEMORY_PER_GB_HOUR;
}

export function calculateTotalCost(
  activeCpuMs: number,
  memoryGb: number,
  durationHours: number,
  invocations: number
): CostMetric {
  const activeCpuCost = calculateActiveCpuCost(activeCpuMs);
  const memoryCost = calculateMemoryCost(memoryGb, durationHours);
  const invocationCost = invocations * PRICING.INVOCATION_COST;
  
  return {
    activeCpuMs,
    provisionedMemoryGbHours: memoryGb * durationHours,
    invocations,
    totalCost: activeCpuCost + memoryCost + invocationCost,
  };
}

export function measurePerformance<T>(
  fn: () => Promise<T>,
  metricName: string,
  functionType: 'fluid' | 'edge' | 'serverless'
): Promise<{ result: T; metrics: PerformanceMetric[] }> {
  return new Promise(async (resolve) => {
    const start = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await fn();
      const end = performance.now();
      const endMemory = process.memoryUsage();
      
      const metrics: PerformanceMetric[] = [
        {
          id: `${metricName}-duration`,
          name: 'Duration',
          value: end - start,
          unit: 'ms',
          timestamp: Date.now(),
          functionType,
        },
        {
          id: `${metricName}-memory`,
          name: 'Memory Usage',
          value: endMemory.heapUsed - startMemory.heapUsed,
          unit: 'bytes',
          timestamp: Date.now(),
          functionType,
        },
      ];
      
      resolve({ result, metrics });
    } catch (error) {
      resolve({
        result: error as T,
        metrics: [{
          id: `${metricName}-error`,
          name: 'Error',
          value: performance.now() - start,
          unit: 'ms',
          timestamp: Date.now(),
          functionType,
        }],
      });
    }
  });
}

export function simulateFluidComputeMetrics(
  executionTime: number,
  cpuUtilization: number,
  memoryMb: number,
  concurrentRequests: number = 1
): FluidComputeMetrics {
  const activeCpuTime = executionTime * (cpuUtilization / 100);
  const idleTime = executionTime - activeCpuTime;
  
  return {
    activeCpuTime,
    totalExecutionTime: executionTime,
    memoryUsed: memoryMb,
    cpuUtilization,
    concurrentRequests,
    idleTime,
  };
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(3)}k`;
  }
  return `$${cost.toFixed(4)}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}