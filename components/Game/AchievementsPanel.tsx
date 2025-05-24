import React from 'react';
import { ItemsPanel } from './ItemsPanel';

const ACHIEVEMENT_ICONS: Record<string, string> = {
  helped_bird: '🐦',
  helped_hedgehog: '🦔',
  friend_beaver: '🦫',
  gratitude_token: '🎟️',
  shiny_pebble: '💎',
  // Add more as needed
};

const GRID_SIZE = 15; // Match inventory size for consistency

export function AchievementsPanel({ achievements }: { achievements: Record<string, boolean> }) {
  const items = Object.entries(achievements)
    .filter(([, earned]) => earned)
    .map(([name]) => ({ name }));

  return (
    <ItemsPanel
      items={items}
      gridSize={GRID_SIZE}
      defaultIcon="🏆"
      icons={ACHIEVEMENT_ICONS}
      showQuantity={false}
    />
  );
} 