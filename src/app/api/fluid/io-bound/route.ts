import { NextRequest, NextResponse } from 'next/server';
import { measurePerformance, simulateFluidComputeMetrics, calculateTotalCost } from '@/lib/performance';

export const runtime = 'nodejs';

async function fetchMultipleAPIs(urls: string[]) {
  const fetchPromises = urls.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });
  
  return Promise.all(fetchPromises);
}

async function ioBoundTask(delay: number = 2000): Promise<number> {
  const start = Date.now();
  
  // Simulate I/O operations with multiple API calls
  const urls = [
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://jsonplaceholder.typicode.com/posts/2',
    'https://jsonplaceholder.typicode.com/posts/3',
  ];
  
  // Add artificial delay to simulate longer I/O
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    await fetchMultipleAPIs(urls);
  } catch (error) {
    console.log('API fetch error:', error);
  }
  
  const end = Date.now();
  return end - start;
}

export async function POST(request: NextRequest) {
  const { delay = 2000 } = await request.json();
  
  const { result, metrics } = await measurePerformance(
    () => ioBoundTask(delay),
    'io-bound',
    'fluid'
  );
  
  const executionTime = result;
  const fluidMetrics = simulateFluidComputeMetrics(
    executionTime,
    15, // Low CPU utilization during I/O wait
    64, // 64MB memory
    1
  );
  
  const costMetrics = calculateTotalCost(
    fluidMetrics.activeCpuTime,
    0.064, // 64MB = 0.064GB
    executionTime / (1000 * 60 * 60),
    1
  );
  
  return NextResponse.json({
    functionType: 'fluid',
    testType: 'io-bound',
    executionTime,
    metrics,
    fluidMetrics,
    costMetrics,
    activeVsTotal: {
      activeCpuTime: fluidMetrics.activeCpuTime,
      totalTime: executionTime,
      idleTime: fluidMetrics.idleTime,
      savings: `${((fluidMetrics.idleTime / executionTime) * 100).toFixed(1)}% idle time`,
    },
    timestamp: Date.now(),
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'I/O Bound Function',
    description: 'Demonstrates low CPU utilization during I/O operations - ideal for Fluid Compute cost savings',
    type: 'fluid',
    features: ['Active CPU pricing benefit', 'Low CPU utilization', 'High I/O wait time'],
  });
}