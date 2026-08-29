# 🎥 10-Minute Video Walkthrough Script & Code Defense Guide

This document is your exact, minute-by-minute companion for recording the **mandatory 10-minute project walkthrough video** for CPS Academy (Junior Software Engineer — Project Round).

---

## ⚠️ গুরুত্বপূর্ণ নির্দেশনা: ডেপ্লয়মেন্ট কি ভিডিওতে লাইভ করে দেখাতে হবে?

**না! ভিডিও চলাকালীন আপনাকে লাইভ ডেপ্লয় করতে হবে না।**
প্রজেক্টটি ভিডিও রেকর্ড করার **আগেই** Vercel এবং Railway-তে ডেপ্লয় করে রাখতে হবে। 

ভিডিওর শেষ অংশে (৯:১৫ - ১০:০০) আপনি শুধু ব্রাউজারে আগে থেকে ওপেন করে রাখা **Railway ড্যাশবোর্ড** এবং **Vercel ড্যাশবোর্ড** স্ক্রিনে এক নজর দেখাবেন এবং বলবেন:
1. ব্যাকএন্ড Railway-তে PostgreSQL ডেটাবেস এবং **Persistent Volume (`/app/public/uploads`)**-এর সাথে লাইভ চলছে (`PUBLIC_URL`, `IS_PROXIED`, CSP & CORS কনফিগার করা)।
2. ফ্রন্টএন্ড Vercel-এ লাইভ চলছে (`NEXT_PUBLIC_STRAPI_URL` দিয়ে কানেক্টেড)।

---

## ⏱️ Exact 10-Minute Timeline Breakdown

| Timestamp | Section | Key Screen / File to Show | Main Objective |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | **Intro & Architecture** | Home Page / README | Explain Next.js 16 + Strapi 5 decoupled stack, 4 distinct roles, database relations. |
| **0:45 - 3:30** | **Live Role-Based Demo** | Deployed App (Vercel) | Full live user flow across Student, Instructor, Content Manager, and Admin. |
| **3:30 - 4:45** | **Data Flow & REST Architecture** | `frontend/lib/api.ts` & Controller | Trace one end-to-end request (e.g. Enroll or Lesson completion) from client to Strapi and DB. |
| **4:45 - 6:00** | **Backend Authorization (3 Layers)** | `permissions.ts` & `policies/*.ts` | Show why security is enforced on the server, not by hiding buttons in React. |
| **6:00 - 7:15** | **Progress Tracking Logic** | `sequence.ts` & `course.ts (progress)` | Explain dynamic progress calculation and sequential lesson unlock line-by-line. |
| **7:15 - 8:15** | **Quiz Auto-Grading & Security** | `quiz-result.ts`, `grade.ts`, `question.json` | Explain server-side grading and why `correctIndex` is private in the schema. |
| **8:15 - 9:15** | **Admin Dashboard & Blog Lifecycle** | `/admin`, `/blog`, `blog-post.ts` | Show platform metrics, role switching, and draft vs. published state isolation. |
| **9:15 - 10:00** | **Deployment & Production Setup** | Railway + Vercel Dashboards | Show PostgreSQL, Railway Persistent Volume, environment variables, CORS, and proxy configurations. |

---

## 🎬 Minute-by-Minute Script & Code Defense

### 1. Introduction & Architecture (0:00 - 0:45)
* **Screen:** Open the live app home page or [README.md](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/README.md).
* **What to say (English):**
  > "Hello everyone! This is my submission for the CPS Academy Junior Software Engineer project round: a modern, highly secure Learning Management System.
  > The tech stack is built on **Next.js 16 App Router** with Tailwind CSS 4 on Vercel for the frontend, and **Strapi 5 Headless CMS with PostgreSQL** deployed on Railway with persistent media volume storage for the backend.
  > The core focus of this project is strict, leak-proof **4-Role Access Control**: Admin, Content Manager, Instructor, and Student. Next.js is purely a presentation layer; every single permission, sequential lesson lock, and quiz grade is strictly validated on the Strapi server."
* **বাংলা কিউ (Bangla Cue):**
  > "সবাইকে স্বাগতম! এটি আমার CPS Academy LMS প্রজেক্ট। ফ্রন্টএন্ড Next.js 16 এবং ব্যাকএন্ড Strapi 5 ও PostgreSQL ডেটাবেসে তৈরি। সম্পূর্ণ সিকিউরিটি ও বিজনেস রুলস সার্ভার-সাইডে ৪টি স্বতন্ত্র রোলের (Admin, Content Manager, Instructor, Student) মাধ্যমে কঠোরভাবে নিয়ন্ত্রণ করা হয়েছে।"

---

### 2. Live Demo Across 4 Roles (0:45 - 3:30)

> [!TIP]
> **Pro Tip:** Have 4 separate browser windows/tabs or profiles logged into each account before hitting record to avoid hitting Strapi's default rate limits.

