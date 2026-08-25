# LMS

A learning management system with four roles: Admin, Content Manager, Instructor and Student.
Built as a project submission for CPS Academy.

Next.js frontend, Strapi backend, deployed separately. One repository, two deploy targets.

```
frontend/   Next.js 16, rendering only
backend/    Strapi 5, owns the data and every rule about it
```

Every rule about who may read or change what lives in the backend. The frontend has no API
routes of its own, it calls Strapi directly and renders the answer.

Setup instructions, the feature list, and the reasoning behind the data model and the
permission design go here once the project runs end to end.
