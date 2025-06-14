import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useLoadGameData(gameId: string) {
  // Select each piece of state and each action with its own hook.
  // This is the most performant and stable way to use Zustand.
  const scenes = useGameStore((state) => state.scenes);
  const actions = useGameStore((state) => state.actions);
  const loading = useGameStore((state) => state.loading);
  const error = useGameStore((state) => state.error);
  const fetchAndSetGameData = useGameStore((state) => state.fetchAndSetGameData);

  useEffect(() => {
    // The effect's dependency array is now very stable.
    if (gameId) {
      fetchAndSetGameData(gameId);
    }
  }, [gameId, fetchAndSetGameData]);

  return { scenes, actions, loading, error };
} 