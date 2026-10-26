# Sentinel — AI Fraud Detection Platform

> **Smarter Detection. Safer Transactions.**

A full-stack fraud detection platform with a premium React frontend and a Java Spring Boot backend.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite, TypeScript, Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Backend | Java 17, Spring Boot |
| Database | MongoDB Atlas |
| Build Tool | Maven |

---

## Project Structure

```
Sentinel/
├── backend/
│   └── sentinel/          # Spring Boot Maven project
│       └── src/main/java/com/sentinel/
│           ├── Transaction.java
│           ├── TransactionController.java
│           ├── TransactionService.java
│           ├── FraudDetectionService.java
│           ├── DashboardController.java
│           ├── AuditLog.java
│           ├── AuditLogController.java
│           ├── AuditLogService.java
│           └── SecurityConfig.java
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/       # DashboardShell, LandingNav
        │   └── ui/           # Reusable UI components
        ├── pages/            # All route pages
        ├── services/         # api.ts — Axios client
        ├── hooks/            # useCountUp
        ├── types/            # TypeScript interfaces
        └── utils/            # Helpers, risk calculator
```

---

## Quick Start

### 1. Start the Backend

```powershell
cd backend/sentinel
./mvnw spring-boot:run
```

Backend runs on **http://localhost:8080**

> Ensure MongoDB Atlas is configured in `src/main/resources/application.properties`.

### 2. Start the Frontend

```powershell
cd frontend
npm install       # (only needed once)
npm run dev
```

Frontend runs on **http://localhost:5173**

> CORS is pre-configured in Spring Boot for `http://localhost:5173`.

---

## Environment Variables

Copy `.env.example` to `.env` (already done):

```env
VITE_API_BASE_URL=http://localhost:8080
```

> Never put MongoDB credentials or Spring secrets in the frontend `.env` file.

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page (public) |
| `/sign-in` | Sign-in UI prototype |
| `/dashboard` | Dashboard overview |
| `/transactions` | All transactions table |
| `/transactions/new` | Submit a new transaction |
| `/transactions/:id` | Transaction detail + review actions |
| `/flagged` | Flagged high-risk transactions |
| `/investigations` | Investigation queue |
| `/audit-logs` | Full audit trail timeline |
| `/settings` | Display preferences |

---

## API Endpoints Connected

| Method | Endpoint | Used In |
|--------|----------|---------|
| `GET` | `/api/dashboard/summary` | Dashboard Overview |
| `GET` | `/api/transactions` | Transactions, Dashboard |
| `GET` | `/api/transactions/flagged` | Flagged Page |
| `GET` | `/api/transactions/{id}` | Transaction Detail |
| `POST` | `/api/transactions` | New Transaction Form |
| `PATCH` | `/api/transactions/{id}/review?decision={d}` | Transaction Detail, Flagged, Investigations |
| `GET` | `/api/audit-logs` | Audit Logs Page |
| `GET` | `/api/audit-logs/transaction/{id}` | Transaction Detail |

### Valid `decision` values for review:
- `REVIEWED`
- `CONFIRMED_FRAUD`
- `FALSE_POSITIVE`

---

## Fraud Risk Rules (replicated in demo calculator)

| Condition | Points Added |
|-----------|-------------|
| Amount ≥ 10,000 | +30 |
| Amount ≥ 5,000 | +20 |
| Amount ≥ 1,000 | +10 |
| Sender == Receiver | +50 |
| Maximum score | 100 |

| Score Range | Risk Level |
|-------------|------------|
| ≥ 60 | HIGH |
| 30–59 | MEDIUM |
| < 30 | LOW |

---

## Features

- **Premium dark UI** — navy/midnight-blue backgrounds, electric blue/cyan/violet gradients, glassmorphism cards
- **Animated hero** — scan lines, floating orbs, live dashboard preview component
- **Interactive risk calculator** — client-side demo using exact backend rules
- **Full CRUD workflow** — submit, view, filter, sort, paginate, and review transactions
- **Investigation queue** — review REVIEW_REQUIRED transactions, confirm fraud, or dismiss
- **Audit timeline** — complete color-coded log of all actions
- **Error states** — meaningful messages when the backend is offline
- **Empty states** — illustrated guidance when no data exists yet
- **Responsive** — works on mobile, tablet, laptop, and desktop
- **Accessible** — semantic HTML, keyboard focus rings, ARIA labels, `prefers-reduced-motion` support

---

## Build for Production

```powershell
cd frontend
npm run build
```

Output in `frontend/dist/`. Serve with any static file server or deploy to Vercel/Netlify.

---

## Notes

- The Sign In page is a **UI prototype** — real authentication is not implemented in the backend
- Settings preferences are **display-only** and not persisted to the backend
- The landing page demo calculator runs **client-side only** and does not call the backend API
- The dashboard error state ("Unable to Load Data") appears when the Spring Boot server is not running — start the backend to see live data
