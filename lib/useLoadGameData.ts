import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useLoadGameData(gameId: string) {
  const { scenes, actions, setScenes, setActions } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/game/${gameId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch game data: ${response.statusText}`);
            }
            const { scenes, actions } = await response.json();
            setScenes(scenes);
            setActions(actions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [gameId, setScenes, setActions]);

  return { scenes, actions, loading, error, setScenes, setActions };
} 