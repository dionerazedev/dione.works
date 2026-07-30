import { BookOpen, Laptop } from 'lucide-react';
import { ChatCircleDots, EnvelopeSimple } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import { PROFILE_LINKS, SECTION_NAVIGATION } from '../../data/navigation';
import { useSoundPreference } from '../../hooks/useSoundPreference';
import { SidebarPlayground } from '../playground/SidebarPlayground';
import { ThemeControls } from '../theme';
import { PresenceSummary } from '../community/PresenceSummary';
import { useActiveSection } from '../ui/useActiveSection';
import { usePortfolioNavigation } from './usePortfolioNavigation';

export const NavigationPanel = ({ currentTime, onNavigate }: { currentTime: string; onNavigate?: () => void }) => {
  const location = useLocation();
  const activeSection = useActiveSection(location.pathname === '/');
  const goToSection = usePortfolioNavigation(onNavigate);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundPreference();
  return <div className="navigation-panel">
    <div className="navigation-main">
      <div className="navigation-identity">
        <Link to="/" onClick={onNavigate}><strong>Dione Raze</strong><span>AI automation + full-stack</span></Link>
      </div>

      <nav className="navigation-primary" aria-label="Primary navigation">
        <Link to="/blog" onClick={onNavigate} className={location.pathname.startsWith('/blog') ? 'is-active' : ''}><BookOpen size={13} aria-hidden="true" />Blog</Link>
        <Link to="/gear" onClick={onNavigate} className={location.pathname === '/gear' ? 'is-active' : ''}><Laptop size={13} aria-hidden="true" />Gear</Link>
        <span className="nav-divider" aria-hidden="true" />
        {SECTION_NAVIGATION.map((item) => <a key={item.id} href={`/#${item.id}`} onClick={(event) => goToSection(event, item.id)} className={location.pathname === '/' && activeSection === item.id ? 'is-active' : ''}>{item.label}</a>)}
      </nav>

      <SidebarPlayground soundEnabled={soundEnabled} onToggleSound={toggleSound} />
    </div>

    <div className="navigation-footer">
      <div className="navigation-community">
        <PresenceSummary />
        <Link to="/community" onClick={onNavigate} className={location.pathname === '/community' ? 'community-link is-active' : 'community-link'}><ChatCircleDots size={14} />Community chat</Link>
      </div>

      <div className="navigation-settings">
        <ThemeControls />
      </div>

      <div className="navigation-details">
        <p>For work, collabs &amp; everything else, reach me at</p>
        <a href={PROFILE_LINKS.email}><EnvelopeSimple size={14} aria-hidden="true" />{PROFILE_LINKS.emailAddress}</a>
        <time className="sr-only">{currentTime}</time>
      </div>
    </div>
  </div>;
};
