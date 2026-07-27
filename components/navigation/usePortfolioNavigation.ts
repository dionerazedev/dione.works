import type { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToSection, type SectionId } from '../../data/navigation';

export const usePortfolioNavigation = (onNavigate?: () => void) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (event: MouseEvent<HTMLElement> | null, id: SectionId) => {
    event?.preventDefault();
    onNavigate?.();

    if (location.pathname === '/') {
      scrollToSection(id);
      return;
    }

    navigate(`/#${id}`);
  };
};
