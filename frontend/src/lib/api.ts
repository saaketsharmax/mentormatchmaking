/**
 * API Client for Sanctuary Network Intelligence
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    // Include validation details if present
    let message = error.error || 'Request failed';
    if (error.details && Array.isArray(error.details)) {
      const fieldErrors = error.details.map((d: { field: string; message: string }) => d.message).join(', ');
      message = fieldErrors || message;
    }
    throw new Error(message);
  }

  return res.json();
}

// =============================================================================
// STARTUP API
// =============================================================================

export interface Startup {
  id: string;
  name: string;
  founderName: string;
  email: string;
  stage: string;
  teamSize?: number;
  productMaturity?: string;
}

export async function createStartup(data: {
  name: string;
  founderName: string;
  email: string;
  stage?: string;
  teamSize?: number;
  productMaturity?: string;
}): Promise<Startup> {
  return fetchAPI('/startups', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getStartup(id: string): Promise<Startup> {
  return fetchAPI(`/startups/${id}`);
}

// =============================================================================
// MENTOR API
// =============================================================================

export interface Mentor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  linkedinUrl?: string;
  isActive: boolean;
  experiences?: { id: string }[];
}

export async function createMentor(data: {
  name: string;
  email: string;
  bio?: string;
  linkedinUrl?: string;
}): Promise<Mentor> {
  return fetchAPI('/mentors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMentors(): Promise<Mentor[]> {
  return fetchAPI('/mentors');
}

// =============================================================================
// BOTTLENECK API
// =============================================================================

export interface BottleneckSubmission {
  startupId: string;
  rawBlocker: string;
  rawAttempts: string;
  rawSuccessCriteria: string;
  stage?: string;
  teamSize?: number;
  productMaturity?: string;
}

export interface BottleneckResponse {
  id: string;
  status: string;
  structured?: Record<string, unknown>;
  message: string;
}

export async function submitBottleneck(
  data: BottleneckSubmission
): Promise<BottleneckResponse> {
  return fetchAPI('/bottlenecks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface Bottleneck {
  id: string;
  startupId: string;
  rawBlocker: string;
  rawAttempts: string;
  rawSuccessCriteria: string;
  structured: Record<string, unknown> | null;
  status: string;
  startup: Startup;
  matches: Match[];
}

export async function getBottleneck(id: string): Promise<Bottleneck> {
  return fetchAPI(`/bottlenecks/${id}`);
}

export async function getBottleneckMatches(id: string): Promise<Match[]> {
  return fetchAPI(`/bottlenecks/${id}/matches`);
}

// =============================================================================
// EXPERIENCE API
// =============================================================================

export interface ExperienceSubmission {
  mentorId: string;
  rawProblem: string;
  rawContext: string;
  rawSolution: string;
  rawOutcomes: string;
  yearOccurred?: number;
  companyStage?: string;
}

export async function submitExperience(
  data: ExperienceSubmission
): Promise<{ id: string; message: string }> {
  return fetchAPI('/experiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// =============================================================================
// MATCH API
// =============================================================================

export interface Match {
  id: string;
  bottleneckId: string;
  experienceId: string;
  mentorId: string;
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  reasoning: Record<string, unknown>;
  status: string;
  mentor: Mentor;
  experience: {
    id: string;
    rawProblem: string;
    structured: Record<string, unknown> | null;
  };
  feedback?: Feedback;
}

export interface Feedback {
  id: string;
  rating: 'HIGHLY_USEFUL' | 'SOMEWHAT_USEFUL' | 'NOT_USEFUL';
  wasRelevant?: boolean;
  wasActionable?: boolean;
  wouldRecommend?: boolean;
  founderNotes?: string;
  operatorNotes?: string;
}

export async function getMatch(id: string): Promise<Match> {
  return fetchAPI(`/matches/${id}`);
}

export async function approveMatch(
  id: string,
  data: { operatorId: string; operatorNotes?: string }
): Promise<Match> {
  return fetchAPI(`/matches/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function rejectMatch(
  id: string,
  data: { operatorId: string; operatorNotes?: string }
): Promise<Match> {
  return fetchAPI(`/matches/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markIntroSent(id: string): Promise<Match> {
  return fetchAPI(`/matches/${id}/intro-sent`, { method: 'POST' });
}

export async function submitFeedback(
  matchId: string,
  data: {
    rating: 'HIGHLY_USEFUL' | 'SOMEWHAT_USEFUL' | 'NOT_USEFUL';
    wasRelevant?: boolean;
    wasActionable?: boolean;
    wouldRecommend?: boolean;
    founderNotes?: string;
    operatorNotes?: string;
  }
): Promise<Feedback> {
  return fetchAPI(`/matches/${matchId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// =============================================================================
// OPERATOR API
// =============================================================================

export interface DashboardData {
  pendingMatches: Match[];
  recentFeedback: Array<{
    id: string;
    rating: string;
    match: Match & { bottleneck: Bottleneck };
  }>;
  stats: {
    totalMatches: number;
    approvedMatches: number;
    completedMatches: number;
    pendingBottlenecks: number;
    matchQuality: {
      highlyUseful: number;
      somewhatUseful: number;
      notUseful: number;
    };
  };
}

export async function getDashboard(): Promise<DashboardData> {
  return fetchAPI('/operator/dashboard');
}

export interface AnalyticsData {
  currentWeights: Record<string, number>;
  matchesByConfidence: Array<{
    confidence: string;
    _avg: { score: number };
    _count: { id: number };
  }>;
  scoresByRating: Array<{
    rating: string;
    avgScore: number;
    count: number;
  }>;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  return fetchAPI('/operator/analytics');
}
