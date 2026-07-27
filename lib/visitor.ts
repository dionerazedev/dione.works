const VISITOR_KEY = 'dione-community-visitor';

const createVisitorId = () => globalThis.crypto.randomUUID();

export const getVisitorId = () => {
  try {
    const saved = window.localStorage.getItem(VISITOR_KEY);
    if (saved) return saved;
    const id = createVisitorId();
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return createVisitorId();
  }
};

export const getDeviceCategory = () => {
  const width = window.innerWidth;
  if (width < 640) return 'mobile' as const;
  if (width < 1024) return 'tablet' as const;
  return 'desktop' as const;
};
