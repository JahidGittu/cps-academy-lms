# 🎥 10-Minute Video Walkthrough Script & Code Defense Guide

This document is your complete, minute-by-minute cheat sheet for recording the **mandatory 10-minute project walkthrough video** for CPS Academy (Junior Software Engineer — Project Round).

---

## ⚠️ ভিডিও শুরুর পূর্ব প্রস্তুতি (Pre-Recording Checklist)

> [!IMPORTANT]
> **ভিডিও রেকর্ড করার সময় আপনাকে লাইভ ডেপ্লয় করে দেখাতে হবে না।**  
> প্রজেক্টটি ভিডিও রেকর্ড করার **আগেই** Railway এবং Vercel-এ ডেপ্লয় করা থাকবে। ভিডিওর শেষ মিনিটে (৯:১৫ - ১০:০০) আপনি কেবল ব্রাউজারে আগে থেকে ওপেন রাখা Railway ও Vercel ড্যাশবোর্ড স্ক্রিনে এক নজর প্রদর্শন করবেন।

### 🛠️ রেকর্ড করার আগে ব্রাউজারে যা যা ওপেন রাখবেন:
1. **Window 1 (Live Demo App):** `http://localhost:3000` অথবা আপনার ডেপ্লয় করা Vercel URL।
   * **Tab 1:** Student Profile (`student@demo.test` / `password123` বা নতুন রেজিস্টার্ড স্টুডেন্ট)
   * **Tab 2:** Instructor Profile (`instructor@demo.test` / `password123`)
   * **Tab 3:** Content Manager Profile (`manager@demo.test` / `password123`)
   * **Tab 4:** Admin Profile (`admin@demo.test` / `password123`)
2. **Window 2 (VS Code / IDE):** নিচের কোড ফাইলগুলো ট্যাব হিসেবে ওপেন রাখুন।
3. **Window 3 (Cloud Dashboards):** Railway Dashboard (`cps-academy-lms` + Volume) ও Vercel Dashboard।
4. **Window 4 (Interactive Teleprompter):** ব্রাউজারে [`video_walkthrough_guide.html`](./video_walkthrough_guide.html) ওপেন রাখুন টাইমার ও স্ক্রিপ্ট দেখার জন্য।

---

## ⏱️ Exact 10-Minute Timeline Breakdown

| Timestamp | Section | Key Screen / File to Show | Main Objective |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | **Intro & Architecture** | Home Page / README | Explain Next.js 16 + Strapi 5 decoupled stack, 4 distinct roles, database relations. |
| **0:45 - 3:30** | **Live Role-Based Demo** | Deployed App (Vercel / Local) | Full live user flow across Student, Instructor, Content Manager, and Admin. |
| **3:30 - 4:45** | **Data Flow & REST Architecture** | `frontend/lib/api.ts` & `backend/src/api/enrollment` | Trace one end-to-end request (e.g. Enroll / Progress save) from client to Strapi and PostgreSQL. |
| **4:45 - 6:00** | **Backend Authorization (3 Layers)** | `permissions.ts` & `policies/*.ts` & `caller.ts` | Show why security is enforced on the server, not by hiding buttons in React. |
| **6:00 - 7:15** | **Dynamic Progress & Sequential Unlock** | `sequence.ts` & `course.ts (progress)` | Explain dynamic progress calculation and sequential lesson unlock line-by-line. |
| **7:15 - 8:15** | **Quiz Auto-Grading & Anti-Cheat** | `question.json`, `quiz-result.ts`, `grade.ts` | Explain server-side grading and why `correctIndex` is private in the schema. |
| **8:15 - 9:15** | **Admin Analytics & Media Persistence** | `stats.ts`, `image-picker.tsx`, `middlewares.ts` | Show platform metrics, role switching, cloud media uploads, and persistent volumes. |
| **9:15 - 10:00** | **Deployment & Production Setup** | Railway + Vercel Dashboards | Show PostgreSQL, Railway Volume mount, CORS headers, and live production logs. |

