/**
 * API ROUTES
 *
 * RESTful endpoints for the Sanctuary Network Intelligence system.
 *
 * Endpoints:
 * - POST /api/startups - Create a startup
 * - POST /api/mentors - Create a mentor
 * - POST /api/bottlenecks - Submit a bottleneck
 * - POST /api/experiences - Submit an experience
 * - GET /api/bottlenecks/:id/matches - Get matches for a bottleneck
 * - POST /api/matches/:id/approve - Approve a match
 * - POST /api/matches/:id/reject - Reject a match
 * - POST /api/matches/:id/feedback - Submit feedback
 * - GET /api/operator/dashboard - Operator dashboard data
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import matchingService from '../services/matchingService';
import {
  BottleneckSubmission,
  ExperienceSubmission,
  FeedbackSubmission,
  StructuredBottleneck,
  StructuredExperience,
} from '../models/types';
import {
  validateStartup,
  validateMentor,
  validateBottleneck,
  validateExperience,
  validateFeedback,
} from '../middleware/validation';
import { submitLimiter } from '../middleware/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

// =============================================================================
// STARTUP ENDPOINTS
// =============================================================================

/**
 * Create a new startup
 */
router.post('/startups', validateStartup, async (req: Request, res: Response) => {
  try {
    const { name, founderName, email, stage, teamSize, productMaturity } = req.body;

    const startup = await prisma.startup.create({
      data: {
        name,
        founderName,
        email,
        stage: stage || 'PRE_SEED',
        teamSize,
        productMaturity,
      },
    });

    res.status(201).json(startup);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A startup with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create startup' });
    }
  }
});

/**
 * Get startup by ID
 */
router.get('/startups/:id', async (req: Request, res: Response) => {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: req.params.id },
      include: {
        bottlenecks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    res.json(startup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch startup' });
  }
});

// =============================================================================
// MENTOR ENDPOINTS
// =============================================================================

/**
 * Create a new mentor
 */
router.post('/mentors', validateMentor, async (req: Request, res: Response) => {
  try {
    const { name, email, bio, linkedinUrl } = req.body;

    const mentor = await prisma.mentor.create({
      data: {
        name,
        email,
        bio,
        linkedinUrl,
      },
    });

    res.status(201).json(mentor);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A mentor with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create mentor' });
    }
  }
});

/**
 * Get mentor by ID
 */
router.get('/mentors/:id', async (req: Request, res: Response) => {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id: req.params.id },
      include: {
        experiences: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
});

/**
 * List all active mentors
 */
