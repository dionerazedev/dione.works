import { ALL_PROJECTS, AUTOMATION_PROJECTS } from '../../data/projects';

export const StatsSection = () => {
  const items = [[String(ALL_PROJECTS.length).padStart(2, '0'), 'Projects documented'], [String(AUTOMATION_PROJECTS.length).padStart(2, '0'), 'Automation systems'], ['600+', 'CUSTOMERS SERVED'], ['PH', 'Philippines-based']];
  return <section className="stats-row" aria-label="Portfolio facts">{items.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section>;
};
