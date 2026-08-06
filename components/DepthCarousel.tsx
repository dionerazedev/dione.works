import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import gsap from 'gsap';
import { type CSSProperties, type KeyboardEvent, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './DepthCarousel.css';

export interface DepthCarouselItem {
  image: string;
  alt?: string;
  title?: string;
  meta?: string;
  caption?: string;
  objectFit?: CSSProperties['objectFit'];
  objectPosition?: CSSProperties['objectPosition'];
  imageScale?: number;
  imageTransformOrigin?: CSSProperties['transformOrigin'];
}

interface DepthCarouselProps {
  items: Array<string | DepthCarouselItem>;
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tint?: string;
  depth?: number;
  spread?: number;
  tilt?: number;
  tiltDirection?: 'left' | 'right';
  perspective?: number;
  visibleCards?: number;
  falloff?: number;
  blur?: number;
  duration?: number;
  ease?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onChange?: (index: number, item: DepthCarouselItem) => void;
  className?: string;
}

interface DragState {
  x: number;
  startPos: number;
  lastX: number;
  lastT: number;
  v: number;
  moved: boolean;
  id: number;
}

const DEFAULT_ITEMS: DepthCarouselItem[] = [
  { image: '/images/dione-profile.webp', alt: 'Dione Raze portrait', title: 'Portrait study' },
  { image: '/images/migo-grayscale-showcase.png', alt: 'Migo travel platform mockups', title: 'Product travel' },
  { image: '/images/projects/laag-bukidnon-desktop.webp', alt: 'Laag Bukidnon desktop page', title: 'Local discovery' },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const normalizeItem = (item: string | DepthCarouselItem): DepthCarouselItem => (typeof item === 'string' ? { image: item, alt: '' } : item);

export const DepthCarousel = ({
  items = DEFAULT_ITEMS,
  cardWidth = 300,
  cardHeight = 380,
  radius = 12,
  tint = '#05060a',
  depth = 190,
  spread = 70,
  tilt = 18,
  tiltDirection = 'right',
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 5,
  duration = 700,
  ease = 'power3.out',
  autoplay = false,
  autoplayDelay = 3600,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  className = '',
}: DepthCarouselProps) => {
  const data = useMemo(() => (Array.isArray(items) ? items : []).map(normalizeItem), [items]);
  const count = data.length;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const scaleRef = useRef(1);
  const dragRef = useRef<DragState | null>(null);
  const wheelTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const [active, setActive] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const layout = useCallback((position: number) => {
    if (!count) return;
    const dir = tiltDirection === 'left' ? -1 : 1;
    const scale = scaleRef.current;

    for (let i = 0; i < count; i += 1) {
      const card = cardRefs.current[i];
      if (!card) continue;

      let distance = i - position;
      if (loop && count > 1) {
        distance = ((distance % count) + count) % count;
        if (distance > count / 2) distance -= count;
      }

      const back = Math.max(0, distance);
      const shown = Math.abs(distance) <= visibleCards + 0.5;
      const translateZ = -depth * distance;
      const translateX = dir * spread * distance;
      const rotateY = dir * tilt * clamp(distance, 0, 1);
      let opacity = distance < 0 ? Math.max(0, 1 + distance) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.18, 1 - back * falloff);
      const blurPx = blur > 0 ? Math.min(blur, (back / Math.max(1, visibleCards)) * blur) : 0;

      card.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(${translateX.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const overlay = overlayRefs.current[i];
      if (overlay) overlay.style.opacity = clamp(back * falloff * 1.25, 0, 0.82).toFixed(3);
    }
  }, [blur, count, depth, falloff, loop, spread, tilt, tiltDirection, visibleCards]);

  const notify = useCallback((index: number) => {
    setActive(index);
    onChangeRef.current?.(index, data[index]);
  }, [data]);

  const tweenTo = useCallback((target: number, animate: boolean) => {
    tweenRef.current?.kill();
    const proxy = { p: posRef.current };
    tweenRef.current = gsap.to(proxy, {
      p: target,
      duration: animate && !reducedRef.current ? duration / 1000 : 0,
      ease,
      onUpdate: () => {
        posRef.current = proxy.p;
        layout(proxy.p);
      },
      onComplete: () => {
        if (count > 0) posRef.current = ((posRef.current % count) + count) % count;
        layout(posRef.current);
      },
    });
  }, [count, duration, ease, layout]);

  const setFocus = useCallback((rawIndex: number, animate = true) => {
    if (!count) return;
    const index = loop ? ((rawIndex % count) + count) % count : clamp(rawIndex, 0, count - 1);
    let delta = index - posRef.current;

    if (loop && count > 1) {
      delta = ((delta % count) + count) % count;
      if (delta > count / 2) delta -= count;
    }

    tweenTo(posRef.current + delta, animate);
    if (index !== focusRef.current) {
      focusRef.current = index;
      notify(index);
    }
  }, [count, loop, notify, tweenTo]);

  const navigateBy = useCallback((step: number) => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      const needed = cardWidth + Math.abs(spread) * 2 + 120;
      scaleRef.current = clamp(width / needed, 0.42, 1);
      layout(posRef.current);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [cardWidth, layout, spread]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const onWheel = (event: WheelEvent) => {
      if (count < 2) return;
      event.preventDefault();
      tweenRef.current?.kill();
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const delta = event.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = window.setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      root.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
    };
  }, [cardWidth, count, layout, setFocus]);

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (count < 2) return;
    tweenRef.current?.kill();
    dragRef.current = {
      x: event.clientX,
      startPos: posRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: event.pointerId,
    };
  }, [count]);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const stepPx = Math.max(cardWidth * 0.55 * scaleRef.current, 40);
    const dx = event.clientX - drag.x;

    if (!drag.moved && Math.abs(dx) > 4) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(drag.id);
    }

    if (!drag.moved) return;
    const now = performance.now();
    const dt = Math.max(now - drag.lastT, 1);
    drag.v = (event.clientX - drag.lastX) / dt;
    drag.lastX = event.clientX;
    drag.lastT = now;
    posRef.current = drag.startPos - dx / stepPx;
    layout(posRef.current);
  }, [cardWidth, layout]);

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const stepPx = Math.max(cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [cardWidth, setFocus]);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      navigateBy(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      navigateBy(1);
    }
  }, [navigateBy]);

  const onCardClick = useCallback((index: number) => {
    if (dragRef.current?.moved) return;
    setFocus(index, true);
  }, [setFocus]);

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!autoplay || reducedRef.current || count < 2) return undefined;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(() => {
        if (!hovered && !focused) navigateBy(1);
      }, Math.max(autoplayDelay, 600));
    };
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = () => { focused = false; };

    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onFocusIn);
    root?.addEventListener('focusout', onFocusOut);
    start();

    return () => {
      stop();
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onFocusIn);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [layout, cardHeight, cardWidth, count, radius]);

  useEffect(() => () => {
    tweenRef.current?.kill();
    if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
    if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
  }, []);

  const style = { '--dc-perspective': `${perspective}px` } as CSSProperties & { '--dc-perspective': string };

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={style}
      role="group"
      aria-roledescription="carousel"
      aria-label="Outside the IDE photo carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage">
        {data.map((item, index) => (
          <div
            key={`${item.image}-${index}`}
            className="depth-carousel__card"
            ref={(element) => { cardRefs.current[index] = element; }}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}${item.title ? `, ${item.title}` : ''}`}
            aria-hidden={active !== index}
            onClick={() => onCardClick(index)}
          >
            <img
              className="depth-carousel__img"
              src={item.image}
              alt={item.alt ?? ''}
              draggable={false}
              style={{
                objectFit: item.objectFit,
                objectPosition: item.objectPosition,
                transform: item.imageScale ? `scale(${item.imageScale})` : undefined,
                transformOrigin: item.imageTransformOrigin,
              }}
            />
            <span className="depth-carousel__tint" ref={(element) => { overlayRefs.current[index] = element; }} style={{ background: tint }} />
            {(item.title || item.meta) && (
              <span className="depth-carousel__caption" aria-hidden="true">
                {item.meta && <small>{item.meta}</small>}
                {item.title && <strong>{item.title}</strong>}
              </span>
            )}
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev" aria-label="Previous photo" onClick={() => navigateBy(-1)}>
            <CaretLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="depth-carousel__arrow depth-carousel__arrow--next" aria-label="Next photo" onClick={() => navigateBy(1)}>
            <CaretRight size={18} aria-hidden="true" />
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Photos">
          {data.map((item, index) => (
            <button
              key={`${item.image}-dot`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Show ${item.title ?? `photo ${index + 1}`}`}
              className={`depth-carousel__dot${active === index ? ' is-active' : ''}`}
              onClick={() => setFocus(index, true)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;
