import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useLoadGameData(gameId: string) {
  const { setScenes, setActions, scenes, actions } = useGameStore();
  const loading = !scenes || !actions;
  const error = null; // We can add error handling later

  useEffect(() => {
    async function fetchGameData() {
      if (!gameId) return;
      try {
        const res = await fetch(`/api/games/${gameId}/`);
        if (!res.ok) {
          throw new Error(`Failed to fetch game data for ${gameId}`);
        }
        const { scenes, actions } = await res.json();
        setScenes(scenes);
        setActions(actions);
      } catch (e) {
        // Handle error state
        console.error(e);
      }
    }

    // Only fetch if data is not already in the store for the current game
    // This simple check might need to be more robust if you switch between games often
    if ((!scenes || !actions) && gameId) {
        fetchGameData();
    }

  }, [gameId, setScenes, setActions, scenes, actions]);

  return { scenes, actions, loading, error, setScenes, setActions };
} 