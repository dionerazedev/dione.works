import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import type { ProjectImage as ProjectImageData } from '../../types/project';
import { ProjectImage } from '../ui/ProjectImage';
import { useDialogAccessibility } from '../ui/useDialogAccessibility';

export const ImageLightbox = ({ image, isOpen, onClose }: { image: ProjectImageData | null; isOpen: boolean; onClose: () => void }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialogAccessibility({ isOpen, onClose, containerRef: dialogRef, initialFocusRef: closeRef });
  useEffect(() => {
    if (isOpen) window.dispatchEvent(new CustomEvent('portfolio:close-assistant'));
  }, [isOpen]);
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && image && (
        <motion.div className="dialog-layer lightbox-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="dialog-backdrop" onMouseDown={onClose} aria-hidden="true" />
          <motion.div ref={dialogRef} initial={{ opacity: 0, scale: 0.975 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.985 }} className="lightbox-dialog" role="dialog" aria-modal="true" aria-label={`Enlarged view of ${image.label ?? image.alt}`} tabIndex={-1}>
            <button ref={closeRef} type="button" onClick={onClose} className="lightbox-close">Close <X size={16} /></button>
            <ProjectImage src={image.src} alt={image.alt} width={image.width} height={image.height} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
