export type MediaAsset = {
  id: string | number;
  name: string;
  url: string;
  category: 'course' | 'blog' | 'general';
  tag?: string;
  size?: string;
  width?: number;
  height?: number;
  isCustom?: boolean;
};

export const PRESETS: MediaAsset[] = [
  {
    id: 'course-nextjs',
    name: 'Full-Stack React & Next.js',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'Frontend',
  },
  {
    id: 'course-db',
    name: 'PostgreSQL & Database Design',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'Database',
  },
  {
    id: 'course-security',
    name: 'OAuth2, JWT & API Security',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'Security',
  },
  {
    id: 'course-cloud',
    name: 'Kubernetes & Cloud Automation',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'DevOps',
  },
  {
    id: 'course-docker',
    name: 'Docker & Containerization',
    url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&auto=format&fit=crop&q=80',
    category: 'course',
    tag: 'DevOps',
  },
  {
    id: 'blog-devops',
    name: 'Zero-Downtime Deployment',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Tutorial',
  },
  {
    id: 'blog-frontend',
    name: 'Modern UI Design Systems',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Frontend',
  },
  {
    id: 'blog-db',
    name: 'SQL Query Optimization',
    url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Database',
  },
  {
    id: 'blog-security',
    name: 'Zero Trust API Architecture',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    category: 'blog',
    tag: 'Security',
  },
];
