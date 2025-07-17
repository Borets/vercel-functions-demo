import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { chunks = 10, delay = 100 } = await request.json();
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const startTime = Date.now();
      
      // Send initial metadata
      controller.enqueue(encoder.encode(JSON.stringify({
        type: 'metadata',
        functionType: 'fluid',
        testType: 'streaming',
        totalChunks: chunks,
        startTime,
      }) + '\n'));
      
      // Stream data chunks
      for (let i = 0; i < chunks; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const chunk = {
          type: 'data',
          chunkId: i + 1,
          data: `Streaming chunk ${i + 1} of ${chunks}`,
          timestamp: Date.now(),
          elapsed: Date.now() - startTime,
        };
        
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
      }
      
      // Send final metrics
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const finalMetrics = {
        type: 'metrics',
        executionTime: totalTime,
        chunksStreamed: chunks,
        averageChunkTime: totalTime / chunks,
        fluidMetrics: {
          activeCpuTime: totalTime * 0.1, // Low CPU usage for streaming
          totalExecutionTime: totalTime,
          memoryUsed: 32, // 32MB for streaming
          cpuUtilization: 10,
          concurrentRequests: 1,
          idleTime: totalTime * 0.9,
        },
        costMetrics: {
          activeCpuMs: totalTime * 0.1,
          provisionedMemoryGbHours: 0.032 * (totalTime / (1000 * 60 * 60)),
          invocations: 1,
          totalCost: (totalTime * 0.1 / (1000 * 60 * 60) * 0.128) + 
                     (0.032 * (totalTime / (1000 * 60 * 60)) * 0.0106) + 
                     (1 * 0.0000002),
        },
        timestamp: endTime,
      };
      
      controller.enqueue(encoder.encode(JSON.stringify(finalMetrics) + '\n'));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET() {
  return Response.json({
    name: 'Streaming Function',
    description: 'Demonstrates HTTP response streaming with Fluid Compute',
    type: 'fluid',
    features: ['HTTP response streaming', 'Real-time data', 'Long-running connections'],
  });
}