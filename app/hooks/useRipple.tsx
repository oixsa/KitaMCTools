'use client';

import { useCallback } from 'react';

/**
 * M3-style ripple effect: spawns a expanding circle from the pointer
 * position inside the nearest `.m3-ripple-host` ancestor (or the
 * element itself). Attach the returned handler to onPointerDown.
 *
 * The target element must have `position: relative` (add the
 * `m3-ripple-host` class which also clips overflow).
 */
export function useRipple() {
  return useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const host = (e.currentTarget as HTMLElement).closest(
      '.m3-ripple-host'
    ) as HTMLElement | null;
    if (!host) return;

    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'm3-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    host.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, []);
}
