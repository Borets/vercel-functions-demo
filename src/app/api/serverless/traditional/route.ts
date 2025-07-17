import { NextRequest, NextResponse } from 'next/server';
import { measurePerformance, calculateTotalCost } from '@/lib/performance';

export const runtime = 'nodejs';

function traditionalServerlessTask(complexity: number = 1000): number {
  const start = Date.now();
  
  // Simulate traditional serverless workload
  let computationResult = 0;
  for (let i = 0; i < complexity * 1000; i++) {
    computationResult += Math.sqrt(i) * Math.sin(i / 1000);
  }
  
  // Use the computation result to prevent optimization
  if (computationResult > 0) {
    // Computation complete
  }
  
  const end = Date.now();
  return end - start;
}

export async function POST(request: NextRequest) {
  const { complexity = 1000 } = await request.json();
  
  const { result, metrics } = await measurePerformance(
    () => Promise.resolve(traditionalServerlessTask(complexity)),
    'traditional-serverless',
    'serverless'
  );
  
  const executionTime = result;
  
  // Traditional serverless pricing (no Active CPU pricing)
  const traditionalCost = calculateTotalCost(
    executionTime, // Full execution time charged
    0.128, // 128MB memory
    executionTime / (1000 * 60 * 60),
    1
  );
  
  return NextResponse.json({
    functionType: 'serverless',
    testType: 'traditional',
    executionTime,
    metrics,
    serverlessMetrics: {
      runtime: 'Node.js 20.x',
      memoryAllocated: '128MB',
      billingModel: 'Full execution time',
      coldStart: 'Standard serverless cold start',
    },
    costMetrics: traditionalCost,
    limitations: [
      'No Active CPU pricing',
      'Charged for full execution time',
      'No resource sharing',
      'Standard cold start times',
    ],
    timestamp: Date.now(),
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'Traditional Serverless Function',
    description: 'Demonstrates traditional serverless compute model for comparison',
    type: 'serverless',
    features: ['Node.js runtime', 'Standard pricing', 'No resource sharing'],
  });
}