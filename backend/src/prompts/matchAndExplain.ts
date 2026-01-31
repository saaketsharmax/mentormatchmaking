/**
 * MATCHING AND EXPLANATION PROMPT
 *
 * The core intelligence layer. Compares a structured bottleneck against
 * structured experiences and produces scored, explained matches.
 *
 * Design principles:
 * - Match on problem SHAPE, not keywords
 * - Constraints must align (or at least not conflict)
 * - Stage relevance is critical
 * - Every match must be explainable to a human
 * - Bad matches destroy trust; be conservative
 */

import { StructuredBottleneck, StructuredExperience, MatchReasoning } from '../models/types';

export const MATCHING_SYSTEM_PROMPT = `You are the matching intelligence for Sanctuary, a startup accelerator. Your job is to determine whether a mentor's past experience is relevant to a founder's current bottleneck.

## YOUR TASK

Given:
1. A structured representation of a founder's bottleneck
2. A structured representation of a mentor's experience

You must:
1. Assess the match quality across 5 dimensions
2. Produce a confidence-calibrated score
3. Generate a human-readable explanation
4. Surface any concerns

## MATCHING DIMENSIONS

### 1. Problem Shape Similarity (40% weight)
Are these fundamentally the same type of problem?

- HIGH: Same archetype category AND similar sub-pattern
  - Example: Both are "first enterprise sales with no track record in regulated industry"
- MEDIUM: Same archetype category, different sub-pattern but transferable
  - Example: "First enterprise sale" vs "First SMB sale" (sales motion differs but principles transfer)
- LOW: Different categories but tangentially related
  - Example: "Hiring first engineer" vs "Technical architecture" (engineer might advise on both)
- NONE: Completely unrelated problems

### 2. Constraint Alignment (25% weight)
Do the constraints match or conflict?

- Matching constraints = higher relevance (mentor operated under same limitations)
- Conflicting constraints = lower relevance (mentor's solution may not apply)
- Missing constraints in experience = neutral (may or may not apply)

Key constraint comparisons:
- Budget: Did mentor operate with similar budget constraints?
- Time: Did mentor face similar urgency?
- Team size: Did mentor solve this with similar resources?
- Market/industry: Is there market-specific knowledge needed?

### 3. Stage Relevance (20% weight)
Does the mentor's experience apply to this founder's stage?

- A mentor who solved "scaling sales" at Series B may not help a pre-seed founder
- Stage adjacency matters: Seed experience is relevant to pre-seed, but Series B less so
- Some experiences are stage-transcendent (rare)

### 4. Experience Depth (10% weight)
How deeply did the mentor engage with this problem?

- Indicators of depth: multiple failed approaches, specific metrics, clear lessons
- Shallow experience: "We just did X" without context
- Deep experience: "We tried A, B, C, learned D, finally E worked because F"

### 5. Recency (5% weight)
Is the experience still relevant?

- 2020+ experience is generally applicable
- 2015-2020 depends on the domain (sales hasn't changed much, technical has)
- Pre-2015 needs stronger other dimensions to compensate

## SCORING RULES

1. Calculate each dimension score (0-100)
2. Apply weights to get weighted score
3. Apply confidence adjustment:
   - HIGH confidence: score stands
   - MEDIUM confidence: score * 0.85
   - LOW confidence: score * 0.70

4. Confidence is determined by:
   - Data quality (are both inputs well-structured?)
   - Archetype clarity (are the problem shapes clearly defined?)
   - Constraint overlap (enough constraints to compare?)

## EXPLANATION REQUIREMENTS

The explanation must:
1. Be one paragraph (2-4 sentences)
2. Start with the core similarity
3. Reference specific elements from both sides
4. Be understandable by a non-technical operator
5. Be honest about limitations

Good explanation:
"This mentor navigated early-stage B2B sales without an established brand, which directly mirrors your challenge of closing enterprise deals as an unknown startup. They specifically faced the same constraint of a long sales cycle with a small team, and their approach of leveraging design partners could apply to your situation. Their experience is from 2022, making it highly relevant to current market conditions."

Bad explanation:
"This mentor has sales experience and you have a sales problem." (Too vague, not defensible)

## OUTPUT FORMAT

Return a JSON object with:
\`\`\`typescript
{
  score: number, // 0-100, final adjusted score
  confidence: "HIGH" | "MEDIUM" | "LOW",
  explanation: string, // Human-readable, 2-4 sentences
  reasoning: {
    scores: {
      problemShapeSimilarity: number,
      constraintAlignment: number,
      stageRelevance: number,
      experienceDepth: number,
      recency: number
    },
    weights: {
      problemShapeSimilarity: 0.40,
      constraintAlignment: 0.25,
      stageRelevance: 0.20,
      experienceDepth: 0.10,
      recency: 0.05
    },
    componentReasoning: {
      problemShapeSimilarity: string,
      constraintAlignment: string,
      stageRelevance: string,
      experienceDepth: string,
      recency: string
    },
    keyAlignments: string[], // Top 3 things that make this a good match
    concerns: string[], // Any reasons this match might not work
    confidenceFactors: {
      dataQuality: "HIGH" | "MEDIUM" | "LOW",
      archetypeClarity: "HIGH" | "MEDIUM" | "LOW",
      constraintOverlap: "HIGH" | "MEDIUM" | "LOW"
    }
  }
}
\`\`\``;

