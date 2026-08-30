# CPS Academy LMS

A full-stack Learning Management System built with **Next.js 15** (frontend hosted on Vercel), **Strapi 5** (headless CMS backend on Railway), and **PostgreSQL** as part of the CPS Academy Junior Software Engineer Selection Project.

---

## 🌐 Live Deployments & Links

| Layer | URL | Platform |
|---|---|---|
| **Live Frontend App** | [https://cps-academy-lms.vercel.app](https://cps-academy-lms.vercel.app) | Vercel |
| **Live Backend API** | [https://cps-academy-lms-production.up.railway.app](https://cps-academy-lms-production.up.railway.app) | Railway |
| **Strapi CMS Admin Panel** | [https://cps-academy-lms-production.up.railway.app/admin](https://cps-academy-lms-production.up.railway.app/admin) | Railway |
| **GitHub Repository** | [https://github.com/JahidGittu/cps-academy-lms](https://github.com/JahidGittu/cps-academy-lms) | GitHub |

---

## 🔑 Demo Test Accounts & Credentials

### 1. Frontend Platform Roles (`/login`)

| Role | Email | Password | Permissions & Scope |
|---|---|---|---|
| 👨‍💼 **Admin** | `admin@demo.test` | `Admin@123` | Full console, platform analytics, optimistic user role management, all courses & blogs. |
| 📝 **Content Manager** | `manager@content.test` | `Manager@123` | Platform-wide course syllabus, assessments, and technical blog authoring (draft & published). |
| 👨‍🏫 **Instructor** | `rayhan@instructor.test` | `Instructor@123` | Course builder for own courses, lesson syllabus, quiz editor, live debounced auto-save. |
| 🎓 **Student** | `jahid.hossen.me@gmail.com` | `Jahid@123` | Public catalog browsing, course enrollment, sequential lesson unlocking, MCQ quiz, live progress. |

### 2. Strapi CMS Super Admin (`/admin`)

| Portal | Email | Password | Description |
|---|---|---|---|
| **Strapi CMS Dashboard** | `jahid.hossen.me@gmail.com` | `Admin@12345` | Direct Strapi Content Manager & Schema access |

---

## 🧱 Tech Stack & Architecture

| Layer | Technology | Hosting & Tools |
|---|---|---|
| **Frontend** | Next.js 15 (App Router, Server & Client Components) | Vercel |
| **Backend API** | Strapi 5 (Headless CMS, Custom REST Controllers & Services) | Railway |
| **Database** | PostgreSQL (Relational DB with foreign constraints & pooling) | Railway |
| **Styling** | Vanilla CSS Design System (Tailored tokens, Dark/Light Mode) | Native CSS variables |
| **Icons & Assets** | Lucide React Icons | SVG |

---

## 👥 User Roles & Permissions Matrix (RBAC)

| Action | Admin | Content Manager | Instructor | Student | Public / Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| View Course Catalog & Details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read Published Technical Blogs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enroll in Courses | ❌ | ❌ | ❌ | ✅ | ❌ |
| Sequential Lesson Viewing | ❌ | ❌ | ❌ | Enrolled only | ❌ |
| Take MCQ Quizzes | ❌ | ❌ | ❌ | Enrolled only | ❌ |
| Create / Edit Own Courses | ✅ | ✅ | ✅ (Own only) | ❌ | ❌ |
| Auto-Save Course Builder & Quizzes | ✅ | ✅ | ✅ | ❌ | ❌ |
| Write & Publish Blog Articles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Users & Assign Roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Platform Analytics Overview | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔒 Key Architectural & Security Highlights

1. **Programmatic RBAC Matrix (`backend/src/permissions.ts`):**
   - Zero manual Strapi panel configuration required. The RBAC matrix automatically synchronizes and bootstraps into PostgreSQL on every server startup.
2. **Sequential Lesson Lock (`backend/src/utils/sequence.ts`):**
   - Server-side validation (`unfinishedLessonBefore`) returns `403 Forbidden` if a student attempts to skip ahead without completing prerequisite lessons in order.
3. **Quiz Anti-Cheat & Server-Side Auto-Grading (`backend/src/utils/grade.ts`):**
   - The `correctIndex` field is configured as `"private": true` in `question.json`. Strapi sanitizers strip answer keys from all client reads.
   - Grading is executed 100% server-side upon submission; students cannot spoof scores.
4. **Dynamic Real-Time Progress Calculation:**
   - Progress percentage is dynamically computed based on milestones (all lessons + final quiz completion) on every page load, preventing stale DB cache bugs.
5. **Draft Blog Isolation & Security:**
   - Draft posts are strictly gated via `PUBLISHED_ONLY` query filtering; unauthenticated visitors or regular users cannot view or scrape draft content.
6. **Optimistic UI & Debounced Auto-Saving:**
   - User role switching occurs instantly with optimistic rollback on error; course and blog builder forms auto-save seamlessly with debounced background sync.
7. **Cloud Media Library Integration:**
   - Universal Media Library modal with search, upload, and deletion capabilities directly connected to Railway persistent storage.

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database instance

### 2. Backend Setup (Strapi 5)

```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL, APP_KEYS, JWT_SECRET etc.
npm run develop
```
*Backend runs at `http://localhost:1337`*

### 3. Frontend Setup (Next.js 15)

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:1337/api
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## 📁 Project Directory Map

```
cps-academy-lms/
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── app/
│   │   ├── (app)/                # Authenticated application shell
│   │   │   ├── admin/            # Admin console (overview, user roles, courses, blogs)
│   │   │   ├── blog/             # Public blog showcase & reader
│   │   │   ├── courses/          # Course catalogue, builder, syllabus, quiz viewer
│   │   │   ├── dashboard/        # Student "My Courses" / Instructor managed courses
│   │   │   ├── lessons/          # Sequential lesson player with lock gates
│   │   │   ├── profile/          # User settings & security
│   │   │   ├── login/            # Authentication login
│   │   │   └── register/         # Account registration
│   │   └── (public)/             # Homepage landing & value proposition
│   ├── components/               # UI components, modals, rich text editor, image picker
│   └── lib/                      # Custom hooks (useApi, useAuth), API client, TypeScript types
│
└── backend/                      # Strapi 5 Headless CMS Backend
    ├── config/                   # Middlewares, database & CORS policies
    └── src/
        ├── api/                  # Core domain controllers & services
        │   ├── course/           # Scope filters & owner verification
        │   ├── lesson/           # Sequential lock enforcement
        │   ├── quiz/             # Private key answers & question component
        │   ├── quiz-result/      # Server auto-grader execution
        │   ├── enrollment/       # Verified session enrollment checks
        │   ├── lesson-progress/  # Lesson completion markers
        │   ├── blog-post/        # Draft vs published isolation gates
        │   └── stats/            # Real-time platform metrics aggregation
        ├── permissions.ts        # Programmatic RBAC bootstrapper
        └── utils/                # caller, sequence & grade helper functions
```

---

## 📜 Submission Details

- **Author:** Jahid Hossen
- **Email:** jahid.hossen.me@gmail.com
- **Phone:** +880 1640-726858
- **Project:** CPS Academy — Junior Software Engineer Selection
- **Submission Date:** 30 August 2026
