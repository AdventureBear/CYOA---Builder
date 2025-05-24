import React, { useState, useEffect } from 'react'
import { Scene } from '@/data/scenes'
import { StoryPhase } from '@/app/types'

interface StoryManagerProps {
    scenes: Record<string, Scene>
    connections: { source: string; target: string }[]
    onUpdateStoryMetrics: (metrics: StoryMetrics) => void
}

interface StoryMetrics {
    openLoops: number
    closedLoops: number
    completionPercentage: number
    currentPhase: StoryPhase
}

export default function StoryManager({ scenes, connections, onUpdateStoryMetrics }: StoryManagerProps) {
    const [storyMetrics, setStoryMetrics] = useState<StoryMetrics>({
        openLoops: 0,
        closedLoops: 0,
        completionPercentage: 0,
        currentPhase: StoryPhase.PEACEFUL_BEGINNINGS,
    })

    useEffect(() => {
        const metrics = calculateStoryMetrics(scenes, connections)
        function calculateStoryMetrics(scenes: Record<string, Scene>, connections: { source: string; target: string }[]): StoryMetrics {
            const openLoops = connections.filter(conn => !scenes[conn.target]).length
            const closedLoops = connections.length - openLoops
            const totalScenes = Object.keys(scenes).length
            const completionPercentage = totalScenes > 0 ? (closedLoops / totalScenes) * 100 : 0
            const currentPhase = determineCurrentPhase(scenes)

            return {
                openLoops,
                closedLoops,
                completionPercentage,
                currentPhase,
            }
        }

        setStoryMetrics(metrics)
        onUpdateStoryMetrics(metrics)
    }, [scenes, connections, onUpdateStoryMetrics])


    function determineCurrentPhase(scenes: Record<string, Scene>): StoryPhase {
        const phaseCount = Object.values(scenes).reduce((acc, scene) => {
            acc[scene.storyPhase] = (acc[scene.storyPhase] || 0) + 1
            return acc
        }, {} as Record<StoryPhase, number>)

        const sortedPhases = Object.entries(phaseCount).sort((a, b) => b[1] - a[1])
        return sortedPhases[0][0] as StoryPhase
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Story Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-semibold">Open Loops:</p>
                    <p>{storyMetrics.openLoops}</p>
                </div>
                <div>
                    <p className="font-semibold">Closed Loops:</p>
                    <p>{storyMetrics.closedLoops}</p>
                </div>
                <div>
                    <p className="font-semibold">Completion:</p>
                    <p>{storyMetrics.completionPercentage.toFixed(2)}%</p>
                </div>
                <div>
                    <p className="font-semibold">Current Phase:</p>
                    <p>{storyMetrics.currentPhase}</p>
                </div>
            </div>
        </div>
    )
}