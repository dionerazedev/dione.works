import { ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { FEATURED_PROJECTS } from '../../data/projects';
import { PROFILE_LINKS } from '../../data/navigation';
import { SectionHeading } from '../ui/SectionHeading';

const REPOSITORIES = FEATURED_PROJECTS.filter((project) => project.sourceUrl);

export const GitHubSection = () => (
  <section id="github" className="section-shell github-section" aria-labelledby="github-heading">
    <SectionHeading
      number="06"
      label="github"
      id="github-heading"
      title="Selected source, available for inspection."
      comment="Public repositories are linked directly; no contribution totals are estimated or fabricated."
    />
    <div className="github-header">
      <div><GithubLogo size={22} aria-hidden="true" /><div><span>GitHub profile</span><strong>@dionerazedev</strong></div></div>
      <a href={PROFILE_LINKS.github} target="_blank" rel="noreferrer">Open profile <ArrowUpRight size={14} /></a>
    </div>
    <div className="repository-list">
      {REPOSITORIES.map((project, index) => (
        <a key={project.id} href={project.sourceUrl} target="_blank" rel="noreferrer">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{project.title}</strong>
          <small>{project.stack?.slice(0, 3).join(' · ')}</small>
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      ))}
    </div>
  </section>
);
