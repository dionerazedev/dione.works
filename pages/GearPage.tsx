import { GEAR_GROUPS } from '../data/gear';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';

export const GearPage = () => {
  useRouteMetadata({ title: 'Gear | Dione Raze', description: 'The verified computers, development tools, and design software Dione uses.', canonicalPath: '/gear' });
  return (
    <article className="reading-page gear-page">
      <div className="gear-dot-field" aria-hidden="true" />
      <header className="page-header gear-hero">
        <p className="page-label">Tools / environment</p>
        <h1>gear</h1>
        <p>The hardware and tools I use to build, create, test, and ship work from my desk. This is a verified list, not an affiliate shelf.</p>
      </header>
      <div className="gear-list">
        {GEAR_GROUPS.map((group) => (
          <section className="gear-section" key={group.label} aria-labelledby={`gear-${group.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <h2 id={`gear-${group.label.toLowerCase().replace(/\s+/g, '-')}`} className="page-label">{group.label}</h2>
            <div className="gear-grid">
              {group.items.map((item) => (
                <article className="gear-card" key={item.name}>
                  <div className={`gear-card-visual is-${item.image.treatment}`}>
                    <img src={item.image.src} alt="" decoding="async" />
                  </div>
                  <div className="gear-card-copy">
                    <div>
                      <h3>{item.name}</h3>
                      {item.note && <p>{item.note}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
};
