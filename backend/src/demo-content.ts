// The content a fresh database gets seeded with. Kept apart from the code that writes it so the
// loop in seed-content.ts stays short enough to read, and so changing a lesson body does not mean
// touching anything that talks to the database.
//
// Courses are attached to an owner by email rather than by id, because ids differ between the
// local sqlite file and the deployed Postgres.

import { webDevCourse } from './web-dev-course';

type Question = { text: string; options: string[]; correctIndex: number };

type Lesson = { title: string; order: number; content: string; videoUrl?: string };

export type DemoCourse = {
  title: string;
  description: string;
  ownerEmail: string;
  lessons: Lesson[];
  quiz?: { title: string; questions: Question[] };
};

export const demoCourses: DemoCourse[] = [
  webDevCourse,
  {
    title: 'SQL Foundations',
    description: 'Reading and writing queries against a relational database, starting from nothing.',
    ownerEmail: 'instructor@demo.test',
    lessons: [
      {
        title: 'What a relational database is',
        order: 1,
        videoUrl: 'https://www.youtube.com/watch?v=h0nxCDiD-zg',
        content: [
          'A relational database stores data in tables. A table has columns with types and rows of',
          'values, and one column is usually the primary key that identifies a row.',
          '',
          'The word relational is about the links between tables, not about the rows being related to',
          'each other. A row in `enrollments` points at a row in `students` and a row in `courses`,',
          'and that pointer is a foreign key.',
        ].join('\n'),
      },
      {
        title: 'SELECT and WHERE',
        order: 2,
        content: [
          'A query names the columns it wants and the table they come from:',
          '',
          '```sql',
          'select title, created_at from courses where owner_id = 3;',
          '```',
          '',
          'The `where` clause runs per row and keeps the ones it is true for. Two things surprise',
          'people early: comparing anything to `null` gives `null` rather than false, so use',
          '`is null`; and string comparison is case sensitive in Postgres.',
        ].join('\n'),
      },
      {
        title: 'Joining two tables',
        order: 3,
        content: [
          'A join matches rows from two tables on a condition, usually a foreign key:',
          '',
          '```sql',
          'select c.title, u.username',
          'from enrollments e',
          'join courses c on c.id = e.course_id',
          'join users u on u.id = e.student_id;',
          '```',
          '',
          'An inner join drops rows with no match on either side. A left join keeps every row from',
          'the left table and fills the right side with nulls, which is what you want when counting',
          'courses that have no enrollments yet.',
        ].join('\n'),
      },
      {
        title: 'GROUP BY and aggregates',
        order: 4,
        content: [
          '`count`, `sum`, `avg`, `min` and `max` collapse many rows into one. `group by` says which',
          'rows get collapsed together.',
          '',
          '```sql',
          'select course_id, count(*) as students',
          'from enrollments',
          'group by course_id;',
          '```',
          '',
          'Every column in the select list has to be either grouped or aggregated. `having` filters',
          'the groups after aggregation; `where` filters the rows before it.',
        ].join('\n'),
      },
      {
        title: 'Indexes, and when they help',
        order: 5,
        content: [
          'An index is a second structure the database keeps so it can find rows without reading the',
          'whole table. It costs disk and it makes writes slightly slower, so it is not free.',
          '',
          'An index helps a lookup on the column it covers, and the leading column of a multi column',
          'index can be used on its own. It does not help if the query wraps the column in a function,',
          'unless the index was built on that expression.',
        ].join('\n'),
      },
    ],
    quiz: {
      title: 'SQL Foundations check',
      questions: [
        {
          text: 'Which clause filters rows before they are grouped?',
          options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
          correctIndex: 1,
        },
        {
          text: 'What does an inner join do with a row that has no match on the other side?',
          options: [
            'Keeps it and fills the other side with nulls',
            'Drops it from the result',
            'Raises an error',
            'Keeps it and repeats the last matched row',
          ],
          correctIndex: 1,
        },
        {
          text: 'How do you test a column for a missing value?',
          options: ['column = null', 'column == null', 'column is null', 'column != null'],
          correctIndex: 2,
        },
        {
          text: 'Which of these is the real cost of adding an index?',
          options: [
            'Reads get slower',
            'Writes get slower and it takes disk space',
            'The table can no longer be altered',
            'Joins stop using the primary key',
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: 'Postgres in Production',
    description: 'The handful of things that decide whether a Postgres instance survives real traffic.',
    ownerEmail: 'instructor@demo.test',
    lessons: [
      {
        title: 'Connections and pooling',
        order: 1,
        videoUrl: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
        content: [
          'Postgres runs a separate process per connection, so connections are expensive and',
          '`max_connections` is a real ceiling rather than advice.',
          '',
          'An application should hold a small pool and reuse it. A serverless deployment cannot, which',
          'is why it needs a pooler such as pgbouncer sitting in front.',
        ].join('\n'),
      },
      {
        title: 'Reading an EXPLAIN plan',
        order: 2,
        content: [
          '`explain analyze` runs the query and reports what actually happened, node by node, from the',
          'inside out.',
          '',
          'The number worth reading first is not the cost, it is the gap between `rows=` estimated and',
          '`rows=` actual. A planner that thinks a step returns 5 rows when it returns 50000 will pick',
          'a nested loop and the query will be slow for a reason no index can fix.',
        ].join('\n'),
      },
      {
        title: 'Vacuum and bloat',
        order: 3,
        content: [
          'An update in Postgres writes a new row version and leaves the old one behind. Vacuum is what',
          'reclaims the space once no transaction can still see the old version.',
          '',
          'Autovacuum handles this on its own until a long running transaction holds the horizon open.',
          'That is the usual story behind a table that keeps growing while its row count does not.',
        ].join('\n'),
      },
      {
        title: 'Backups you have actually restored',
        order: 4,
        content: [
          'A backup nobody has restored is a guess. Restore it into a scratch database on a schedule',
          'and check a row count you know the answer to.',
          '',
          '`pg_dump` gives a logical dump that is portable between versions. Physical backups with WAL',
          'archiving give point in time recovery, and they are tied to the major version.',
        ].join('\n'),
      },
    ],
    quiz: {
      title: 'Postgres in Production check',
      questions: [
        {
          text: 'Why does a serverless application usually need pgbouncer?',
          options: [
            'It encrypts the connection',
            'Each invocation would otherwise open its own connection',
            'It caches query results',
            'Postgres cannot accept TLS directly',
          ],
          correctIndex: 1,
        },
        {
          text: 'In an EXPLAIN ANALYZE plan, what is worth reading first?',
          options: [
            'The total cost number',
            'The gap between estimated and actual rows',
            'The width of each column',
            'The planning time',
          ],
          correctIndex: 1,
        },
        {
          text: 'A table keeps growing on disk while its row count stays flat. Most likely cause?',
          options: [
            'Missing index',
            'Dead row versions that vacuum cannot reclaim yet',
            'Too many connections',
            'The primary key ran out of values',
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    title: 'Designing a Schema',
    description: 'Turning a set of things a product needs to do into tables and foreign keys.',
    ownerEmail: 'manager@demo.test',
    lessons: [
      {
        title: 'Start from the queries',
        order: 1,
        content: [
          'Write down the questions the application will ask before drawing any tables. "Which lessons',
          'has this student finished in this course" is a query, and it decides whether completion is a',
          'row, a column or a counter.',
          '',
          'A schema designed from the nouns alone tends to be right in the abstract and awkward for',
          'every screen that has to be built on it.',
        ].join('\n'),
      },
      {
        title: 'One to many, and where the foreign key goes',
        order: 2,
        content: [
          'A course has many lessons and a lesson belongs to one course. The foreign key lives on the',
          'many side, so `lessons.course_id`, never a list of lesson ids on the course.',
          '',
          'Getting this backwards is the most common early mistake, and the symptom is a column that',
          'has to hold more than one value.',
        ].join('\n'),
      },
      {
        title: 'Many to many and the join table',
        order: 3,
        content: [
          'A student enrolls in many courses and a course has many students, so neither side can hold',
          'the key. A third table does: `enrollments(student_id, course_id)`.',
          '',
          'That table is usually worth naming properly, because it nearly always grows fields of its',
          'own. An enrollment has a date, and later a status.',
        ].join('\n'),
      },
      {
        title: 'When to denormalise',
        order: 4,
        content: [
          'Storing a value you could have derived is a cache, and a cache can go stale. Progress',
          'percentage is the example in this project: it is counted from completion rows on every',
          'request rather than stored, so it cannot disagree with them.',
          '',
          'Denormalise when the count has become genuinely too slow, and then own the job of keeping it',
          'correct. Not before.',
        ].join('\n'),
      },
    ],
  },
];

export const demoPosts = [
  {
    title: 'Why this course list starts with SQL and not an ORM',
    publishState: 'published' as const,
    body: [
      'An ORM is a good tool and a bad first teacher. It answers the question "how do I get this row',
      'in my language" before the student has asked "what is this row and what did the database have',
      'to do to find it".',
      '',
      'The cost shows up later and it always shows up the same way: a page that runs one query per row',
      'in a list, and nobody can see it because none of the queries were written down anywhere.',
      '',
      'So the first course here is plain SQL. Once a join and an index make sense, an ORM becomes what',
      'it should be, which is a convenience over something you can already read.',
    ].join('\n'),
  },
  {
    title: 'Reading an EXPLAIN plan without guessing',
    publishState: 'published' as const,
    body: [
      'Most people meet `explain` while a query is already slow, read the cost number, and conclude',
      'nothing. The cost is in arbitrary units and comparing it across two different queries means',
      'very little.',
      '',
      'Read the row estimates instead. Every node reports what the planner expected and, under',
      '`explain analyze`, what it got. Find the deepest node where those two disagree badly and you',
      'have found why the plan is wrong, because every choice above it was made on that number.',
      '',
      'The fix is often not an index. It is a statistics target, a rewritten predicate the planner can',
      'actually estimate, or accepting that the query wants a different shape.',
    ].join('\n'),
  },
  {
    title: 'Course roadmap for next term',
    publishState: 'draft' as const,
    body: [
      'Still being decided, so this one stays a draft until the schedule is fixed.',
      '',
      'Likely additions: a short course on transactions and isolation levels, and something on',
      'migrations that covers how to add a column to a large table without locking it.',
    ].join('\n'),
  },
];

// Partial progress on purpose. A demo where every course reads 0 or 100 percent does not show that
// the percentage is counted per student, and quizAnswers here are deliberately not all correct.
export const demoEnrollments = [
  {
    studentEmail: 'student@demo.test',
    courseTitle: 'SQL Foundations',
    lessonsDone: 2,
    quizAnswers: [1, 1, 2, 0],
  },
  {
    studentEmail: 'student@demo.test',
    courseTitle: 'Postgres in Production',
    lessonsDone: 4,
  },
  {
    studentEmail: 'student2@demo.test',
    courseTitle: 'SQL Foundations',
    lessonsDone: 4,
    quizAnswers: [1, 1, 2, 1],
  },
];
