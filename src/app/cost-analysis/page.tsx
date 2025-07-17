import CostTracker from '@/components/CostTracker';

export default function CostAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cost Analysis</h1>
          <p className="text-gray-600">Detailed cost breakdown and savings analysis for Vercel Functions</p>
        </div>
        
        <CostTracker />
      </div>
    </div>
  );
}