import React from 'react';

interface DeadEndSceneProps {
  sceneId: string;
  onRestart: () => void;
  onWriteScene: () => void;
  onLoadSample: () => void;
}

export default function DeadEndScene({ sceneId, onRestart, onWriteScene, onLoadSample }: DeadEndSceneProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1a1a] text-amber-50 p-8">
      <h1 className="text-3xl font-bold mb-4">This part of the adventure hasn&apos;t been written yet!</h1>
      <p className="mb-8 text-lg text-center max-w-xl">
        You&apos;ve reached a scene (<span className="font-mono bg-amber-900/20 px-2 py-1 rounded">{sceneId}</span>) that doesn&apos;t exist yet. What would you like to do?
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded shadow"
          onClick={onRestart}
        >
          Restart Adventure
        </button>
        <button
          className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded shadow"
          onClick={onWriteScene}
        >
          Write this scene
        </button>
        <button
          className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded shadow"
          onClick={onLoadSample}
        >
          Load Sample Adventure
        </button>
      </div>
    </div>
  );
} 