import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useDialogAccessibility } from '../ui/useDialogAccessibility';
import { NavigationPanel } from './NavigationPanel';

export const MobileMenu = ({ isOpen, currentTime, onClose }: { isOpen: boolean; currentTime: string; onClose: () => void }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialogAccessibility({ isOpen, onClose, containerRef: dialogRef, initialFocusRef: closeRef });
  return createPortal(<AnimatePresence>{isOpen && <motion.div className="mobile-menu-layer" initial={false}><motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" tabIndex={-1} className="mobile-menu" initial={{ y: 12 }} animate={{ y: 0 }} exit={{ y: 8 }}><div className="mobile-menu-header"><h1 id="mobile-menu-title">Navigation</h1><button ref={closeRef} type="button" onClick={onClose} className="icon-button" aria-label="Close navigation"><X size={18} /></button></div><NavigationPanel currentTime={currentTime} onNavigate={onClose} /></motion.div></motion.div>}</AnimatePresence>, document.body);
};
