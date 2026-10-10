# HealthTwin AI — Personal Health Digital Twin & Copilot
> **"Your Health, Connected and Understood."**  
> Built for the 24-Hour Healthcare AI Hackathon | Frontend Demonstration Prototype

---

## 🩺 Project Overview

**HealthTwin AI** is a personal health platform that organizes medical records, explains complex clinical information in plain language, and maps documented medical history alongside simulated wearable wellness trends into a single, cohesive view.

This repository contains the **complete, fully interactive frontend** built with:
* **React 19 & Vite 8** (TypeScript, strict typing, verbatim module syntax)
* **Tailwind CSS v4** (minimalist healthcare palette: soft whites, slate-900 typography, teal-600 brand, emerald normal, amber out-of-range)
* **Recharts** (responsive charts for heart rate, steps, sleep architecture, and active minutes)
* **Lucide React** (consistent clinical and system icons)

> [!IMPORTANT]
> **DEMO MODE — SYNTHETIC DATA NOTICE:**  
> All patient records, laboratory metrics, medications, and wearable telemetry in this frontend are realistic, synthetic demo data. HealthTwin AI is informational only and does not compute arbitrary medical health scores or replace clinician judgment.

---

## 🚀 Quickstart & Run Instructions

### 1. Prerequisites
* **Node.js**: v18+ (verified on v24.20.0)
* **npm**: v9+ (verified on v11.19.0)

### 2. Installation
Open a terminal in the `frontend` folder:
```bash
cd frontend
npm install
```

### 3. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

### 4. Production Build Validation
```bash
npm run build
```
Builds cleanly with zero TypeScript errors into the `dist/` folder.

---

## 📱 Features & Interactive Flows

| Feature / Page | Status | Details |
| :--- | :--- | :--- |
| **Overview Dashboard** | **Fully Functional** | 4 summary metric cards, "Health at a Glance" panel, data completeness indicator (68%), recent activity list, concept explainer, and quick action pathways. |
| **Medical Records** | **Fully Functional** | Search, category filtering, date sorting, local simulated upload modal with progress state, and slide-over review drawer with editable test values, reference ranges, and dosages. |
| **AI Health Summary** | **Fully Functional** | Report selector (CMP, Lipid Profile, CBC), executive plain-language summary, key findings list, biochemical analytes table with explicit lab ranges, terminology glossary, and copyable clinician discussion questions. |
| **Health Timeline** | **Fully Functional** | Chronological timeline and table list view toggle, event-type filtering, search, and detailed modal views with clinical tag indexing. |
| **Wellness & Wearables** | **Fully Functional** | Summary cards for Heart Rate, Steps, Sleep, and Activity. 4 interactive Recharts charts (intraday HR curve, daily step counts, sleep stages breakdown, active minutes) with 7D/14D/30D filters. |
| **Ask Health Copilot** | **Fully Functional** | AI assistant chat interface with 5 pre-grounded example chips with simulated citations, follow-up recommendations, transparent fallback handling, and ethical disclaimer. |
| **Settings & Architecture** | **Fully Functional** | Demo patient profile (Alex Morgan, SYN-PT-89420), **English and Telugu language switcher**, accessibility status, and 5-point future integration connectivity matrix. |
| **Global Shell** | **Fully Functional** | Live search bar with instant dropdown suggestions, notification dropdown with demo alerts, demo patient profile menu, responsive mobile drawer, and floating toast feedback. |

---

## 🔬 Simulated vs. Future Backend Integrations

| Subsystem | Current Frontend Stage | Planned Backend Implementation |
| :--- | :--- | :--- |
| **Document Upload** | Local in-browser file validation & state update | Python/FastAPI multipart upload to HIPAA-compliant encrypted storage (e.g., S3/GCS) |
| **OCR Extraction** | Pre-structured synthetic analytes & editable review drawer | Pipeline using PaddleOCR / Tesseract / AWS Textract for lab tables and prescriptions |
| **AI Copilot** | Pre-grounded response maps with citation previews & transparent fallback | RAG (Retrieval-Augmented Generation) with vector embeddings (pgvector/FAISS) and clinical LLM |
| **Wearables** | Simulated 30-day telemetry points (60 bpm resting HR, 9,080 avg steps) | OAuth2 sync with Apple HealthKit, Google Health Connect, and Garmin APIs |
| **Interoperability** | Standardized JSON data models | HL7 FHIR US Core profiles and India ABDM / ABHA Health Information Exchange |

---

## 📂 Project Architecture

```
frontend/
├── index.html                   # Healthcare fonts & HTML metadata
├── package.json                 # React, Vite, Tailwind v4, Recharts, Lucide
├── tsconfig.json                # TypeScript root configuration
├── vite.config.ts               # Vite bundler with Tailwind CSS v4 plugin
├── public/
│   └── favicon.svg              # Teal medical pulse & twin node icon
└── src/
    ├── App.tsx                  # Main application state, routing, and toasts
    ├── main.tsx                 # Entry mount point
    ├── index.css                # Base styling & Tailwind v4 directives
    ├── types/
    │   └── health.ts            # Core TypeScript interfaces & status unions
    ├── data/
    │   ├── mockRecords.ts       # Synthetic clinical documents (CMP, Lipid, CBC, Rx, Radiology)
    │   ├── mockWellness.ts      # Simulated 30-day wearable telemetry points
    │   └── mockConversations.ts # Grounded Copilot response dictionary & prompts
    ├── utils/
    │   └── translations.ts      # English & Telugu translation dictionary
    ├── components/
    │   ├── common/              # MetricCard, StatusBadge, Modal, Drawer, Toast, EmptyState
    │   ├── layout/              # Sidebar, Header, DemoDisclaimerBanner
    │   ├── dashboard/           # HealthGlanceCard, QuickActions, RecentActivityList, DigitalTwinExplainer
    │   ├── records/             # RecordUploadModal, RecordDetailDrawer, RecordTable, RecordFilterBar
    │   ├── summary/             # SummaryOverviewCard, LabValuesTable, TerminologyExplainer, ClinicianQuestions
    │   ├── timeline/            # TimelineItem, TimelineFilter, TimelineEventDetailModal
    │   ├── wellness/            # WellnessMetricCard, HeartRateChart, StepCountChart, SleepChart, ActivityChart, WellnessTrendsSummary
    │   └── copilot/             # CopilotChat, CopilotMessageItem
    └── pages/
        ├── Dashboard.tsx        # Overview dashboard page
        ├── MedicalRecords.tsx   # Document management page
        ├── HealthSummary.tsx    # AI explanation & lab ranges page
        ├── HealthTimeline.tsx   # Chronological health journey page
        ├── Wellness.tsx         # Wearables & activity dashboard
        ├── HealthCopilot.tsx    # Conversational assistant page
        └── Settings.tsx         # Preferences, i18n & integration status
```

---

## ⚖️ Clinical Transparency & Safety Principles

1. **Zero Fabricated Risk Scores:** HealthTwin AI does not assign composite "health scores" or speculative disease-risk percentages.
2. **Explicit Reference Ranges:** Laboratory results always display the exact reference range provided by the testing laboratory, with visual indicators (Within Range, Outside Range, Needs Review).
3. **Doctor-First Communication:** AI summaries conclude with copyable discussion questions to prepare patients for informed consultations with their licensed physicians.
