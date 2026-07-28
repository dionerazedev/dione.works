import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from './theme-context';

const OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];
const ICONS = { system: Monitor, light: Sun, dark: Moon } as const;

export const ThemeControls = () => {
  const { preference, setTheme } = useTheme();
  return <div className="theme-controls" role="group" aria-label="Theme">{OPTIONS.map((option) => {
    const Icon = ICONS[option];
    return <button key={option} type="button" className={preference === option ? 'is-active' : ''} aria-label={`${option} theme`} aria-pressed={preference === option} title={`${option} theme`} onClick={() => setTheme(option)}><Icon size={13} aria-hidden="true" /></button>;
  })}</div>;
};
