import { ArrowUpRight, ArrowsOutSimple } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { ProjectData, ProjectImage as ProjectImageData } from '../../types/project';
import BorderGlow from '../BorderGlow';
import { ProjectImage } from '../ui/ProjectImage';
import { ProjectStatusBadge } from './ProjectStatusBadge';

export const FeaturedProject = ({ project, index, onPreview }: { project: ProjectData; index: number; onPreview: (image: ProjectImageData) => void }) => {
  const image = { src: project.imageUrl, alt: project.imageAlt, width: project.imageWidth, height: project.imageHeight, label: project.title };
  const imageClassName = project.id === 'migo' ? 'project-image-button migo-project-image' : 'project-image-button';
  const articleClassName = project.id === 'migo' ? 'project-feature is-migo' : 'project-feature';
  const imageButton = <button type="button" className={imageClassName} onClick={() => onPreview(image)} aria-label={`Enlarge ${project.title} project image`}><ProjectImage src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" /><span aria-hidden="true"><ArrowsOutSimple size={15} /></span></button>;
  const media = project.id === 'migo' ? (
    <BorderGlow
      className="project-image-glow"
      edgeSensitivity={35}
      glowColor="220 8 48"
      backgroundColor="var(--migo-project-image-background, #f7f7f7)"
      borderColor="var(--border)"
      borderRadius={12}
      glowRadius={18}
      glowIntensity={0.35}
      coneSpread={18}
      animated={false}
      fillOpacity={0.08}
      colors={['var(--border)', 'var(--border-strong)', 'var(--muted)']}
    >
      {imageButton}
    </BorderGlow>
  ) : imageButton;

  return <article className={articleClassName}>{media}<div className="project-copy"><div className="project-kicker"><span>{String(index + 1).padStart(2, '0')}</span><ProjectStatusBadge status={project.status} /></div><h3><Link to={`/work/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p><dl className="project-meta"><div><dt>Role</dt><dd>{project.role ?? 'Independent project'}</dd></div><div><dt>Stack</dt><dd>{project.stack?.join(' · ')}</dd></div><div><dt>Type</dt><dd>{project.type ?? project.category}</dd></div></dl><div className="project-actions"><Link to={`/work/${project.slug}`}>Case study <ArrowUpRight size={12} /></Link>{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live <ArrowUpRight size={12} /></a>}{project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noreferrer">Source <ArrowUpRight size={12} /></a>}</div>{project.demoPassword && <p className="project-demo-note">Demo password: <code>{project.demoPassword}</code></p>}</div></article>;
};
