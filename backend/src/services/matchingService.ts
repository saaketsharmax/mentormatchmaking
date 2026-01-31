/**
 * MATCHING SERVICE
 *
 * Orchestrates the matching pipeline:
 * 1. Fetch all active mentor experiences
 * 2. Run batch matching against the bottleneck
 * 3. Filter and rank results
 * 4. Store matches in database
 */

import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import {
  StructuredBottleneck,
  StructuredExperience,
  MatchReasoning,
  MatchResult,
} from '../models/types';
import {
  buildBatchMatchingPrompt,
  buildMatchingPrompt,
} from '../prompts/matchAndExplain';
import {
  buildBottleneckStructuringPrompt,
} from '../prompts/structureBottleneck';
import {
  buildExperienceStructuringPrompt,
} from '../prompts/structureExperience';

const prisma = new PrismaClient();
const anthropic = new Anthropic();

// Configuration
const BATCH_SIZE = 10; // Experiences per batch matching call
const MIN_SCORE_THRESHOLD = 40; // Minimum score to store a match
const TOP_MATCHES_TO_RETURN = 5; // Number of matches to return to operator

/**
 * Structure a raw bottleneck submission using Claude
 */
export async function structureBottleneck(input: {
  rawBlocker: string;
  rawAttempts: string;
  rawSuccessCriteria: string;
  stage?: string;
  teamSize?: number;
  productMaturity?: string;
}): Promise<StructuredBottleneck> {
  const prompt = buildBottleneckStructuringPrompt(input);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt.user,
      },
    ],
    system: prompt.system,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    return JSON.parse(content.text) as StructuredBottleneck;
  } catch (e) {
    throw new Error(`Failed to parse structured bottleneck: ${content.text}`);
  }
}

/**
 * Structure a raw experience submission using Claude
 */
export async function structureExperience(input: {
  rawProblem: string;
  rawContext: string;
  rawSolution: string;
  rawOutcomes: string;
  yearOccurred?: number;
  companyStage?: string;
}): Promise<StructuredExperience> {
  const prompt = buildExperienceStructuringPrompt(input);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt.user,
      },
    ],
    system: prompt.system,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    return JSON.parse(content.text) as StructuredExperience;
  } catch (e) {
    throw new Error(`Failed to parse structured experience: ${content.text}`);
  }
}

/**
 * Match a single bottleneck against a single experience
 */
export async function matchSingle(
  bottleneck: StructuredBottleneck,
  experience: StructuredExperience,
  mentorName: string
): Promise<{
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  reasoning: MatchReasoning;
}> {
  const prompt = buildMatchingPrompt(bottleneck, experience, mentorName);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt.user,
      },
    ],
    system: prompt.system,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    return JSON.parse(content.text);
  } catch (e) {
    throw new Error(`Failed to parse match result: ${content.text}`);
  }
}

/**
 * Batch match a bottleneck against multiple experiences
 */
async function matchBatch(
  bottleneck: StructuredBottleneck,
  experiences: Array<{
    mentorId: string;
    mentorName: string;
    experienceId: string;
    experience: StructuredExperience;
  }>
): Promise<
  Array<{
    mentorId: string;
    experienceId: string;
    score: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    explanation: string;
    reasoning: MatchReasoning;
  }>
> {
  const prompt = buildBatchMatchingPrompt(bottleneck, experiences);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt.user,
      },
    ],
    system: prompt.system,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    return JSON.parse(content.text);
  } catch (e) {
    throw new Error(`Failed to parse batch match results: ${content.text}`);
  }
}

/**
 * Main matching pipeline
 *
 * Given a bottleneck ID, generates and stores matches against all relevant experiences
 */
