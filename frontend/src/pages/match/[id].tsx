import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getMatch, Match, approveMatch, rejectMatch, markIntroSent, submitFeedback } from '@/lib/api';

export default function MatchDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback form
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<'HIGHLY_USEFUL' | 'SOMEWHAT_USEFUL' | 'NOT_USEFUL'>('HIGHLY_USEFUL');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadMatch(id);
    }
  }, [id]);

  const loadMatch = async (matchId: string) => {
    try {
      const data = await getMatch(matchId);
      setMatch(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      await approveMatch(match.id, { operatorId: 'operator-1' });
      loadMatch(match.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      await rejectMatch(match.id, { operatorId: 'operator-1' });
      loadMatch(match.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIntroSent = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      await markIntroSent(match.id);
      loadMatch(match.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      await submitFeedback(match.id, {
        rating: feedbackRating,
        operatorNotes: feedbackNotes || undefined,
      });
      loadMatch(match.id);
      setShowFeedback(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-slate-100 text-slate-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      INTRO_SENT: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`badge ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sanctuary-200 border-t-sanctuary-600 rounded-full" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Match not found'}</p>
          <Link href="/operator" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const reasoning = match.reasoning as {
    scores: Record<string, number>;
    weights: Record<string, number>;
    componentReasoning: Record<string, string>;
    keyAlignments: string[];
    concerns: string[];
    confidenceFactors: Record<string, string>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sanctuary-700 font-bold">
              Sanctuary Intelligence
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/operator" className="text-slate-600 hover:text-sanctuary-600">
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Match Detail</span>
          </div>
          {getStatusBadge(match.status)}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Score header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {match.mentor.name}
              </h1>
              <p className="text-slate-600">
                Matched with <strong>{(match as any).bottleneck?.startup?.name || 'Startup'}</strong>
              </p>
            </div>
            <div className="text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
                  match.score >= 70
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : match.score >= 50
                    ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                    : 'text-red-600 bg-red-50 border-red-200'
                }`}
              >
                {match.score}
              </div>
              <div className="mt-2">
                <span
                  className={`badge ${
                    match.confidence === 'HIGH'
                      ? 'badge-high'
                      : match.confidence === 'MEDIUM'
                      ? 'badge-medium'
                      : 'badge-low'
                  }`}
                >
                  {match.confidence} Confidence
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Match Explanation
          </h2>
          <p className="text-slate-700 leading-relaxed">{match.explanation}</p>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Bottleneck */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Founder&apos;s Bottleneck
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Blocker</p>
                <p className="text-slate-700">{(match as any).bottleneck?.rawBlocker}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Already Tried</p>
                <p className="text-slate-700">{(match as any).bottleneck?.rawAttempts}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Success Criteria</p>
                <p className="text-slate-700">{(match as any).bottleneck?.rawSuccessCriteria}</p>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Mentor&apos;s Experience
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Problem Solved</p>
                <p className="text-slate-700">{match.experience.rawProblem}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed reasoning */}
        {reasoning && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Match Reasoning (Audit Trail)
            </h2>

            {/* Component scores */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {Object.entries(reasoning.scores || {}).map(([key, score]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{score}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-slate-400">
                    ({Math.round((reasoning.weights?.[key] || 0) * 100)}% weight)
                  </div>
                </div>
              ))}
            </div>

            {/* Key alignments */}
            {reasoning.keyAlignments?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Key Alignments</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {reasoning.keyAlignments.map((alignment, i) => (
                    <li key={i}>{alignment}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {reasoning.concerns?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Potential Concerns</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {reasoning.concerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Component reasoning */}
            <details className="mt-4">
              <summary className="text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                Show detailed component reasoning
              </summary>
              <div className="mt-4 space-y-3 text-sm">
                {Object.entries(reasoning.componentReasoning || {}).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-slate-700 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-slate-600">{value}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>

          {match.status === 'PENDING' && (
            <div className="flex gap-4">
              <button
                className="btn-primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                Approve Match
              </button>
              <button
                className="btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Reject Match
              </button>
            </div>
          )}

          {match.status === 'APPROVED' && (
            <button
              className="btn-primary"
              onClick={handleIntroSent}
              disabled={actionLoading}
            >
              Mark Introduction Sent
            </button>
          )}

          {match.status === 'INTRO_SENT' && !match.feedback && (
            <div>
              {!showFeedback ? (
                <button
                  className="btn-primary"
                  onClick={() => setShowFeedback(true)}
                >
                  Record Feedback
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="label">How useful was this match?</label>
                    <div className="flex gap-3">
                      {(['HIGHLY_USEFUL', 'SOMEWHAT_USEFUL', 'NOT_USEFUL'] as const).map(
                        (rating) => (
                          <button
                            key={rating}
                            className={`px-4 py-2 rounded-lg border ${
                              feedbackRating === rating
                                ? 'border-sanctuary-600 bg-sanctuary-50 text-sanctuary-700'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                            onClick={() => setFeedbackRating(rating)}
                          >
                            {rating.replace(/_/g, ' ')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="label">Notes (optional)</label>
                    <textarea
                      className="textarea h-20"
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      placeholder="Any additional context about the match quality..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="btn-primary"
                      onClick={handleSubmitFeedback}
                      disabled={actionLoading}
                    >
                      Submit Feedback
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowFeedback(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {match.feedback && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-1">Feedback Received</p>
              <p className="text-slate-600">
                Rating: <strong>{match.feedback.rating.replace(/_/g, ' ')}</strong>
              </p>
              {match.feedback.operatorNotes && (
                <p className="text-sm text-slate-500 mt-2">{match.feedback.operatorNotes}</p>
              )}
            </div>
          )}

          {match.status === 'REJECTED' && (
            <p className="text-slate-500">This match was rejected.</p>
          )}
        </div>
      </main>
    </div>
  );
}
