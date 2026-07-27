import { ArrowUpRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { ProjectData } from '../../types/project';
import { ProjectStatusBadge } from './ProjectStatusBadge';

export const AutomationProjectCard = ({ project }: { project: ProjectData }) => <article className="automation-project"><div className="project-kicker"><span>{project.tag}</span><ProjectStatusBadge status={project.status} /></div><h4><Link to={`/work/${project.slug}`}>{project.title}</Link></h4><p>{project.description}</p><div className="automation-actions"><Link to={`/work/${project.slug}`}>View record <ArrowUpRight size={11} /></Link>{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer">Demo <ArrowUpRight size={11} /></a>}{project.videoUrl && <a href={project.videoUrl} target="_blank" rel="noreferrer">Walkthrough <ArrowUpRight size={11} /></a>}</div></article>;
