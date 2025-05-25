/* ---------------- InventoryPanel.tsx ---------------- */
import React from 'react';
import { ItemsPanel } from './ItemsPanel';

// Placeholder for item images (can be extended later)
const ITEM_ICONS: Record<string, string> = {
  silver: '🪙',
  map: '🗺️',
  shiny_pebble: '💎',
  stick: '🪵',
  gratitude_token: '🎟️',
  helped_hedgehog: '🦔',
  helped_bird: '🐦',
  friend_beaver: '🦫',
  shoelace: '👟',
  acorn: '🌰',
  fish: '🐟',
  flower: '🌸',
  pebble: '🪨',
  backpack: '🎒',
  // Add more mappings as needed
};

const INVENTORY_SIZE = 15; // 5 columns x 3 rows

export function InventoryPanel({ inventory }: { inventory: Record<string, number>; }) {
  const items = Object.entries(inventory).map(([name, quantity]) => ({
    name,
    quantity,
  }));

  return (
    <ItemsPanel
      items={items}
      gridSize={INVENTORY_SIZE}
      defaultIcon="📦"
      icons={ITEM_ICONS}
      showQuantity={true}
    />
  );
}
  