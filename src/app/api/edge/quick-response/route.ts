import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const { message = 'Hello from Edge Function!' } = await request.json();
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  return NextResponse.json({
    functionType: 'edge',
    testType: 'quick-response',
    message,
    executionTime,
    region: process.env.VERCEL_REGION || 'unknown',
    edgeMetrics: {
      coldStart: true, // Edge functions have minimal cold start
      globalDistribution: '70+ edge locations',
      runtime: 'V8 Edge Runtime',
      memoryUsage: 'Minimal - no MicroVM overhead',
    },
    costMetrics: {
      executionTime,
      costModel: 'Traditional per-invocation',
      note: 'No Active CPU pricing for Edge Functions',
    },
    timestamp: endTime,
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'Quick Response Edge Function',
    description: 'Demonstrates ultra-fast Edge Function performance',
    type: 'edge',
    features: ['9x faster cold starts', 'Global distribution', 'V8 Edge Runtime'],
  });
}