import { Suspense } from 'react';
import ActionsManagerClient from './ActionsManagerClient';
import DeveloperNav from '@/components/Dev/DeveloperNav';


export default function ActionsManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      
      <ActionsManagerClient />
    </Suspense>
  );
} 