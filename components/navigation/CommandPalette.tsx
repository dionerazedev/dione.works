import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, MagnifyingGlass, X } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { PROFILE_LINKS, type SectionId } from '../../data/navigation';
import { ALL_PROJECTS } from '../../data/projects';
import type { CommandDefinition } from '../../types/command';
import { useTheme } from '../theme';
import { useDialogAccessibility } from '../ui/useDialogAccessibility';
import { usePortfolioNavigation } from './usePortfolioNavigation';

const PROJECT_COMMANDS: CommandDefinition[] = ALL_PROJECTS.map((project) => ({
  id: `project-${project.id}`,
  label: `Open ${project.title}`,
  keywords: ['project', 'case study', project.category ?? '', project.tag, ...(project.stack ?? [])],
  actionType: 'route',
  destination: `/work/${project.slug}`,
}));

const COMMANDS: CommandDefinition[] = [
  { id: 'home', label: 'Home', keywords: ['intro', 'top'], actionType: 'navigate', destination: 'home' },
  { id: 'about', label: 'About', keywords: ['profile', 'bio'], actionType: 'navigate', destination: 'about' },
  { id: 'blog', label: 'Blog', keywords: ['writing', 'notes', 'drafts'], actionType: 'route', destination: '/blog' },
  { id: 'gear', label: 'Gear', keywords: ['tools', 'hardware', 'setup'], actionType: 'route', destination: '/gear' },
  { id: 'community', label: 'Community Chat', keywords: ['messages', 'presence', 'visitors'], actionType: 'route', destination: '/community' },
  { id: 'work', label: 'Selected Work', keywords: ['projects', 'portfolio'], actionType: 'navigate', destination: 'featured-work' },
  ...PROJECT_COMMANDS,
  { id: 'experience', label: 'Experience', keywords: ['resume', 'work history'], actionType: 'navigate', destination: 'experience' },
  { id: 'stack', label: 'Technology Stack', keywords: ['tools', 'skills', 'tech'], actionType: 'navigate', destination: 'tech-stack' },
  { id: 'capabilities', label: 'Capabilities', keywords: ['services', 'deliverables'], actionType: 'navigate', destination: 'services' },
  { id: 'certifications', label: 'Certifications', keywords: ['credentials', 'excel', 'google'], actionType: 'navigate', destination: 'certifications' },
  { id: 'contact', label: 'Contact', keywords: ['email', 'hire', 'call'], actionType: 'navigate', destination: 'contact' },
  { id: 'assistant', label: 'Open Portfolio Assistant', keywords: ['ask', 'chat', 'help'], actionType: 'assistant' },
  { id: 'resume', label: 'Open Résumé', keywords: ['cv', 'pdf'], actionType: 'external', destination: PROFILE_LINKS.resume },
  { id: 'github', label: 'Open GitHub', keywords: ['source', 'code'], actionType: 'external', destination: PROFILE_LINKS.github },
  { id: 'linkedin', label: 'Open LinkedIn', keywords: ['profile', 'social'], actionType: 'external', destination: PROFILE_LINKS.linkedin },
  { id: 'copy-email', label: 'Copy Email', keywords: ['contact', 'clipboard'], actionType: 'copy', destination: PROFILE_LINKS.emailAddress },
  { id: 'theme', label: 'Switch Theme', keywords: ['dark', 'light', 'appearance'], actionType: 'theme', shortcut: 'T' },
];

export const CommandPalette = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const closePalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setFeedback('');
    onClose();
  }, [onClose]);
  const goToSection = usePortfolioNavigation(closePalette);
  useDialogAccessibility({ isOpen, onClose: closePalette, containerRef: dialogRef, initialFocusRef: inputRef });

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return COMMANDS;
    return COMMANDS.filter((command) => `${command.label} ${command.keywords.join(' ')}`.toLowerCase().includes(normalized));
  }, [query]);

  const runCommand = async (command: CommandDefinition) => {
    if (command.actionType === 'navigate' && command.destination) {
      goToSection(null, command.destination as SectionId);
      return;
    }
    if (command.actionType === 'route' && command.destination) {
      navigate(command.destination);
      closePalette();
      return;
    }
    if (command.actionType === 'external' && command.destination) {
      window.open(command.destination, '_blank', 'noopener,noreferrer');
      closePalette();
      return;
    }
    if (command.actionType === 'download' && command.destination) {
      const link = document.createElement('a');
      link.href = command.destination;
      link.download = '';
      link.click();
      closePalette();
      return;
    }
    if (command.actionType === 'copy' && command.destination) {
      try {
        await navigator.clipboard.writeText(command.destination);
        setFeedback('Email copied to clipboard.');
      } catch {
        setFeedback('Unable to copy. Email: dioneraze.dev@gmail.com');
      }
      return;
    }
    if (command.actionType === 'theme') {
      const bounds = dialogRef.current?.getBoundingClientRect();
      toggleTheme(bounds ? { x: bounds.left + bounds.width / 2, y: bounds.top + 48 } : undefined);
      setFeedback('Theme switched.');
      return;
    }
    if (command.actionType === 'assistant') {
      closePalette();
      window.setTimeout(() => window.dispatchEvent(new CustomEvent('portfolio:open-assistant')), 80);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div className="dialog-layer" initial={false}>
          <div className="dialog-backdrop" onMouseDown={closePalette} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-title"
            aria-describedby="command-description"
            tabIndex={-1}
            className="command-palette"
            initial={{ y: 10, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.985 }}
            transition={{ duration: 0.2 }}
          >
            <div className="command-palette-header">
              <div><h2 id="command-title">Command palette</h2><p id="command-description">Navigate the portfolio or run an action.</p></div>
              <button type="button" onClick={closePalette} className="icon-button" aria-label="Close command palette"><X size={18} /></button>
            </div>
            <div className="command-search">
              <MagnifyingGlass size={17} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
                onKeyDown={(event) => {
                  if (!filteredCommands.length) return;
                  if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((value) => (value + 1) % filteredCommands.length); }
                  if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((value) => (value - 1 + filteredCommands.length) % filteredCommands.length); }
                  if (event.key === 'Enter') { event.preventDefault(); void runCommand(filteredCommands[activeIndex]); }
                }}
                placeholder="Type a command…"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-activedescendant={filteredCommands[activeIndex] ? `command-${filteredCommands[activeIndex].id}` : undefined}
                autoComplete="off"
              />
              <kbd>ESC</kbd>
            </div>
            <div id="command-results" className="command-results" role="listbox">
              {filteredCommands.map((command, index) => (
                <button
                  id={`command-${command.id}`}
                  key={command.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? 'is-active' : ''}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => { void runCommand(command); }}
                >
                  <span>{command.label}</span>
                  {command.shortcut ? <kbd>{command.shortcut}</kbd> : <ArrowRight size={14} aria-hidden="true" />}
                </button>
              ))}
              {!filteredCommands.length && <p className="command-empty">No matching commands.</p>}
            </div>
            <div className="command-palette-footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> select</span>
              <span className="command-feedback" aria-live="polite">{feedback && <><Check size={13} />{feedback}</>}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
