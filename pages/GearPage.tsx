import { GEAR_GROUPS } from '../data/gear';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';

export const GearPage = () => {
  useRouteMetadata({ title: 'Gear | Dione Raze', description: 'The verified computers, development tools, and design software Dione uses.', canonicalPath: '/gear' });
  return <article className="reading-page gear-page"><header className="page-header"><p className="page-label">Tools / environment</p><h1>gear</h1><p>A simple list of the hardware and software currently documented in this portfolio. No affiliate links or product endorsements.</p></header><div className="gear-list">{GEAR_GROUPS.map((group, index) => <section key={group.label}><header><span>{String(index + 1).padStart(2, '0')}</span><h2>{group.label}</h2></header><ul>{group.items.map((item) => <li key={item.name}><span>{item.name}</span>{item.note && <small>{item.note}</small>}</li>)}</ul></section>)}</div></article>;
};
