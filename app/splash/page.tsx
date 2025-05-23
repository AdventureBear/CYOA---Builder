'use client'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useState } from 'react'
import { initialGameState } from '@/lib/gameState'
import Link from 'next/link'

export default function SplashScreen() {
  const router = useRouter()
  const { resetGame, loadGame } = useGameStore()
  const [hasSave, setHasSave] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasSave(!!localStorage.getItem('cyoa-save'))
    }
  }, [])

  function handleNewGame() {
    resetGame()
    router.push(`/scene/${initialGameState.currentSceneId}`)
  }

  function handleResume() {
    loadGame('lastSaveKey') // Replace with your logic if you have multiple saves
    router.push(`/scene/${initialGameState.currentSceneId}`) // Or the saved scene
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 48, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24, letterSpacing: 1 }}>Choose Your Own Adventure</h1>
        {hasSave ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button onClick={handleResume} style={{ padding: '16px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Resume Game</button>
            <button onClick={handleNewGame} style={{ padding: '16px 0', background: '#fff', border: '2px solid #2563eb', color: '#2563eb', borderRadius: 8, fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Start New Game</button>
          </div>
        ) : (
          <button onClick={handleNewGame} style={{ padding: '16px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 18, marginBottom: 8, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Start New Game</button>
        )}
        <div style={{ marginTop: 32 }}>
          <Link href="/developer" style={{ display: 'inline-block', padding: '14px 0', background: '#22c55e', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 18, width: '100%', textDecoration: 'none', boxShadow: '0 2px 8px #0001' }}>Enter Builder Dashboard</Link>
        </div>
      </div>
    </div>
  )
} 