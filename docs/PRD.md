# Product Requirements Document (PRD)
# Sanctuary Network Intelligence

**Version:** 1.0
**Last Updated:** January 31, 2026
**Status:** MVP Complete

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Overview](#3-product-overview)
4. [User Personas](#4-user-personas)
5. [User Stories & Requirements](#5-user-stories--requirements)
6. [Feature Specifications](#6-feature-specifications)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Models](#8-data-models)
9. [API Specifications](#9-api-specifications)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Success Metrics](#12-success-metrics)
13. [Future Roadmap](#13-future-roadmap)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

### 1.1 Product Vision

Sanctuary Network Intelligence is an internal tool for startup accelerators that intelligently matches founders facing specific bottlenecks with mentors who have lived experience solving similar problems. Unlike traditional mentor matching based on industry keywords or job titles, this system matches on **problem shape similarity** - the underlying patterns of challenges regardless of surface-level domain differences.

### 1.2 Key Value Propositions

| Stakeholder | Value Delivered |
|-------------|-----------------|
| **Founders** | Get matched with mentors who have actually solved their specific problem, not just worked in their industry |
| **Mentors** | Time is respected - only connected when their experience is genuinely relevant |
| **Operators** | Scalable matching with explainability; can review and override AI decisions |
| **Accelerator** | Higher quality mentor interactions, better founder outcomes, data-driven improvement |

### 1.3 Success Criteria

- **Match Relevance:** >70% of matches rated "Highly Useful" or "Somewhat Useful"
- **Time to Match:** <24 hours from bottleneck submission to approved match
- **Mentor Utilization:** Each active mentor matched at least once per quarter
- **Founder Satisfaction:** NPS >50 for mentor matching experience

---

## 2. Problem Statement

### 2.1 Current State

Traditional mentor matching in accelerators suffers from:

1. **Keyword Matching Failure:** Matching "fintech founder" with "fintech advisor" ignores that a founder struggling with enterprise sales cycles might benefit more from a B2B SaaS veteran than a fintech expert who only did consumer products.

2. **Title-Based Assumptions:** Job titles don't capture what problems someone actually solved. A "VP of Engineering" might have deep experience in scaling teams OR in technical architecture OR in recruiting - the title doesn't tell you.

3. **Manual Matching Doesn't Scale:** Operators can't hold the full context of 50+ mentors' experiences in their heads while reading a founder's problem description.

4. **No Feedback Loop:** Most programs don't systematically learn which matches worked and why.

### 2.2 Desired Future State

A system where:
- Founders describe their bottleneck in natural language
- AI extracts the underlying problem patterns and constraints
- Mentors' past experiences are structured similarly
- Matching happens on problem shape, not keywords
- Every match comes with an explanation operators can verify
- Feedback improves future matching accuracy

---

## 3. Product Overview

### 3.1 Product Name

**Sanctuary Network Intelligence** (Internal codename: SNI)

### 3.2 Product Type

Internal B2B SaaS tool for accelerator/incubator operations teams

### 3.3 Core Concept: Problem Shape Matching

**Problem Shape** = The underlying pattern of a challenge, independent of industry or domain.

Examples of problem shape similarity:

| Founder's Problem | Mentor's Experience | Why It Matches |
|-------------------|---------------------|----------------|
| "Can't close enterprise deals - 6 month sales cycles killing runway" | Sold developer tools to Fortune 500 with 9-month cycles | Same shape: Long B2B sales cycles with resource constraints |
| "Co-founder conflict about product direction" | Navigated founder disagreement at Series A that almost killed company | Same shape: Co-founder alignment under pressure |
| "Users love the product but won't pay" | Transitioned freemium SaaS to paid with 80% conversion | Same shape: Monetization of engaged but non-paying users |

### 3.4 System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    SANCTUARY NETWORK INTELLIGENCE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   FOUNDER    │    │    MENTOR    │    │   OPERATOR   │      │
│  │   PORTAL     │    │   PORTAL     │    │  DASHBOARD   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API GATEWAY                           │   │
│  │            (Express.js + Validation + Rate Limiting)     │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                 │
│  ┌────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ STRUCTURING│    │  MATCHING   │    │  FEEDBACK   │         │
│  │  SERVICE   │    │   ENGINE    │    │   LOOP      │         │
│  │  (Claude)  │    │  (Claude)   │    │             │         │
│  └────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     DATABASE                             │   │
│  │              (PostgreSQL + Prisma ORM)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. User Personas

### 4.1 Founder (Primary User)

**Name:** Sarah Chen
**Role:** CEO & Co-founder, Series A B2B SaaS
**Goals:**
- Get unstuck on a specific problem blocking growth
- Talk to someone who has actually solved this, not just theorized about it
- Minimize time spent explaining context

**Pain Points:**
- Previous mentor matches were "nice conversations" but not actionable
- Tired of getting matched with people based on industry, not problem
- Doesn't have time for introductory calls that go nowhere

**Key Quote:** *"I don't need someone who worked in my industry. I need someone who has been exactly where I am right now."*

### 4.2 Mentor (Primary User)

**Name:** Marcus Johnson
**Role:** Former VP Sales, 3x startup veteran, Angel investor
**Goals:**
- Help founders with problems he's actually qualified to help with
- Avoid wasting time on mismatched introductions
- Build reputation as a high-value mentor

**Pain Points:**
- Gets matched with founders based on "B2B" keyword, regardless of relevance
- Spends 30 minutes on calls only to realize he can't help
- No way to share specific experiences he could help with

**Key Quote:** *"I rebuilt a sales team after the entire team quit during Series B. That's specific. Match me with founders facing THAT."*

### 4.3 Operator (Admin User)

**Name:** Jamie Rivera
**Role:** Program Manager, Accelerator Operations
**Goals:**
- Facilitate high-quality mentor connections at scale
- Have visibility into match quality and reasoning
- Continuously improve the matching process

**Pain Points:**
- Can't remember all mentor experiences when reading founder problems
- No time to manually research best matches for each founder
- Lacks data on which matches actually helped

**Key Quote:** *"I need AI to do the heavy lifting, but I need to understand WHY it made each match so I can override bad ones."*

---

## 5. User Stories & Requirements

### 5.1 Founder User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| F1 | As a founder, I can submit a detailed description of my current bottleneck | P0 | Form captures: blocker description, attempted solutions, success criteria |
| F2 | As a founder, I can view matches with explanations of why each mentor was selected | P0 | Each match shows: mentor info, relevant experience, match reasoning |
| F3 | As a founder, I can provide feedback on match quality after a conversation | P1 | Feedback form with rating + structured questions |
| F4 | As a founder, I can see my submission history and match status | P2 | Dashboard showing past bottlenecks and their outcomes |

### 5.2 Mentor User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| M1 | As a mentor, I can create a profile with my background | P0 | Profile captures: name, email, bio, LinkedIn |
| M2 | As a mentor, I can submit detailed narratives of problems I've solved | P0 | Experience form captures: problem, context, solution, outcomes |
| M3 | As a mentor, I can add multiple experiences to increase match opportunities | P1 | No limit on experiences; each structured independently |
| M4 | As a mentor, I can see when I've been matched and the context | P2 | Notification with founder's problem summary |

### 5.3 Operator User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| O1 | As an operator, I can view all pending matches requiring review | P0 | Dashboard shows matches sorted by score/confidence |
| O2 | As an operator, I can see detailed reasoning for each match | P0 | Breakdown of: problem shape, constraints, stage, recency |
| O3 | As an operator, I can approve or reject matches with notes | P0 | Approve/reject actions with optional notes field |
| O4 | As an operator, I can view match quality analytics | P1 | Charts showing: feedback distribution, scores vs ratings |
| O5 | As an operator, I can manually trigger re-matching | P2 | "Rematch" button on bottleneck detail page |

---

## 6. Feature Specifications

### 6.1 Bottleneck Submission System

#### 6.1.1 Input Fields

| Field | Type | Required | Validation | Purpose |
|-------|------|----------|------------|---------|
| Startup Name | String | Yes | 1-200 chars | Identification |
| Founder Name | String | Yes | 1-200 chars | Contact |
| Email | Email | Yes | Valid format | Communication |
| Stage | Enum | Yes | PRE_SEED, SEED, SERIES_A, SERIES_B_PLUS, GROWTH | Context for matching |
| What's blocking progress? | Text | Yes | 5+ chars | Primary problem description |
| What have you tried? | Text | Yes | 5+ chars | Failed attempts (valuable signal) |
| What does success look like? | Text | Yes | 5+ chars | Desired outcome |

#### 6.1.2 Structuring Process

The system uses Claude AI to extract structured data from raw input:

**Input:** Raw text from founder
**Output:** Structured bottleneck object

```json
{
  "problemArchetype": "SALES_PROCESS",
  "primaryBlocker": "Enterprise sales cycles exceeding runway timeline",
  "constraints": [
    "12 months runway remaining",
    "No existing enterprise references",
    "Technical product requiring long evaluation"
  ],
  "failedApproaches": [
    "Cold outbound to procurement",
    "Bottom-up developer adoption"
  ],
  "successCriteria": "Close 2 enterprise deals within 6 months",
  "urgencyLevel": "HIGH",
  "stageContext": {
    "stage": "SEED",
    "teamSize": 8,
    "productMaturity": "MVP with paying customers"
  },
  "keywords": ["enterprise sales", "long cycles", "runway pressure"]
}
```

### 6.2 Experience Capture System

#### 6.2.1 Input Fields

| Field | Type | Required | Validation | Purpose |
|-------|------|----------|------------|---------|
| Problem Description | Text | Yes | 5+ chars | What challenge did you face? |
| Context | Text | Yes | 5+ chars | Stage, constraints, what failed |
| Solution | Text | Yes | 5+ chars | What worked and why |
| Outcomes | Text | Yes | 5+ chars | Results and lessons |
| Year | Number | No | 1990-current | Recency weighting |
| Company Stage | Enum | No | Same as startup stages | Stage matching |

#### 6.2.2 Structuring Process

**Output:** Structured experience object

```json
{
  "problemArchetype": "SALES_PROCESS",
  "problemSummary": "Closed first Fortune 500 deal with no brand recognition",
  "contextFactors": [
    "Series A company",
    "No case studies or references",
    "9-month typical sales cycle in industry"
  ],
  "approachTaken": "Champion-led sales with executive sponsorship program",
  "keyInsights": [
    "Find the internal champion first, not the buyer",
    "Create urgency through limited pilot program",
    "Use investor network for warm intros to executives"
  ],
  "outcomes": {
    "quantitative": "Closed $400K deal in 5 months",
    "qualitative": "Became reference customer for 3 subsequent deals"
  },
  "applicableStages": ["SEED", "SERIES_A"],
  "yearOccurred": 2022,
  "lessonsLearned": [
    "Enterprise sales is about reducing perceived risk",
    "Champions need ammunition to sell internally"
  ]
}
```

### 6.3 Matching Engine

#### 6.3.1 Matching Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Problem Shape Similarity** | 40% | How similar is the underlying problem pattern? |
| **Constraint Alignment** | 25% | Do the constraints (runway, team size, resources) match? |
| **Stage Relevance** | 20% | Did the mentor's experience happen at a similar stage? |
| **Experience Depth** | 10% | How detailed and specific is the mentor's experience? |
| **Recency** | 5% | How recent is the experience? (More recent = more relevant) |

#### 6.3.2 Confidence Levels

| Level | Criteria | Operator Action |
|-------|----------|-----------------|
| **HIGH** | Score ≥80, strong alignment on 4+ dimensions | Auto-approve option available |
| **MEDIUM** | Score 60-79, good alignment on 2-3 dimensions | Review recommended |
| **LOW** | Score <60, partial alignment | Manual review required |

#### 6.3.3 Match Output

```json
{
  "score": 85,
  "confidence": "HIGH",
  "reasoning": {
    "problemShapeScore": 90,
    "problemShapeReason": "Both involve enterprise sales with long cycles and no existing references",
    "constraintScore": 85,
    "constraintReason": "Similar runway pressure and team size constraints",
    "stageScore": 80,
    "stageReason": "Mentor's experience at Series A applicable to Seed stage",
    "depthScore": 75,
    "depthReason": "Detailed tactical insights provided",
    "recencyScore": 90,
    "recencyReason": "Experience from 2022, highly current"
  },
  "explanation": "Marcus closed his first Fortune 500 deal while facing similar constraints: no brand recognition, long sales cycles, and runway pressure. His champion-led approach and executive sponsorship program directly addresses Sarah's challenge of enterprise sales velocity."
}
```

### 6.4 Operator Dashboard

#### 6.4.1 Dashboard Components

1. **Pending Matches Queue**
   - Sorted by: Score (desc), then Created Date (asc)
   - Shows: Founder name, problem summary, mentor name, score, confidence
   - Actions: Approve, Reject, View Details

2. **Recent Feedback**
   - Last 10 feedback submissions
   - Shows: Rating, founder/mentor names, date
   - Links to full match details

3. **Statistics Panel**
   - Total matches (all time)
   - Approved matches
   - Completed matches (with feedback)
   - Pending bottlenecks
   - Match quality breakdown (pie chart)

#### 6.4.2 Match Detail View

- Full bottleneck text + structured data
- Full experience text + structured data
- Complete reasoning breakdown
- Approve/Reject with notes
- Mark intro as sent
- View feedback (if submitted)

### 6.5 Feedback & Learning Loop

#### 6.5.1 Feedback Collection

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Overall Rating | Enum | Yes | Highly Useful, Somewhat Useful, Not Useful |
| Was it relevant? | Boolean | No | Yes/No |
| Was it actionable? | Boolean | No | Yes/No |
| Would you recommend this mentor? | Boolean | No | Yes/No |
| Founder Notes | Text | No | Free-form |
| Operator Notes | Text | No | Free-form |

#### 6.5.2 Learning Loop (Future)

The system tracks correlations between:
- Match scores and feedback ratings
- Specific dimensions and usefulness
- Mentor characteristics and success rates

This data can be used to adjust dimension weights over time.

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 + React 18 | SSR, file-based routing, excellent DX |
| **Styling** | Tailwind CSS | Utility-first, rapid iteration, brutalist design |
| **Backend** | Express.js + TypeScript | Lightweight, type-safe, easy to deploy |
| **Database** | PostgreSQL (prod) / SQLite (dev) | Relational integrity, JSON support |
| **ORM** | Prisma | Type-safe queries, migrations, studio |
| **AI** | Claude API (Anthropic) | Best-in-class reasoning for structuring & matching |
| **Deployment** | Docker + Vercel/Railway | Containerized, easy scaling |

### 7.2 Directory Structure

```
sanctuary-intel/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Next.js pages
│   │   │   ├── index.tsx    # Landing page
│   │   │   ├── founder/     # Founder portal
│   │   │   ├── mentor/      # Mentor portal
│   │   │   └── operator/    # Operator dashboard
│   │   ├── lib/
│   │   │   └── api.ts       # API client
│   │   └── styles/
│   │       └── globals.css  # Brutalist design system
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── routes.ts    # REST endpoints
│   │   ├── middleware/
│   │   │   ├── validation.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/
│   │   │   └── matchingService.ts  # Claude integration
│   │   ├── prompts/
│   │   │   ├── structureBottleneck.ts
│   │   │   ├── structureExperience.ts
│   │   │   └── matchAndExplain.ts
│   │   ├── models/
│   │   │   └── types.ts     # TypeScript interfaces
│   │   └── index.ts         # Express server
│   ├── prisma/
│   │   ├── schema.prisma    # Dev schema (SQLite)
│   │   └── schema.production.prisma  # Prod schema (PostgreSQL)
│   └── package.json
│
├── docker-compose.yml       # Full stack deployment
├── .env.example             # Environment template
└── docs/
    └── PRD.md               # This document
```

### 7.3 API Architecture

```
                                    ┌─────────────────┐
                                    │   Rate Limiter  │
                                    │  (100 req/15m)  │
                                    └────────┬────────┘
                                             │
┌──────────┐    HTTPS    ┌──────────────────▼───────────────────┐
│ Frontend │ ◄─────────► │              API Gateway              │
│ (Next.js)│             │         /api/* endpoints              │
└──────────┘             └──────────────────┬───────────────────┘
                                            │
                         ┌──────────────────┼──────────────────┐
                         │                  │                  │
                         ▼                  ▼                  ▼
                  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
                  │  Validation │   │    Error    │   │   Async     │
                  │  Middleware │   │   Handler   │   │  Handler    │
                  └─────────────┘   └─────────────┘   └─────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │    Route Handlers   │
              │  (CRUD + Business)  │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │   Prisma   │ │  Claude    │ │   Other    │
   │   (Data)   │ │   (AI)     │ │  Services  │
   └────────────┘ └────────────┘ └────────────┘
```

---

## 8. Data Models

### 8.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   STARTUP   │       │  BOTTLENECK │       │    MATCH    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │───┐   │ id          │
│ name        │   │   │ startupId   │◄──┘   │ bottleneckId│◄─┐
│ founderName │   │   │ rawBlocker  │       │ experienceId│◄─┼─┐
│ email       │   │   │ rawAttempts │       │ mentorId    │◄─┼─┼─┐
│ stage       │   │   │ rawSuccess  │       │ score       │   │ │ │
│ teamSize    │   │   │ structured  │       │ confidence  │   │ │ │
│ createdAt   │   │   │ status      │       │ reasoning   │   │ │ │
└─────────────┘   │   │ createdAt   │       │ explanation │   │ │ │
                  │   └─────────────┘       │ status      │   │ │ │
                  │                         │ operatorId  │   │ │ │
                  │                         │ createdAt   │   │ │ │
                  │                         └─────────────┘   │ │ │
                  │                                │          │ │ │
                  │                                ▼          │ │ │
                  │                         ┌─────────────┐   │ │ │
                  │                         │  FEEDBACK   │   │ │ │
                  │                         ├─────────────┤   │ │ │
                  │                         │ id          │   │ │ │
                  │                         │ matchId     │◄──┘ │ │
                  │                         │ rating      │     │ │
                  │                         │ wasRelevant │     │ │
                  │                         │ wasActionble│     │ │
                  │                         │ createdAt   │     │ │
                  │                         └─────────────┘     │ │
                  │                                             │ │
┌─────────────┐   │   ┌─────────────┐                          │ │
│   MENTOR    │   │   │ EXPERIENCE  │                          │ │
├─────────────┤   │   ├─────────────┤                          │ │
│ id          │───┼──►│ id          │──────────────────────────┘ │
│ name        │   │   │ mentorId    │◄───────────────────────────┘
│ email       │   │   │ rawProblem  │
│ bio         │   │   │ rawContext  │
│ linkedinUrl │   │   │ rawSolution │
│ isActive    │   │   │ rawOutcomes │
│ createdAt   │   │   │ structured  │
└─────────────┘   │   │ yearOccurred│
                  │   │ companyStage│
                  │   │ createdAt   │
                  │   └─────────────┘
                  │
                  └─── 1:Many Relationships
```

### 8.2 Database Schema (PostgreSQL)

```sql
-- Enums
CREATE TYPE startup_stage AS ENUM ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B_PLUS', 'GROWTH');
CREATE TYPE bottleneck_status AS ENUM ('PENDING', 'STRUCTURED', 'MATCHING', 'MATCHED', 'FAILED');
CREATE TYPE match_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'INTRO_SENT', 'COMPLETED');
CREATE TYPE match_confidence AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE feedback_rating AS ENUM ('HIGHLY_USEFUL', 'SOMEWHAT_USEFUL', 'NOT_USEFUL');

-- Tables
CREATE TABLE startups (
    id VARCHAR(25) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    founder_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    stage startup_stage DEFAULT 'PRE_SEED',
    team_size INTEGER,
    product_maturity VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mentors (
    id VARCHAR(25) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    linkedin_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bottlenecks (
    id VARCHAR(25) PRIMARY KEY,
    startup_id VARCHAR(25) REFERENCES startups(id) ON DELETE CASCADE,
    raw_blocker TEXT NOT NULL,
    raw_attempts TEXT NOT NULL,
    raw_success_criteria TEXT NOT NULL,
    structured JSONB,
    status bottleneck_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE experiences (
    id VARCHAR(25) PRIMARY KEY,
    mentor_id VARCHAR(25) REFERENCES mentors(id) ON DELETE CASCADE,
    raw_problem TEXT NOT NULL,
    raw_context TEXT NOT NULL,
    raw_solution TEXT NOT NULL,
    raw_outcomes TEXT NOT NULL,
    structured JSONB,
    year_occurred INTEGER,
    company_stage VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matches (
    id VARCHAR(25) PRIMARY KEY,
    bottleneck_id VARCHAR(25) REFERENCES bottlenecks(id) ON DELETE CASCADE,
    experience_id VARCHAR(25) REFERENCES experiences(id) ON DELETE CASCADE,
    mentor_id VARCHAR(25) REFERENCES mentors(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    confidence match_confidence NOT NULL,
    reasoning JSONB NOT NULL,
    explanation TEXT NOT NULL,
    status match_status DEFAULT 'PENDING',
    operator_id VARCHAR(25),
    operator_notes TEXT,
    intro_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bottleneck_id, experience_id)
);

CREATE TABLE feedback (
    id VARCHAR(25) PRIMARY KEY,
    match_id VARCHAR(25) UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    rating feedback_rating NOT NULL,
    was_relevant BOOLEAN,
    was_actionable BOOLEAN,
    would_recommend BOOLEAN,
    founder_notes TEXT,
    operator_notes TEXT,
    processed_for_learning BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 9. API Specifications

### 9.1 Base URL

- **Development:** `http://localhost:3001/api`
- **Production:** `https://api.sanctuary.network/api`

### 9.2 Authentication

Currently: None (internal tool assumption)
Future: JWT-based authentication with role-based access control

### 9.3 Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Submissions | 10 requests | 1 hour |
| Auth (future) | 10 requests | 15 minutes |

### 9.4 Endpoints

#### 9.4.1 Startup Endpoints

**POST /api/startups**
Create a new startup.

```
Request:
{
  "name": "Acme Corp",
  "founderName": "Sarah Chen",
  "email": "sarah@acme.com",
  "stage": "SEED",
  "teamSize": 8
}

Response: 201 Created
{
  "id": "clx1234567890",
  "name": "Acme Corp",
  "founderName": "Sarah Chen",
  "email": "sarah@acme.com",
  "stage": "SEED",
  "teamSize": 8,
  "createdAt": "2026-01-31T12:00:00Z"
}
```

**GET /api/startups/:id**
Get startup by ID with recent bottlenecks.

---

#### 9.4.2 Mentor Endpoints

**POST /api/mentors**
Create a new mentor.

**GET /api/mentors**
List all active mentors.

**GET /api/mentors/:id**
Get mentor by ID with experiences.

---

#### 9.4.3 Bottleneck Endpoints

**POST /api/bottlenecks**
Submit a new bottleneck. Triggers structuring and matching.

```
Request:
{
  "startupId": "clx1234567890",
  "rawBlocker": "We can't close enterprise deals...",
  "rawAttempts": "We've tried cold outreach...",
  "rawSuccessCriteria": "Close 2 enterprise deals...",
  "stage": "SEED",
  "teamSize": 8
}

Response: 201 Created
{
  "id": "clxbottleneck123",
  "status": "STRUCTURED",
  "structured": { ... },
  "message": "Bottleneck submitted. Matching in progress."
}
```

**GET /api/bottlenecks/:id**
Get bottleneck with startup and matches.

**GET /api/bottlenecks/:id/matches**
Get all matches for a bottleneck.

**POST /api/bottlenecks/:id/rematch**
Regenerate matches for a bottleneck.

---

#### 9.4.4 Experience Endpoints

**POST /api/experiences**
Submit a new mentor experience.

**GET /api/experiences/:id**
Get experience by ID.

---

#### 9.4.5 Match Endpoints

**GET /api/matches/:id**
Get match with full details.

**POST /api/matches/:id/approve**
Approve a match (operator action).

**POST /api/matches/:id/reject**
Reject a match (operator action).

**POST /api/matches/:id/intro-sent**
Mark intro email as sent.

**POST /api/matches/:id/feedback**
Submit feedback for a completed match.

---

#### 9.4.6 Operator Endpoints

**GET /api/operator/dashboard**
Get dashboard data: pending matches, recent feedback, stats.

**GET /api/operator/analytics**
Get analytics: weights, confidence distribution, score vs rating correlation.

---

## 10. UI/UX Requirements

### 10.1 Design System: Brutalist

The interface uses a distinctive brutalist aesthetic characterized by:

| Element | Specification |
|---------|---------------|
| **Typography** | JetBrains Mono, Space Mono (monospace), uppercase text |
| **Colors** | Primary: #FF5F1F (orange), Background: #F0EDE4 (cream), Accents: Black/White |
| **Borders** | Heavy 4px black borders on all containers |
| **Shadows** | Hard offset shadows (8px 8px 0px black) |
| **Buttons** | Black fill, white text, uppercase, heavy borders |
| **Forms** | Transparent backgrounds with heavy borders |

### 10.2 Color Palette

```css
:root {
  --primary: #FF5F1F;        /* Orange - CTAs, highlights */
  --off-white: #F0EDE4;      /* Cream - Background */
  --brutal-black: #000000;   /* Black - Text, borders */
  --match-high: #22c55e;     /* Green - High confidence */
  --match-med: #eab308;      /* Yellow - Medium confidence */
  --match-low: #ef4444;      /* Red - Low confidence */
  --accent-pink: #fbc4d1;    /* Pink - Secondary accent */
  --accent-green: #2d4a34;   /* Dark green - Alternative */
}
```

### 10.3 Component Library

| Component | Class | Description |
|-----------|-------|-------------|
| Card | `.card-brutal` | White bg, 4px black border, hard shadow |
| Button Primary | `.btn-brutal` | Black bg, white text, transforms on hover |
| Button Outline | `.btn-brutal-outline` | White bg, black border, inverts on hover |
| Input | `.input-brutal` | Transparent bg, 4px border, uppercase placeholder |
| Textarea | `.textarea-brutal` | Same as input, resizable |
| Label | `.label-brutal` | 10px, uppercase, letter-spacing, gray |
| Badge | `.badge-brutal` | Small pill with confidence colors |

### 10.4 Page Layouts

#### Landing Page
- Hero with mission statement
- Three user type cards (Founder, Mentor, Operator)
- Statistics marquee

#### Founder Submission
- Two-step wizard (Startup Info → Bottleneck Details)
- Real-time character count
- Context sidebar showing startup info

#### Operator Dashboard
- Fixed sidebar navigation
- Main content area with sections
- Grid layout for pending matches

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric | Target |
|--------|--------|
| Page Load Time | <2 seconds (LCP) |
| API Response Time | <500ms (p95) for CRUD |
| AI Processing Time | <30 seconds for structuring/matching |
| Database Queries | <100ms (p95) |

### 11.2 Scalability

| Dimension | Current | Target |
|-----------|---------|--------|
| Concurrent Users | 10 | 100 |
| Bottlenecks/Month | 50 | 500 |
| Mentors | 50 | 500 |
| Experiences | 100 | 2,000 |

### 11.3 Reliability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Data Durability | 99.99% |
| Backup Frequency | Daily |
| Recovery Time Objective | 4 hours |

### 11.4 Security

| Requirement | Implementation |
|-------------|----------------|
| HTTPS | Enforced in production |
| Input Validation | Server-side validation on all endpoints |
| Rate Limiting | IP-based throttling |
| SQL Injection | Prisma parameterized queries |
| XSS Prevention | React auto-escaping |
| CORS | Whitelist frontend domain only |
| API Keys | Environment variables, never in code |

### 11.5 Observability

| Aspect | Tool/Approach |
|--------|---------------|
| Logging | Structured JSON logs to stdout |
| Error Tracking | Console (future: Sentry) |
| Metrics | Rate limit headers, response times |
| Monitoring | Health endpoint for uptime checks |

---

## 12. Success Metrics

### 12.1 Primary KPIs

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| **Match Usefulness Rate** | % of matches rated Highly/Somewhat Useful | >70% | Feedback submissions |
| **Time to First Match** | Hours from bottleneck submission to approved match | <24h | Timestamp delta |
| **Operator Efficiency** | Matches reviewed per hour | >10 | Dashboard analytics |
| **Mentor Engagement** | % of mentors with at least 1 match/quarter | >50% | Match records |

### 12.2 Secondary KPIs

| Metric | Definition | Target |
|--------|------------|--------|
| Bottleneck Completion Rate | % of started forms that are submitted | >80% |
| Match Approval Rate | % of AI matches approved by operators | >70% |
| Feedback Collection Rate | % of completed matches with feedback | >60% |
| Repeat Usage | Founders who submit 2+ bottlenecks | >30% |

### 12.3 Leading Indicators

- Number of mentor experiences added (supply)
- Number of bottlenecks submitted (demand)
- Average match score over time (AI quality)
- Operator override rate (AI accuracy)

---

## 13. Future Roadmap

### Phase 2: Enhanced Matching (Q2 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-mentor matching | Surface 3-5 matches per bottleneck | High |
| Match confidence explanations | Natural language reasons for confidence level | High |
| Mentor availability | Track mentor capacity and response times | Medium |
| Async matching | Background job queue for large batch processing | Medium |

### Phase 3: Learning Loop (Q3 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| Weight optimization | Auto-adjust dimension weights based on feedback | High |
| Negative signal learning | Learn from rejected matches and poor feedback | High |
| A/B testing framework | Test matching algorithm variations | Medium |
| Mentor effectiveness scores | Track which mentors consistently get good feedback | Medium |

### Phase 4: Scale & Integration (Q4 2026)

| Feature | Description | Priority |
|---------|-------------|----------|
| Authentication | JWT auth with founder/mentor/operator roles | High |
| Email notifications | Automated emails for matches, reminders | High |
| Calendar integration | Direct scheduling from match approval | Medium |
| Slack integration | Notifications in accelerator Slack | Medium |
| Multi-accelerator | White-label support for multiple programs | Low |

### Phase 5: Intelligence Layer (2027)

| Feature | Description | Priority |
|---------|-------------|----------|
| Proactive matching | Suggest mentors before founder submits bottleneck | Medium |
| Pattern detection | Identify common bottlenecks across cohort | Medium |
| Mentor recommendations | Suggest what experiences mentors should add | Low |
| Outcome tracking | Long-term tracking of founder success | Low |

---

## 14. Appendix

### 14.1 Glossary

| Term | Definition |
|------|------------|
| **Bottleneck** | A specific problem blocking a founder's progress |
| **Experience** | A mentor's narrative of solving a specific problem |
| **Problem Shape** | The underlying pattern of a challenge, independent of domain |
| **Structuring** | AI extraction of structured data from raw text |
| **Match Score** | 0-100 score indicating quality of mentor-founder match |
| **Confidence** | HIGH/MEDIUM/LOW indicator of match certainty |

### 14.2 Problem Archetypes

The system recognizes these common problem patterns:

| Archetype | Examples |
|-----------|----------|
| SALES_PROCESS | Long sales cycles, closing enterprise deals, pricing |
| HIRING_SCALING | First hires, building culture, scaling teams |
| PRODUCT_MARKET_FIT | Validation, pivoting, finding ICP |
| FUNDRAISING | Pitch strategy, investor targeting, term sheets |
| TECHNICAL_SCALING | Architecture, performance, reliability |
| COFOUNDER_DYNAMICS | Equity splits, disagreements, role clarity |
| GO_TO_MARKET | Launch strategy, channel selection, positioning |
| OPERATIONS | Processes, tools, efficiency at scale |
| LEGAL_COMPLIANCE | Contracts, regulations, IP protection |
| PERSONAL_LEADERSHIP | Burnout, imposter syndrome, decision fatigue |

### 14.3 Sample Claude Prompts

See `/backend/src/prompts/` for full prompt implementations:

- `structureBottleneck.ts` - Extracts structured data from founder input
- `structureExperience.ts` - Extracts structured data from mentor narrative
- `matchAndExplain.ts` - Scores matches and generates explanations

### 14.4 Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://...      # PostgreSQL connection string
ANTHROPIC_API_KEY=sk-ant-...       # Claude API key
PORT=3001                          # Server port
NODE_ENV=production                # Environment
FRONTEND_URL=https://...           # CORS origin

# Frontend
NEXT_PUBLIC_API_URL=https://...    # Backend API URL
```

### 14.5 Deployment Checklist

- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] Prisma migrations run
- [ ] HTTPS certificate installed
- [ ] Rate limiting configured
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Backup schedule verified
- [ ] API key rotated from development

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-31 | Claude + Human | Initial PRD |

---

*This document is the source of truth for Sanctuary Network Intelligence product requirements. All implementation decisions should reference this document.*
