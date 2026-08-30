# CPS Academy LMS

A full-stack Learning Management System built with **Next.js** (frontend on Vercel) and **Strapi 5** (backend on Railway) as part of the CPS Academy Junior Software Engineer Project Round.

---

## 🌐 Live Deployment

| Layer | URL |
|-------|-----|
| **Frontend** | https://cps-academy-lms.vercel.app *(Vercel)* |
| **Backend API** | https://cps-academy-lms-production.up.railway.app *(Railway)* |
| **GitHub** | https://github.com/JahidGittu/cps-academy-lms |

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.test` | `Admin@123` |
| **Content Manager** | `manager@content.test` | `Manager@123` |
| **Instructor** | `rayhan@instructor.test` | `Instructor@123` |
| **Student** | `jahid.hossen.me@gmail.com` | `Jahid@123` |


## 🧱 Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) | Vercel |
| Backend / CMS | Strapi 5 | Railway |
| Database | PostgreSQL | Railway |
| Styling | Vanilla CSS (custom design system) | — |

---

## 👥 User Roles & Permissions

| Action | Admin | Content Manager | Instructor | Student |
|--------|-------|----------------|------------|---------|
| Manage users & assign roles | ✅ | ❌ | ❌ | ❌ |
| Create / edit / delete any course | ✅ | ✅ | Own only | ❌ |
| Add / edit / delete lessons | ✅ | ✅ | Own courses | ❌ |
| Create quizzes | ✅ | ✅ | Own courses | ❌ |
| View student progress | ✅ | ✅ | Own courses | Own only |
| Write / manage blog posts | ✅ | ✅ | ❌ | ❌ |
| Enroll in a course | ❌ | ❌ | ❌ | ✅ |
| Take quizzes | ❌ | ❌ | ❌ | ✅ |

---

## ✅ Features Completed

### Core Features
- **Authentication** — JWT-based login/register with role assignment
- **Role-based protected routes** — enforced on both frontend (`RequireAuth`) and backend (RBAC permission matrix)
- **Course Management** — full CRUD; Content Managers manage all, Instructors manage own courses
- **Lessons** — ordered lessons under courses with text content and/or video URL
- **Student Enrollment** — browse available courses, enroll, "My Courses" dashboard
- **Lesson Viewing** — sequential lesson access, only for enrolled students (backend-enforced)
- **Progress Tracking** — mark lessons complete, live % progress per course per student, persists across refreshes

### Differentiator Features
- **Quiz with Auto-Grading** — MCQ quiz per course, immediate score on submit, stored result viewable later
- **Admin Panel** — user list with role management, platform-wide course/blog management, real-time stats
- **Platform Stats** — users per role, total courses, lessons, enrollments, quiz attempts, blog post counts
- **Blog** — rich text editor, draft/published states (drafts hidden from public), topic tags, cover images

### Extra (Beyond Spec)
- **Universal Media Library Modal** — browse, search, upload to Railway cloud, delete assets with sweet-alert confirmation
- **Auto-save** — course builder and blog editor auto-save with debounce, no data loss
- **Rich Text Editor** — custom editor for lesson content (bold, italic, lists, headings, code blocks)
- **Dark/Light Theme Toggle** — system-preference aware, persisted
- **Loading Skeletons** — smooth content transitions instead of jarring spinners
- **Toast Notifications** — feedback on every action
- **Responsive Design** — mobile-first, works on all screen sizes

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL (or use Railway's hosted DB via env vars)

### Backend (Strapi)

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, APP_KEYS, JWT_SECRET etc.
npm install
npm run develop
```

Backend runs at `http://localhost:1337`

### Frontend (Next.js)

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:1337/api
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://...
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=https://cps-academy-lms-production.up.railway.app/api
NEXT_PUBLIC_STRAPI_URL=https://cps-academy-lms-production.up.railway.app
```

---

## 🏗️ Architecture Decisions

### Why this structure?

**Backend:** Strapi 5's document-based API was chosen for its built-in content type management and flexible permission system. We wrote a custom `permissions.ts` bootstrapper that runs on every server start to enforce the RBAC matrix programmatically — no manual Strapi admin panel clicking required, and permissions are version-controlled.

**Frontend:** Next.js App Router with client components for interactive pages. We use a lightweight `useApi` hook (SWR-like) for data fetching with built-in loading/error states. The auth flow stores JWT in localStorage and reads it through a `useAuth()` hook shared across all pages.

**Progress Tracking:** When a student finishes a lesson, a `lesson-progress` record is created linking the student (via their enrollment) to the specific lesson. The progress percentage is computed on the frontend: `completed.size / lessons.length * 100`. This is intentionally kept in the frontend to avoid the overhead of a custom backend aggregation endpoint for every page load.

**Quiz Auto-Grading:** The `correctIndex` field is marked private in Strapi's schema and never returned on a standard read. When a student submits answers, the backend's quiz controller fetches the full quiz (with correctIndex) internally, compares each submitted answer, computes the score, and stores a `quiz-result` record. The student only ever sees their score — never the answer key.

**Role-based Access:** Every API endpoint checks the caller's role before returning data. The `caller()` utility extracts the authenticated user, and `seesEveryRow()` returns `true` only for admin/manager roles. For Instructors, queries are filtered by `owner.id === caller.id` server-side.

---

## 📁 Project Structure

```
cps-academy-lms/
├── frontend/                # Next.js App Router
│   ├── app/
│   │   ├── (app)/           # Authenticated app shell
│   │   │   ├── admin/       # Admin panel (users, courses, blogs, stats)
│   │   │   ├── blog/        # Public blog list & detail
│   │   │   ├── courses/     # Course catalog, detail, quiz, progress
│   │   │   ├── dashboard/   # Student "My Courses" / Instructor managed courses
│   │   │   ├── lessons/     # Lesson viewer
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (public)/        # Landing page
│   ├── components/          # Shared UI components
│   └── lib/                 # API client, auth hooks, types
│
└── backend/                 # Strapi 5
    └── src/
        ├── api/             # Custom controllers for each content type
        │   ├── course/      # Ownership checks, instructor filtering
        │   ├── lesson/      # Enrollment gate on body access
        │   ├── quiz/        # Answer-key isolation, auto-grading
        │   ├── blog-post/   # Draft/publish gate, topic handling
        │   ├── enrollment/  # Student-only creation
        │   ├── lesson-progress/ # Progress recording
        │   ├── quiz-result/ # Score storage
        │   └── stats/       # Aggregated platform metrics
        ├── permissions.ts   # RBAC matrix applied on every boot
        └── utils/caller.ts  # Auth context helpers
```

---

## 🔒 Security Notes

- `correctIndex` is never exposed in quiz read endpoints — only the backend auto-grader sees it
- Lesson content body is gated behind enrollment check on the backend
- All role assignments must go through the Admin's user management panel — users cannot self-promote
- Draft blog posts return 404/empty for non-admin/CM roles on the backend
