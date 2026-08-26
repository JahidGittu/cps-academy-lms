# LMS

A learning management system with four roles: Admin, Content Manager, Instructor and Student.
Built as the project submission for CPS Academy.

Next.js frontend, Strapi backend, deployed separately. One repository, two deploy targets.

```
frontend/   Next.js 16, rendering only
backend/    Strapi 5, owns the data and every rule about it
```

Every rule about who may read or change what lives in the backend. The frontend has no API
routes of its own, it calls Strapi directly and renders the answer.

## Live

- Frontend: not deployed yet
- API: not deployed yet

## Demo accounts

Created on boot from `SEED_PASSWORD`, all with the same password. A role cannot be chosen at
signup, so these are the way in as anything other than a Student.

| Username     | Role            |
| ------------ | --------------- |
| `admin`      | Admin           |
| `manager`    | Content Manager |
| `instructor` | Instructor      |
| `student`    | Student         |
| `student2`   | Student         |

## Running it locally

Node 20 or newer. Two terminals, backend first.

```bash
cd backend
cp .env.example .env
npm install
npm run develop
```

The first boot creates the four roles, applies the permission matrix, creates the demo accounts
and seeds three courses with lessons, quizzes, enrollments and a few blog posts. It skips anything
already there, so a database in use is left alone.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The site is on http://localhost:3000 and the API on http://localhost:1337. The Strapi admin panel
at http://localhost:1337/admin is not part of the submission, but it is there if you want to look
at the data. It asks you to create its own account on first visit, which is separate from the demo
accounts above.

## What is built

Auth

- Register and sign in against Strapi's users-permissions plugin
- Access token plus refresh token, with the access token rotated on a 401 rather than signing the
  visitor out
- Routes protected by role, and by the server as well as the screen

Courses

- Course list, course detail with the syllabus, enroll and unenroll
- Create, edit and delete a course, restricted to the account that owns it
- Lessons managed from the course edit screen, ordered, with delete
- Sequential viewing: a lesson opens only when the one before it is marked done

Differentiators

- Progress tracking. A student sees a percentage per course on their dashboard; whoever runs the
  course sees the same figures for the whole class on the roster page.
- Quizzes with auto grading. Multiple choice, marked on the server, with the answer key never sent
  to the account taking it.
- Admin panel. Platform counts and the user list, on a page only an Admin can reach.
- Blog with draft and published states. Drafts are readable only by the roles that manage the blog;
  everyone else, signed in or not, gets a 404.

## Roles

`backend/src/permissions.ts` holds the matrix and applies it on every boot, because roles and
permissions are database rows and do not travel with the code. Holding a box in that matrix means
a role may call an endpoint at all. Narrowing a call to the caller's own rows is the controllers'
and policies' job:

- `is-course-owner` guards course update and delete
- `owns-parent-course` guards lesson and quiz writes, checking every course involved, so a lesson
  cannot be moved into a syllabus the caller does not own
- Content Manager and Admin bypass ownership, because running the library is their job

## Decisions worth knowing about

**No role selection at signup.** Anyone who registers is a Student. A form that lets a visitor pick
Admin is not a permission system, and the spec's matrix only means anything if the role is assigned
rather than claimed.

**Data fetching from the browser.** The token is a bearer token in `localStorage`, so the requests
that carry it are made from the client. Rendering pages on a Next server would mean either putting
the token in a cookie the Strapi plugin does not issue, or proxying every call.

**No `app/api/` routes.** There is one API and it is Strapi. A Next route handler in front of it
would be a second place for rules to live and a second place for them to disagree.

**Percentages are counted per request, not stored.** A stored percentage drifts the moment a lesson
is added or deleted. `GET /courses/:id/progress` counts lessons against completion rows, and both
the student's dashboard and the instructor's roster read that one route.

**The answer key has a route of its own.** `correctIndex` is `private` in the quiz schema, which
strips it from every read for every role, the author included. A quiz save replaces the whole
question list, so the builder would write an empty key over the real one. `GET /quizzes/:id/answers`
hands the key back behind the same ownership policy as the writes.

## Tests

There is no test suite. What there is instead: `npx tsc --noEmit` in `backend/` and `npm run build`
in `frontend/` both pass, and every route in the matrix was checked by hand against each role.