---

## 🎬 Minute-by-Minute Script & Talking Points

### 1. Introduction & Architecture (0:00 - 0:45)
* **Screen:** Open the live app home page (`/`) or `README.md`.
* **What to say (English):**
  > "Hello everyone! This is my submission for the CPS Academy Junior Software Engineer project round: a modern, secure, full-stack Learning Management System.  
  > The architecture is fully decoupled: **Next.js 16 App Router** with Tailwind CSS on the frontend, and **Strapi 5 Headless CMS with PostgreSQL** on the backend.  
  > The platform implements strict **Role-Based Access Control (RBAC)** across 4 distinct roles: Admin, Content Manager, Instructor, and Student. The frontend is strictly a presentation layer; every business rule, sequential unlock, and permission check is enforced directly on the backend."
* **What to say (বাংলায় চাইলে):**
  > "আসসালামু আলাইকুম। এটি CPS Academy-এর জুনিয়র সফটওয়্যার ইঞ্জিনিয়ার পদের জন্য আমার LMS প্রজেক্ট সাবমিশন। এটি Next.js 16 এবং Strapi 5 Headless CMS ও PostgreSQL দিয়ে তৈরি। এই প্রজেক্টের মূল ফোকাস হচ্ছে ৪টি রোলের (Admin, Content Manager, Instructor, Student) কঠোর সার্ভার-সাইড সিকিউরিটি এবং সিকোয়েনশিয়াল লার্নিং।"

---

### 2. Live Demo Across 4 Roles (0:45 - 3:30)

#### 🧑‍🎓 Step A: Student Flow (`student@demo.test`) — 60s
1. **Public Catalogue (`/courses`):** Show that visitors can view course titles, descriptions, and syllabus outlines, but cannot access full video lessons or quizzes.
2. **Registration / Login:** Show the clean form with live eye-toggle password visibility.
3. **Enrollment Action:** Click **`Enroll in this Course`**. Show the modern floating toast notification (`toast.success`) and automatic 3-second redirect to Lesson 1.
4. **Sequential Lesson Unlock:** Open a lesson. Show that Lesson 2 is accessible, but Lesson 3 is locked until Lesson 2 is completed.
5. **Instant In-Place Navigation:** Click **`Next Lesson`**. Show how the lesson updates instantly without any full-page spinner or video skeleton jumps.
6. **Quiz Assessment & Auto-Grading:** Take the MCQ quiz at the end of the course, submit answers, and show the instant scorecard (e.g. `4 / 5` - `80%`).
7. **Dashboard Progress:** Go to `/dashboard`. Show that the course card now displays `100% Done` with the Quiz Score badge.

#### 👨‍🏫 Step B: Instructor Flow (`instructor@demo.test`) — 40s
1. Open `/dashboard` and show **Managed Courses**.
2. Click **View Student Progress & Roster** (`/courses/:id/students`). Show the live class roster with every enrolled student's progress and quiz scores.
3. Open **Edit Course Builder** (`/courses/:id/edit`). Show the interactive Syllabus Builder: reordering lessons with up/down arrows, rich Markdown editor, and Quiz Builder.
4. Explain that instructors can only edit courses they own.

#### 📝 Step C: Content Manager Flow (`manager@demo.test`) — 35s
1. Switch to Content Manager account. Show that they have platform-wide access to create and edit any course.
2. Go to **Blog Management** (`/manage/blog`). Create a blog post.
3. Demonstrate the **Draft vs. Published** lifecycle: Save a post as `Draft`, open an incognito window to show it is hidden from students/public, then publish it and show it appearing instantly on `/blog`.

#### 👑 Step D: Admin Panel (`admin@demo.test`) — 30s
1. Open `/admin`.
2. Show the **Platform Metrics** tile dashboard: real-time counts of Accounts per role, Total Courses, Lessons, Enrollments, Quiz Attempts, and Blog Posts.
3. Go to **User Management** (`/admin/users`). Demonstrate promoting a user from `Student` to `Instructor` with live role assignment.

