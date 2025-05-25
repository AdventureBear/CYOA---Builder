import Link from 'next/link';
import { notFound } from 'next/navigation';

const games = [
  { id: 'cute-animals', name: 'Cute Animals (Sample)' },
  { id: 'my-new-game', name: 'My New Game' },
];

export default function GameLandingPage({ params }: { params: { game: string } }) {
  const game = games.find(g => g.id === params.game);
  if (!game) return notFound();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Link href="/developer" style={{ alignSelf: 'flex-start', marginBottom: 24, color: '#2563eb', fontWeight: 600, fontSize: 18, textDecoration: 'none' }}>← Back to All Games</Link>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 48, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, letterSpacing: 1 }}>{game.name}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
          <Link href={`/developer/scenes?game=${game.id}`} style={{ padding: '18px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 20, textDecoration: 'none', boxShadow: '0 2px 8px #0001', letterSpacing: 1 }}>Scene Manager</Link>
          <Link href={`/developer/actions?game=${game.id}`} style={{ padding: '18px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 20, textDecoration: 'none', boxShadow: '0 2px 8px #0001', letterSpacing: 1 }}>Action Manager</Link>
          <Link href={`/developer/playtest?game=${game.id}`} style={{ padding: '18px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 20, textDecoration: 'none', boxShadow: '0 2px 8px #0001', letterSpacing: 1 }}>Playtest</Link>
        </div>
      </div>
    </div>
  );
} 