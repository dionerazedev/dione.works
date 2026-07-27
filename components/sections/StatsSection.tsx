import { ALL_PROJECTS, AUTOMATION_PROJECTS } from '../../data/projects';
import { TECHNOLOGY_GROUPS } from '../../data/technologies';

export const StatsSection = () => {
  const tools = new Set(TECHNOLOGY_GROUPS.flatMap((group) => group.tools.map((tool) => tool.name)));
  const items = [[String(ALL_PROJECTS.length).padStart(2, '0'), 'Projects documented'], [String(AUTOMATION_PROJECTS.length).padStart(2, '0'), 'Automation systems'], [String(tools.size).padStart(2, '0'), 'Verified tools'], ['PH', 'Philippines-based']];
  return <section className="stats-row" aria-label="Portfolio facts">{items.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>;
};