---

### 3. Data Flow & REST Architecture (3:30 - 4:45)
* **Code to show in IDE:**
  - `frontend/lib/api.ts`
  - `backend/src/api/enrollment/controllers/enrollment.ts`
* **What to say:**
  > "Let's trace how data moves from client to server.  
  > In `frontend/lib/api.ts`, we configure a centralized Axios instance. Every request automatically attaches the Bearer JWT token from localStorage. We implemented a single-flight Axios interceptor to catch 401 errors, call `/api/auth/refresh`, rotate the token, and seamlessly retry requests without interrupting the user.  
  > When a student enrolls, the frontend sends `POST /api/enrollments` with only `{ data: { course: documentId } }`.  
  > On the backend in `enrollment.ts`, we completely ignore any client-supplied user ID to prevent spoofing. We extract `caller(ctx).id` directly from `ctx.state.user`. Strapi's Document Service validates duplicate enrollments before committing to PostgreSQL."

---

### 4. Backend Authorization — 3-Layer Security (4:45 - 6:00)
* **Code to show in IDE:**
  - `backend/src/permissions.ts`
  - `backend/src/policies/is-course-owner.ts`
  - `backend/src/policies/owns-parent-course.ts`
  - `backend/src/utils/caller.ts`
* **What to say:**
  > "Our security is strictly enforced on the server across 3 distinct defensive layers:  
  > **Layer 1 (Bootstrap RBAC Matrix):** In `permissions.ts`, our automated bootstrap runs on server boot and synchronizes the 4-role permission matrix into Strapi's database. If a student attempts to `POST /api/courses` via Postman, Strapi immediately rejects it with a 403 Forbidden.  
  > **Layer 2 (Route Policies):** While RBAC allows Instructors to edit courses, it cannot verify ownership. We implemented route policies like `is-course-owner.ts` and `owns-parent-course.ts`. Every policy returns an explicit boolean so it never fails open.  
  > **Layer 3 (Controller Scoping):** In `caller.ts`, we apply `narrow()` query scoping. Students can only read their own progress and enrollments, while instructors only see rows for courses they own."

---

### 5. Dynamic Progress & Sequential Unlock (6:00 - 7:15)
* **Code to show in IDE:**
  - `backend/src/utils/sequence.ts`
  - `backend/src/api/course/controllers/course.ts` (the `progress` method)
  - `backend/src/api/lesson/controllers/lesson.ts`
* **What to say:**
  > "For Progress Tracking, we made two critical architectural decisions:  
  > 1. **Dynamic Progress Calculation:** Percentages are never stored as static columns in the database. If an instructor adds or removes a lesson tomorrow, static numbers become corrupted. Instead, `GET /api/courses/:id/progress` dynamically counts completed `LessonProgress` records against total course lessons in a single database query.  
  > 2. **Sequential Progression (`sequence.ts`):** When a student requests `GET /api/lessons/:id`, `unfinishedLessonBefore()` queries all earlier lessons where `order < currentLesson.order`. If any previous lesson lacks a progress record, the controller returns a 403 naming the exact unfinished lesson.  
  > 3. **Quiz Milestone Integration:** A course only reaches 100% completion when all lessons and the final quiz assessment are completed."

---

### 6. Quiz Auto-Grading & Anti-Cheat Security (7:15 - 8:15)
* **Code to show in IDE:**
  - `backend/src/components/quiz/question.json`
  - `backend/src/api/quiz-result/controllers/quiz-result.ts`
  - `backend/src/utils/grade.ts`
* **What to say:**
  > "Auto-grading happens entirely on the server to prevent cheating.  
  > In `question.json`, the `correctIndex` field is configured with `"private": true`. Strapi's output sanitizer strips private fields from all Content API responses. Therefore, when a student loads a quiz, inspecting the network tab in Chrome DevTools reveals only the question text and options — the correct answer is never leaked to the client.  
  > When the student submits their answers, `quiz-result.ts` loads the private questions from PostgreSQL, passes them to `grade.ts`, scores the submission, and persists the result."

