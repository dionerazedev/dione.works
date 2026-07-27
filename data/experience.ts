export interface ExperienceEntry {
  role: string;
  engagement: string;
  source?: string;
  period: string;
  summary: string[];
  technologies: string[];
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: 'Full-Stack Developer',
    engagement: 'Independent Contractor',
    period: 'October 2025 — Present',
    summary: [
      'I build and maintain full-stack web and mobile applications, including SaaS products, dashboards, internal tools, travel platforms, and AI-powered business systems.',
      'My work covers frontend development, backend APIs, authentication, database design, integrations, testing, deployment, and ongoing improvements using React, Next.js, TypeScript, React Native, Expo, Supabase, and PostgreSQL.',
    ],
    technologies: ['FULL-STACK DEVELOPMENT', 'WEB & MOBILE', 'AI INTEGRATION'],
  },
];
