export type ServiceIconName = 'code' | 'workflow' | 'api';

export interface ServiceData {
  id: string;
  title: string;
  description: string;
  problem: string;
  deliverables: string[];
  icon: ServiceIconName;
}

export const SERVICES: ServiceData[] = [
  {
    id: 'full-stack-development',
    title: 'Full-Stack Product Development',
    description:
      'Web applications and responsive product interfaces built around clear user flows, secure data, and maintainable code.',
    problem:
      'For product ideas that need to move from scattered requirements or manual processes into a usable digital system.',
    deliverables: [
      'React and Next.js applications',
      'Business websites and product interfaces',
      'Dashboards and internal tools',
      'Authentication and user accounts',
      'Supabase and PostgreSQL data layers',
      'Responsive desktop and mobile UX',
    ],
    icon: 'code',
  },
  {
    id: 'ai-automation',
    title: 'AI Automation Systems',
    description:
      'Workflow systems that classify requests, move data, generate review-ready outputs, and route exceptions to the right person.',
    problem:
      'For repetitive operational work spread across inboxes, spreadsheets, CRMs, messaging tools, and manual handoffs.',
    deliverables: [
      'n8n, Make, and Zapier workflows',
      'AI agents and customer chat workflows',
      'CRM, intake, and lead-management systems',
      'AI model and tool orchestration',
      'Validation, retries, and escalation paths',
      'Logs and operational handoff notes',
    ],
    icon: 'workflow',
  },
  {
    id: 'api-integrations',
    title: 'API Integrations & Product Infrastructure',
    description:
      'Reliable connections between products, third-party services, databases, webhooks, and internal workflows.',
    problem:
      'For teams whose important information is trapped in disconnected tools or duplicated through manual entry.',
    deliverables: [
      'REST API and webhook integrations',
      'Data mapping and transformation',
      'Database and service connections',
      'Error-aware integration flows',
    ],
    icon: 'api',
  },
];
