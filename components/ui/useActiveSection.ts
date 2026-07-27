import { useEffect, useState } from 'react';
import { SECTION_NAVIGATION, type SectionId } from '../../data/navigation';

const SECTION_IDS = new Set<SectionId>(SECTION_NAVIGATION.map(({ id }) => id));

const sectionFromHash = (): SectionId => {
  if (typeof window === 'undefined') return 'home';
  const id = window.location.hash.slice(1) as SectionId;
  return SECTION_IDS.has(id) ? id : 'home';
};

export const useActiveSection = (enabled = true) => {
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash);

  useEffect(() => {
    if (!enabled) return;

    const targetIds = new Map<Element, SectionId>();
    SECTION_NAVIGATION.forEach(({ id }) => {
      const section = document.getElementById(id);
      const marker = section?.querySelector('h1, h2') ?? section;
      if (marker) targetIds.set(marker, id);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = visible ? targetIds.get(visible.target) : undefined;
        if (id) setActiveSection(id);
      },
      { rootMargin: '-84px 0px -65% 0px', threshold: 0 },
    );

    targetIds.forEach((_, marker) => observer.observe(marker));

    const handleSectionChange = (event: Event) => {
      const id = (event as CustomEvent<SectionId>).detail;
      if (SECTION_IDS.has(id)) setActiveSection(id);
    };
    const handleHistoryChange = () => setActiveSection(sectionFromHash());
    window.addEventListener('portfolio:section-change', handleSectionChange);
    window.addEventListener('hashchange', handleHistoryChange);
    window.addEventListener('popstate', handleHistoryChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('portfolio:section-change', handleSectionChange);
      window.removeEventListener('hashchange', handleHistoryChange);
      window.removeEventListener('popstate', handleHistoryChange);
    };
  }, [enabled]);

  return activeSection;
};
