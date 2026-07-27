import { useEffect, useState } from 'react';

const KEY = 'dione-sound';

export const useSoundPreference = () => {
  const [enabled, setEnabled] = useState(() => { try { return window.localStorage.getItem(KEY) === 'on'; } catch { return false; } });
  useEffect(() => {
    if (!enabled) return;
    const playTick = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('a, button')) return;
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 560;
      gain.gain.setValueAtTime(0.012, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.035);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.04);
      oscillator.addEventListener('ended', () => void context.close(), { once: true });
    };
    document.addEventListener('pointerdown', playTick, true);
    return () => document.removeEventListener('pointerdown', playTick, true);
  }, [enabled]);
  const toggle = () => setEnabled((current) => {
    const next = !current;
    try { window.localStorage.setItem(KEY, next ? 'on' : 'off'); } catch { /* Storage may be blocked. */ }
    return next;
  });
  return { enabled, toggle };
};
