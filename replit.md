# Hospital Intelligence Platform

## Overview

A full-stack Hospital Intelligence Platform for clinical case management with AI-powered risk analysis, bilingual (English + Arabic) brief generation, and an emergency alert dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (Shadcn UI)
- **Backend**: Express 5 API server
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: Wouter
- **Forms**: react-hook-form + @hookform/resolvers
- **Animations**: framer-motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/              # Express API server (backend)
│   │   └── src/
│   │       ├── lib/
│   │       │   └── riskEngine.ts    # Risk classification & brief generation
│   │       └── routes/
│   │           └── cases.ts         # Clinical cases CRUD + analysis
│   └── hospital-intel/          # React frontend (served at /)
│       └── src/
│           ├── pages/
│           │   ├── dashboard.tsx    # Main dashboard with emergency alerts
│           │   ├── new-report.tsx   # Multi-step case submission form
│           │   └── case-detail.tsx  # Case detail with bilingual briefs
│           └── components/
│               └── layout/sidebar.tsx
├── lib/
│   ├── api-spec/                # OpenAPI spec + Orval codegen config
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas from OpenAPI
│   └── db/                      # Drizzle ORM schema + DB connection
│       └── src/schema/cases.ts  # Clinical cases table schema
```

## Features

### 1. Manual Report Input
- Multi-step form (Patient Info → Clinical Details → Vital Signs → Raw Report)
- Supports SOAP and JSON report types
- Symptom tag input system

### 2. Risk & Decision Engine (`artifacts/api-server/src/lib/riskEngine.ts`)
- Rule-based risk classification: LOW / MEDIUM / HIGH / CRITICAL
- Analyzes: symptoms, vital signs, age, medical history
- Recommends: SELF_CARE / SCHEDULE_CONSULTATION / HOSPITAL_VISIT / EMERGENCY_RESPONSE
- Vitals thresholds: temperature, heart rate, blood pressure, SpO2, respiratory rate

### 3. Hospital Brief Generator
- Auto-generates structured English briefs
- Auto-generates Arabic briefs with RTL support
- Both generated on case creation, stored in DB

### 4. Dashboard
- Live case queue with risk badges
- Stats bar: total cases, count per risk level
- Emergency Alerts section for CRITICAL unacknowledged cases
- Bilingual brief toggle per case card

### 5. Emergency Alerts
- CRITICAL cases shown prominently at top with pulsing animation
- Acknowledge button to mark as reviewed
- Color-coded: red = CRITICAL, orange = HIGH, yellow = MEDIUM, green = LOW

## API Endpoints

- `GET /api/cases` — List all cases
- `POST /api/cases` — Submit and analyze a new case
- `GET /api/cases/:id` — Get case details
- `POST /api/cases/:id/acknowledge` — Acknowledge a CRITICAL case
- `DELETE /api/cases/:id` — Delete a case
- `GET /api/healthz` — Health check

## Database Schema

Table: `clinical_cases`
- Patient demographics (name, age, gender)
- Clinical data (chief complaint, symptoms JSONB, vitals JSONB)
- Analysis results (riskLevel enum, recommendedAction enum, riskFactors JSONB)
- Briefs (briefEnglish, briefArabic)
- Status (acknowledged boolean)

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — Start backend
- `pnpm --filter @workspace/hospital-intel run dev` — Start frontend
