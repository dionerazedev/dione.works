import { useTheme, type ThemePreference } from './theme-context';

const OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export const ThemeControls = () => {
  const { preference, setTheme } = useTheme();
  return <div className="theme-controls" role="group" aria-label="Theme">{OPTIONS.map((option) => <button key={option} type="button" className={preference === option ? 'is-active' : ''} aria-pressed={preference === option} onClick={() => setTheme(option)}>{option}</button>)}</div>;
};
