import { BookOpen, Laptop } from 'lucide-react';
import { ChatCircleDots, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import { PROFILE_LINKS, SECONDARY_SOCIAL_LINKS, SECTION_NAVIGATION } from '../../data/navigation';
import { useSoundPreference } from '../../hooks/useSoundPreference';
import { ThemeControls } from '../theme';
import { PresenceSummary } from '../community/PresenceSummary';
import { useActiveSection } from '../ui/useActiveSection';
import { getCommandShortcut } from './shortcut';
import { usePortfolioNavigation } from './usePortfolioNavigation';

export const NavigationPanel = ({ currentTime, onNavigate }: { currentTime: string; onNavigate?: () => void }) => {
  const location = useLocation();
  const activeSection = useActiveSection(location.pathname === '/');
  const goToSection = usePortfolioNavigation(onNavigate);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundPreference();
  const openAssistant = () => {
    onNavigate?.();
    window.dispatchEvent(new CustomEvent('portfolio:open-assistant'));
  };

  return <div className="navigation-panel">
    <div className="navigation-identity">
      <Link to="/" onClick={onNavigate}><strong>Dione Raze</strong><span>AI automation + full-stack</span></Link>
    </div>

    <nav className="navigation-primary" aria-label="Primary navigation">
      <Link to="/blog" onClick={onNavigate} className={location.pathname.startsWith('/blog') ? 'is-active' : ''}><BookOpen size={13} aria-hidden="true" />Blog</Link>
      <Link to="/gear" onClick={onNavigate} className={location.pathname === '/gear' ? 'is-active' : ''}><Laptop size={13} aria-hidden="true" />Gear</Link>
      <span className="nav-divider" aria-hidden="true" />
      {SECTION_NAVIGATION.map((item) => <a key={item.id} href={`/#${item.id}`} onClick={(event) => goToSection(event, item.id)} className={location.pathname === '/' && activeSection === item.id ? 'is-active' : ''}>{item.label}</a>)}
    </nav>

    <div className="navigation-community">
      <button type="button" className="ask-anything" onClick={openAssistant}><span>Ask anything</span><kbd>{getCommandShortcut()}</kbd></button>
      <PresenceSummary />
      <Link to="/community" onClick={onNavigate} className={location.pathname === '/community' ? 'community-link is-active' : 'community-link'}><ChatCircleDots size={14} />Community chat</Link>
    </div>

    <div className="navigation-settings">
      <span className="sidebar-micro-label">Theme</span>
      <ThemeControls />
      <button type="button" className="sound-toggle" onClick={toggleSound} aria-pressed={soundEnabled}>{soundEnabled ? <SpeakerHigh size={14} /> : <SpeakerSlash size={14} />}Sound {soundEnabled ? 'on' : 'off'}</button>
    </div>

    <nav className="navigation-external" aria-label="Sidebar profile links">
      <a href={PROFILE_LINKS.github} target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
      <a href={PROFILE_LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
      <a href={PROFILE_LINKS.resume} target="_blank" rel="noreferrer">Résumé <span>↗</span></a>
    </nav>

    <div className="navigation-details">
      <p>Available for selected projects</p>
      <p>Davao City, Philippines</p>
      <time>{currentTime}</time>
      <a href={PROFILE_LINKS.email}>{PROFILE_LINKS.emailAddress}</a>
      <div>{SECONDARY_SOCIAL_LINKS.slice(0, 2).map((link) => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div>
    </div>
  </div>;
};
