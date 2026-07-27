import { ArrowUp } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PROFILE_LINKS } from '../data/navigation';

export const Footer = () => <footer className="site-footer"><div><strong>Dione Raze</strong><span>© {new Date().getFullYear()} · Davao City, Philippines</span></div><nav aria-label="Footer links"><Link to="/blog">Blog</Link><Link to="/gear">Gear</Link><Link to="/community">Community</Link><a href={PROFILE_LINKS.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={PROFILE_LINKS.email}>Email</a><a href="#top" onClick={(event) => { event.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }}>Top <ArrowUp size={11} /></a></nav></footer>;
