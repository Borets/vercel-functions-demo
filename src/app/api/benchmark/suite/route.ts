import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface BenchmarkConfig {
  iterations: number;
  concurrency: number;
  functions: string[];
}

interface BenchmarkResult {
  functionName: string;
  results: {
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
    errors: number;
    successRate: number;
  };
}

const DEFAULT_FUNCTIONS = [
  '/api/fluid/cpu-intensive',
  '/api/fluid/io-bound',
  '/api/fluid/concurrent',
  '/api/edge/quick-response',
  '/api/edge/geo-location',
  '/api/serverless/traditional',
  '/api/ai/text-generation',
  '/api/ai/agent-simulation',
];

async function runSingleTest(url: string, payload: Record<string, unknown>): Promise<number> {
  const start = Date.now();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    await response.json();
    return Date.now() - start;
  } catch (error) {
    throw error;
  }
}

async function benchmarkFunction(
  functionPath: string,
  iterations: number,
  concurrency: number
): Promise<BenchmarkResult> {
  const payload = {
    '/api/fluid/cpu-intensive': { iterations: 30 },
    '/api/fluid/io-bound': { delay: 1000 },
    '/api/fluid/concurrent': { concurrentTasks: 3 },
    '/api/edge/quick-response': { message: 'benchmark test' },
    '/api/edge/geo-location': { userMessage: 'benchmark test' },
    '/api/serverless/traditional': { complexity: 500 },
    '/api/ai/text-generation': { tokens: 50 },
    '/api/ai/agent-simulation': { steps: 2 },
  }[functionPath] || {};

  const results: number[] = [];
  const errors: number[] = [];
  
  // Run tests in batches based on concurrency
  for (let i = 0; i < iterations; i += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, iterations - i) }, () =>
      runSingleTest(functionPath, payload)
    );
    
    const batchResults = await Promise.allSettled(batch);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push(1);
      }
    });
  }
  
  if (results.length === 0) {
    throw new Error(`All requests failed for ${functionPath}`);
  }
  
  const sortedResults = results.sort((a, b) => a - b);
  const min = sortedResults[0];
  const max = sortedResults[sortedResults.length - 1];
  const avg = results.reduce((sum, val) => sum + val, 0) / results.length;
  const median = sortedResults[Math.floor(sortedResults.length / 2)];
  const p95 = sortedResults[Math.floor(sortedResults.length * 0.95)];
  const p99 = sortedResults[Math.floor(sortedResults.length * 0.99)];
  
  return {
    functionName: functionPath,
    results: {
      min,
      max,
      avg,
      median,
      p95,
      p99,
      errors: errors.length,
      successRate: (results.length / (results.length + errors.length)) * 100,
    },
  };
}

export async function POST(request: NextRequest) {
  const config: BenchmarkConfig = await request.json();
  const { iterations = 10, concurrency = 2, functions = DEFAULT_FUNCTIONS } = config;
  
  const startTime = Date.now();
  const results: BenchmarkResult[] = [];
  
  try {
    // Run benchmarks sequentially to avoid overwhelming the system
    for (const functionPath of functions) {
      const result = await benchmarkFunction(functionPath, iterations, concurrency);
      results.push(result);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    return NextResponse.json({
      benchmarkConfig: config,
      results,
      summary: {
        totalFunctions: functions.length,
        totalRequests: functions.length * iterations,
        totalTime,
        averageTimePerFunction: totalTime / functions.length,
        fastest: results.reduce((min, current) => 
          current.results.min < min.results.min ? current : min
        ),
        slowest: results.reduce((max, current) => 
          current.results.max > max.results.max ? current : max
        ),
      },
      timestamp: endTime,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Benchmark failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      partialResults: results,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Benchmark Suite',
    description: 'Comprehensive performance benchmarking for all function types',
    defaultConfig: {
      iterations: 10,
      concurrency: 2,
      functions: DEFAULT_FUNCTIONS,
    },
    availableFunctions: DEFAULT_FUNCTIONS,
  });
}