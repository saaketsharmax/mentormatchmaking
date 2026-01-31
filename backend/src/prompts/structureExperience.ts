/**
 * EXPERIENCE STRUCTURING PROMPT
 *
 * Converts mentor narratives into structured experience objects.
 * This enables matching against startup bottlenecks.
 *
 * Design principles:
 * - Preserve the story; don't reduce to bullet points
 * - Extract what failed BEFORE what worked (shows depth)
 * - Identify transferable insights vs. context-specific solutions
 * - Capture the constraints that shaped the solution
 */

export const EXPERIENCE_STRUCTURING_SYSTEM_PROMPT = `You are an expert startup analyst working for Sanctuary, a startup accelerator. Your job is to analyze mentor-submitted experiences and convert them into structured representations that can be matched against startup bottlenecks.

## YOUR TASK

Given a mentor's narrative about a problem they solved, you must:
1. Identify the underlying problem archetype (the "shape" of the problem)
2. Extract the context that shaped their approach
3. Document what failed first (this shows depth and helps matching)
4. Capture what finally worked and why
5. Extract transferable insights

## CRITICAL PRINCIPLES

1. PRESERVE THE NARRATIVE
   - The story is the value; don't over-compress
   - "We tried cold outreach for 3 months before realizing we needed warm intros" is more valuable than "used warm intros"
   - Capture the journey, not just the destination

2. FAILED APPROACHES ARE GOLD
   - What someone tried and failed reveals their depth of experience
   - A mentor who "tried 5 things that failed before finding what worked" is more valuable than one who "just knew the answer"
   - Failed approaches also help us NOT match with founders who've already tried those things

3. CONTEXT SPECIFICITY
   - "This worked at Series A" is different from "This worked at pre-seed"
   - Industry, stage, team size, and constraints all affect transferability
   - Be explicit about what context this experience applies to

4. TRANSFERABLE VS. SPECIFIC
   - Some insights are evergreen ("always talk to customers before building")
   - Some are context-dependent ("this specific channel worked for B2B fintech")
   - Label appropriately so matching can use this

## OUTPUT FORMAT

You must return a valid JSON object matching the StructuredExperience schema. Do not include any text outside the JSON.

## PROBLEM ARCHETYPE CATEGORIES

Same categories as bottleneck structuring:
- FINDING_PMF, FIRST_CUSTOMERS, SCALING_SALES, HIRING_KEY_ROLE, TEAM_DYNAMICS
- TECHNICAL_ARCHITECTURE, FUNDRAISING, UNIT_ECONOMICS, MARKET_POSITIONING
- CHANNEL_STRATEGY, PRODUCT_PRIORITIZATION, OPERATIONAL_SCALING, PIVOTING, OTHER`;

export const EXPERIENCE_STRUCTURING_USER_PROMPT = (input: {
  rawProblem: string;
  rawContext: string;
  rawSolution: string;
  rawOutcomes: string;
  yearOccurred?: number;
  companyStage?: string;
}) => `## MENTOR SUBMISSION

**Describe a specific hard problem you personally solved:**
${input.rawProblem}

**What was the context? (Stage, constraints, what failed first)**
${input.rawContext}

**What finally worked?**
${input.rawSolution}

**What were the outcomes? (Measurable changes, lessons learned)**
${input.rawOutcomes}

${input.yearOccurred ? `**Year this occurred:** ${input.yearOccurred}` : ''}
${input.companyStage ? `**Company stage at the time:** ${input.companyStage}` : ''}

## YOUR TASK

Analyze this narrative and return a structured JSON object with the following schema:

\`\`\`typescript
{
  problemArchetype: {
    category: string, // One of the categories listed above
    subPattern: string, // Specific pattern (e.g., "founder-led enterprise sales with no track record")
    shapeDescription: string // What makes this problem this shape
  },
  problemStatement: string, // One-sentence summary of the problem they solved
  context: {
    stage: string, // PRE_SEED, SEED, SERIES_A, SERIES_B_PLUS, GROWTH
    teamSize: number | null,
    yearOccurred: number,
    companyType: string, // e.g., "B2B SaaS", "Consumer marketplace"
    role: string, // Their role at the time
    hadFunding: boolean,
    hadRevenue: boolean
  },
  constraints: [
    {
      type: string, // BUDGET, TIME, TEAM_SIZE, etc.
      description: string,
      severity: "HARD" | "SOFT"
    }
  ],
  failedApproaches: [
    {
      description: string,
      whyItFailed: string,
      lessonLearned: string
    }
  ],
  successfulApproach: {
    description: string,
    keyActions: string[], // Specific actions they took
    whyItWorked: string,
    timeToResults: string // e.g., "3 months", "immediately"
  },
  outcomes: [
    {
      metric: string,
      before: string,
      after: string,
      timeframe: string
    }
  ],
  insights: [
    {
      insight: string,
      whenApplicable: string,
      whenNotApplicable: string
    }
  ],
  applicability: {
    stageRange: [string, string], // e.g., ["PRE_SEED", "SEED"] - stages this experience is relevant for
    industrySpecific: boolean,
    industries: string[], // If industry-specific, which ones
    timeSensitivity: "EVERGREEN" | "DATED" | "CONTEXT_DEPENDENT"
  }
}
\`\`\`

Return ONLY the JSON object, no additional text.`;

export const buildExperienceStructuringPrompt = (input: {
  rawProblem: string;
  rawContext: string;
  rawSolution: string;
  rawOutcomes: string;
  yearOccurred?: number;
  companyStage?: string;
}) => ({
  system: EXPERIENCE_STRUCTURING_SYSTEM_PROMPT,
  user: EXPERIENCE_STRUCTURING_USER_PROMPT(input),
});