export async function generateMatches(bottleneckId: string): Promise<MatchResult[]> {
  // 1. Fetch the bottleneck with its structured data
  const bottleneck = await prisma.bottleneck.findUnique({
    where: { id: bottleneckId },
    include: { startup: true },
  });

  if (!bottleneck) {
    throw new Error(`Bottleneck not found: ${bottleneckId}`);
  }

  if (!bottleneck.structured) {
    throw new Error(`Bottleneck not structured yet: ${bottleneckId}`);
  }

  const structuredBottleneck = JSON.parse(bottleneck.structured) as StructuredBottleneck;

  // 2. Fetch all active mentor experiences with structured data
  const experiences = await prisma.experience.findMany({
    where: {
      structured: { not: null },
      mentor: { isActive: true },
    },
    include: { mentor: true },
  });

  if (experiences.length === 0) {
    return [];
  }

  // 3. Update bottleneck status to MATCHING
  await prisma.bottleneck.update({
    where: { id: bottleneckId },
    data: { status: 'MATCHING' },
  });

  // 4. Batch process experiences
  const allMatches: Array<{
    mentorId: string;
    experienceId: string;
    mentorName: string;
    score: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    explanation: string;
    reasoning: MatchReasoning;
  }> = [];

  for (let i = 0; i < experiences.length; i += BATCH_SIZE) {
    const batch = experiences.slice(i, i + BATCH_SIZE).map((exp) => ({
      mentorId: exp.mentorId,
      mentorName: exp.mentor.name,
      experienceId: exp.id,
      experience: JSON.parse(exp.structured!) as StructuredExperience,
    }));

    const batchResults = await matchBatch(structuredBottleneck, batch);

    allMatches.push(
      ...batchResults.map((r) => ({
        ...r,
        mentorName: batch.find((b) => b.experienceId === r.experienceId)?.mentorName || 'Unknown',
      }))
    );
  }

  // 5. Filter by minimum threshold and sort by score
  const qualifiedMatches = allMatches
    .filter((m) => m.score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  // 6. Store matches in database
  const storedMatches = await Promise.all(
    qualifiedMatches.map(async (match) => {
      const dbMatch = await prisma.match.upsert({
        where: {
          bottleneckId_experienceId: {
            bottleneckId: bottleneckId,
            experienceId: match.experienceId,
          },
        },
        create: {
          bottleneckId: bottleneckId,
          experienceId: match.experienceId,
          mentorId: match.mentorId,
          score: match.score,
          confidence: match.confidence,
          reasoning: JSON.stringify(match.reasoning),
          explanation: match.explanation,
          status: 'PENDING',
        },
        update: {
          score: match.score,
          confidence: match.confidence,
          reasoning: JSON.stringify(match.reasoning),
          explanation: match.explanation,
        },
      });

      return {
        matchId: dbMatch.id,
        mentorId: match.mentorId,
        mentorName: match.mentorName,
        experienceId: match.experienceId,
        score: match.score,
        confidence: match.confidence,
        explanation: match.explanation,
        reasoning: match.reasoning,
      };
    })
  );

  // 7. Update bottleneck status to MATCHED
  await prisma.bottleneck.update({
    where: { id: bottleneckId },
    data: { status: 'MATCHED' },
  });

  // 8. Return top matches
  return storedMatches.slice(0, TOP_MATCHES_TO_RETURN);
}

/**
 * Get weight adjustments based on historical feedback
 *
 * This is the learning loop - we adjust weights based on what matches
 * operators and founders found useful.
 */
export async function getAdjustedWeights(): Promise<{
  problemShapeSimilarity: number;
  constraintAlignment: number;
  stageRelevance: number;
  experienceDepth: number;
  recency: number;
}> {
  // Default weights
  const baseWeights = {
    problemShapeSimilarity: 0.40,
    constraintAlignment: 0.25,
    stageRelevance: 0.20,
    experienceDepth: 0.10,
    recency: 0.05,
  };

  // Fetch recent feedback
  const recentFeedback = await prisma.feedback.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    },
    include: {
      match: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  if (recentFeedback.length < 10) {
    // Not enough data to adjust
    return baseWeights;
  }

  // Analyze which dimensions correlate with positive feedback
  const highlyUseful = recentFeedback.filter((f) => f.rating === 'HIGHLY_USEFUL');
  const notUseful = recentFeedback.filter((f) => f.rating === 'NOT_USEFUL');

  if (highlyUseful.length === 0 || notUseful.length === 0) {
    return baseWeights;
  }

  // Calculate average component scores for each feedback category
  const avgScores = (
    matches: typeof recentFeedback
  ): { [key: string]: number } => {
    const totals: { [key: string]: number } = {
      problemShapeSimilarity: 0,
      constraintAlignment: 0,
      stageRelevance: 0,
      experienceDepth: 0,
      recency: 0,
    };

    matches.forEach((f) => {
      const reasoning = JSON.parse(f.match.reasoning) as MatchReasoning;
      if (reasoning?.scores) {
        Object.keys(totals).forEach((key) => {
          totals[key] += (reasoning.scores as any)[key] || 0;
        });
      }
    });

    Object.keys(totals).forEach((key) => {
      totals[key] /= matches.length;
    });

    return totals;
  };

  const usefulAvg = avgScores(highlyUseful);
  const notUsefulAvg = avgScores(notUseful);

  // Adjust weights based on which dimensions differentiate useful from not useful
  const adjustedWeights = { ...baseWeights };
  const dimensions = Object.keys(baseWeights) as Array<keyof typeof baseWeights>;

  dimensions.forEach((dim) => {
    const diff = usefulAvg[dim] - notUsefulAvg[dim];
    // If useful matches score higher on this dimension, increase its weight
    // Scale adjustment to be subtle (max 20% change)
    const adjustment = Math.max(-0.05, Math.min(0.05, diff / 100));
    adjustedWeights[dim] = baseWeights[dim] + adjustment;
  });

  // Normalize weights to sum to 1
  const total = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
  dimensions.forEach((dim) => {
    adjustedWeights[dim] /= total;
  });

  return adjustedWeights;
}

export default {
  structureBottleneck,
  structureExperience,
  matchSingle,
  generateMatches,
  getAdjustedWeights,
};
