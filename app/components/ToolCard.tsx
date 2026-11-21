'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Tool } from '../types/tools';
import { useRipple } from '../hooks/useRipple';

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ToolCard({
  tool,
  isFavorite,
  onToggleFavorite,
}: ToolCardProps) {
  const onRipple = useRipple();
  const [starPopping, setStarPopping] = useState(false);

  const handleFavorite = () => {
    onToggleFavorite();
    if (!isFavorite) {
      // Pop only when starring (not when unstarring)
      setStarPopping(true);
    }
  };

  return (
    <div
      className="m3-ripple-host bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[20px] p-4 sm:p-5 shadow-2xs hover:bg-[var(--md-sys-color-surface-container)] hover:shadow-md hover:border-[var(--md-sys-color-outline-variant)] transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5 active:scale-[0.99]"
      onPointerDown={onRipple}
    >
      <div>
        {/* Card Thumbnail / Preview Viewport (M3 Surface Container) */}
        <div className="relative w-full h-32 sm:h-36 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]/30 mb-3.5 flex items-center justify-center overflow-hidden">
          {/* Favorite Toggle Star (M3 Icon Toggle Button) */}
          <button
            type="button"
            onClick={handleFavorite}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-lowest)]/90 backdrop-blur-xs flex items-center justify-center text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-accent)] shadow-2xs transition-colors z-10 cursor-pointer active:scale-95"
            aria-label={isFavorite ? `Unfavorite ${tool.title}` : `Favorite ${tool.title}`}
          >
            <span
              onAnimationEnd={() => setStarPopping(false)}
              className={`material-symbols-outlined text-[18px] transition-transform ${
                isFavorite
                  ? `text-[var(--md-sys-color-accent)] filled scale-110 ${starPopping ? 'star-pop' : ''}`
                  : 'text-[var(--md-sys-color-outline)]'
              }`}
            >
              star
            </span>
          </button>

          {/* Badge indicator (M3 Small Badge) */}
          {tool.badge && (
            <span className="absolute top-2.5 right-2.5 font-mono-meta text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline-variant)]/40">
              {tool.badge}
            </span>
          )}

          {/* Center Graphic / Material Icon */}
          <Link
            href={tool.href}
            className="flex flex-col items-center justify-center text-[var(--md-sys-color-primary)] group-hover:scale-110 transition-transform duration-200 w-full h-full"
            aria-label={tool.title}
          >
            <span className="material-symbols-outlined text-[40px] sm:text-[44px]">
              {tool.icon}
            </span>
            {tool.engineVersion && (
              <span className="font-mono-meta text-[10px] text-[var(--md-sys-color-outline)] mt-1.5 px-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)]/60">
                {tool.engineVersion}
              </span>
            )}
          </Link>
        </div>

        {/* Card Title & Description */}
        <Link href={tool.href} className="block">
          <h3 className="font-headline font-bold text-base text-[var(--md-sys-color-on-surface)] mb-1.5 group-hover:text-[var(--md-sys-color-primary)] transition-colors">
            {tool.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed line-clamp-2 mb-4">
          {tool.description}
        </p>
      </div>

      {/* Card Footer: Category Assist Chip & M3 Action Button */}
      <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]/40 flex items-center justify-between">
        <span className="font-mono-meta text-[11px] text-[var(--md-sys-color-outline)] capitalize px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container)]">
          {tool.category.replace('-', ' ')}
        </span>
        <Link
          href={tool.href}
          className="m3-ripple-host w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shadow-2xs group-hover:bg-[var(--md-sys-color-primary)] group-hover:text-[var(--md-sys-color-on-primary)] transition-all transform group-hover:translate-x-0.5 active:scale-95"
          aria-label={`Open ${tool.title}`}
        >
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
