'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useEffect, useState, useMemo } from 'react'
import SceneComponent from '@/components/Game/Scene'
import { useGameStore } from '@/store/gameStore'
import { runActions } from '@/engine/actionRunner'
import DeadEndScene from '@/components/Game/DeadEndScene'
import { initialGameState } from '@/lib/gameState'
import AddScene from '@/components/Dev/AddScene'
import { Scene } from '@/app/types'


// function generateScenePrompt(sceneName: string, storyMetrics: StoryMetrics, existingScenes: SceneInfo[]): string {
//   const formattedExistingScenes = existingScenes.map(scene => `${scene.id}: ${scene.name}`).join(", ");
//   const completionLikelihood = calculateCompletionLikelihood(storyMetrics);
//   const maxNewScenes = Math.max(1, Math.floor(20 - storyMetrics.totalScenes / 5)); // Decrease max new scenes as total scenes increase

//   return `Create a scene "${sceneName}" for the Viking Alignment Adventure:

// Current State:
// - Phase: ${storyMetrics.currentPhase}
// - Completion: ${storyMetrics.completionPercentage.toFixed(0)}%
// - Total Scenes: ${storyMetrics.totalScenes}

// Existing scenes: ${formattedExistingScenes}

// Instructions:
// 1. Brief setting description (50 words max)
// 2. Location in Norse world
// 3. Season and year
// 4. Story phase (PEACEFUL_BEGINNINGS, FIRST_RAIDS, EXPANSION, SETTLEMENT, CONFLICT, or RESOLUTION)
// 5. Is it required for main storyline? (true/false)
// 6. Two to four choices (Ljosbearer, Skuggasmith, Solheart, Myrkrider)

// Important:
// - You have a ${(completionLikelihood * 100).toFixed(0)}% chance to connect each choice to an existing scene.
// - You can create up to ${maxNewScenes} new scene(s) if needed.
// - Prioritize connecting to existing scenes that advance the story timeline.
// - If creating a new scene, use a descriptive name that fits the story context.

// Format:
// {
//   "id": "${sceneName}",
//   "text": "Scene description",
//   "location": "Location",
//   "season": "Season and year",
//   "storyPhase": "PHASE",
//   "isRequired": boolean,
//   "choices": [
//     {
//       "text": "Choice text",
//       "alignment": "Alignment",
//       "nextScene": "Existing scene ID or new scene name"
//     },
//     // 1 to 3 more choices
//   ]
// }

// Ensure the scene fits the Viking Age setting and advances the story.`
// }

// function formatOpenLoops(openLoops: OpenLoop[]): string {
//   if (openLoops.length === 0) {
//     return "No open loops.";
//   }
//
//   return openLoops.slice(0, 3).map((loop, index) =>
//       `Open Loop ${index + 1}: "${loop.choice.text}" (from "${loop.sceneId}")`
//   ).join('\n');
// }

// Define Scene and Action types for this file
interface Choice {
  text: string;
  nextNodeId?: string;
  nextAction?: string;
}

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { gameState, resetGame, actions, scenes, setActions, setScenes } = useGameStore()
  const [showAddScene, setShowAddScene] = useState(false);
  const searchParams = useSearchParams();
  const isPlaytest = searchParams?.get('playtest') === '1';
  const game = searchParams?.get('game') || 'cute-animals';


  // console.log('actions in component', actions);
  useEffect(() => {
    (async () => {
      try {
        const scenesRes = await fetch(`/api/listScenes?game=${game}`);
        const actionsRes = await fetch(`/api/listActions?game=${game}`);
        if (!scenesRes.ok || !actionsRes.ok) {
          throw new Error("Missing scenes or actions for this game.");
        }
        const scenesObj = await scenesRes.json();
        const actionsObj = await actionsRes.json();
        setScenes(scenesObj);
        setActions(actionsObj);
      } catch (err) {
        setScenes({});
        setActions({});
      }
    })();
  }, [game, isPlaytest, setActions, setScenes]);

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
      runActions(currentScene.actions, "onEnter", gameState, actions);
    }
  }, [currentScene, gameState, actions])

  const handleChoice = (choice: Choice) => {
    if (!currentScene) return;
    if (choice.nextAction && actions && Object.keys(actions).length > 0) {
      runActions([choice.nextAction], "onChoice", gameState, actions);
    }
    if (currentScene.actions && actions && Object.keys(actions).length > 0) {
      runActions(currentScene.actions, "onExit", gameState, actions);
    }
    if (choice.nextNodeId) {
      router.push(`/scene/${choice.nextNodeId}`);
    }
  }

  if (loading) {
    return <div style={{ color: 'white', background: '#1a1a1a', minHeight: '100vh', padding: 32 }}>Loading scene...</div>;
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