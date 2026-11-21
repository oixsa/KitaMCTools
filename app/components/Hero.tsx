'use client';

import Link from 'next/link';
import { CATEGORIES, TOOLS } from '../data/tools';

/**
 * Hero redesign decisions (R-31, one line each):
 * - Composition: asymmetric two-column with the live server-list mockup as the single focal
 *   point on the right; the copy column stays quiet so the mockup carries the "alive" moment.
 * - No eyebrow badge: the version pill said nothing the headline or brand already does (R-09).
 * - Identical 2x2 capability tiles replaced by a compact spec list: same facts, varied
 *   rhythm, no copy-paste card grid (R-14).
 * - Mono meta line and category chips are drawn from real data (TOOLS.length, CATEGORIES)
 *   so every number and label is verifiable from the repo (R-17 / R-38).
 * - Voxel motif: a stepped pixel underline on the highlighted words, tying the identity to
 *   Minecraft blocks without a decorative background grid (R-07).
 * - MOTION 2: only 150-200ms hover/press transitions, no entrance animations.
 */
export function Hero() {
  // Real counts, never hardcoded: categories excluding the "all" pseudo-category.
  const toolCount = TOOLS.length;
  const categoryCount = CATEGORIES.length - 1;
  const jumpCategories = CATEGORIES.filter((c) => c.id !== 'all');

  return (
    <div className="relative w-full overflow-hidden pt-24 sm:pt-28 pb-12 sm:pb-16 border-b border-[var(--md-sys-color-outline-variant)]/40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left column: quiet copy, one accent, real-data meta row */}
          <div className="lg:col-span-5 flex flex-col items-start">
            {/* Mono meta line: provenance, not a marketing badge */}
            <p className="font-mono-meta text-[11px] font-semibold uppercase tracking-wider text-[var(--md-sys-color-outline)] mb-5">
              Java &amp; Bedrock utilities
            </p>

            <h1 className="font-display-hero text-3xl sm:text-4xl lg:text-5xl text-[var(--md-sys-color-on-surface)] tracking-tight leading-[1.15] mb-5">
              Every Minecraft tool,{' '}
              {/* Voxel underline: stepped pixel blocks replace a plain text-decoration so the
                  accent reads as Minecraft terrain, not generic underline */}
              <span className="relative inline-block text-[var(--md-sys-color-primary)]">
                built precise
                <span
                  aria-hidden="true"
                  className="absolute left-0 -bottom-1 flex gap-[3px]"
                >
                  <span className="w-2.5 h-1 bg-[var(--md-sys-color-primary)]" />
                  <span className="w-2.5 h-1.5 bg-[var(--md-sys-color-primary)]/70" />
                  <span className="w-2.5 h-2 bg-[var(--md-sys-color-primary)]/40" />
                </span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--md-sys-color-on-surface-variant)] mb-7 leading-relaxed max-w-lg">
              Shape generators, server calculators, and MOTD designers that run
              entirely in your browser. No accounts, no installs, paste-ready
              output.
            </p>

            {/* CTAs: specific verbs, no generic labels */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/tools/motd-editor"
                className="m3-btn-filled w-full sm:w-auto py-3 cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  aria-hidden="true"
                >
                  dns
                </span>
                Design a Server MOTD
              </Link>
              <a
                href="#explore-tools"
                className="m3-btn-outlined w-full sm:w-auto py-3 cursor-pointer"
              >
                See All {toolCount} Tools
              </a>
            </div>

            {/* Category quick-jump: real CATEGORIES data, all anchor to the catalog section */}
            <div className="mt-8 w-full">
              <p className="font-mono-meta text-[10px] uppercase font-bold tracking-wider text-[var(--md-sys-color-outline)] mb-3">
                {toolCount} tools in {categoryCount} categories
              </p>
              <div className="flex flex-wrap gap-2">
                {jumpCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href="#explore-tools"
                    className="m3-chip cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[15px] text-[var(--md-sys-color-primary)]"
                      aria-hidden="true"
                    >
                      {cat.icon}
                    </span>
                    {cat.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: the focal point. In-game server list simulation keeps its
              authentic dark palette as content, independent of the site theme */}
          <div
            className="lg:col-span-7 w-full lg:pl-6"
            id="featured-tool"
          >
            <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/50 rounded-[24px] shadow-sm p-5 sm:p-7 transition-colors duration-200 hover:bg-[var(--md-sys-color-surface-container)]">
              {/* Card header: featured label earns its place because this is the only
                  flagship spotlight on the page (real status, R-09) */}
              <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--md-sys-color-outline-variant)]/40">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[var(--md-sys-color-primary)]">
                    dns
                  </span>
                  <div>
                    <h2 className="font-headline font-bold text-base sm:text-lg text-[var(--md-sys-color-on-surface)] leading-tight">
                      Server MOTD Generator
                    </h2>
                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                      Live preview of exactly what players see
                    </p>
                  </div>
                </div>
                <span className="font-mono-meta text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-[var(--md-sys-color-accent-container)] text-[var(--md-sys-color-on-accent-container)] whitespace-nowrap">
                  Featured
                </span>
              </div>

              {/* Server list mockup: dark palette is legitimate in-game content */}
              <div className="bg-[#0E0E0E] border-2 border-[#262626] rounded-2xl p-4 font-mono shadow-inner">
                <div className="flex items-start gap-3">
                  {/* Mini server icon block */}
                  <div className="w-12 h-12 rounded-lg bg-[#1C1C1C] border border-[#383838] flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-[26px]"
                      aria-hidden="true"
                    >
                      dns
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="text-white text-xs font-bold tracking-wider truncate">
                        KITA NETWORK
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-[#AAAAAA] flex-shrink-0">
                        <span>42/100</span>
                        {/* Signal bars, Minecraft server list convention */}
                        <div
                          className="flex items-end gap-0.5 h-3"
                          aria-hidden="true"
                        >
                          <span className="w-0.5 h-1 bg-[#55FF55]" />
                          <span className="w-0.5 h-1.5 bg-[#55FF55]" />
                          <span className="w-0.5 h-2 bg-[#55FF55]" />
                          <span className="w-0.5 h-2.5 bg-[#55FF55]" />
                        </div>
                      </div>
                    </div>

                    {/* Two-line MOTD with real Minecraft color codes */}
                    <div className="bg-black/70 rounded-lg p-2.5 text-xs space-y-1 leading-tight border border-white/5">
                      <div className="text-[#FFAA00] font-bold">
                        ★ KITA NETWORK{' '}
                        <span className="text-[#AAAAAA]">[1.20 - 1.21]</span>{' '}
                        <span className="text-[#55FF55]">ONLINE</span>
                      </div>
                      <div className="text-[#FFFF55]">
                        ➤{' '}
                        <span className="text-white">Custom Quests</span>{' '}
                        <span className="text-[#555555]">|</span>{' '}
                        <span className="text-[#55FFFF]">Economy</span>{' '}
                        <span className="text-[#555555]">|</span>{' '}
                        <span className="text-[#55FF55]">SMP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capability rows: same real facts as the old tiles, varied rhythm instead
                  of four identical cards (R-14) */}
              <ul className="my-4 space-y-2.5">
                {[
                  {
                    icon: 'palette',
                    title: '16 standard colors, &0 to &f',
                    note: 'plus bold, italic, and underline codes',
                  },
                  {
                    icon: 'gradient',
                    title: 'RGB hex gradients',
                    note: 'smooth transitions for 1.16+ servers',
                  },
                  {
                    icon: 'description',
                    title: 'server.properties & YAML export',
                    note: 'escaped Unicode, ready to paste',
                  },
                ].map((row) => (
                  <li
                    key={row.title}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span
                      className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)] mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    >
                      {row.icon}
                    </span>
                    <span className="text-[var(--md-sys-color-on-surface)] font-medium">
                      {row.title}
                      <span className="text-[var(--md-sys-color-on-surface-variant)] font-normal">
                        {' '}
                        {row.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/tools/motd-editor"
                className="m3-btn-filled w-full py-3 text-xs cursor-pointer"
              >
                Design a Server MOTD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
