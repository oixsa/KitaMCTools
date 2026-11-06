'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES } from '../data/tools';
import { Tool, ToolCategoryId } from '../types/tools';
import { ToolCard } from './ToolCard';

interface ExploreToolsProps {
  tools: Tool[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ExploreTools({
  tools,
  isFavorite,
  onToggleFavorite,
  searchQuery,
  onSearchChange,
}: ExploreToolsProps) {
  const [activeCategory, setActiveCategory] = useState<ToolCategoryId | 'favorites'>('all');

  // Count starred tools
  const favoriteCount = useMemo(() => {
    return tools.filter((tool) => isFavorite(tool.id)).length;
  }, [tools, isFavorite]);

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Handle favorites filter
      if (activeCategory === 'favorites') {
        if (!isFavorite(tool.id)) return false;
      } else if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [tools, activeCategory, searchQuery, isFavorite]);

  const clearFilters = () => {
    setActiveCategory('all');
    onSearchChange('');
  };

  const hasActiveFilters = Boolean(searchQuery) || activeCategory !== 'all';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full" id="explore-tools">
      {/* Section Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-center lg:justify-between items-center lg:items-end mb-6 sm:mb-8 gap-4">
        <div className="text-center lg:text-left">
          <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-[var(--md-sys-color-on-surface)]">
            Explore tools
          </h2>
          <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Find the right Minecraft tool by category or search.
          </p>
        </div>

        {/* Live Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full lg:w-auto ">
          {/* M3 Docked Search Field */}
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[var(--md-sys-color-outline)] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="w-full h-11 pl-10 pr-9 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs sm:text-sm shadow-2xs border border-transparent focus:outline-none focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface-container-highest)] transition-all placeholder:text-[var(--md-sys-color-outline)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-3 text-[var(--md-sys-color-outline)] hover:text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Category Dropdown */}
      <div className="relative sm:hidden mb-6">
        <span className="material-symbols-outlined absolute left-3.5 top-3 pointer-events-none text-[var(--md-sys-color-outline)] text-[18px]">
          {activeCategory === 'favorites' ? 'star' : 'filter_list'}
        </span>
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value as ToolCategoryId | 'favorites')}
          aria-label="Filter tools by category"
          className="w-full h-11 pl-10 pr-9 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-sm font-medium shadow-2xs border border-transparent focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer appearance-none"
        >
          <option value="all">All tools</option>
          <option value="favorites">Favorites{favoriteCount > 0 ? ` (${favoriteCount})` : ''}</option>
          {CATEGORIES.filter((cat) => cat.id !== 'all' && tools.some((t) => t.category === cat.id)).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-[var(--md-sys-color-outline)] text-[18px]">
          expand_more
        </span>
      </div>

      {/* M3 Filter Chips Bar (hidden on mobile — uses dropdown; single-row scrollable on tablet/desktop) */}
      <div className="hidden sm:flex items-center gap-2 flex-nowrap overflow-x-auto pb-2 mb-6 chips-scrollbar">
        {/* All tools chip */}
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`m3-chip cursor-pointer whitespace-nowrap shrink-0 ${
            activeCategory === 'all' ? 'm3-chip-selected' : ''
          }`}
        >
          {activeCategory === 'all' ? (
            <span className="material-symbols-outlined text-[16px]">check</span>
          ) : (
            <span className="material-symbols-outlined text-[16px]">apps</span>
          )}
          <span>All tools</span>
        </button>

        {/* Favorites filter chip (Instant UX access to starred tools) */}
        <button
          type="button"
          onClick={() => setActiveCategory('favorites')}
          className={`m3-chip cursor-pointer whitespace-nowrap shrink-0 ${
            activeCategory === 'favorites' ? 'm3-chip-selected' : ''
          }`}
        >
          {activeCategory === 'favorites' ? (
            <span className="material-symbols-outlined text-[16px]">check</span>
          ) : (
            <span className={`material-symbols-outlined text-[16px] ${favoriteCount > 0 ? 'text-[var(--md-sys-color-tertiary)] filled' : ''}`}>
              star
            </span>
          )}
          <span>Favorites</span>
          {favoriteCount > 0 && (
            <span className="font-mono-meta text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold">
              {favoriteCount}
            </span>
          )}
        </button>

        {/* Standard Category Chips */}
        {CATEGORIES.filter((cat) => cat.id !== 'all' && tools.some((t) => t.category === cat.id)).map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`m3-chip cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected ? 'm3-chip-selected' : ''
              }`}
            >
              {isSelected ? (
                <span className="material-symbols-outlined text-[16px]">check</span>
              ) : (
                cat.icon && (
                  <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                )
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--md-sys-color-outline)] mb-4">
        <span>
          Showing{' '}
          <strong className="text-[var(--md-sys-color-on-surface)]">
            {filteredTools.length}
          </strong>{' '}
          of {tools.length} tools
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[var(--md-sys-color-primary)] font-semibold hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Tools Catalog Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 ">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={isFavorite(tool.id)}
              onToggleFavorite={() => onToggleFavorite(tool.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State (M3 Surface Container Card) */
        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]/40 rounded-[24px] p-10 sm:p-14 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)] mb-4">
            <span className="material-symbols-outlined text-[32px]">
              {activeCategory === 'favorites' ? 'star_outline' : 'search_off'}
            </span>
          </div>
          <h3 className="font-headline font-bold text-lg text-[var(--md-sys-color-on-surface)] mb-1.5">
            {activeCategory === 'favorites'
              ? 'No favorite tools starred yet'
              : 'No tools match your search'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] max-w-sm mb-6 leading-relaxed">
            {activeCategory === 'favorites'
              ? 'Click the star icon on any tool card to pin your most-used Minecraft utilities here.'
              : `We could not find any tools matching "${searchQuery}". Try adjusting keywords or category filters.`}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs sm:text-sm font-semibold hover:brightness-95 active:scale-98 transition-all cursor-pointer shadow-2xs"
          >
            {activeCategory === 'favorites' ? 'Browse All Tools' : 'Clear filters'}
          </button>
        </div>
      )}
    </section>
  );
}
