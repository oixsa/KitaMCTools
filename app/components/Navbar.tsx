'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAV_ITEMS } from '../data/navigation';
import { useTheme } from '../hooks/useTheme';

export interface NavbarProps {
  onOpenSearch?: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  className?: string;
}

/**
 * Navbar redesign decisions (R-31, one line each):
 * - Brand lockup: "KitaMCTools" as one wordmark with a single terracotta accent on "MC",
 *   replacing the split Kita/MCTools/M3 chip lockup (the M3 chip said nothing functional, R-09).
 * - Active nav indicator: M3 nav-tab convention, a small bar under the active item plus
 *   tonal pill, so active state is never color alone (R-39).
 * - Mobile drawer: Escape closes, backdrop click closes, focus moves to the first link on
 *   open, and focus returns to the menu button on close (R-32).
 * - GitHub moves out of hiding: shown on md+ as an icon button so the repo link is reachable
 *   on tablet too (R-24: all destinations kept).
 * - MOTION 2: all transitions 150-200ms, no entrance animation on the drawer.
 */

const GITHUB_URL = 'https://github.com/oixsa/KitaMCTools';

export function NavLinks({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={`hidden md:flex items-center gap-1 text-sm font-medium ${className}`}
      aria-label="Main Navigation"
    >
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href === '/#explore-tools' && pathname === '/');
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative px-3.5 py-2 rounded-full transition-colors duration-150 cursor-pointer ${
              isActive
                ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
            }`}
          >
            {item.label}
            {/* Active indicator bar: active state carried by position, not color alone */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-5 h-[3px] rounded-full bg-[var(--md-sys-color-primary)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

interface MobileNavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile Material 3 Navigation Drawer.
 * Escape closes the drawer and focus returns to the trigger (handled by Navbar).
 */
export function MobileNavbar({ isOpen, onClose }: MobileNavbarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop: click to dismiss, below the fixed header (z-50) so the bar stays visible */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="md:hidden fixed inset-0 top-16 z-40 bg-black/40 cursor-pointer"
      />
      <div className="md:hidden absolute top-full left-0 right-0 border-t border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface-container-low)] px-4 pt-3 pb-5 shadow-xl">
        <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
          {MAIN_NAV_ITEMS.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                autoFocus={i === 0}
                aria-current={isActive ? 'page' : undefined}
                className={`px-4 min-h-[44px] rounded-full text-sm font-medium transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                    : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)]'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className="material-symbols-outlined text-[var(--md-sys-color-outline)] text-[18px]"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 pt-3 border-t border-[var(--md-sys-color-outline-variant)]/40 flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              code
            </span>
            GitHub
          </a>
          <span className="font-mono-meta text-[11px] text-[var(--md-sys-color-primary)] font-bold">
            Java &amp; Bedrock
          </span>
        </div>
      </div>
    </>
  );
}

export function Navbar({
  onOpenSearch,
  isDark: propIsDark,
  toggleTheme: propToggleTheme,
  className = '',
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeHook = useTheme();

  const isDark = propIsDark !== undefined ? propIsDark : themeHook.isDark;
  const toggleTheme = propToggleTheme || themeHook.toggleTheme;

  // Escape closes the mobile drawer; focus returns to the menu button (R-32)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        document.getElementById('mobile-menu-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 bg-[var(--md-sys-color-surface)]/95 backdrop-blur-md border-b border-[var(--md-sys-color-outline-variant)]/40 transition-colors duration-200 ${className}`}
    >
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: brand lockup and desktop navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none cursor-pointer"
            aria-label="KitaMCTools home"
          >
            <Image
              src="/logo.png"
              alt="KitaMCTools logo"
              width={32}
              height={32}
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
            {/* Single wordmark, one terracotta accent: cleaner lockup than split text + chip */}
            <span className="font-headline font-extrabold text-lg tracking-tight text-[var(--md-sys-color-on-surface)]">
              Kita
              <span className="text-[var(--md-sys-color-primary)]">MC</span>
              Tools
            </span>
          </Link>

          <NavLinks />
        </div>

        {/* Right: quick launcher, GitHub, theme toggle, mobile menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenSearch && (
            <>
              {/* Desktop quick launcher with kbd hint (AppShell owns the Cmd+K handler) */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden sm:flex items-center justify-between gap-3 px-3.5 h-10 w-48 lg:w-64 bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] border border-transparent hover:border-[var(--md-sys-color-outline-variant)] rounded-full text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors duration-150 cursor-pointer group"
                aria-label="Open quick tool launcher"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition-colors duration-150"
                    aria-hidden="true"
                  >
                    search
                  </span>
                  Quick launcher
                </span>
                <kbd className="font-mono-meta text-[10px] bg-[var(--md-sys-color-surface-container-lowest)] px-2 py-0.5 rounded-md border border-[var(--md-sys-color-outline-variant)]/60 text-[var(--md-sys-color-outline)]">
                  ⌘K
                </kbd>
              </button>
              {/* Mobile: icon-only launcher, 44px tap target */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="sm:hidden w-11 h-11 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 cursor-pointer"
                aria-label="Open quick tool launcher"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  search
                </span>
              </button>
            </>
          )}

          {/* GitHub repository link: md+ icon button so it exists on tablet too */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex w-11 h-11 rounded-full items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 cursor-pointer"
            aria-label="KitaMCTools GitHub repository"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              code
            </span>
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            type="button"
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="md:hidden w-11 h-11 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-150 cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer, wrapped so Escape/backdrop wiring has a stable anchor */}
      <div id="mobile-navigation">
        <MobileNavbar
          isOpen={mobileMenuOpen}
          onClose={() => {
            setMobileMenuOpen(false);
            document.getElementById('mobile-menu-toggle')?.focus();
          }}
        />
      </div>
    </header>
  );
}

export default Navbar;