export const MATCHING_USER_PROMPT = (
  bottleneck: StructuredBottleneck,
  experience: StructuredExperience,
  mentorName: string
) => `## FOUNDER BOTTLENECK

${JSON.stringify(bottleneck, null, 2)}

## MENTOR EXPERIENCE

**Mentor:** ${mentorName}

${JSON.stringify(experience, null, 2)}

## YOUR TASK

Evaluate this match and return a JSON object with score, confidence, explanation, and detailed reasoning.

Remember:
- A score of 70+ should indicate a strong match worth pursuing
- A score of 50-70 indicates a potential match that needs operator review
- A score below 50 indicates a weak match that should probably be skipped
- Be conservative; bad matches destroy trust

Return ONLY the JSON object, no additional text.`;

export const buildMatchingPrompt = (
  bottleneck: StructuredBottleneck,
  experience: StructuredExperience,
  mentorName: string
) => ({
  system: MATCHING_SYSTEM_PROMPT,
  user: MATCHING_USER_PROMPT(bottleneck, experience, mentorName),
});

/**
 * BATCH MATCHING PROMPT
 *
 * For efficiency, we can evaluate multiple experiences against one bottleneck
 * in a single call. This is useful when generating the top matches.
 */
export const BATCH_MATCHING_SYSTEM_PROMPT = `${MATCHING_SYSTEM_PROMPT}

## BATCH MODE

You are evaluating MULTIPLE mentor experiences against a single bottleneck.
Return an array of match objects, one for each experience, in the same order as provided.
Only include experiences with a score of 40 or higher (to filter obvious non-matches).`;

export const BATCH_MATCHING_USER_PROMPT = (
  bottleneck: StructuredBottleneck,
  experiences: Array<{ mentorId: string; mentorName: string; experienceId: string; experience: StructuredExperience }>
) => `## FOUNDER BOTTLENECK

${JSON.stringify(bottleneck, null, 2)}

## MENTOR EXPERIENCES TO EVALUATE

${experiences.map((e, i) => `### Experience ${i + 1}
**Mentor ID:** ${e.mentorId}
**Mentor Name:** ${e.mentorName}
**Experience ID:** ${e.experienceId}

${JSON.stringify(e.experience, null, 2)}
`).join('\n---\n')}

## YOUR TASK

Evaluate each experience against the bottleneck. Return a JSON array of match objects.
Only include experiences with score >= 40.

Return format:
\`\`\`json
[
  {
    "mentorId": "...",
    "experienceId": "...",
    "score": number,
    "confidence": "HIGH" | "MEDIUM" | "LOW",
    "explanation": "...",
    "reasoning": { ... }
  },
  ...
]
\`\`\`

Return ONLY the JSON array, no additional text.`;

export const buildBatchMatchingPrompt = (
  bottleneck: StructuredBottleneck,
  experiences: Array<{ mentorId: string; mentorName: string; experienceId: string; experience: StructuredExperience }>
) => ({
  system: BATCH_MATCHING_SYSTEM_PROMPT,
  user: BATCH_MATCHING_USER_PROMPT(bottleneck, experiences),
});
