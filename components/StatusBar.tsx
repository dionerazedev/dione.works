import { GitBranch, MapPin } from '@phosphor-icons/react';
import { useTheme } from './theme';

export const StatusBar = ({ currentTime }: { currentTime: string }) => {
  const { theme } = useTheme();
  return (
    <div className="status-bar" role="status" aria-label="Portfolio status">
      <div><span><GitBranch size={12} />main</span><span>production</span><span className="status-live"><i />deployed</span></div>
      <div><span className="status-availability"><i />available_for_work</span><span><MapPin size={12} />Philippines</span><span>{theme}</span><time>{currentTime}</time></div>
    </div>
  );
};