#### Step A: Student Flow (`student@demo.test` / Student Registration)
1. Open the public catalogue `/courses`. Show that visitors can view course titles, descriptions, and syllabus outlines, but cannot see full video players or take quizzes.
2. Register a new account or log in as **Student**. Show the **Floating Toast Notification** and instant auto-redirect.
3. Open a course (e.g. *Web Development Masterclass* or *Postgres in Production*). Click **Enroll**.
4. Open a lesson. Show that **Sequential Progression** is strictly active: Lesson 2 is locked until Lesson 1 is completed.
5. Click **Next Lesson**. Show the **Instant In-Place Smooth Transition** without page buffering, and show the live **Course Track Progress Bar** update in the sidebar.
6. Navigate to the course **Quiz**. Select MCQ answers and click **Submit**.
7. Show the auto-graded score (e.g. `Score: 4/5 (80%)`) and show that the course is now marked **100% Completed** with verified badge.

#### Step B: Instructor Flow (`instructor@demo.test`)
1. Switch to the Instructor account. Go to `/dashboard`.
2. Open an owned course and click **Student Progress** (`/courses/:id/students`). Show the live class roster with every enrolled student's progress and quiz scores.
3. Click **Edit Course Builder**. Show the syllabus editor: reordering lessons with arrows, editing rich markdown text, and updating the **Quiz Builder**.
4. Show that the instructor can view correct answer choices because of the protected `/api/quizzes/:id/answers` endpoint.

#### Step C: Content Manager Flow (`manager@demo.test`)
1. Switch to Content Manager. Show that they can manage all courses across the entire platform.
2. Go to `/blog` and `/manage/blog`. Create or edit an engineering article.
3. Show the **Draft vs. Published** toggle. Save a post as `Draft`. Log out and verify that public visitors and students cannot see the draft. Then switch it to `Published` and show it appearing instantly on the public blog.

#### Step D: Admin Panel (`admin@demo.test`)
1. Switch to Admin. Navigate to `/admin`.
2. Show the **Platform Metrics Hub** (Total accounts per role, courses, lessons, enrollments, quiz attempts, published posts vs drafts).
3. Show the **User Management Roster**: promote a user from Student to Instructor in one click.

---

### 3. Data Flow & REST Architecture (3:30 - 4:45)
* **Code to show:** 
  - [frontend/lib/api.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/frontend/lib/api.ts)
  - [backend/src/api/enrollment/controllers/enrollment.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/enrollment/controllers/enrollment.ts)
  - [backend/src/extensions/users-permissions/strapi-server.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/extensions/users-permissions/strapi-server.ts)
* **What to say (English):**
  > "Let's trace how data moves through the application.
  > On the frontend, `lib/api.ts` configures a centralized Axios instance. Every outgoing request passes through an interceptor attaching the JWT bearer token. If a token expires (10-minute lifetime), a single-flight response interceptor catches the 401, calls `/api/auth/refresh`, rotates the token, and retries seamlessly without logging out the user.
  > When a student enrolls, the frontend sends `POST /api/enrollments` with only `{ data: { course: documentId } }`.
  > On the backend in `enrollment.ts`, we completely discard any client-supplied student ID. We extract `caller(ctx).id` directly from `ctx.state.user`. Then the Document Service checks for duplicate enrollments before writing to PostgreSQL and returning the sanitized response.
  > Furthermore, in `users-permissions/strapi-server.ts`, we customized the registration controller to programmatically assign the 'Student' role and issue an authenticated JWT immediately."

---

### 4. Backend Authorization — 3-Layer Security (4:45 - 6:00)
* **Code to show:** 
  - [backend/src/permissions.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/permissions.ts)
  - [backend/src/policies/is-course-owner.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/policies/is-course-owner.ts)
  - [backend/src/policies/owns-parent-course.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/policies/owns-parent-course.ts)
  - [backend/src/policies/can-view-lesson.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/policies/can-view-lesson.ts)
* **What to say (English):**
  > "Our security is strictly enforced on the server across 3 distinct layers:
  > **Layer 1 (RBAC Permission Matrix):** In `permissions.ts`, our automated bootstrap runs on server boot and synchronizes the 4-role permission matrix directly to PostgreSQL. If a Student tries to `POST /api/courses` or modify someone else's quiz via Postman, Strapi immediately rejects it with a 403 Forbidden.
  > **Layer 2 (Route Policies):** Roles can say *'Instructors can edit courses'*, but not *'only their own courses'*. So we created `is-course-owner.ts` and `owns-parent-course.ts`. Every policy returns an explicit boolean so it never fails open.
  > **Layer 3 (Controller Scoping):** In `caller.ts`, we apply `narrow()` to ensure students can only fetch their own progress/enrollments, while instructors only see data for courses they own."

---

### 5. Progress Tracking Logic & Sequential Unlocking (6:00 - 7:15)
* **Code to show:** 
  - [backend/src/utils/sequence.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/utils/sequence.ts)
  - [backend/src/policies/can-view-lesson.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/policies/can-view-lesson.ts)
  - [backend/src/api/course/controllers/course.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/course/controllers/course.ts) (the `progress` method)
  - [frontend/app/(app)/dashboard/enrolled-courses.tsx](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/frontend/app/%28app%29/dashboard/enrolled-courses.tsx)
