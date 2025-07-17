import { NextRequest, NextResponse } from 'next/server';
import { measurePerformance, simulateFluidComputeMetrics, calculateTotalCost } from '@/lib/performance';

export const runtime = 'nodejs';

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function cpuIntensiveTask(iterations: number = 35): number {
  const start = Date.now();
  const result = fibonacci(iterations);
  const end = Date.now();
  return end - start;
}

export async function POST(request: NextRequest) {
  const { iterations = 35 } = await request.json();
  
  const { result: executionTimeResult, metrics } = await measurePerformance(
    () => Promise.resolve(cpuIntensiveTask(iterations)),
    'cpu-intensive',
    'fluid'
  );
  
  const executionTime = executionTimeResult;
  const fluidMetrics = simulateFluidComputeMetrics(
    executionTime,
    95, // High CPU utilization
    128, // 128MB memory
    1
  );
  
  const costMetrics = calculateTotalCost(
    fluidMetrics.activeCpuTime,
    0.128, // 128MB = 0.128GB
    executionTime / (1000 * 60 * 60),
    1
  );
  
  return NextResponse.json({
    functionType: 'fluid',
    testType: 'cpu-intensive',
    executionTime,
    metrics,
    fluidMetrics,
    costMetrics,
    timestamp: Date.now(),
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'CPU Intensive Function',
    description: 'Demonstrates high CPU utilization with Fibonacci calculation',
    type: 'fluid',
    features: ['Active CPU pricing', 'High CPU utilization', 'Minimal I/O'],
  });
}