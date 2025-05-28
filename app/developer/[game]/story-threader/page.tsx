import StoryThreader from '@/components/Dev/StoryThreader';
import Link from 'next/link';

export default function StoryThreaderPage({ params }: { params: { game: string } }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1a202c', padding: 32 }}>
      <Link href={`/developer/${params.game}`} style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500, fontSize: 18, marginBottom: 24, display: 'inline-block' }}>&larr; Back to Game Dashboard</Link>
      <StoryThreader />
    </div>
  );
} 