export type SectionId =
  | 'home'
  | 'about'
  | 'featured-work'
  | 'automation-work'
  | 'experience'
  | 'tech-stack'
  | 'services'
  | 'certifications'
  | 'outside-ide'
  | 'github'
  | 'contact';

export interface NavigationItem {
  label: string;
  id: SectionId;
  href: `#${SectionId}`;
  ariaLabel: string;
}

export const SECTION_NAVIGATION: readonly NavigationItem[] = [
  { label: 'About', id: 'about', href: '#about', ariaLabel: 'Go to about Dione' },
  { label: 'Projects', id: 'featured-work', href: '#featured-work', ariaLabel: 'Go to selected projects' },
  { label: 'Stack', id: 'tech-stack', href: '#tech-stack', ariaLabel: 'Go to technology stack' },
  { label: 'Experience', id: 'experience', href: '#experience', ariaLabel: 'Go to experience' },
  { label: 'Capabilities', id: 'services', href: '#services', ariaLabel: 'Go to capabilities' },
  { label: 'Outside', id: 'outside-ide', href: '#outside-ide', ariaLabel: 'Go to Outside the IDE' },
  { label: 'Contact', id: 'contact', href: '#contact', ariaLabel: 'Go to contact options' },
];

export const PRIMARY_NAVIGATION = SECTION_NAVIGATION;

export const PROFILE_LINKS = {
  calendly: 'https://calendly.com/dioneoro11/30min',
  email: 'mailto:dioneraze.dev@gmail.com',
  emailAddress: 'dioneraze.dev@gmail.com',
  resume: 'https://drive.google.com/file/d/1OzBZ4OUX5Bfb3l9-RjwBRFLapBG6dC-q/view?usp=sharing',
  github: 'https://github.com/dionerazedev',
  linkedin: 'https://www.linkedin.com/in/dione-raze-oro-b274a8243/',
} as const;

export const SECONDARY_SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/dnrze_/' },
  { label: 'Facebook', href: 'https://www.facebook.com/raze.dodot/' },
  { label: 'OnlineJobs', href: 'https://www.onlinejobs.ph/jobseekers/info/2465090' },
  { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~019d50a01f575c8779' },
] as const;

export const scrollToSection = (id: SectionId, updateHistory = true): boolean => {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  if (updateHistory) window.history.replaceState(null, '', `/#${id}`);
  window.dispatchEvent(new CustomEvent<SectionId>('portfolio:section-change', { detail: id }));
  return true;
};
