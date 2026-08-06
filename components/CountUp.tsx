import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export interface CountUpProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

const getDecimalPlaces = (num: number) => {
  const str = num.toString();

  if (str.includes('.')) {
    const decimals = str.split('.')[1];

    if (Number.parseInt(decimals, 10) !== 0) {
      return decimals.length;
    }
  }

  return 0;
};

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
  ...spanProps
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const initialValue = direction === 'down' ? to : from;
  const finalValue = direction === 'down' ? from : to;
  const motionValue = useMotionValue(initialValue);
  const completedRef = useRef(false);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
  });

  const isInView = useInView(ref, { once: true, margin: '0px' });
  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;

      const options: Intl.NumberFormatOptions = {
        useGrouping: Boolean(separator),
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };

      const formattedNumber = Intl.NumberFormat('en-US', options).format(latest);

      return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
    },
    [maxDecimals, separator],
  );

  useEffect(() => {
    if (!ref.current) return;

    const value = prefersReducedMotion ? finalValue : initialValue;
    ref.current.textContent = formatValue(value);
  }, [finalValue, formatValue, initialValue, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      completedRef.current = true;
      if (ref.current) {
        ref.current.textContent = formatValue(finalValue);
      }
      return undefined;
    }

    if (isInView && startWhen) {
      completedRef.current = false;
      onStart?.();

      const timeoutId = window.setTimeout(() => {
        motionValue.set(finalValue);
      }, delay * 1000);

      const durationTimeoutId = window.setTimeout(() => {
        completedRef.current = true;
        if (ref.current) {
          ref.current.textContent = formatValue(finalValue);
        }
        onEnd?.();
      }, delay * 1000 + duration * 1000);

      return () => {
        window.clearTimeout(timeoutId);
        window.clearTimeout(durationTimeoutId);
      };
    }

    return undefined;
  }, [delay, duration, finalValue, formatValue, isInView, motionValue, onEnd, onStart, prefersReducedMotion, startWhen]);

  useEffect(() => {
    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.textContent = formatValue(finalValue);
      }
      return undefined;
    }

    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = completedRef.current ? formatValue(finalValue) : formatValue(latest);
      }
    });

    return () => unsubscribe();
  }, [finalValue, formatValue, prefersReducedMotion, springValue]);

  return <span className={className} ref={ref} {...spanProps} />;
}
