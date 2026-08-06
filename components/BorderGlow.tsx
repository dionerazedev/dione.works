import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';

import './BorderGlow.css';

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number | string;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'] as const;
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

const parseHSL = (hsl: string): HslColor => {
  const match = hsl.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 220, s: 8, l: 48 };
  return { h: Number.parseFloat(match[1]), s: Number.parseFloat(match[2]), l: Number.parseFloat(match[3]) };
};

const buildGlowVars = (glowColor: string, intensity: number): GlowStyle => {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];

  return opacities.reduce<GlowStyle>((vars, opacity, index) => {
    vars[`--glow-color${keys[index]}`] = `hsl(${base} / ${Math.min(opacity * intensity, 100)}%)`;
    return vars;
  }, {});
};

const buildGradientVars = (colors: string[]): GlowStyle => {
  const safeColors = colors.length > 0 ? colors : ['var(--border)'];

  const vars = GRADIENT_KEYS.reduce<GlowStyle>((result, key, index) => {
    const color = safeColors[Math.min(COLOR_MAP[index], safeColors.length - 1)];
    result[key] = `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${color} 0px, transparent 52%)`;
    return result;
  }, {});

  vars['--gradient-base'] = `linear-gradient(${safeColors[0]} 0 100%)`;
  return vars;
};

const formatRadius = (radius: number | string) => (typeof radius === 'number' ? `${radius}px` : radius);

const BorderGlow = ({
  children,
  className = '',
  edgeSensitivity = 35,
  glowColor = '220 8 48',
  backgroundColor = 'var(--background)',
  borderColor = 'var(--border)',
  borderRadius = 12,
  glowRadius = 18,
  glowIntensity = 0.35,
  coneSpread = 18,
  animated = false,
  colors = ['var(--border)', 'var(--border-strong)', 'var(--muted)'],
  fillOpacity = 0.08,
}: BorderGlowProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canTrackPointer = useRef(false);

  const getCenterOfElement = useCallback((element: HTMLElement) => {
    const { width, height } = element.getBoundingClientRect();
    return [width / 2, height / 2] as const;
  }, []);

  const getEdgeProximity = useCallback((element: HTMLElement, x: number, y: number) => {
    const [centerX, centerY] = getCenterOfElement(element);
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const scaleX = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX);
    const scaleY = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY);

    return Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((element: HTMLElement, x: number, y: number) => {
    const [centerX, centerY] = getCenterOfElement(element);
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    if (deltaX === 0 && deltaY === 0) return 0;

    const degrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    return degrees < 0 ? degrees + 360 : degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || !canTrackPointer.current || event.pointerType === 'touch') return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);

    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  }, [getCursorAngle, getEdgeProximity]);

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--edge-proximity', '0');
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePointerMode = () => {
      canTrackPointer.current = finePointer.matches && !reducedMotion.matches;
      if (!canTrackPointer.current) handlePointerLeave();
    };

    updatePointerMode();
    finePointer.addEventListener('change', updatePointerMode);
    reducedMotion.addEventListener('change', updatePointerMode);

    return () => {
      finePointer.removeEventListener('change', updatePointerMode);
      reducedMotion.removeEventListener('change', updatePointerMode);
    };
  }, [handlePointerLeave]);

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card || !canTrackPointer.current) return undefined;

    card.classList.add('sweep-active');
    card.style.setProperty('--edge-proximity', '55');
    card.style.setProperty('--cursor-angle', '110deg');
    const timeout = window.setTimeout(() => {
      card.style.setProperty('--edge-proximity', '0');
      card.classList.remove('sweep-active');
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [animated]);

  const style = useMemo<GlowStyle>(() => ({
    '--card-bg': backgroundColor,
    '--border-color': borderColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': formatRadius(borderRadius),
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  }), [backgroundColor, borderColor, borderRadius, colors, coneSpread, edgeSensitivity, fillOpacity, glowColor, glowIntensity, glowRadius]);

  return (
    <div
      ref={cardRef}
      className={['border-glow-card', className].filter(Boolean).join(' ')}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
};

export default BorderGlow;
