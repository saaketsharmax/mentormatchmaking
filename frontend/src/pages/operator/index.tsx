import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboard, DashboardData, approveMatch, rejectMatch } from '@/lib/api';

export default function OperatorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboard = await getDashboard();
      setData(dashboard);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await approveMatch(matchId, { operatorId: 'operator-1' });
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await rejectMatch(matchId, { operatorId: 'operator-1' });
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-24 border-8 border-black flex items-center justify-center">
          <div className="size-8 bg-primary animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-brutal p-8 text-center">
          <p className="text-match-low font-bold mb-4">ERROR: {error}</p>
          <button className="btn-brutal-outline" onClick={loadDashboard}>
            RETRY
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Group matches by startup
  const startupMatches = data.pendingMatches.reduce((acc, match) => {
    const startupId = match.bottleneck.startup.id;
    if (!acc[startupId]) {
      acc[startupId] = {
        startup: match.bottleneck.startup,
        bottleneck: match.bottleneck,
        matches: [],
      };
    }
    acc[startupId].matches.push(match);
    return acc;
  }, {} as Record<string, { startup: any; bottleneck: any; matches: typeof data.pendingMatches }>);

  const startupList = Object.values(startupMatches);
  const activeStartup = selectedStartup ? startupMatches[selectedStartup] : startupList[0];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-white brutal-border border-l-0 border-t-0 border-b-0 flex flex-col">
        <div className="p-6 border-b-4 border-black bg-primary text-black">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 bg-black"></div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">SANCTUARY</h1>
              <p className="text-[10px] font-bold tracking-widest mt-1 opacity-80">TACTICAL OPERATOR V2.4</p>
            </div>
          </div>
          <div className="relative">
            <input
              className="w-full bg-white brutal-border py-2 pl-4 pr-10 text-xs font-bold focus:ring-0 placeholder:text-gray-400"
              placeholder="[ SEARCH_STARTUPS ]"
              type="text"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[11px] font-black bg-black text-white px-2 py-1 inline-block tracking-widest mb-2">
            ACTIVE_RESIDENCIES
          </div>

          {startupList.length === 0 ? (
            <p className="text-xs font-bold text-gray-500 p-4">NO PENDING MATCHES</p>
          ) : (
            startupList.map(({ startup, matches }) => (
              <button
                key={startup.id}
                onClick={() => setSelectedStartup(startup.id)}
                className={`w-full flex items-center gap-3 p-3 brutal-border text-left transition-transform active:translate-y-1 ${
                  activeStartup?.startup.id === startup.id
                    ? 'bg-black text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <div className="w-12 h-12 brutal-border bg-gray-200 flex items-center justify-center text-2xl font-black">
                  {startup.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-black truncate">{startup.name}</p>
                  <p className="text-[10px] font-bold opacity-60 mt-1">
                    {matches.length} MATCH{matches.length !== 1 ? 'ES' : ''} // {startup.stage}
                  </p>
                </div>
                <div className={`w-3 h-3 ${matches[0]?.score >= 70 ? 'bg-match-high' : 'bg-primary'}`}></div>
              </button>
            ))
          )}
        </nav>

        <div className="p-4 border-t-4 border-black bg-white">
          <Link
            href="/founder/submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white brutal-border text-xs font-black tracking-widest hover:bg-primary hover:text-black transition-colors"
          >
            + NEW_ENTRY
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div className="bg-black text-white px-8 py-2 flex items-center justify-between text-[10px] font-bold tracking-widest">
          <div className="flex gap-6">
            <span>SYSTEM: STABLE</span>
            <span>VOL: {String(data.stats.totalMatches).padStart(3, '0')}</span>
          </div>
          <div className="flex gap-6">
            <span>PENDING: {data.stats.pendingBottlenecks}</span>
            <span>APPROVED: {data.stats.approvedMatches}</span>
          </div>
        </div>

        {activeStartup ? (
          <div className="px-8 py-8 flex-1">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-black text-white px-2 py-0.5 text-[11px] font-black tracking-tighter">
                    {activeStartup.startup.stage}
                  </span>
                  <span className="text-black font-black text-sm">&gt;&gt;&gt;</span>
                  <span className="text-black font-black text-sm">
                    {activeStartup.matches.length}_MATCHES_FOUND
                  </span>
                </div>
                <h2 className="header-block text-5xl">{activeStartup.startup.name}</h2>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/match/${activeStartup.matches[0]?.id}`}
                  className="btn-brutal-outline"
                >
                  VIEW_DETAILS
                </Link>
              </div>
            </div>

            {/* Bottleneck */}
            <div className="brutal-border bg-white mb-8 flex overflow-hidden">
              <div className="w-20 bg-black flex items-center justify-center">
                <span className="text-primary text-4xl font-black">!</span>
              </div>
              <div className="flex-1 p-8">
                <h3 className="text-[11px] font-black tracking-widest text-gray-500 mb-4 inline-block border-b-2 border-black">
                  TARGET_BOTTLENECK
                </h3>
                <p className="text-xl font-bold leading-tight normal-case">
                  &quot;{activeStartup.bottleneck.rawBlocker.substring(0, 200)}
                  {activeStartup.bottleneck.rawBlocker.length > 200 ? '...' : ''}&quot;
                </p>
              </div>
            </div>

            {/* Matches */}
            <div>
              <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
                <h3 className="font-black text-2xl tracking-tighter flex items-center gap-4">
                  ≡ MATCH_MANIFEST
                </h3>
                <div className="flex gap-6">
                  <div className="text-xs font-black border-b-2 border-black">SORT: SCORE_DESC</div>
                </div>
              </div>

              <div className="space-y-4">
                {activeStartup.matches.map((match) => (
                  <div
                    key={match.id}
                    className="brutal-border bg-white p-0 flex items-stretch hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  >
                    <div className="w-24 brutal-border border-l-0 border-t-0 border-b-0 bg-gray-200 flex items-center justify-center text-4xl font-black">
                      {match.mentor.name.charAt(0)}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-2">
                        <h4 className="font-black text-2xl tracking-tight">{match.mentor.name}</h4>
                        <span
                          className={`badge-brutal ${
                            match.confidence === 'HIGH'
                              ? 'badge-high'
                              : match.confidence === 'MEDIUM'
                              ? 'badge-medium'
                              : 'badge-low'
                          }`}
                        >
                          {match.confidence}_CONFIDENCE
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-600 normal-case line-clamp-2">
                        {match.explanation}
                      </p>
                    </div>
                    <div className="w-32 brutal-border border-r-0 border-t-0 border-b-0 bg-gray-50 flex flex-col items-center justify-center p-4">
                      <div className="text-[10px] font-black text-gray-400 mb-1">SCORE</div>
                      <div className="score-display">{match.score.toFixed(1)}</div>
                    </div>
                    <div className="w-48 border-l-4 border-black p-4 flex flex-col gap-2 bg-white">
                      <button
                        onClick={() => handleApprove(match.id)}
                        disabled={actionLoading === match.id}
                        className="w-full py-2 bg-black text-white text-[10px] font-black hover:bg-primary hover:text-black transition-colors disabled:opacity-50"
                      >
                        {actionLoading === match.id ? 'PROCESSING...' : 'INIT_CONTACT'}
                      </button>
                      <button
                        onClick={() => handleReject(match.id)}
                        disabled={actionLoading === match.id}
                        className="w-full py-2 brutal-border text-[10px] font-black hover:bg-match-low hover:text-white hover:border-match-low transition-colors disabled:opacity-50"
                      >
                        PURGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-24 brutal-border mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">∅</span>
              </div>
              <h2 className="header-block text-2xl mb-2">NO_PENDING_MATCHES</h2>
              <p className="text-sm font-bold text-gray-500">CHECK BACK LATER</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-4 border-black bg-white px-8 py-4 flex justify-between text-[10px] font-bold text-gray-500">
          <div className="flex gap-6">
            <span>QUALITY_RATE: {data.stats.matchQuality.highlyUseful}H / {data.stats.matchQuality.somewhatUseful}M / {data.stats.matchQuality.notUseful}L</span>
          </div>
          <Link href="/operator/analytics" className="underline hover:text-primary">
            VIEW_ANALYTICS
          </Link>
        </div>
      </main>
    </div>
  );
}
