'use client'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useState } from 'react'
import { initialGameState } from '@/lib/gameState'
import Link from 'next/link'

export default function SplashScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', padding: 48, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 32, letterSpacing: 1 }}>Choose Your Own Adventure</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 24 }}>
          <Link href="/play" style={{ padding: '22px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 22, textDecoration: 'none', boxShadow: '0 2px 8px #0001', marginBottom: 8, letterSpacing: 1 }}>I am a Player</Link>
          <Link href="/developer" style={{ padding: '22px 0', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 22, textDecoration: 'none', boxShadow: '0 2px 8px #0001', letterSpacing: 1 }}>I am a Developer</Link>
        </div>
      </div>
    </div>
  )
} 