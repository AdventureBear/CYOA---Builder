'use client';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';

export default function PlaytestAdventureClient() {
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';
  const scenes = useGameStore((state) => state.scenes);
  const scenesArray = useMemo(() => scenes ? Object.values(scenes) : [], [scenes]);
  const [selected, setSelected] = useState('');
  const router = useRouter();
  const setScenes = useGameStore((state) => state.setScenes);
  const setActions = useGameStore((state) => state.setActions);
  const setBreadcrumbs = useGameStore((state) => state.updateBreadcrumbs);

  useEffect(() => {
    async function fetchScenes() {
      const res = await fetch(`/api/games/${game}/`);
      const { scenes, actions } = await res.json();
      setScenes(scenes);
      setActions(actions);
    }
    if (game) fetchScenes();
  }, [game, setScenes, setActions]);

  // Set default selected scene when scenes are loaded
  useEffect(() => {
    if (scenesArray.length > 0 && !selected) {
      setSelected(scenesArray[0].id);
      setBreadcrumbs(scenesArray[0].id);
    }
  }, [scenesArray, selected, setBreadcrumbs]);

  function handleStart(selected: string) {
    if (selected) {
      setBreadcrumbs(selected);
      router.push(`/scene/${selected}?playtest=1&game=${game}`);
    }
  }

  if (!scenes) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Playtest Adventure</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        <div style={{ marginTop: 32 }}>
          <label htmlFor="startScene" style={{ fontWeight: 600, fontSize: 18 }}>Start from scene: </label>
          <select
            id="startScene"
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ marginLeft: 12, padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16 }}
          >
            {Object.values(scenes).map(scene => (
              <option key={scene.id} value={scene.id}>{scene.location} ({scene.id})</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => handleStart(selected)}
          style={{ marginTop: 40, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '16px 40px', fontWeight: 700, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
        >
          Start Playtest
        </button>
      </div>
    </div>
  );
} 