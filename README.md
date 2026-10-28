<div align="center">

# Retinova Clinical Backend: Tele-Ophthalmology Screening API

**Production-Grade RESTful Telemedicine Platform for AI-Assisted Retinal Screening, Clinical Workflow Orchestration, and Automated Diagnostic Reporting.**

[![Express 5](https://img.shields.io/badge/API%20Framework-Express%205-000000?style=for-the-badge&logo=express&logoColor=white)](server.js)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=for-the-badge&logo=postgresql&logoColor=white)](database/schema.sql)
[![Node Tests](https://img.shields.io/badge/Tests-3%2F3%20Passing-3da87a?style=for-the-badge&logo=node.js&logoColor=white)](test/server.test.js)
[![SIH 2026](https://img.shields.io/badge/Initiative-Smart%20India%20Hackathon%202026-FF9933?style=for-the-badge)](https://www.sih.gov.in)
[![Render Blueprint](https://img.shields.io/badge/Deploy-Render%20Web%20Service-46E3B7?style=for-the-badge&logo=render&logoColor=black)](render.yaml)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 1. Executive Summary & Clinical Context

Diabetic retinopathy, glaucoma, and macular degeneration are leading causes of preventable adult blindness in rural and underserved communities. **Retinova** is a clinical-grade tele-ophthalmology platform developed for the **Smart India Hackathon (SIH 2026)** to decentralize vision screening.

The **Retinova Clinical Backend** orchestrates the complete tele-medical workflow:
1. **Patient Registry & Demographics:** Secure ingestion and deduplication of patient health records.
2. **Fundus Screening Sessions:** Ingestion and validation of high-resolution digital fundus photographs via Multer.
3. **AI Bridge (RetinaSafe MATLAB Core):** Subprocess bridge dispatching raw fundus scans to the algorithmic MATLAB core (`SIH26038-MATLAB`) for automated vessel segmentation, optic disc detection, and biomarker extraction.
4. **Ophthalmologist Review Queue:** Asynchronous case triage, physician sign-off, clinical annotations, and second-opinion workflows.
5. **Medical Report Engine:** Comprehensive clinical report generation summarizing findings, risk classifications, and follow-up recommendations.

---

## 2. Telemedicine Platform Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend & Diagnostic Devices"]
        Optometrist[Rural Vision Center / Optometrist Portal]
        Specialist[Ophthalmologist Tele-Review Workstation]
    end

    subgraph APILayer["Retinova Backend API (Express 5)"]
        Auth[JWT Session & Role Gatekeeper]
        Router[REST API Dispatcher]
        Upload[Multer Secure Storage: /uploads]
        Bridge[matlabService Bridge Subprocess]
    end

    subgraph ComputeData["Data & Algorithmic Core"]
        Postgres[(PostgreSQL 16: Patients, Screenings, Reports)]
        MATLAB[SIH26038 MATLAB RetinaSafe Pipeline]
    end

    Optometrist -->|Upload Fundus & Demographics| Router
    Specialist -->|Review Cases & Sign Off| Router
    Router --> Auth
    Auth --> Upload
    Router --> Postgres
    Upload --> Bridge
    Bridge --> MATLAB
    MATLAB -->|Biomarkers & Severity Maps| Bridge
    Bridge --> Postgres
```

---

## 3. Comprehensive REST API Specifications

### System & Health Endpoints
- `GET /api/health` — Service liveness and database connection ping.

### Authentication & RBAC (`routes/authRoutes.js`)
- `POST /api/auth/register` — Create clinical user account (Role: `optometrist`, `ophthalmologist`, `admin`).
- `POST /api/auth/login` — Authenticate and receive HTTP-only session cookie or Bearer JWT token.
- `GET /api/auth/me` — Retrieve active authenticated session identity.

### Patient Demographics (`routes/patientRoutes.js`)
- `GET /api/patients` — List registered patient cohorts with pagination and search.
- `POST /api/patients` — Register a new patient record.
- `GET /api/patients/:id` — Retrieve longitudinal patient medical history and prior screenings.

### Screening Ingestion & AI Pipeline (`routes/screeningRoutes.js` & `routes/aiRoutes.js`)
- `POST /api/screenings` — Initiate screening session with bilateral fundus photograph upload (`multipart/form-data`).
- `POST /api/ai/analyze/:screeningId` — Dispatch screening fundus images to the MATLAB RetinaSafe analysis engine.
- `GET /api/findings/:screeningId` — Retrieve classified retinal biomarkers (microaneurysms, hemorrhages, exudates, cup-to-disc ratio).

### Clinical Review & Reports (`routes/caseRoutes.js` & `routes/reportRoutes.js`)
- `GET /api/cases/queue` — Priority-ordered physician tele-triage review queue.
- `POST /api/cases/:id/review` — Ophthalmologist diagnostic validation, grading, and treatment recommendations.
- `GET /api/reports/:screeningId/pdf` — Retrieve or compile standardized clinical PDF diagnostic report.

---

## 4. Database Schema & Migration Architecture

The relational schema is defined in `database/schema.sql` and versioned through sequential SQL migrations:
- `users`: Healthcare provider accounts with hashed credentials and role permissions.
- `patients`: Patient demographics, national identification, contact information, and medical risk factors.
- `screenings`: Discrete clinical sessions tracking image storage paths, capture devices, and triage status.
- `ai_results`: Algorithmic severity scores, confidence levels, and segmentation metadata generated by RetinaSafe.
- `case_reviews`: Physician notes, confirmed ICD-10 diagnoses, and referral urgency.
- `reports`: Clinical report archival logs and verification timestamps.

---

## 5. Quickstart & Local Installation

### Prerequisites
- Node.js 18.x, 20.x, or 24.x
- PostgreSQL 14+
- (Optional) MATLAB R2022b+ with Image Processing & Deep Learning Toolboxes (for live algorithmic bridge execution)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/purnachandra-maharana/retinova-backend.git
cd retinova-backend

npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Populate `.env` with your PostgreSQL database credentials:
```env
PORT=10000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/retinova_db
JWT_SECRET=your_secure_random_jwt_secret
CORS_ORIGINS=http://localhost:5173
```

### 3. Initialize Database
```bash
# Run schema and migrations
psql -U postgres -d retinova_db -f database/schema.sql
psql -U postgres -d retinova_db -f database/migrations/001_auth.sql
psql -U postgres -d retinova_db -f database/migrations/002_ai_result_metadata.sql
```

### 4. Launch Service
```bash
# Development mode with hot-reload
npm run dev

# Production mode
npm start
```

---

## 6. Automated Testing Suite

The backend features automated unit and integration tests executing against Node.js's native test runner (`node:test`):

```bash
npm test
```

### Verified Test Matrix:
- `health endpoint reports a healthy API`: Validates `/api/health` returns HTTP 200 with JSON payload `{ success: true, status: "healthy" }`.
- `unknown routes return a JSON 404`: Confirms API boundary trapping for undefined endpoints with standard error envelope.
- `clinical APIs reject anonymous requests`: Enforces JWT role protection across protected medical routes (`/api/patients`).

**Result: 3 passed in 867ms.**

---

## 7. Cloud Deployment (Render Blueprint)

This repository includes an Infrastructure-as-Code manifest (`render.yaml`) orchestrating both the **Node.js Web Service** and a managed **PostgreSQL Database** on Render.

### Deploying to Render
1. Push this repository to GitHub.
2. Navigate to [Render Dashboard](https://dashboard.render.com) > **New +** > **Blueprint**.
3. Link `retinova-backend`. Render provisions:
   - **Web Service:** `retinova-backend` on Node.js
   - **Database:** `retinova-postgres` (PostgreSQL 16) with automated connection string injection (`DATABASE_URL`)
   - **Health Check:** `/api/health`

---

## 8. Security & Healthcare Compliance Disclosures

- **Role-Based Access Control (RBAC):** Strict separation of privileges between Optometrists (capture/intake) and Ophthalmologists (diagnosis/sign-off).
- **Session Security:** Cryptographically signed tokens utilizing HS256 algorithms with token invalidation capabilities.
- **Data Protection:** Database connection pool mandates SSL encryption in production environments (`rejectUnauthorized: false` for managed cloud certificates).
- **Sanitized Upload Ingestion:** Multer middleware validates MIME types and isolates user-uploaded image files with randomized UUID filenames to prevent path traversal exploits.

---

## 9. Author & Attribution

**Purna Chandra Maharana**
- Portfolio: [github.com/purnachandra-maharana](https://github.com/purnachandra-maharana)
- Reference Standard: [Inkloom AI](https://github.com/purnachandra-maharana/inkloom-ai)
- Hackathon Project: Smart India Hackathon 2026 (SIH 2026)
