'use client'
import Link from 'next/link';
import { useLoadScenesAndActions } from '@/lib/useLoadScenesAndActions';

const games = [
  { id: 'cute-animals', name: 'Cute Animals (Sample)' },
  { id: 'my-new-game', name: 'My New Game' },
];

export default function DeveloperDashboard() {
  useLoadScenesAndActions();
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-2 mt-2">CYOA Game Builder</h1>
      <p className="text-lg text-slate-600 mb-6">Select a game to begin editing.</p>
      
      <div className="flex gap-6 flex-wrap mt-8">
        {games.map(game => (
          <Link key={game.id} href={`/developer/${game.id}`} className="bg-white rounded-xl shadow p-6 min-w-[220px] max-w-[260px] w-full border border-slate-200 hover:border-blue-400 hover:shadow-lg transition flex flex-col items-center mb-4">
            <div className="text-lg font-semibold text-blue-600 mb-2">{game.name}</div>
            <div className="text-slate-500 text-xs">ID: {game.id}</div>
          </Link>
        ))}
        {/* Placeholder for new game */}
        <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-6 min-w-[220px] max-w-[260px] w-full flex flex-col items-center justify-center text-slate-400 mb-4">
          <div className="text-lg font-semibold mb-2">+ New Adventure</div>
          <button className="bg-green-500 text-white rounded px-4 py-2 font-bold opacity-60 cursor-not-allowed" disabled>Coming soon</button>
        </div>
      </div>
    </div>
  );
} 