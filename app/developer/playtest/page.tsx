import { Suspense } from 'react';
import PlaytestAdventureClient from './PlaytestAdventureClient';

export default function PlaytestAdventurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlaytestAdventureClient />
    </Suspense>
  );
} 