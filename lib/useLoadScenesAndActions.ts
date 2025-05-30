import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useLoadScenesAndActions(gameId: string = 'cute-animals') {
  const scenes = useGameStore((s) => s.scenes);
  const actions = useGameStore((s) => s.actions);
  const setScenes = useGameStore((s) => s.setScenes);
  const setActions = useGameStore((s) => s.setActions);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/games/${gameId}/`);
      const { scenes, actions } = await res.json();
      setScenes(scenes);
      setActions(actions);
    }
    if (!scenes || !actions) fetchData();
  }, [gameId, scenes, actions, setScenes, setActions]);
} 