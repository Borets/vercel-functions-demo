import { NextRequest, NextResponse } from 'next/server';
import { measurePerformance, simulateFluidComputeMetrics, calculateTotalCost } from '@/lib/performance';

export const runtime = 'nodejs';

async function simulateAIInference(prompt: string, tokens: number = 100): Promise<string> {
  // Simulate AI inference with varying response times
  const baseDelay = 1000; // 1 second base
  const tokenDelay = tokens * 10; // 10ms per token
  const totalDelay = baseDelay + tokenDelay;
  
  await new Promise(resolve => setTimeout(resolve, totalDelay));
  
  // Generate mock response
  const words = ['artificial', 'intelligence', 'generates', 'creative', 'responses', 'efficiently', 'using', 'advanced', 'models', 'technology'];
  const response = Array.from({ length: Math.min(tokens / 4, 50) }, () => 
    words[Math.floor(Math.random() * words.length)]
  ).join(' ');
  
  return `Generated response for "${prompt}": ${response}`;
}

export async function POST(request: NextRequest) {
  const { prompt = 'Generate a creative story', tokens = 100 } = await request.json();
  
  const { result, metrics } = await measurePerformance(
    () => simulateAIInference(prompt, tokens),
    'ai-inference',
    'fluid'
  );
  
  const executionTime = metrics.find(m => m.name === 'Duration')?.value || 0;
  
  // AI workloads typically have low CPU usage during I/O wait
  const fluidMetrics = simulateFluidComputeMetrics(
    executionTime,
    20, // Low CPU utilization - waiting for AI response
    512, // 512MB memory for AI processing
    1
  );
  
  const costMetrics = calculateTotalCost(
    fluidMetrics.activeCpuTime,
    0.512, // 512MB = 0.512GB
    executionTime / (1000 * 60 * 60),
    1
  );
  
  // Compare with traditional serverless cost
  const traditionalCost = calculateTotalCost(
    executionTime, // Full execution time charged
    0.512,
    executionTime / (1000 * 60 * 60),
    1
  );
  
  return NextResponse.json({
    functionType: 'fluid',
    testType: 'ai-inference',
    prompt,
    response: result,
    tokens,
    executionTime,
    metrics,
    fluidMetrics,
    costMetrics,
    aiOptimizations: {
      description: 'AI workloads benefit from Fluid Compute Active CPU pricing',
      cpuUtilization: `${fluidMetrics.cpuUtilization}%`,
      idleTime: `${fluidMetrics.idleTime}ms waiting for AI response`,
      costSavings: {
        fluidCost: costMetrics.totalCost,
        traditionalCost: traditionalCost.totalCost,
        savings: traditionalCost.totalCost - costMetrics.totalCost,
        savingsPercentage: ((traditionalCost.totalCost - costMetrics.totalCost) / traditionalCost.totalCost * 100).toFixed(1),
      },
    },
    timestamp: Date.now(),
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'AI Text Generation Function',
    description: 'Demonstrates AI workload optimization with Fluid Compute',
    type: 'fluid',
    features: ['AI inference simulation', 'Low CPU utilization', 'Active CPU pricing benefits'],
  });
}