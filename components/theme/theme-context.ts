import { createContext, useContext } from 'react';

export type Theme = 'dark' | 'light';
export type ThemePreference = Theme | 'system';

export interface ThemeTransitionOrigin { x: number; y: number; }

export interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (preference: ThemePreference, origin?: ThemeTransitionOrigin) => void;
  toggleTheme: (origin?: ThemeTransitionOrigin) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider.');
  return context;
};
