import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface LoadTestConfig {
  targetFunction: string;
  duration: number; // seconds
  rps: number; // requests per second
  payload?: Record<string, unknown>;
}

interface LoadTestResult {
  timestamp: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

async function runLoadTest(config: LoadTestConfig): Promise<{
  results: LoadTestResult[];
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    averageResponseTime: number;
    medianResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    actualRPS: number;
    targetRPS: number;
    duration: number;
  };
}> {
  const { targetFunction, duration, rps, payload = {} } = config;
  const results: LoadTestResult[] = [];
  const intervalMs = 1000 / rps;
  const endTime = Date.now() + (duration * 1000);
  
  const makeRequest = async (): Promise<LoadTestResult> => {
    const start = Date.now();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}${targetFunction}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      await response.json();
      
      return {
        timestamp: Date.now(),
        responseTime: Date.now() - start,
        success: true,
      };
    } catch (error) {
      return {
        timestamp: Date.now(),
        responseTime: Date.now() - start,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  
  // Run load test
  const requests: Promise<LoadTestResult>[] = [];
  let requestCount = 0;
  
  while (Date.now() < endTime) {
    const requestPromise = makeRequest();
    requests.push(requestPromise);
    requestCount++;
    
    // Wait for the next interval
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  // Wait for all requests to complete
  const allResults = await Promise.all(requests);
  results.push(...allResults);
  
  // Calculate summary statistics
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  const responseTimes = successfulResults.map(r => r.responseTime);
  responseTimes.sort((a, b) => a - b);
  
  const summary = {
    totalRequests: results.length,
    successfulRequests: successfulResults.length,
    failedRequests: failedResults.length,
    successRate: (successfulResults.length / results.length) * 100,
    averageResponseTime: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
    medianResponseTime: responseTimes[Math.floor(responseTimes.length / 2)],
    p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
    p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
    minResponseTime: responseTimes[0],
    maxResponseTime: responseTimes[responseTimes.length - 1],
    actualRPS: results.length / duration,
    targetRPS: rps,
    duration: duration,
  };
  
  return { results, summary };
}

export async function POST(request: NextRequest) {
  const config: LoadTestConfig = await request.json();
  
  // Validate config
  if (!config.targetFunction || !config.duration || !config.rps) {
    return NextResponse.json({
      error: 'Invalid config',
      message: 'targetFunction, duration, and rps are required',
    }, { status: 400 });
  }
  
  if (config.duration > 60) {
    return NextResponse.json({
      error: 'Duration too long',
      message: 'Maximum duration is 60 seconds',
    }, { status: 400 });
  }
  
  if (config.rps > 50) {
    return NextResponse.json({
      error: 'RPS too high',
      message: 'Maximum RPS is 50',
    }, { status: 400 });
  }
  
  try {
    const { results, summary } = await runLoadTest(config);
    
    return NextResponse.json({
      config,
      results: results.slice(0, 100), // Limit response size
      summary,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Load test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Load Test',
    description: 'Stress test functions with configurable load',
    config: {
      targetFunction: 'Function endpoint to test',
      duration: 'Test duration in seconds (max 60)',
      rps: 'Requests per second (max 50)',
      payload: 'Optional payload for the function',
    },
    examples: [
      {
        targetFunction: '/api/fluid/cpu-intensive',
        duration: 30,
        rps: 10,
        payload: { iterations: 30 },
      },
      {
        targetFunction: '/api/edge/quick-response',
        duration: 20,
        rps: 20,
        payload: { message: 'load test' },
      },
    ],
  });
}