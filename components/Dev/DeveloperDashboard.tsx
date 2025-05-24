'use client';

import React, { useEffect, useRef } from 'react';
import { allScenes } from '@/lib/scenes';
import { StoryPhase } from '@/app/types';
import * as d3 from 'd3';
import * as d3dag from 'd3-dag';
import SceneFlow from './SceneFlow';

const PHASE_COLORS: Record<string, string> = {
  PEACEFUL_BEGINNINGS: '#4CAF50',
  FIRST_VENTURES: '#FFC107',
  EXPANSION: '#2196F3',
  CONFLICT: '#E57373',
  SETTLEMENT: '#9C27B0',
  LEGACY: '#795548',
};

interface DagSceneNode {
  id: string;
  name: string;
  phase: StoryPhase;
  parentIds: string[];
}

type DagNodeDatum = {
  x: number;
  y: number;
  data: DagSceneNode;
};

type DagLinkDatum = {
  source: DagNodeDatum;
  target: DagNodeDatum;
};

const nodeRadius = 18;

const DeveloperDashboard = () => {
  // const dagRef = useRef<HTMLDivElement>(null);

  // Calculate metrics
  const totalScenes = Object.keys(allScenes).length;
  const scenesByPhase = Object.values(allScenes).reduce((acc, scene) => {
    acc[scene.storyPhase] = (acc[scene.storyPhase] || 0) + 1;
    return acc;
  }, {} as Record<StoryPhase, number>);
  const scenesByAlignment = Object.values(allScenes).reduce((acc, scene) => {
    scene.choices.forEach(choice => {
      if (choice.alignment) {
        acc[choice.alignment] = (acc[choice.alignment] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // // Prepare DAG data for d3-dag
  // const getDagData = (): DagSceneNode[] => {
  //   const nodes = Object.values(allScenes).map(scene => ({
  //     id: scene.id,
  //     name: scene.name,
  //     phase: scene.storyPhase,
  //     parentIds: [] as string[],
  //   }));
  //   const nodeMap = new Map(nodes.map(n => [n.id, n]));
  //   Object.values(allScenes).forEach(scene => {
  //     scene.choices.forEach(choice => {
  //       if (choice.nextScene) {
  //         const target = nodeMap.get(choice.nextScene);
  //         if (target) {
  //           target.parentIds.push(scene.id);
  //         }
  //       }
  //     });
  //   });
  //   return nodes;
  // };

  // Get unique phases for legend and background bands
  // const dagData = getDagData();
  // const uniquePhases: string[] = Array.from(new Set(dagData.map((d) => d.phase)));

  // useEffect(() => {
  //   if (!dagRef.current) return;
  //   d3.select(dagRef.current).selectAll('*').remove();

  //   const builder = d3dag.graphStratify();
  //   const graph = builder(dagData);

  //   // Use layeringSimplex and a larger vertical gap
  //   const layout = d3dag.sugiyama()
  //     .nodeSize([nodeRadius * 2, nodeRadius * 2])
  //     .gap([nodeRadius, 100])
  //     .layering(d3dag.layeringSimplex());
  //   layout(graph);

  //   const width = 1200;
  //   const height = 900;
  //   const svg = d3.select(dagRef.current)
  //     .append('svg')
  //     .attr('width', width)
  //     .attr('height', height);

  //   // Add drop shadow filter
  //   const defs = svg.append('defs');
  //   const filter = defs.append('filter')
  //     .attr('id', 'drop-shadow')
  //     .attr('height', '130%');
  //   filter.append('feDropShadow')
  //     .attr('dx', 0)
  //     .attr('dy', 2)
  //     .attr('stdDeviation', 3)
  //     .attr('flood-color', '#000')
  //     .attr('flood-opacity', 0.2);

  //   // Draw links
  //   svg.append('g')
  //     .selectAll('path')
  //     .data(graph.links() as Iterable<DagLinkDatum>)
  //     .enter()
  //     .append('path')
  //     .attr('d', (d: DagLinkDatum) =>
  //       `M${d.source.x},${d.source.y}C${(d.source.x + d.target.x) / 2},${d.source.y} ${(d.source.x + d.target.x) / 2},${d.target.y} ${d.target.x},${d.target.y}`
  //     )
  //     .attr('stroke', (d: DagLinkDatum) => PHASE_COLORS[d.source.data.phase] || '#999')
  //     .attr('stroke-width', 2)
  //     .attr('fill', 'none')
  //     .attr('opacity', 0.7);

  //   // Draw nodes
  //   const node = svg.append('g')
  //     .selectAll('g')
  //     .data(graph.nodes() as Iterable<DagNodeDatum>)
  //     .enter()
  //     .append('g')
  //     .attr('transform', (d: DagNodeDatum) => `translate(${d.x},${d.y})`);

  //   node.append('circle')
  //     .attr('r', nodeRadius)
  //     .attr('fill', (d: DagNodeDatum) => PHASE_COLORS[d.data.phase] || '#888')
  //     .attr('filter', 'url(#drop-shadow)');

  //   node.append('text')
  //     .attr('x', nodeRadius + 10)
  //     .attr('y', 0)
  //     .attr('text-anchor', 'start')
  //     .attr('alignment-baseline', 'middle')
  //     .style('font-size', '15px')
  //     .style('font-weight', 'bold')
  //     .style('fill', '#222')
  //     .text((d: DagNodeDatum) => d.data.name);

  //   // Add phase labels as background bands
  //   uniquePhases.forEach((phase, i) => {
  //     svg.append('rect')
  //       .attr('x', 0)
  //       .attr('y', (height / uniquePhases.length) * i)
  //       .attr('width', width)
  //       .attr('height', height / uniquePhases.length)
  //       .attr('fill', PHASE_COLORS[phase] || '#eee')
  //       .attr('opacity', 0.07)
  //       .lower();
  //     svg.append('text')
  //       .attr('x', 10)
  //       .attr('y', (height / uniquePhases.length) * i + 30)
  //       .text(phase)
  //       .style('font-size', '18px')
  //       .style('fill', PHASE_COLORS[phase] || '#888')
  //       .style('font-weight', 'bold')
  //       .attr('opacity', 0.5);
  //   });
  // }, [dagData, uniquePhases]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Total Scenes</h2>
          <p className="text-4xl font-bold text-blue-600">{totalScenes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Story Phases</h2>
          <div className="space-y-2">
            {Object.entries(scenesByPhase).map(([phase, count]) => (
              <div key={phase} className="flex justify-between">
                <span>{phase}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Alignment Distribution</h2>
          <div className="space-y-2">
            {Object.entries(scenesByAlignment).map(([alignment, count]) => (
              <div key={alignment} className="flex justify-between">
                <span>{alignment}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
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
          {Object.values(allScenes).map((scene) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;