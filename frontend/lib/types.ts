// Shapes the Strapi API actually returns.
// Strapi 5 gives every row both an id and a documentId — documentId is the one that goes in URLs.


export type RoleName = 'Admin' | 'Content Manager' | 'Instructor' | 'Student';

export type Role = {
  id:   number;
  name: RoleName;
  type: string;
};

export type User = {
  id:          number;
  documentId?: string;
  username:    string;
  email:       string;
  role?:       Role;
  createdAt?:  string;
  updatedAt?:  string;
};


export type Course = {
  id:             number;
  documentId:     string;
  title:          string;
  description?:   string | null;
  coverImageUrl?: string | null;
  owner?:         User | null;
  // plain username returned by the server — the owner relation is stripped below Admin level
  instructor?:    string | null;
  // syllabus-only: each lesson here has title + order, no body (body is fetched per-lesson)
  lessons?:       Lesson[];
  quiz?:          Quiz | null;
  // computed server-side — avoids exposing the owner relation to lower roles
  owned?:         boolean;
  createdAt?:     string;
  updatedAt?:     string;
};


export type Lesson = {
  id:         number;
  documentId: string;
  title:      string;
  content?:   string | null;
  videoUrl?:  string | null;
  order:      number;
  course?:    Course | null;
};


// correctIndex is marked private in Strapi so it never appears on a public read.
// It is included here for the write side (quiz builder), where the author needs to set it.
export type Question = {
  id:            number;
  text:          string;
  options:       string[];
  correctIndex?: number;
};

export type Quiz = {
  id:         number;
  documentId: string;
  title:      string;
  questions?: Question[];
  course?:    Course | null;
};

// returned by GET /api/quizzes/:id/answers — the only route that carries correctIndex
export type QuizKey = {
  title:     string;
  questions: { text: string; options: string[]; correctIndex: number }[];
};


export type Enrollment = {
  id:         number;
  documentId: string;
  createdAt:  string;
  student?:   User | null;
  course?:    Course | null;
};

export type LessonProgress = {
  id:         number;
  documentId: string;
  createdAt:  string;
  lesson?:    Lesson | null;
};

export type QuizResult = {
  id:         number;
  documentId: string;
  createdAt:  string;
  score:      number;
  total:      number;
  answers?:   number[];
  quiz?:      Quiz | null;
};

export type BlogPost = {
  id:             number;
  documentId:     string;
  title:          string;
  body:           string;
  coverImageUrl?: string | null;
  topic?:         string | null;
  publishState:   'draft' | 'published';
  createdAt:      string;
  author?:        User | null;
};


export type CourseProgress = {
  totalLessons: number;
  students: {
    id:               number;
    studentId:        number;
    username:         string;
    completedLessons: number;
    percentComplete:  number;
    quizScore:        number | null;
    quizTotal:        number | null;
  }[];
};

export type Stats = {
  users:        { role: string; count: number }[];
  courses:      number;
  lessons:      number;
  enrollments:  number;
  quizAttempts: number;
  blogPosts:    { published: number; drafts: number };
};


// Strapi list response wrapper
export type Collection<T> = { data: T[]; meta: { pagination: { total: number } } };

// Strapi single-item response wrapper
export type Single<T> = { data: T };