---

### 7. Admin Analytics & Persistent Media Uploads (8:15 - 9:15)
* **Code to show in IDE:**
  - `backend/src/api/stats/controllers/stats.ts`
  - `backend/src/extensions/users-permissions/strapi-server.ts`
  - `frontend/components/image-picker.tsx`
  - `backend/config/middlewares.ts`
* **What to say:**
  > "For platform management:  
  > In `stats.ts`, the Admin overview executes parallel aggregation queries to report total users by role, active courses, lessons, and quiz submissions.  
  > In `strapi-server.ts`, we extended the built-in Users-Permissions plugin to automatically attach the `Student` role to new sign-ups.  
  > For media uploads, `image-picker.tsx` uploads directly to Strapi's `/api/upload` endpoint. In `middlewares.ts`, we configured Content Security Policy (`img-src`, `media-src`) and CORS headers so images render smoothly across Railway and Vercel. On Railway, we mounted a persistent volume at `/app/public/uploads` so uploaded course thumbnails and avatars persist indefinitely across deployments."

---

### 8. Deployment & Production Setup (9:15 - 10:00)
* **Screen:** Open Railway and Vercel browser tabs.
* **Code to show:** `backend/config/server.ts` & `backend/config/middlewares.ts`
* **What to say:**
  > "Finally, let's look at the production deployment:  
  > - **Backend:** Deployed on Railway connected to a managed PostgreSQL database. In `server.ts`, `url` and `proxy: true` handle SSL termination. The persistent volume stores uploaded media.  
  > - **Frontend:** Deployed on Vercel with `NEXT_PUBLIC_STRAPI_URL` pointing to the live Railway backend.  
  > Both services are live, healthy, and communicating over secure HTTPS. Thank you for your time and for reviewing my project!"

---

## 🎯 Quick Code Navigation Map (File Paths in Repo)

| Topic | File Path |
| :--- | :--- |
| **REST Client & Interceptors** | [`frontend/lib/api.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/frontend/lib/api.ts) |
| **RBAC Matrix Bootstrap** | [`backend/src/permissions.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/permissions.ts) |
| **Course Ownership Policy** | [`backend/src/policies/is-course-owner.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/policies/is-course-owner.ts) |
| **Parent Course Policy** | [`backend/src/policies/owns-parent-course.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/policies/owns-parent-course.ts) |
| **Caller Scoping Utility** | [`backend/src/utils/caller.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/utils/caller.ts) |
| **Sequential Lesson Enforcer** | [`backend/src/utils/sequence.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/utils/sequence.ts) |
| **Dynamic Progress Controller** | [`backend/src/api/course/controllers/course.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/course/controllers/course.ts) |
| **Lesson Unlock Controller** | [`backend/src/api/lesson/controllers/lesson.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/lesson/controllers/lesson.ts) |
| **Private Question Schema** | [`backend/src/components/quiz/question.json`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/components/quiz/question.json) |
| **Server-side Quiz Grader** | [`backend/src/utils/grade.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/utils/grade.ts) |
| **Admin Stats Controller** | [`backend/src/api/stats/controllers/stats.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/api/stats/controllers/stats.ts) |
| **Custom Auth Registration** | [`backend/src/extensions/users-permissions/strapi-server.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/src/extensions/users-permissions/strapi-server.ts) |
| **Cloud Image Upload Component** | [`frontend/components/image-picker.tsx`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/frontend/components/image-picker.tsx) |
| **CORS & CSP Configuration** | [`backend/config/middlewares.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/config/middlewares.ts) |
| **Server Proxy Settings** | [`backend/config/server.ts`](file:///c:/Users/USAMA/Desktop/cps%20academy/lms%20project/backend/config/server.ts) |
