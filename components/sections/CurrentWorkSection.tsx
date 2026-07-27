import { SectionHeading } from '../ui/SectionHeading';
import { AutomationProjectsSection } from './AutomationProjectsSection';
import { TechStackSection } from './TechStackSection';

export const CurrentWorkSection = () => <section className="section-shell current-work" aria-labelledby="current-work-heading"><SectionHeading number="03" label="current work" id="current-work-heading" title="A working set of automation patterns and product tools." comment="These are documented prototypes and technologies—not fabricated client deployments." /><AutomationProjectsSection /><TechStackSection /></section>;