router.get('/mentors', async (req: Request, res: Response) => {
  try {
    const mentors = await prisma.mentor.findMany({
      where: { isActive: true },
      include: {
        experiences: {
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// =============================================================================
// BOTTLENECK ENDPOINTS
// =============================================================================

/**
 * Submit a new bottleneck
 *
 * This is the main entry point for founders.
 * 1. Creates the bottleneck record
 * 2. Structures it using Claude
 * 3. Triggers matching (async)
 */
router.post('/bottlenecks', submitLimiter, validateBottleneck, async (req: Request, res: Response) => {
  try {
    const submission: BottleneckSubmission = req.body;

    // 1. Create the bottleneck record
    const bottleneck = await prisma.bottleneck.create({
      data: {
        startupId: submission.startupId,
        rawBlocker: submission.rawBlocker,
        rawAttempts: submission.rawAttempts,
        rawSuccessCriteria: submission.rawSuccessCriteria,
        status: 'PENDING',
      },
    });

    // 2. Structure the bottleneck (this calls Claude)
    try {
      const structured = await matchingService.structureBottleneck({
        rawBlocker: submission.rawBlocker,
        rawAttempts: submission.rawAttempts,
        rawSuccessCriteria: submission.rawSuccessCriteria,
        stage: submission.stage,
        teamSize: submission.teamSize,
        productMaturity: submission.productMaturity,
      });

      await prisma.bottleneck.update({
        where: { id: bottleneck.id },
        data: {
          structured: JSON.stringify(structured),
          status: 'STRUCTURED',
        },
      });

      // 3. Trigger matching (async - don't wait)
      matchingService.generateMatches(bottleneck.id).catch((err) => {
        console.error('Matching failed:', err);
      });

      res.status(201).json({
        id: bottleneck.id,
        status: 'STRUCTURED',
        structured,
        message: 'Bottleneck submitted. Matching in progress.',
      });
    } catch (structureError) {
      console.error('Structuring failed:', structureError);

      // Still return the bottleneck, but note the error
      res.status(201).json({
        id: bottleneck.id,
        status: 'PENDING',
        message: 'Bottleneck submitted but structuring failed. An operator will review.',
      });
    }
  } catch (error) {
    console.error('Bottleneck submission error:', error);
    res.status(500).json({ error: 'Failed to submit bottleneck' });
  }
});

/**
 * Get bottleneck by ID
 */
router.get('/bottlenecks/:id', async (req: Request, res: Response) => {
  try {
    const bottleneck = await prisma.bottleneck.findUnique({
      where: { id: req.params.id },
      include: {
        startup: true,
        matches: {
          include: {
            mentor: true,
            experience: true,
            feedback: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!bottleneck) {
      return res.status(404).json({ error: 'Bottleneck not found' });
    }

    res.json(bottleneck);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bottleneck' });
  }
});

/**
 * Get matches for a bottleneck
 */
router.get('/bottlenecks/:id/matches', async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      where: { bottleneckId: req.params.id },
      include: {
        mentor: true,
        experience: true,
        feedback: true,
      },
      orderBy: { score: 'desc' },
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

/**
 * Regenerate matches for a bottleneck
 */
router.post('/bottlenecks/:id/rematch', async (req: Request, res: Response) => {
  try {
    const bottleneck = await prisma.bottleneck.findUnique({
      where: { id: req.params.id },
    });

    if (!bottleneck) {
      return res.status(404).json({ error: 'Bottleneck not found' });
    }

    if (!bottleneck.structured) {
      return res.status(400).json({ error: 'Bottleneck not structured yet' });
    }

    // Trigger matching
    const matches = await matchingService.generateMatches(req.params.id);

    res.json({
      message: 'Matching complete',
      matchCount: matches.length,
      matches,
    });
  } catch (error) {
    console.error('Rematch error:', error);
    res.status(500).json({ error: 'Failed to regenerate matches' });
  }
});

// =============================================================================
// EXPERIENCE ENDPOINTS
// =============================================================================

/**
 * Submit a new experience
 *
 * This is the main entry point for mentors.
 */
router.post('/experiences', submitLimiter, validateExperience, async (req: Request, res: Response) => {
  try {
    const submission: ExperienceSubmission = req.body;

    // 1. Create the experience record
    const experience = await prisma.experience.create({
      data: {
        mentorId: submission.mentorId,
        rawProblem: submission.rawProblem,
        rawContext: submission.rawContext,
        rawSolution: submission.rawSolution,
        rawOutcomes: submission.rawOutcomes,
        yearOccurred: submission.yearOccurred,
        companyStage: submission.companyStage,
      },
    });

    // 2. Structure the experience (this calls Claude)
    try {
      const structured = await matchingService.structureExperience({
        rawProblem: submission.rawProblem,
        rawContext: submission.rawContext,
        rawSolution: submission.rawSolution,
        rawOutcomes: submission.rawOutcomes,
        yearOccurred: submission.yearOccurred,
        companyStage: submission.companyStage,
      });

      await prisma.experience.update({
        where: { id: experience.id },
        data: { structured: JSON.stringify(structured) },
      });

      res.status(201).json({
        id: experience.id,
        structured,
        message: 'Experience submitted and structured successfully.',
      });
    } catch (structureError) {
      console.error('Experience structuring failed:', structureError);

      res.status(201).json({
        id: experience.id,
        message: 'Experience submitted but structuring failed. An operator will review.',
      });
    }
  } catch (error) {
    console.error('Experience submission error:', error);
    res.status(500).json({ error: 'Failed to submit experience' });
  }
});

/**
 * Get experience by ID
 */
router.get('/experiences/:id', async (req: Request, res: Response) => {
  try {
    const experience = await prisma.experience.findUnique({
      where: { id: req.params.id },
      include: { mentor: true },
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

// =============================================================================
// MATCH ENDPOINTS
// =============================================================================

/**
 * Get match by ID
 */
router.get('/matches/:id', async (req: Request, res: Response) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: {
        bottleneck: {
          include: { startup: true },
        },
        mentor: true,
        experience: true,
        feedback: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

/**
 * Approve a match (operator action)
 */
router.post('/matches/:id/approve', async (req: Request, res: Response) => {
  try {
    const { operatorId, operatorNotes } = req.body;

    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        operatorId,
        operatorNotes,
      },
    });

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve match' });
  }
});

/**
 * Reject a match (operator action)
 */
router.post('/matches/:id/reject', async (req: Request, res: Response) => {
  try {
    const { operatorId, operatorNotes } = req.body;

    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        operatorId,
        operatorNotes,
      },
    });

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject match' });
  }
});

/**
 * Mark intro as sent
 */
router.post('/matches/:id/intro-sent', async (req: Request, res: Response) => {
  try {
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        status: 'INTRO_SENT',
        introSentAt: new Date(),
      },
    });

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

/**
 * Submit feedback for a match
 */
router.post('/matches/:id/feedback', validateFeedback, async (req: Request, res: Response) => {
  try {
    const submission: FeedbackSubmission = req.body;

    const feedback = await prisma.feedback.create({
      data: {
        matchId: req.params.id,
        rating: submission.rating,
        wasRelevant: submission.wasRelevant,
        wasActionable: submission.wasActionable,
        wouldRecommend: submission.wouldRecommend,
        founderNotes: submission.founderNotes,
        operatorNotes: submission.operatorNotes,
      },
    });

    // Update match status
    await prisma.match.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' },
    });

    res.status(201).json(feedback);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Feedback already submitted for this match' });
    } else {
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }
});

// =============================================================================
// OPERATOR DASHBOARD ENDPOINTS
// =============================================================================

/**
 * Get operator dashboard data
 */
router.get('/operator/dashboard', async (req: Request, res: Response) => {
  try {
    // Pending matches requiring review
    const pendingMatches = await prisma.match.findMany({
      where: { status: 'PENDING' },
      include: {
        bottleneck: {
          include: { startup: true },
        },
        mentor: true,
        experience: true,
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take: 20,
    });

    // Recent feedback
    const recentFeedback = await prisma.feedback.findMany({
      include: {
        match: {
          include: {
            mentor: true,
            bottleneck: {
              include: { startup: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Stats
    const totalMatches = await prisma.match.count();
    const approvedMatches = await prisma.match.count({
      where: { status: 'APPROVED' },
    });
    const completedMatches = await prisma.match.count({
      where: { status: 'COMPLETED' },
    });

    const feedbackCounts = await prisma.feedback.groupBy({
      by: ['rating'],
      _count: { rating: true },
    });

    const matchQualityStats = {
      highlyUseful: feedbackCounts.find((f) => f.rating === 'HIGHLY_USEFUL')?._count.rating || 0,
      somewhatUseful: feedbackCounts.find((f) => f.rating === 'SOMEWHAT_USEFUL')?._count.rating || 0,
      notUseful: feedbackCounts.find((f) => f.rating === 'NOT_USEFUL')?._count.rating || 0,
    };

    // Bottlenecks awaiting matches
    const pendingBottlenecks = await prisma.bottleneck.count({
      where: { status: { in: ['PENDING', 'STRUCTURED', 'MATCHING'] } },
    });

    res.json({
      pendingMatches,
      recentFeedback,
      stats: {
        totalMatches,
        approvedMatches,
        completedMatches,
        pendingBottlenecks,
        matchQuality: matchQualityStats,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * Get match quality analytics
 */
router.get('/operator/analytics', async (req: Request, res: Response) => {
  try {
    // Current weights (adjusted by learning loop)
    const weights = await matchingService.getAdjustedWeights();

    // Average scores by confidence level
    const matchesByConfidence = await prisma.match.groupBy({
      by: ['confidence'],
      _avg: { score: true },
      _count: { id: true },
    });

    // Feedback correlation with scores
    const feedbackWithScores = await prisma.feedback.findMany({
      include: { match: true },
    });

    const avgScoreByRating: { [key: string]: { total: number; count: number } } = {};
    feedbackWithScores.forEach((f) => {
      if (!avgScoreByRating[f.rating]) {
        avgScoreByRating[f.rating] = { total: 0, count: 0 };
      }
      avgScoreByRating[f.rating].total += f.match.score;
      avgScoreByRating[f.rating].count += 1;
    });

    const scoresByRating = Object.entries(avgScoreByRating).map(([rating, data]) => ({
      rating,
      avgScore: data.total / data.count,
      count: data.count,
    }));

    res.json({
      currentWeights: weights,
      matchesByConfidence,
      scoresByRating,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
