import Link from 'next/link';

const games = [
  { id: 'cute-animals', name: 'Cute Animals (Sample)' },
  { id: 'my-new-game', name: 'My New Game' },
];

export default function PlayerLandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Link href="/splash" style={{ alignSelf: 'flex-start', marginBottom: 24, color: '#2563eb', fontWeight: 600, fontSize: 18, textDecoration: 'none' }}>← Back to Home</Link>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24, letterSpacing: 1, textAlign: 'center' }}>Choose a Game to Play</h1>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {games.map(game => (
          <div key={game.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, minWidth: 280, maxWidth: 320, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: '#2563eb', textAlign: 'center' }}>{game.name}</div>
            <Link href={`/play/${game.id}`} style={{ marginTop: 18, display: 'block', background: '#2563eb', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 18, padding: '14px 0', textDecoration: 'none', textAlign: 'center', boxShadow: '0 1px 4px #0001', width: '100%' }}>Play</Link>
          </div>
        ))}
      </div>
    </div>
  );
} 