"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Scene {
  id: string;
  location: string;
}

export default function PlaytestAdventure() {
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchScenes() {
      setLoading(true);
      const filenames = await fetch(`/api/listScenes?game=${game}`).then(res => res.json());
      const data = await Promise.all(
        filenames.map(async (filename: string) => {
          const res = await fetch(`/games/${game}/scenes/${filename}`);
          const json = await res.json();
          return { id: json.id, location: json.location };
        })
      );
      setScenes(data);
      setSelected(data[0]?.id || '');
      setLoading(false);
    }
    fetchScenes();
  }, [game]);

  function handleStart() {
    if (selected) {
      router.push(`/scene/${selected}?playtest=1&game=${game}`);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Playtest Adventure</h2>
        <Link href="/developer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>&larr; Back to Dashboard</Link>
        {loading ? (
          <div style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 20 }}>Loading scenes...</div>
        ) : (
          <>
            <div style={{ marginTop: 32 }}>
              <label htmlFor="startScene" style={{ fontWeight: 600, fontSize: 18 }}>Start from scene: </label>
              <select
                id="startScene"
                value={selected}
                onChange={e => setSelected(e.target.value)}
                style={{ marginLeft: 12, padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 16 }}
              >
                {scenes.map(scene => (
                  <option key={scene.id} value={scene.id}>{scene.location} ({scene.id})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleStart}
              style={{ marginTop: 40, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '16px 40px', fontWeight: 700, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
              disabled={!selected}
            >
              Start Playtest
            </button>
          </>
        )}
      </div>
    </div>
  );
} 