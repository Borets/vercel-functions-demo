import { NextRequest, NextResponse } from 'next/server';
import { measurePerformance, simulateFluidComputeMetrics, calculateTotalCost } from '@/lib/performance';

export const runtime = 'nodejs';

async function processConcurrentRequests(count: number = 5): Promise<Array<{ taskId: number; processingTime: number; result: string }>> {
  const tasks = Array.from({ length: count }, async (_, i) => {
    const delay = Math.random() * 1000 + 500; // 500-1500ms delay
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      taskId: i + 1,
      processingTime: delay,
      result: `Task ${i + 1} completed`,
    };
  });
  
  return Promise.all(tasks);
}

export async function POST(request: NextRequest) {
  const { concurrentTasks = 5 } = await request.json();
  
  const { result, metrics } = await measurePerformance(
    () => processConcurrentRequests(concurrentTasks),
    'concurrent',
    'fluid'
  );
  
  const executionTime = metrics.find(m => m.name === 'Duration')?.value || 0;
  const fluidMetrics = simulateFluidComputeMetrics(
    executionTime,
    25, // Moderate CPU utilization
    256, // 256MB memory for concurrent processing
    concurrentTasks
  );
  
  const costMetrics = calculateTotalCost(
    fluidMetrics.activeCpuTime,
    0.256, // 256MB = 0.256GB
    executionTime / (1000 * 60 * 60),
    1
  );
  
  // Calculate savings from resource sharing
  const traditionalCost = calculateTotalCost(
    executionTime * concurrentTasks, // No resource sharing
    0.256 * concurrentTasks, // No memory sharing
    executionTime / (1000 * 60 * 60),
    concurrentTasks
  );
  
  return NextResponse.json({
    functionType: 'fluid',
    testType: 'concurrent',
    executionTime,
    concurrentTasks,
    results: result,
    metrics,
    fluidMetrics,
    costMetrics,
    costComparison: {
      fluidCost: costMetrics.totalCost,
      traditionalCost: traditionalCost.totalCost,
      savings: traditionalCost.totalCost - costMetrics.totalCost,
      savingsPercentage: ((traditionalCost.totalCost - costMetrics.totalCost) / traditionalCost.totalCost * 100).toFixed(1),
    },
    timestamp: Date.now(),
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'Concurrent Processing Function',
    description: 'Demonstrates resource sharing benefits of Fluid Compute with concurrent requests',
    type: 'fluid',
    features: ['Resource sharing', 'Memory reuse', 'Concurrent processing'],
  });
}