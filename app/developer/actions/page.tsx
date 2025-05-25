import { Suspense } from 'react';
import ActionsManagerClient from './ActionsManagerClient';


export default function ActionsManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActionsManagerClient />
    </Suspense>
  );
} 