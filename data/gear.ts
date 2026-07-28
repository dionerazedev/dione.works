export interface GearGroup {
  label: string;
  items: GearItem[];
}

export interface GearItem {
  name: string;
  note?: string;
  image: {
    src: string;
    treatment: 'product' | 'photo' | 'logo';
  };
}

export const GEAR_GROUPS: GearGroup[] = [
  {
    label: 'Computers',
    items: [
      {
        name: 'MacBook Air M1',
        note: 'Primary build and development machine.',
        image: { src: '/images/gear/macbook-air-m1.jpg', treatment: 'product' },
      },
    ],
  },
  {
    label: 'Mobile',
    items: [
      {
        name: 'iPhone 15 Pro Max',
        note: 'Mobile testing, photos, and short-form capture.',
        image: { src: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-15-pro-max.png', treatment: 'product' },
      },
    ],
  },
  {
    label: 'Development',
    items: [
      { name: 'VS Code', note: 'Daily editor for React, TypeScript, and automation work.', image: { src: '/images/gear/vscode.svg', treatment: 'logo' } },
      { name: 'GitHub', note: 'Source control, issue tracking, and project handoff.', image: { src: '/images/tech/github.svg', treatment: 'logo' } },
      { name: 'Docker', note: 'Local services and repeatable development environments.', image: { src: '/images/gear/docker.svg', treatment: 'logo' } },
      { name: 'Supabase', note: 'Auth, Postgres, storage, and realtime prototypes.', image: { src: '/images/tech/supabase.svg', treatment: 'logo' } },
      { name: 'n8n', note: 'Workflow automation and integration experiments.', image: { src: '/images/tech/n8n.svg', treatment: 'logo' } },
      { name: 'Claude', note: 'Research, code review, and implementation support.', image: { src: '/images/tech/claude.svg', treatment: 'logo' } },
      { name: 'OpenAI', note: 'AI features, assistants, and product prototyping.', image: { src: '/images/gear/openai.svg', treatment: 'logo' } },
    ],
  },
  {
    label: 'Design',
    items: [
      { name: 'Figma', note: 'Interface planning, wireframes, and handoff notes.', image: { src: '/images/gear/figma.svg', treatment: 'logo' } },
      { name: 'Canva', note: 'Lightweight presentation and social graphics.', image: { src: '/images/gear/canva.svg', treatment: 'logo' } },
    ],
  },
];
