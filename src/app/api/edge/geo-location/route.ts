import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // Extract geolocation data from request (available in Edge runtime)
  const geoData = (request as { geo?: { country?: string; city?: string; region?: string; latitude?: string; longitude?: string } }).geo;
  const country = geoData?.country || 'Unknown';
  const city = geoData?.city || 'Unknown';
  const region = geoData?.region || 'Unknown';
  const latitude = geoData?.latitude || 'Unknown';
  const longitude = geoData?.longitude || 'Unknown';
  
  const { userMessage = 'Hello from user!' } = await request.json();
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  return NextResponse.json({
    functionType: 'edge',
    testType: 'geo-location',
    userMessage,
    executionTime,
    geoData: {
      country,
      city,
      region,
      latitude,
      longitude,
    },
    edgeMetrics: {
      runtime: 'V8 Edge Runtime',
      globalDistribution: true,
      lowLatency: `${executionTime}ms response time`,
      closestEdge: `Served from nearest edge location`,
    },
    performanceAdvantages: [
      'No cold start delays',
      'Closest geographic processing',
      'Minimal network latency',
      'Instant geo-location access',
    ],
    timestamp: endTime,
  });
}

export async function GET() {
  return NextResponse.json({
    name: 'Geo-Location Edge Function',
    description: 'Demonstrates Edge Function geo-location capabilities and global distribution',
    type: 'edge',
    features: ['Geographic processing', 'Global edge network', 'Low latency'],
  });
}