import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalytics, AnalyticsData } from '@/lib/api';

export default function OperatorAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const analytics = await getAnalytics();
      setData(analytics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sanctuary-200 border-t-sanctuary-600 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button className="btn-primary" onClick={loadAnalytics}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const dimensionLabels: Record<string, string> = {
    problemShapeSimilarity: 'Problem Shape',
    constraintAlignment: 'Constraint Alignment',
    stageRelevance: 'Stage Relevance',
    experienceDepth: 'Experience Depth',
    recency: 'Recency',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-sanctuary-700 font-bold">
            Sanctuary Intelligence
          </Link>
          <span className="text-slate-400">/</span>
          <Link href="/operator" className="text-slate-600 hover:text-sanctuary-600">
            Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Analytics</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Match Quality Analytics</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current weights */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Current Dimension Weights
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              These weights are adjusted based on feedback. Higher weight = more influence on match score.
            </p>
            <div className="space-y-3">
              {Object.entries(data.currentWeights).map(([key, weight]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{dimensionLabels[key] || key}</span>
                    <span className="font-medium">{Math.round(weight * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-sanctuary-600 h-2 rounded-full"
                      style={{ width: `${weight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matches by confidence */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Matches by Confidence Level
            </h2>
            <div className="space-y-4">
              {data.matchesByConfidence.map((item) => (
                <div
                  key={item.confidence}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <span
                      className={`badge ${
                        item.confidence === 'HIGH'
                          ? 'badge-high'
                          : item.confidence === 'MEDIUM'
                          ? 'badge-medium'
                          : 'badge-low'
                      }`}
                    >
                      {item.confidence}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">
                      {item._count.id} matches
                    </div>
                    <div className="text-sm text-slate-600">
                      Avg score: {Math.round(item._avg.score || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scores by rating */}
          <div className="card md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Match Scores vs. Feedback
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Comparing match scores against actual feedback helps calibrate the system.
            </p>
            {data.scoresByRating.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No feedback data yet. Scores will appear here as feedback is collected.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {data.scoresByRating.map((item) => (
                  <div
                    key={item.rating}
                    className={`p-6 rounded-lg text-center ${
                      item.rating === 'HIGHLY_USEFUL'
                        ? 'bg-green-50'
                        : item.rating === 'SOMEWHAT_USEFUL'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <div
                      className={`text-3xl font-bold mb-2 ${
                        item.rating === 'HIGHLY_USEFUL'
                          ? 'text-green-700'
                          : item.rating === 'SOMEWHAT_USEFUL'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}
                    >
                      {Math.round(item.avgScore)}
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      Avg Score
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.rating.replace(/_/g, ' ')} ({item.count} matches)
                    </div>
                  </div>
                ))}
              </div>
            )}

            {data.scoresByRating.length > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Interpretation</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>
                    • If &quot;Highly Useful&quot; matches have significantly higher scores, the system is well-calibrated.
                  </li>
                  <li>
                    • If scores are similar across ratings, the matching dimensions may need adjustment.
                  </li>
                  <li>
                    • The learning loop automatically adjusts weights based on this data.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
