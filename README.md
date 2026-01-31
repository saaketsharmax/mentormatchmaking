# Sanctuary Network Intelligence

A network intelligence layer that matches startup founders with mentors based on **lived experience**, not keywords or titles.

## Core Philosophy

- Early-stage startups don't need advice — they need **pattern-matched experience**
- Matching is based on **problem shape similarity**, not industry tags or LinkedIn bios
- Every match must be **explainable, defensible, and auditable**
- Bad matches destroy trust; good matches unlock weeks of progress

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                         (Next.js + React)                           │
├─────────────────────────────────────────────────────────────────────┤
│  Founder Flow    │    Mentor Flow     │    Operator Dashboard       │
│  - Submit        │    - Onboard       │    - Review matches         │
│    bottleneck    │    - Add           │    - Approve/reject         │
│                  │      experiences   │    - Record feedback        │
│                  │                    │    - View analytics         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                   │
│                        (Express + TypeScript)                        │
├─────────────────────────────────────────────────────────────────────┤
│  REST API                                                            │
│  - /api/startups         - /api/bottlenecks                         │
│  - /api/mentors          - /api/experiences                         │
│  - /api/matches          - /api/operator/*                          │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AI REASONING LAYER                            │
│                          (Claude API)                                │
├─────────────────────────────────────────────────────────────────────┤
│  1. Structure Bottleneck  →  Extract problem shape, constraints     │
│  2. Structure Experience  →  Extract patterns, failed attempts      │
│  3. Match & Explain       →  Score, confidence, explanation         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATABASE                                   │
│                          (PostgreSQL)                                │
├─────────────────────────────────────────────────────────────────────┤
│  Startups  │  Mentors  │  Bottlenecks  │  Experiences  │  Matches  │
│            │           │  (raw+struct) │  (raw+struct) │  Feedback │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Startup Bottleneck

Raw founder input is converted into a structured representation:

```typescript
interface StructuredBottleneck {
  // Core problem identification
  problemArchetype: {
    category: 'FINDING_PMF' | 'FIRST_CUSTOMERS' | 'SCALING_SALES' | ...;
    subPattern: string;        // e.g., "enterprise sales with no track record"
    shapeDescription: string;  // Natural language description
  };

  problemStatement: string;    // One-sentence distillation

  constraints: Array<{
    type: 'BUDGET' | 'TIME' | 'TEAM_SIZE' | ...;
    description: string;
    severity: 'HARD' | 'SOFT';
  }>;

  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  stageContext: {
    stage: 'PRE_SEED' | 'SEED' | 'SERIES_A' | ...;
    teamSize: number | null;
    monthsOfRunway: number | null;
    hasProduct: boolean;
    hasRevenue: boolean;
  };

  attemptedSolutions: Array<{
    description: string;
    outcome: string;
    whyItFailed: string | null;
  }>;

  successCriteria: {
    description: string;
    timeframe: string;
    measurable: boolean;
  };
}
```

### Mentor Experience

Raw narratives are converted into structured experience objects:

```typescript
interface StructuredExperience {
  problemArchetype: {
    category: string;
    subPattern: string;
    shapeDescription: string;
  };

  problemStatement: string;

  context: {
    stage: string;
    teamSize: number | null;
    yearOccurred: number;
    companyType: string;
    role: string;
    hadFunding: boolean;
    hadRevenue: boolean;
  };

  constraints: Constraint[];

  failedApproaches: Array<{
    description: string;
    whyItFailed: string;
    lessonLearned: string;
  }>;

  successfulApproach: {
    description: string;
    keyActions: string[];
    whyItWorked: string;
    timeToResults: string;
  };

  outcomes: Array<{
    metric: string;
    before: string;
    after: string;
    timeframe: string;
  }>;

  insights: Array<{
    insight: string;
    whenApplicable: string;
    whenNotApplicable: string;
  }>;

  applicability: {
    stageRange: [string, string];
    industrySpecific: boolean;
    industries: string[];
    timeSensitivity: 'EVERGREEN' | 'DATED' | 'CONTEXT_DEPENDENT';
  };
}
```

### Match

Each match includes score, confidence, and full reasoning:

```typescript
interface Match {
  score: number;               // 0-100
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;         // Human-readable, 2-4 sentences

  reasoning: {
    scores: {
      problemShapeSimilarity: number;  // 0-100
      constraintAlignment: number;
      stageRelevance: number;
      experienceDepth: number;
      recency: number;
    };

    weights: {
      problemShapeSimilarity: 0.40;
      constraintAlignment: 0.25;
      stageRelevance: 0.20;
      experienceDepth: 0.10;
      recency: 0.05;
    };

    componentReasoning: {
      [dimension: string]: string;  // Explanation for each score
    };

    keyAlignments: string[];   // Top reasons this is a good match
    concerns: string[];        // Potential issues

    confidenceFactors: {
      dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
      archetypeClarity: 'HIGH' | 'MEDIUM' | 'LOW';
      constraintOverlap: 'HIGH' | 'MEDIUM' | 'LOW';
    };
  };
}
```

---

## API Endpoints

### Startups & Mentors

```
POST /api/startups              Create a startup
GET  /api/startups/:id          Get startup details

POST /api/mentors               Create a mentor
GET  /api/mentors               List all active mentors
GET  /api/mentors/:id           Get mentor details
```

### Bottlenecks

```
POST /api/bottlenecks           Submit a new bottleneck
                                → Structures it via Claude
                                → Triggers async matching

GET  /api/bottlenecks/:id       Get bottleneck with matches
GET  /api/bottlenecks/:id/matches  Get matches only
POST /api/bottlenecks/:id/rematch  Regenerate matches
```

### Experiences

```
POST /api/experiences           Submit mentor experience
                                → Structures it via Claude

GET  /api/experiences/:id       Get experience details
```

### Matches

```
GET  /api/matches/:id           Get match with full reasoning
POST /api/matches/:id/approve   Operator approves match
POST /api/matches/:id/reject    Operator rejects match
POST /api/matches/:id/intro-sent  Mark intro as sent
POST /api/matches/:id/feedback  Submit feedback after intro
```

### Operator

```
GET  /api/operator/dashboard    Dashboard data (pending, stats, feedback)
GET  /api/operator/analytics    Weight calibration, score analysis
```

---

## Claude Prompts

### 1. Bottleneck Structuring

**Purpose:** Convert raw founder input into a structured bottleneck object.

Key principles:
- Extract problem **shape**, not keywords
- Preserve constraint nuance (3 months runway ≠ 6 months runway)
- Document what they've already tried (to avoid redundant matches)
- Infer stage context from signals

### 2. Experience Structuring

**Purpose:** Convert mentor narratives into structured experience objects.

Key principles:
- Preserve the **story** — the journey is the value
- **Failed approaches are gold** — they show depth
- Context specificity matters (Series A ≠ pre-seed)
- Distinguish evergreen vs. dated insights

### 3. Matching & Explanation

**Purpose:** Score matches and generate human-readable explanations.

**Matching Dimensions:**

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Problem Shape Similarity | 40% | Are these the same type of problem? |
| Constraint Alignment | 25% | Do constraints match or conflict? |
| Stage Relevance | 20% | Does experience apply to this stage? |
| Experience Depth | 10% | How deeply did mentor engage? |
| Recency | 5% | Is experience still relevant? |

**Confidence Adjustment:**
- HIGH confidence: score stands
- MEDIUM confidence: score × 0.85
- LOW confidence: score × 0.70

**Explanation Requirements:**
- 2-4 sentences
- Start with core similarity
- Reference specific elements from both sides
- Be honest about limitations

---

## UI Flows

### Founder Submission Flow

1. **Info Step:** Name, email, startup name, stage, team size
2. **Bottleneck Step:**
   - "What is blocking progress right now?"
   - "What have you already tried?"
   - "What would success look like in 14 days?"
3. **Processing:** Claude structures the bottleneck
4. **Confirmation:** Bottleneck ID, matching in progress

### Mentor Onboarding Flow

1. **Profile Step:** Name, email, bio, LinkedIn
2. **Experience Step:**
   - "Describe a specific hard problem you solved"
   - "What was the context? What failed first?"
   - "What finally worked?"
   - "What were the outcomes?"
3. **Add More:** Option to add additional experiences
4. **Confirmation:** Thank you, we'll reach out when there's a match

### Operator Dashboard

1. **Stats Overview:** Pending bottlenecks, matches to review, approval rate
2. **Pending Matches:** Cards with:
   - Founder info & bottleneck summary
   - Match score (0-100) with confidence badge
   - Mentor name & experience summary
   - Full explanation
   - Approve / Reject / View Details buttons
3. **Recent Feedback:** Track match quality over time

### Match Detail View

1. **Score Header:** Score ring, confidence badge, status
2. **Explanation:** Full match explanation
3. **Side-by-Side:** Bottleneck vs. Experience comparison
4. **Audit Trail:** All component scores, reasoning, alignments, concerns
5. **Actions:** Approve/Reject/Send Intro/Record Feedback

---

## Learning Loop

The system adjusts matching weights based on feedback:

1. Collect feedback after each intro (Highly Useful / Somewhat Useful / Not Useful)
2. Analyze which dimensions correlate with positive feedback
3. Adjust weights (max ±5% per dimension, normalized to sum to 1)
4. Higher-signal dimensions get more weight over time

This creates a **self-improving system** that gets better at matching as more data flows through.

---

## Setup

### Backend

```bash
cd backend
npm install

# Set environment variables
export DATABASE_URL="postgresql://..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Initialize database
npm run db:push

# Run development server
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Set environment variable
export NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Run development server
npm run dev
```

---

## Technical Decisions

1. **Claude for structuring, not embeddings:** Embeddings lose nuance. Claude can understand "this is fundamentally about founder-led sales in a regulated market" even if the words are different.

2. **Batch matching:** Process multiple experiences per API call for efficiency. Filter out <40 score matches early.

3. **Explicit reasoning storage:** Every match stores full reasoning for auditability. Operators can see exactly why a match was made.

4. **Confidence calibration:** Match scores are adjusted by confidence to prevent over-indexing on low-quality data.

5. **Async matching:** Bottleneck structuring is synchronous (user waits), but matching runs async (user gets confirmation immediately).

---

## What This Is NOT

- ❌ A marketplace
- ❌ A mentor directory
- ❌ A keyword matching system
- ❌ A LinkedIn integration

## What This IS

- ✅ A network intelligence layer
- ✅ Pattern-matched experience discovery
- ✅ Operator-mediated introductions
- ✅ Self-improving matching system
- ✅ Sanctuary's network memory
