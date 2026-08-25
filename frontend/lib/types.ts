// Shapes the API actually returns, written out here so a page does not have to guess. Strapi 5
// gives every row both an id and a documentId; documentId is the one that goes in a URL.

export type RoleName = 'Admin' | 'Content Manager' | 'Instructor' | 'Student';

export type User = {
  id: number;
  username: string;
  email: string;
  role?: { id: number; name: RoleName; type: string };
};

export type Course = {
  id: number;
  documentId: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  owner?: User | null;
  // A course read only carries the syllabus, so these lessons have a title and an order and no
  // body. The body comes from GET /api/lessons/:id, which is where the enrollment check lives.
  lessons?: Lesson[];
  quiz?: Quiz | null;
  // Answered by the server, because the owner relation it would otherwise be compared against is
  // stripped from the response for every role below Admin.
  owned?: boolean;
};

export type Lesson = {
  id: number;
  documentId: string;
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  order: number;
  course?: Course | null;
};

// correctIndex is private in the Strapi schema, so it never comes back on a read. It is here for
// the write side, where a quiz is authored.
export type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex?: number;
};

export type Quiz = {
  id: number;
  documentId: string;
  title: string;
  questions?: Question[];
  course?: Course | null;
};

export type Enrollment = {
  id: number;
  documentId: string;
  createdAt: string;
  student?: User | null;
  course?: Course | null;
};

export type LessonProgress = {
  id: number;
  documentId: string;
  createdAt: string;
  lesson?: Lesson | null;
};

export type QuizResult = {
  id: number;
  documentId: string;
  createdAt: string;
  score: number;
  total: number;
  answers?: number[];
  quiz?: Quiz | null;
};

export type BlogPost = {
  id: number;
  documentId: string;
  title: string;
  body: string;
  coverImageUrl?: string | null;
  publishState: 'draft' | 'published';
  createdAt: string;
  author?: User | null;
};

// GET /api/courses/:id/progress. A student gets a roster of one, themselves.
export type StudentProgress = {
  id: number;
  username: string | null;
  completedLessons: number;
  percentComplete: number;
  quizScore: number | null;
  quizTotal: number | null;
};

export type CourseProgress = {
  totalLessons: number;
  students: StudentProgress[];
};

// GET /api/stats, Admin only.
export type Stats = {
  users: { role: string; count: number }[];
  courses: number;
  lessons: number;
  enrollments: number;
  quizAttempts: number;
  blogPosts: { published: number; drafts: number };
};

export type Collection<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

export type Single<T> = { data: T };
