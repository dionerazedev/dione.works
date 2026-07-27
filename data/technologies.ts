export interface TechnologyData { name: string; category: string; logo?: string; }
export interface TechnologyGroup { label: string; description: string; tools: TechnologyData[]; }

export const TECHNOLOGY_GROUPS: TechnologyGroup[] = [
  { label: 'Frontend', description: 'Responsive web and mobile product interfaces.', tools: [
    { name: 'JavaScript', category: 'Language' }, { name: 'TypeScript', category: 'Language' }, { name: 'React', category: 'Interface' }, { name: 'Next.js', category: 'Framework' }, { name: 'React Native', category: 'Mobile' }, { name: 'Expo', category: 'Mobile' }, { name: 'Tailwind CSS', category: 'Styling' }, { name: 'Vite', category: 'Build tool' },
  ] },
  { label: 'Backend', description: 'Application services, access, and connected APIs.', tools: [
    { name: 'Node.js', category: 'Runtime' }, { name: 'Python', category: 'Language' }, { name: 'Java', category: 'Language' }, { name: 'PHP', category: 'Language' }, { name: 'Express.js', category: 'Framework' }, { name: 'NestJS', category: 'Framework' }, { name: 'Laravel', category: 'Framework' }, { name: 'PostgreSQL', category: 'Database' }, { name: 'MySQL', category: 'Database' }, { name: 'MongoDB', category: 'Database' }, { name: 'DynamoDB', category: 'Database' }, { name: 'OAuth', category: 'Auth' }, { name: 'JWT', category: 'Auth' }, { name: 'LDAP', category: 'Auth' }, { name: 'REST', category: 'API' }, { name: 'Supabase', category: 'Backend' }, { name: 'Webhooks', category: 'Events' },
  ] },
  { label: 'Automation', description: 'Workflow orchestration and operational handoffs.', tools: [
    { name: 'n8n', category: 'Automation' }, { name: 'Make.com', category: 'Automation' }, { name: 'Zapier', category: 'Automation' },
  ] },
  { label: 'AI', description: 'Model-assisted product and workflow integrations.', tools: [
    { name: 'Claude', category: 'Model' }, { name: 'OpenAI', category: 'Model' }, { name: 'Gemini', category: 'Model' },
  ] },
  { label: 'Infrastructure', description: 'Source control, containers, and deployment.', tools: [
    { name: 'Docker', category: 'Containers' }, { name: 'Vercel', category: 'Deployment' },
  ] },
  { label: 'Developer tools', description: 'Daily collaboration, planning, and development workspace tools.', tools: [
    { name: 'Git', category: 'Versioning' }, { name: 'GitHub', category: 'Versioning' }, { name: 'GitLab', category: 'Versioning' }, { name: 'Bitbucket', category: 'Versioning' }, { name: 'VS Code', category: 'Editor' }, { name: 'Slack', category: 'Communication' }, { name: 'Discord', category: 'Communication' }, { name: 'Teams', category: 'Communication' }, { name: 'JIRA', category: 'Planning' }, { name: 'Trello', category: 'Planning' }, { name: 'ClickUp', category: 'Planning' },
  ] },
];

export interface CredentialData { title: string; issuer: string; achieved?: string; image: string; alt: string; width: number; height: number; }
export const CREDENTIALS: CredentialData[] = [
  { title: 'Microsoft Office Specialist: Excel Associate (Microsoft 365 Apps)', issuer: 'Microsoft', achieved: 'September 23, 2025', image: '/images/credentials/microsoft-office-specialist-certificate.webp', alt: 'Microsoft Office Specialist Excel Associate certificate awarded to Dione Raze Oro', width: 798, height: 618 },
  { title: 'Data Analytics Professional Certificate', issuer: 'Google', achieved: 'August 24, 2025', image: '/images/credentials/google-data-analytics-certificate.webp', alt: 'Google Data Analytics Professional Certificate awarded to Dione Raze Oro', width: 1057, height: 825 },
];
