
import { useGameStore } from '@/store/gameStore';
import React from 'react'


const Breadcrumbs = () => {
    
    const breadcrumbs = useGameStore((state) => state.gameState.breadcrumbs);
    const scenes = useGameStore((state) => state.scenes);

  return (
    <nav>
      <div className="flex gap-1 text-sm justify-start ">
               {breadcrumbs.map((sceneId, idx) => (
                <div className="flex " key={sceneId}>
                    {scenes?.[sceneId]?.location || sceneId}
                    {idx < breadcrumbs.length-1 && ' »'}
                </div>
            ))}
            </div>
        
    </nav>
  )
}

export default Breadcrumbs