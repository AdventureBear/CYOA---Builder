import { Suspense } from 'react';
import SceneManagerClient from './SceneManagerClient';

export default function SceneManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SceneManagerClient />
    </Suspense>
  );
} 