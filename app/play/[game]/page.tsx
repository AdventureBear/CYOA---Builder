"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlayGamePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/scene/forest_clearing');
  }, [router]);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <Link href="/play" style={{ alignSelf: 'flex-start', marginBottom: 24, color: '#2563eb', fontWeight: 600, fontSize: 18, textDecoration: 'none' }}>← Back to All Games</Link>
      <div style={{ fontSize: 22, color: '#64748b' }}>Loading...</div>
    </div>
  );
} 