import { FEATURED_PROJECTS } from '../../data/projects';
import type { ProjectImage } from '../../types/project';
import { FeaturedProject } from '../projects/FeaturedProject';
import { SectionHeading } from '../ui/SectionHeading';

export const FeaturedProjectsSection = ({ onPreview }: { onPreview: (image: ProjectImage) => void }) => <section id="featured-work" className="section-shell selected-projects" aria-labelledby="featured-work-heading"><SectionHeading number="02" label="selected work" id="featured-work-heading" title="A small selection of products and connected systems." comment="Every status, link, and screenshot comes from the existing portfolio data." /><div className="featured-projects">{FEATURED_PROJECTS.map((project, index) => <FeaturedProject key={project.id} project={project} index={index} onPreview={onPreview} />)}</div></section>;
