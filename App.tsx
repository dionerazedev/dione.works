/*
THESIS: A personal field index lets verified work lead and refuses the oversized agency-hero template.
OWN-WORLD: Strict monochrome tokens, hairline rules, compact pixel/mono details, halftone portrait, and flat editorial rows.
STORY: Visitors meet Dione, inspect real products and notes, understand his working range, then contact him directly.
FIRST VIEWPORT: A cut-out monochrome portrait sits beside a compact name, two paragraphs, and four profile links.
FORM: Brief-pinned Bryl Minimal personal index; the supplied direction replaces concept seeding and controls every route.
*/
import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Route, Routes } from 'react-router-dom';
import { ChatAssistant } from './components/ChatAssistant';
import { CommunityProvider } from './components/community/CommunityProvider';
import { Footer } from './components/Footer';
import { MainContent } from './components/MainContent';
import { Navbar } from './components/Navbar';
import { SidebarLeft } from './components/SidebarLeft';
import { CommandPalette } from './components/navigation/CommandPalette';
import { MobileMenu } from './components/navigation/MobileMenu';

const CaseStudyPage = lazy(() => import('./pages/CaseStudyPage').then((module) => ({ default: module.CaseStudyPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((module) => ({ default: module.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((module) => ({ default: module.BlogPostPage })));
const GearPage = lazy(() => import('./pages/GearPage').then((module) => ({ default: module.GearPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((module) => ({ default: module.CommunityPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

const formatManilaTime = () => `${new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })} PHT`;

const PortfolioApp = () => {
  const [currentTime, setCurrentTime] = useState(formatManilaTime);
  const [activeOverlay, setActiveOverlay] = useState<'command' | 'menu' | null>(null);
  useEffect(() => { const id = setInterval(() => setCurrentTime(formatManilaTime()), 30_000); return () => clearInterval(id); }, []);
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      if (event.shiftKey) {
        window.dispatchEvent(new CustomEvent('portfolio:close-assistant'));
        setActiveOverlay('command');
      } else {
        setActiveOverlay(null);
        window.dispatchEvent(new CustomEvent('portfolio:open-assistant'));
      }
    };
    addEventListener('keydown', handleShortcut);
    return () => removeEventListener('keydown', handleShortcut);
  }, []);
  const openOverlay = (overlay: 'command' | 'menu') => { window.dispatchEvent(new CustomEvent('portfolio:close-assistant')); setActiveOverlay(overlay); };
  return <CommunityProvider><a href="#main-content" className="skip-link">Skip to main content</a><div id="top" className="portfolio-shell"><SidebarLeft currentTime={currentTime} /><div className="workspace"><Navbar onOpenMenu={() => openOverlay('menu')} /><main id="main-content" tabIndex={-1}><Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}><Routes><Route path="/" element={<MainContent />} /><Route path="/blog" element={<BlogPage />} /><Route path="/blog/:slug" element={<BlogPostPage />} /><Route path="/gear" element={<GearPage />} /><Route path="/community" element={<CommunityPage />} /><Route path="/work/:slug" element={<CaseStudyPage />} /><Route path="*" element={<NotFoundPage />} /></Routes></Suspense></main><Footer /></div></div><MobileMenu isOpen={activeOverlay === 'menu'} currentTime={currentTime} onClose={() => setActiveOverlay(null)} /><CommandPalette isOpen={activeOverlay === 'command'} onClose={() => setActiveOverlay(null)} /><ChatAssistant isOverlayOpen={activeOverlay !== null} /></CommunityProvider>;
};

const App = () => <MotionConfig reducedMotion="user"><PortfolioApp /></MotionConfig>;
export default App;
