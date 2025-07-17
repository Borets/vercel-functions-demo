import { NextRequest, NextResponse } from 'next/server';
import { measurePerformance, simulateFluidComputeMetrics, calculateTotalCost } from '@/lib/performance';

export const runtime = 'nodejs';

async function simulateAgentWorkflow(steps: number = 3): Promise<Array<{ id: number; action: string; startTime: number; endTime: number; duration: number }>> {
  const workflow = [];
  
  for (let i = 0; i < steps; i++) {
    const step = {
      id: i + 1,
      action: `Agent step ${i + 1}`,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
    };
    
    // Simulate agent thinking time and external API calls
    const thinkingTime = Math.random() * 500 + 200; // 200-700ms thinking
    const apiCallTime = Math.random() * 1000 + 500; // 500-1500ms API call
    
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    step.action += ' - thinking complete';
    
    await new Promise(resolve => setTimeout(resolve, apiCallTime));
    step.action += ' - external API call complete';
    
    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    
    workflow.push(step);
  }
  
  return workflow;
}

export async function POST(request: NextRequest) {
  const { steps = 3 } = await request.json();
  
  const { result, metrics } = await measurePerformance(
    () => simulateAgentWorkflow(steps),
    'agent-simulation',
    'fluid'
  );
  
  const executionTime = metrics.find(m => m.name === 'Duration')?.value || 0;
  
  // Agent workloads have very low CPU usage - mostly waiting
  const fluidMetrics = simulateFluidComputeMetrics(
    executionTime,
    8, // Very low CPU utilization - agents mostly wait
    256, // 256MB memory for agent processing
    1
  );
  
  const costMetrics = calculateTotalCost(
    fluidMetrics.activeCpuTime,
    0.256, // 256MB = 0.256GB
    executionTime / (1000 * 60 * 60),
    1
  );
  
  // Compare with traditional serverless cost
  const traditionalCost = calculateTotalCost(
    executionTime, // Full execution time charged
    0.256,
    executionTime / (1000 * 60 * 60),
    1
  );
  
  return NextResponse.json({
    functionType: 'fluid',
    testType: 'agent-simulation',
    steps,
    workflow: result,
    executionTime,
    metrics,
    fluidMetrics,
    costMetrics,
    agentOptimizations: {
      description: 'Agent workloads are ideal for Fluid Compute - high idle time, low CPU usage',
      cpuUtilization: `${fluidMetrics.cpuUtilization}%`,
      idleTime: `${fluidMetrics.idleTime}ms waiting for external responses`,
      workflowEfficiency: 'Perfect for MCP servers and agent frameworks',
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
    name: 'Agent Simulation Function',
    description: 'Demonstrates agent workflow optimization with Fluid Compute',
    type: 'fluid',
    features: ['Agent workflow simulation', 'Very low CPU utilization', 'Maximum cost savings'],
  });
}