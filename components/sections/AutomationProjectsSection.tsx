import { useMemo, useState } from 'react';
import { AUTOMATION_PROJECTS } from '../../data/projects';
import type { AutomationPlatform } from '../../types/project';
import { AutomationProjectCard } from '../projects/AutomationProjectCard';

type Filter = 'All' | AutomationPlatform;
const FILTERS: Filter[] = ['All', 'n8n', 'Make', 'Zapier'];

export const AutomationProjectsSection = () => {
  const [filter, setFilter] = useState<Filter>('All');
  const filtered = useMemo(() => filter === 'All' ? AUTOMATION_PROJECTS : AUTOMATION_PROJECTS.filter((project) => project.platforms?.includes(filter)), [filter]);
  return <section id="automation-work" className="automation-archive" aria-labelledby="automation-heading"><header className="subsection-heading"><div><p className="page-label">Automation archive</p><h3 id="automation-heading">Ten documented workflow systems.</h3></div><div className="filter-list" aria-label="Filter automation projects">{FILTERS.map((item) => <button key={item} type="button" aria-pressed={filter === item} className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></header><div className="automation-grid">{filtered.map((project) => <AutomationProjectCard key={project.id} project={project} />)}</div></section>;
};
