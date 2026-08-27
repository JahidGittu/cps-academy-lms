# 🎓 CPS Academy — Learning Management System (LMS)

A modern, secure, full-stack Learning Management System built with a decoupled architecture for the **CPS Academy Junior Software Engineer (Project Round)**.

- **Frontend:** Next.js 16 (App Router, Tailwind CSS, TypeScript, `Plus Jakarta Sans`) — Deployed on **Vercel**
- **Backend / Headless CMS:** Strapi 5 (TypeScript, Custom REST Controllers, Policies, Services) — Deployed on **Railway** with **PostgreSQL**

---

## 🔗 Live Application Links

- 🌐 **Frontend (Live on Vercel):** *[Insert your Vercel URL here]*
- ⚙️ **Backend API (Live on Railway):** *[Insert your Railway URL here]*
- 🎥 **Video Walkthrough (10-Minute Walkthrough & Code Defense):** *[Insert your Google Drive / YouTube Unlisted Link here]*
- 💻 **GitHub Repository:** *[Insert your Public GitHub Link here]*

---

## 👥 Demo User Credentials (Seed Accounts)

All accounts are pre-seeded with the password: `demo12345`

| Role | Username | Email | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin` | `admin@demo.test` | Full platform control: manage all users, assign/change roles, view system statistics, edit/delete any course or blog post. |
| **✍️ Content Manager** | `manager` | `manager@demo.test` | Content library management: create and edit courses, lessons, quizzes across the platform, publish and manage engineering blog articles (draft vs. published). |
| **👨‍🏫 Instructor** | `instructor` | `instructor@demo.test` | Course instructor: manage owned courses, lessons, and quizzes. View real-time completion progress roster of enrolled students. |
| **👨‍🎓 Student** | `student` | `student@demo.test` | Learner: enroll in courses, complete sequential lessons, take auto-graded quizzes, and track completion progress. |
| **👨‍🎓 Student 2** | `student2` | `student2@demo.test` | Secondary student account for multi-user class roster and quiz analytics testing. |

---

## 🛡️ Role-Based Permission Matrix

Every single rule is validated strictly on the **Strapi backend** via custom policies and controllers (`backend/src/permissions.ts`, `backend/src/policies/`, `backend/src/api/*/controllers/`).

| Action | Admin | Content Manager | Instructor | Student | Public Visitor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manage users & assign/change roles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Access Admin Platform Stats (`/api/stats`)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create / edit / delete any course** | ✅ | ✅ | Own only | ❌ | ❌ |
| **Add / edit / delete lessons & reorder** | ✅ | ✅ | Own courses | ❌ | ❌ |
| **Create & configure MCQ quizzes** | ✅ | ✅ | Own courses | ❌ | ❌ |
| **View student progress & roster** | ✅ | ✅ | Own courses | Own only | ❌ |
| **Write, edit & publish blog posts** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Read published engineering blog posts** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Enroll in a course** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Complete sequential lessons** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Take MCQ quizzes & get auto-graded** | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 🌟 Key Differentiators & Human Engineering Decisions

### 1. ⛓️ Strict Server-Side Sequential Progression (`sequence.ts`)
- Lessons unlock strictly in order.
- A student cannot jump ahead or access Lesson $N$ until Lesson $N-1$ has a verified database entry in `LessonProgress`.
- DevTools manipulation or direct URL requests to locked lessons return **HTTP 403 Forbidden**.

### 2. 🔐 Hidden Answer Key & Server-Side Auto-Grading (`grade.ts`)
- In Strapi schema definitions, `correctIndex` is marked `private: true`.
- When fetching quiz questions on the client, Strapi automatically strips the correct answers from the response payload.
- Grading occurs 100% on the server in `grade.ts`, recording permanent `QuizResult` entries.

### 3. 📝 Blog Lifecycle & Draft Isolation
- Content Managers and Admins can draft articles before going live.
- Draft posts are strictly invisible to students and the public (returning 404/403).
- Publishing an article makes it instantly accessible in the public feed.

### 4. 🖼️ Dual Image Upload System (`image-picker.tsx`)
- Supports direct device file upload (with client-side canvas compression) as well as direct image URLs and 1-click curated preset chips.

### 5. 🗂️ Enterprise 100vh Pinned Sidebar Workspace
- Persistent left-edge workspace sidebar that stays active across all authenticated routes (`/dashboard`, `/admin`, `/courses/new`, `/blog/new`, curriculum editors, and rosters) without disappearing.

---

## 💻 Running the Project Locally

### Prerequisites
- Node.js version 20 or newer
- npm version 9 or newer

### 1. Start the Strapi Backend
```bash
cd backend
cp .env.example .env
npm install
npm run develop
```
- The backend starts on `http://localhost:1337`.
- On initial startup, the database auto-seeds the 4 roles, demo accounts, sample courses, lessons, quizzes, and blog posts.

### 2. Start the Next.js Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
- The frontend starts on `http://localhost:3000`.

---

## 🚀 Production Deployment Setup

### Railway (Backend + PostgreSQL)
1. Provision a **PostgreSQL Database** on Railway.
2. Deploy the `backend/` folder to Railway.
3. Configure environment variables in Railway:
   - `DATABASE_CLIENT=postgres`
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - `PUBLIC_URL=https://<your-railway-app>.up.railway.app`
   - `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`
   - `IS_PROXIED=true`
   - `CORS_ORIGIN=https://<your-vercel-app>.vercel.app`

### Vercel (Frontend)
1. Deploy the `frontend/` folder to Vercel (Next.js preset).
2. Configure environment variable in Vercel:
   - `NEXT_PUBLIC_STRAPI_URL=https://<your-railway-app>.up.railway.app`
