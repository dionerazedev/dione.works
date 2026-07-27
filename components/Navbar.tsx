import { List } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './theme';

export const Navbar = ({ onOpenMenu }: { onOpenMenu: () => void }) => <header className="mobile-topbar"><Link to="/" className="mobile-brand"><strong>Dione Raze</strong><span>AI automation + full-stack</span></Link><div><ThemeToggle /><button type="button" onClick={onOpenMenu} className="icon-button" aria-label="Open navigation"><List size={19} /></button></div></header>;
