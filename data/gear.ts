export interface GearGroup {
  label: string;
  items: Array<{ name: string; note?: string }>;
}

export const GEAR_GROUPS: GearGroup[] = [
  {
    label: 'Computers',
    items: [
      { name: 'MacBook Air M1' },
      { name: 'Windows 11 laptop' },
      { name: 'Portable monitor' },
    ],
  },
  { label: 'Mobile', items: [{ name: 'iPhone 15 Pro Max' }] },
  {
    label: 'Development',
    items: ['VS Code', 'GitHub', 'Docker', 'Supabase', 'n8n', 'Claude', 'OpenAI'].map((name) => ({ name })),
  },
  {
    label: 'Design',
    items: [{ name: 'Figma' }, { name: 'Canva' }],
  },
];
