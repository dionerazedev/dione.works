import { flushSync } from 'react-dom';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme, type ThemePreference, type ThemeTransitionOrigin } from './theme-context';
import './theme-transition.css';

const STORAGE_KEY = 'dione-theme';
const systemTheme = (): Theme => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const resolveTheme = (preference: ThemePreference): Theme => preference === 'system' ? systemTheme() : preference;
const isPreference = (value: unknown): value is ThemePreference => value === 'system' || value === 'dark' || value === 'light';
const readPreference = (): ThemePreference => {
  try { const value = window.localStorage.getItem(STORAGE_KEY); return isPreference(value) ? value : 'system'; } catch { return 'system'; }
};
const applyTheme = (theme: Theme, preference: ThemePreference) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0c0c0f' : '#ffffff';
};
const persist = (preference: ThemePreference) => { try { window.localStorage.setItem(STORAGE_KEY, preference); } catch { /* Storage may be blocked. */ } };
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [theme, setResolvedTheme] = useState<Theme>(() => {
    const current = document.documentElement.dataset.theme;
    return current === 'dark' || current === 'light' ? current : resolveTheme(readPreference());
  });
  const preferenceRef = useRef(preference);
  const themeRef = useRef(theme);
  const timerRef = useRef<number | null>(null);

  const commit = useCallback((nextPreference: ThemePreference, nextTheme: Theme, sync = false) => {
    preferenceRef.current = nextPreference;
    themeRef.current = nextTheme;
    persist(nextPreference);
    applyTheme(nextTheme, nextPreference);
    const update = () => { setPreference(nextPreference); setResolvedTheme(nextTheme); };
    if (sync) flushSync(update); else update();
  }, []);

  const transitionTo = useCallback((nextPreference: ThemePreference, origin?: ThemeTransitionOrigin) => {
    const nextTheme = resolveTheme(nextPreference);
    if (nextPreference === preferenceRef.current && nextTheme === themeRef.current) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const startViewTransition = document.startViewTransition?.bind(document);
    if (!origin || !startViewTransition || reducedMotion() || nextTheme === themeRef.current) {
      document.documentElement.classList.toggle('theme-color-transition', !reducedMotion() && nextTheme !== themeRef.current);
      commit(nextPreference, nextTheme);
      timerRef.current = window.setTimeout(() => document.documentElement.classList.remove('theme-color-transition'), 500);
      return;
    }
    document.documentElement.classList.add('theme-view-transition');
    const transition = startViewTransition(() => commit(nextPreference, nextTheme, true));
    transition.ready.then(() => {
      const x = Math.min(Math.max(origin.x, 0), window.innerWidth);
      const y = Math.min(Math.max(origin.y, 0), window.innerHeight);
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      document.documentElement.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 540, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' } as KeyframeAnimationOptions,
      );
    }).catch(() => undefined);
    transition.finished.finally(() => document.documentElement.classList.remove('theme-view-transition'));
  }, [commit]);

  useLayoutEffect(() => { applyTheme(theme, preference); }, [preference, theme]);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystem = () => {
      if (preferenceRef.current !== 'system') return;
      const next = systemTheme();
      themeRef.current = next;
      applyTheme(next, 'system');
      setResolvedTheme(next);
    };
    query.addEventListener('change', syncSystem);
    return () => query.removeEventListener('change', syncSystem);
  }, []);
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  const value = useMemo(() => ({
    theme,
    preference,
    setTheme: transitionTo,
    toggleTheme: (origin?: ThemeTransitionOrigin) => transitionTo(themeRef.current === 'dark' ? 'light' : 'dark', origin),
  }), [preference, theme, transitionTo]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
