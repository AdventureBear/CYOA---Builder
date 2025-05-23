'use client'
import Link from 'next/link';
import { useState } from 'react';

const games = [
  { id: 'cute-animals', name: 'Cute Animals (Sample)' },
  { id: 'my-new-game', name: 'My New Game' },
];

export default function DeveloperDashboard() {
  const [selectedGame, setSelectedGame] = useState(games[0].id);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 48, maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: 1 }}>CYOA Game Builder Dashboard</h1>
        <p style={{ fontSize: 18, color: '#334155', marginBottom: 32 }}>Select a game to manage or create a new one.</p>
        <div style={{ marginBottom: 32 }}>
          <label htmlFor="gameSelect" style={{ fontWeight: 600, fontSize: 18, marginRight: 12 }}>Game:</label>
          <select
            id="gameSelect"
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 18 }}
          >
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 32 }}>
          <li style={{ marginBottom: 16 }}>
            <Link href={`/developer/scenes?game=${selectedGame}`} style={{ display: 'block', background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 20, padding: '16px 0', textDecoration: 'none', boxShadow: '0 2px 8px #0001' }}>Scene Manager</Link>
          </li>
          <li style={{ marginBottom: 16 }}>
            <Link href={`/developer/actions?game=${selectedGame}`} style={{ display: 'block', background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 20, padding: '16px 0', textDecoration: 'none', boxShadow: '0 2px 8px #0001' }}>Action Manager</Link>
          </li>
          <li>
            <Link href={`/developer/playtest?game=${selectedGame}`} style={{ display: 'block', background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 20, padding: '16px 0', textDecoration: 'none', boxShadow: '0 2px 8px #0001' }}>Playtest Adventure</Link>
          </li>
        </ul>
        <button style={{ marginTop: 8, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 0', fontWeight: 700, fontSize: 18, width: '100%', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>+ New Adventure (coming soon)</button>
      </div>
    </div>
  );
} 