import { TECHNOLOGY_GROUPS } from '../../data/technologies';

const stackIntro = 'The tools, frameworks, and platforms I reach for — across front end, back end, infrastructure, automation, and AI.';

const slugifyLabel = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const TechStackSection = () => <section id="tech-stack" className="stack-section" aria-labelledby="tech-stack-heading"><header className="tech-stack-header"><h3 id="tech-stack-heading">tech stack</h3><p>{stackIntro}</p></header><div className="tech-stack-groups">{TECHNOLOGY_GROUPS.map((group) => { const headingId = `tech-stack-${slugifyLabel(group.label)}`; return <section key={group.label} className="tech-stack-group" aria-labelledby={headingId}><h4 id={headingId}>{group.label}</h4><ul className="tech-chip-list" aria-label={`${group.label} technologies`}>{group.tools.map((tool) => <li key={tool.name}><span title={`${tool.name} — ${tool.category}`}>{tool.name}</span></li>)}</ul></section>; })}</div></section>;
