import { useRef, useCallback } from 'react';

/**
 * useTilt — 3D mouse-follow tilt effect for cards.
 * Usage: const { ref, handlers } = useTilt(); <div ref={ref} {...handlers}>
 */
export function useTilt({ max = 8, scale = 1.02, speed = 400 } = {}) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`;
    el.style.transition = `transform ${speed / 4}ms ease`;

    // Inner glow follows mouse
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    el.style.setProperty('--glow-x', `${glowX}%`);
    el.style.setProperty('--glow-y', `${glowY}%`);
  }, [max, scale, speed]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = `transform ${speed}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  }, [speed]);

  return {
    ref,
    handlers: { onMouseMove, onMouseLeave },
  };
}
