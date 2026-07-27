export type ProjectStatus =
  | 'Live Product'
  | 'Client Project'
  | 'Personal Project'
  | 'Technical Prototype'
  | 'Concept Project';

export type AutomationPlatform = 'n8n' | 'Make' | 'Zapier';

export type ProjectImageKind = 'desktop' | 'mobile' | 'workflow' | 'poster' | 'detail';

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
  kind?: ProjectImageKind;
  href?: string;
}

export interface ProjectCaseStudySection {
  label: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  tag: string;
  label?: string;
  category?: string;
  type?: string;
  status: ProjectStatus;
  deploymentStatus: string;
  role?: string;
  timeline?: string;
  liveUrl?: string;
  sourceUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  demoPassword?: string;
  stack?: string[];
  problem?: string;
  solution?: string[] | string;
  impact?: string[];
  technicalCapabilities?: string[];
  measuredResults?: string[];
  expectedBenefits?: string[];
  outcome?: string;
  disclosure?: string;
  platforms?: AutomationPlatform[];
  images?: ProjectImage[];
  targetUsers?: string[];
  goals?: string[];
  features?: string[];
  userFlow?: string[];
  architecture?: string[];
  databaseNotes?: string[];
  integrations?: string[];
  process?: string[];
  challenges?: string[];
  lessons?: string[];
  futureImprovements?: string[];
  caseStudySections?: ProjectCaseStudySection[];
}
