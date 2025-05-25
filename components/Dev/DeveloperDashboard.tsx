'use client';

import React from 'react';
// import { allScenes } from '@/lib/scenes';
import SceneFlow from './SceneFlow';

const DeveloperDashboard = () => {
  // Calculate metrics
  // const totalScenes = Object.keys(allScenes).length;
  // const scenesByPhase = Object.values(allScenes).reduce((acc, scene) => {
  //   acc[scene.storyPhase] = (acc[scene.storyPhase] || 0) + 1;
  //   return acc;
  // }, {} as Record<StoryPhase, number>);
  // const scenesByAlignment = Object.values(allScenes).reduce((acc, scene) => {
  //   scene.choices.forEach(choice => {
  //     if (choice.alignment) {
  //       acc[choice.alignment] = (acc[choice.alignment] || 0) + 1;
  //     }
  //   });
  //   return acc;
  // }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Total Scenes</h2>
          <p className="text-4xl font-bold text-blue-600">{/* totalScenes */}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Story Phases</h2>
          <div className="space-y-2">
            {/* {Object.entries(scenesByPhase).map(([phase, count]) => (
              <div key={phase} className="flex justify-between">
                <span>{phase}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))} */}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Alignment Distribution</h2>
          <div className="space-y-2">
            {/* {Object.entries(scenesByAlignment).map(([alignment, count]) => (
              <div key={alignment} className="flex justify-between">
                <span>{alignment}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))} */}
          </div>
        </div>
      </div>

      {/* Scene Visualization */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Story Graph</h2>
        <div className="overflow-x-auto">
          <SceneFlow />
        </div>
      </div>

      {/* Scene Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Scene Details</h2>
        <div className="space-y-6">
          {/* {Object.values(allScenes).map((scene) => (
            <div key={scene.id} id={`scene-${scene.id}`} className="border-l-4 border-blue-500 pl-4 py-4">
              <h3 className="font-semibold text-lg mb-2">{scene.name}</h3>
              <p className="text-gray-700 mb-4">{scene.text}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                  {scene.storyPhase}
                </span>
                {scene.isRequired && (
                  <span className="text-sm bg-green-200 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Choices:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scene.choices.map((choice, index) => (
                    choice.nextScene && (
                      <a
                        key={index}
                        href={`#scene-${choice.nextScene}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`scene-${choice.nextScene}`)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="block p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                      >
                        <p className="font-medium">{choice.text}</p>
                        <p className="text-sm text-gray-600">→ {allScenes[choice.nextScene]?.name || 'Unknown Scene'}</p>
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;