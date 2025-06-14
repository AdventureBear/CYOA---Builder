'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useEffect, useState, useMemo } from 'react'
import SceneComponent from '@/components/Game/Scene'
import { useGameStore } from '@/store/gameStore'
import { runActions } from '@/engine/actionRunner'
import DeadEndScene from '@/components/Game/DeadEndScene'
import { initialGameState } from '@/lib/gameState'
import AddScene from '@/components/Dev/AddScene'
import { Scene, Choice } from '@/app/types'
import { logEvent } from '@/lib/logger'



export default function Page() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { gameState, resetGame, actions, setActions, setLastChoice, pushChoice, resetChoiceStack } = useGameStore()
  const [showAddScene, setShowAddScene] = useState(false);
  const searchParams = useSearchParams();
  const game = searchParams?.get('game') || 'cute-animals';
  console.log('breadcrumbs', gameState.breadcrumbs);

  const scenes = useGameStore((state) => state.scenes);

  
  const setScenes = useGameStore((state) => state.setScenes);
// 
useEffect(() => {
 
  async function fetchScenes() {
    console.log('fetching scenes from within playtest');
    const res = await fetch(`/api/games/${game}/`);
    const { scenes, actions } = await res.json()
    setScenes(scenes);
    setActions(actions);
    
  };
  if (!scenes && game) fetchScenes();
 
}, [game, setScenes, setActions, scenes]);

  const loading = !scenes;
  
  const currentScene = useMemo(() => {
    if (!scenes) return undefined;
    let scene = scenes[id];
    if (!scene) {
      const possibleMatch = Object.keys(scenes).find(key => key.trim() === id.trim());
      if (possibleMatch) {
        scene = scenes[possibleMatch];
      }
    }
    return scene;
  }, [scenes, id]);

  const hasRunActions = useRef(false)
  useEffect(() => { hasRunActions.current = false }, [id])
  useEffect(() => {
    if (
      !hasRunActions.current &&
      currentScene?.actions &&
      actions &&
      Object.keys(actions).length > 0
    ) {
      hasRunActions.current = true;
      // runActions(currentScene.actions, "onEnter", gameState, actions);

      // --- call runner and catch an override -----------------
      const override = runActions(
        currentScene.actions,
        "onEnter",
        gameState,
        actions
      );
      console.log('override', override);

      // --- if a router action asked for a detour, go there ----
      if (override && override !== id) {
        useGameStore.getState().updateBreadcrumbs(override); // optional
        router.replace(`/scene/${override}`);                // swap URL
        return;                                              // stop: new scene will mount
      }


    }
  }, [currentScene, gameState, actions,id,router])

  const handleChoice = (choice: Choice) => {
    setLastChoice(choice.text);
    resetChoiceStack();
    pushChoice(choice.text);
    if (!currentScene) return;
    logEvent("choice", {
      id: currentScene.location,    
      description: choice.text
    });
    if (choice.nextAction && actions && Object.keys(actions).length > 0) {
      runActions([choice.nextAction], "onChoice", gameState, actions);
    }
    if (currentScene.actions && actions && Object.keys(actions).length > 0) {
      runActions(currentScene.actions, "onExit", gameState, actions);
    }
    if (choice.nextNodeId) {
      useGameStore.getState().updateBreadcrumbs(choice.nextNodeId);
      router.push(`/scene/${choice.nextNodeId}`);
    }
  }

  if (loading || !currentScene) {
    return <div className="min-h-screen flex items-center justify-center bg-[#ece5db] text-[#3d2c1a]">Loading...</div>;
  }
  if (!currentScene) {
    if (showAddScene) {
      return <AddScene
        sceneId={id}
        onAddScene={(scene: Scene) => {
          setShowAddScene(false);
          router.push(`/scene/${scene.id}`);
        }}
        onCancel={() => setShowAddScene(false)}
      />;
    }
    return <DeadEndScene sceneId={id} onRestart={() => { resetGame(); router.push(`/scene/${initialGameState.currentSceneId}`); }} onWriteScene={() => setShowAddScene(true)} onLoadSample={() => alert('Sample adventure loading coming soon!')} />;
  }
  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] text-amber-50">
      <SceneComponent scene={currentScene} onChoice={handleChoice} />
    </div>
  );
}