* **What to say (English):**
  > "For Progress Tracking, we made two critical architectural decisions:
  > 1. **Percentages are never stored as static numbers in the database.** If an instructor adds or removes a lesson tomorrow, a stored percentage becomes invalid. Instead, `GET /courses/:id/progress` dynamically counts completed `LessonProgress` rows against total course milestones in a single query.
  > 2. **Sequential Progression:** In `sequence.ts`, `unfinishedLessonBefore()` queries all earlier lessons where `order < currentLesson.order` and verifies whether a completion record exists. If any earlier lesson is missing, `can-view-lesson.ts` returns a 403 naming the exact unfinished lesson.
  > 3. **Quiz Milestone Integration:** A course with a quiz only awards 100% completion after the student has submitted the final assessment, calculating `totalMilestones = lessons.length + (hasQuiz ? 1 : 0)`."

---

### 6. Quiz Auto-Grading & Anti-Cheat Security (7:15 - 8:15)
* **Code to show:** 
  - [backend/src/components/quiz/question.json](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/components/quiz/question.json)
  - [backend/src/api/quiz-result/controllers/quiz-result.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/quiz-result/controllers/quiz-result.ts)
  - [backend/src/utils/grade.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/utils/grade.ts)
  - [backend/src/api/quiz/controllers/quiz.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/quiz/controllers/quiz.ts) (`answers` method)
* **What to say (English):**
  > "Auto-grading happens entirely on the server.
  > To prevent cheating, `correctIndex` in `question.json` is configured with `"private": true`. Strapi's output sanitizer strips private attributes from all Content API endpoints. The student client only ever receives question text and option strings. The server evaluates the score by loading the raw document inside `quiz-result` controller with `grade.ts`.
  > Meanwhile, instructors can verify answers via the dedicated, permission-guarded `/api/quizzes/:id/answers` endpoint."

---

### 7. Admin Dashboard, Media Storage & Blog Control (8:15 - 9:15)
* **Code to show:** 
  - [backend/src/api/stats/controllers/stats.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/stats/controllers/stats.ts)
  - [frontend/components/image-picker.tsx](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/frontend/components/image-picker.tsx)
  - [backend/src/api/blog-post/controllers/blog-post.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/blog-post/controllers/blog-post.ts)
* **What to say (English):**
  > "In the Admin dashboard, `GET /api/stats` gathers platform metrics — counting accounts per role, total courses, lessons, enrollments, and quiz attempts in a single unified query.
  > For Media Uploads, `image-picker.tsx` streams images directly to Strapi's `/api/upload` endpoint, persistently stored on Railway's dedicated volume.
  > For the Engineering Blog, we use a custom `publishState` enum ('draft' | 'published'). In `blog-post.ts`, any read request by students or public visitors is server-narrowed to `publishState: 'published'`. Drafts return a 404 to unauthorized users."

---

### 8. Deployment & Production Setup (9:15 - 10:00)
* **Screen:** Open Railway and Vercel browser tabs.
* **Code to show:** 
  - [backend/config/middlewares.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/config/middlewares.ts)
  - [backend/config/server.ts](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/config/server.ts)
* **What to say (English):**
  > "For production deployment:
  > - **Backend:** Deployed on Railway with a managed PostgreSQL database and a 500MB persistent volume mounted at `/app/public/uploads`. In `server.ts`, reverse proxy settings and `PUBLIC_URL` handle secure HTTPS headers. In `middlewares.ts`, CORS and CSP allow cross-origin image rendering on Vercel.
  > - **Frontend:** Deployed on Vercel with `NEXT_PUBLIC_STRAPI_URL` set to the live Railway domain.
  > Thank you very much for your time and reviewing my submission!"
* **বাংলা কিউ (Bangla Cue):**
  > "ডেপ্লয়মেন্টে ব্যাকএন্ড Railway-তে PostgreSQL এবং পারসিস্টেন্ট ভলিউম সহ লাইভ চলছে, এবং ফ্রন্টএন্ড Vercel-এ লাইভ কানেক্টেড রয়েছে। প্রজেক্টটি রিভিউ করার জন্য ধন্যবাদ!"

---

## 📋 Pre-Recording Checklist
- [ ] Open 4 browser tabs: Student, Instructor, Content Manager, Admin.
- [ ] Open Railway Dashboard & Vercel Dashboard in a separate window.
- [ ] Open VS Code with key files ready in split editor:
  - `frontend/lib/api.ts`
  - `backend/src/permissions.ts`
  - `backend/src/policies/is-course-owner.ts`
  - `backend/src/utils/sequence.ts`
  - `backend/src/components/quiz/question.json`
- [ ] Test microphone audio and screen resolution (1080p).
- [ ] Target recording duration: **9:30 to 10:00 minutes**.
