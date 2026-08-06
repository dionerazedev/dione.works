import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef = undefined,
  enableBlur = true,
  baseOpacity = 1,
  baseRotation = 0,
  blurStrength = 5,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  as: Component = 'h2',
  ...props
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    if (typeof children !== 'string') return children;

    return children.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const wordYOffset = coarsePointer ? 6 : 12;
    const animationDuration = coarsePointer ? 0.5 : 0.7;
    const wordStagger = coarsePointer ? 0.008 : 0.015;
    const blurAmount = coarsePointer ? Math.min(blurStrength, 1.5) : blurStrength;
    const scroller = scrollContainerRef?.current ?? window;
    const wordElements = el.querySelectorAll('.word');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'power3.out',
          rotate: 0,
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 85%',
            end: rotationEnd,
            toggleActions: 'play none none none',
            once: true,
          },
        },
      );

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, y: wordYOffset, willChange: 'opacity, transform, filter' },
        {
          ease: 'power3.out',
          opacity: 1,
          y: 0,
          duration: animationDuration,
          stagger: wordStagger,
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 85%',
            end: wordAnimationEnd,
            toggleActions: 'play none none none',
            once: true,
          },
          onComplete: () => {
            gsap.set(wordElements, { clearProps: 'willChange' });
          },
        },
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurAmount}px)` },
          {
            ease: 'power3.out',
            filter: 'blur(0px)',
            duration: animationDuration,
            stagger: wordStagger,
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top 85%',
              end: wordAnimationEnd,
              toggleActions: 'play none none none',
              once: true,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <Component {...props} ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <span className={`scroll-reveal-text ${textClassName}`}>{splitText}</span>
    </Component>
  );
};

export default ScrollReveal;
