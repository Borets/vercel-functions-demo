# Vercel Functions Performance Demo

A comprehensive demo site showcasing Vercel's latest 2025 performance features, including **Fluid Compute with Active CPU pricing**, Edge Functions, and AI workload optimization.

## 🚀 Features

### Function Types Demonstrated
- **Fluid Compute Functions**: New default compute model with Active CPU pricing
- **Edge Functions**: Ultra-fast cold starts with global distribution
- **Serverless Functions**: Traditional compute for comparison
- **AI Workload Functions**: Optimized for inference and agent workflows

### Performance Testing
- **Real-time benchmarking** with comprehensive metrics
- **Cost analysis** showing up to 85% savings with Fluid Compute
- **Streaming demonstrations** for real-time applications
- **Load testing** capabilities with configurable parameters

### Key Metrics Tracked
- **Active CPU pricing** ($0.128/hour for active CPU time only)
- **Memory usage** ($0.0106/GB-hour with resource sharing)
- **Response times** and cold start performance
- **Cost comparisons** between different compute models

## 🏗️ Architecture

Built with the latest technologies:
- **Next.js 15.4.1** with Turbopack for optimal performance
- **React 19** with streaming metadata support
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Recharts** for performance visualizations

## 📊 Demo Pages

1. **Performance Dashboard** (`/`) - Real-time metrics and benchmarking
2. **Cost Analysis** (`/cost-analysis`) - Detailed cost breakdown and savings
3. **Streaming Demo** (`/streaming-demo`) - HTTP response streaming showcase

## 🔧 API Endpoints

### Fluid Compute Functions
- `POST /api/fluid/cpu-intensive` - High CPU utilization demo
- `POST /api/fluid/io-bound` - I/O bound workload (ideal for cost savings)
- `POST /api/fluid/concurrent` - Concurrent request handling
- `POST /api/fluid/streaming` - HTTP response streaming

### Edge Functions
- `POST /api/edge/quick-response` - Ultra-fast edge response
- `POST /api/edge/geo-location` - Geographic processing demo

### AI Workload Functions
- `POST /api/ai/text-generation` - AI inference simulation
- `POST /api/ai/agent-simulation` - Agent workflow optimization

### Benchmark Suite
- `POST /api/benchmark/suite` - Comprehensive performance benchmarking
- `POST /api/benchmark/load-test` - Configurable load testing

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   ```
   http://localhost:3000
   ```

## 🔧 Deployment

The project is optimized for Vercel deployment with:
- **Fluid Compute as default** (`vercel.json` configured)
- **Node.js 20.x runtime** for all functions
- **Global edge distribution** for optimal performance

Deploy to Vercel:
```bash
vercel --prod
```

## 📈 Performance Insights

### Fluid Compute Benefits
- **Active CPU pricing**: Pay only for CPU usage (not idle time)
- **Resource sharing**: Multiple requests share underlying resources
- **Cost savings**: Up to 85% reduction for I/O-bound workloads
- **AI optimization**: Perfect for inference and agent workflows

### Edge Functions Advantages
- **9x faster cold starts** compared to traditional serverless
- **Global distribution** across 70+ edge locations
- **V8 Edge Runtime** with minimal overhead
- **Instant scaling** for high-traffic applications

### Benchmark Results
The demo shows typical performance improvements:
- **AI workloads**: 80%+ cost savings due to low CPU utilization
- **I/O-bound functions**: 70%+ savings from idle time optimization
- **Streaming applications**: Minimal cost for long-running connections
- **Edge functions**: Sub-100ms response times globally

## 🛠️ Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "compute": {
    "default": "fluid"
  },
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "regions": ["all"]
    }
  }
}
```

### Environment Variables
- `NEXT_PUBLIC_VERCEL_URL`: Deployment URL
- `NEXT_PUBLIC_VERCEL_ENV`: Environment (preview/production)

## 📚 Learn More

- [Vercel Fluid Compute Documentation](https://vercel.com/docs/functions/fluid-compute)
- [Active CPU Pricing](https://vercel.com/blog/introducing-active-cpu-pricing-for-fluid-compute)
- [Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Next.js 15.4.1 Release Notes](https://nextjs.org/blog/next-15-2)

## 🎯 Use Cases

Perfect for demonstrating:
- **AI/ML workloads** with variable CPU usage
- **Real-time applications** with streaming requirements
- **Cost optimization** for high-volume applications
- **Global performance** with edge distribution
- **Modern serverless** architecture benefits

---

Built with ❤️ to showcase Vercel's cutting-edge 2025 compute capabilities.
