'use client'
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import Link from 'next/link';

const games = [
  { id: 'cute-animals', name: 'Cute Animals (Sample)' },
  { id: 'my-new-game', name: 'My New Game' },
];

// Custom hook to load scenes and actions if missing
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

export default function DeveloperDashboard() {
  useLoadScenesAndActions();
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24, letterSpacing: 1, textAlign: 'center' }}>CYOA Game Builder Dashboard</h1>
      <p style={{ fontSize: 18, color: '#334155', marginBottom: 32, textAlign: 'center' }}>Select a game to manage or create a new one.</p>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {games.map(game => (
          <Link key={game.id} href={`/developer/${game.id}`} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, minWidth: 280, maxWidth: 320, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16, textDecoration: 'none', cursor: 'pointer', transition: 'box-shadow 0.2s', color: '#1a202c' }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: '#2563eb', textAlign: 'center' }}>{game.name}</div>
          </Link>
        ))}
        {/* Placeholder for new game */}
        <div style={{ background: '#f3f4f6', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, minWidth: 280, maxWidth: 320, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '2px dashed #cbd5e1', marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>+ New Adventure</div>
          <button style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontWeight: 700, fontSize: 18, width: '100%', cursor: 'not-allowed', opacity: 0.7, marginTop: 8 }}>Coming soon</button>
        </div>
      </div>
    </div>
  );
} 