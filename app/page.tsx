'use client';

import { useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { ExploreTools } from './components/ExploreTools';
import { Hero } from './components/Hero';
import { TOOLS } from './data/tools';
import { useFavorites } from './hooks/useFavorites';

export default function Home() {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full">
      {/* Hero Section with Interactive Server MOTD Generator Spotlight */}
      <Hero />

      {/* Complete Filterable & Searchable Active Tool Catalog */}
      <ExploreTools
        tools={TOOLS}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* About KitaMCTools Section */}
      <AboutSection />
    </div>
  );
}
