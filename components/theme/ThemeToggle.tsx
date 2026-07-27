import { Moon, Sun } from '@phosphor-icons/react';
import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { useTheme } from './theme-context';

type Props = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'onClick' | 'type'>;

export const ThemeToggle = ({ className = '', ...props }: Props) => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    toggleTheme({ x: event.detail ? event.clientX : box.left + box.width / 2, y: event.detail ? event.clientY : box.top + box.height / 2 });
  };
  return <button {...props} type="button" className={`theme-toggle ${className}`} onClick={handleClick} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</button>;
};
