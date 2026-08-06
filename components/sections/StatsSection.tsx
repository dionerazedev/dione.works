import { ALL_PROJECTS, AUTOMATION_PROJECTS } from '../../data/projects';
import CountUp from '../CountUp';

export const StatsSection = () => {
  const items = [
    { value: ALL_PROJECTS.length, label: 'Projects documented' },
    { value: AUTOMATION_PROJECTS.length, label: 'Automation systems' },
    { value: 600, suffix: '+', label: 'CUSTOMERS SERVED', separator: ',' },
    { text: 'PH', label: 'Philippines-based' },
  ];

  return (
    <section className="stats-row" aria-label="Portfolio facts">
      {items.map((item) => (
        <div key={item.label}>
          <strong aria-label={`${'text' in item ? item.text : `${item.value}${item.suffix ?? ''}`} ${item.label}`}>
            {'text' in item ? (
              item.text
            ) : (
              <>
                <CountUp from={0} to={item.value} duration={1.2} separator={item.separator ?? ''} className="count-up-text" />
                {item.suffix}
              </>
            )}
          </strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
};
