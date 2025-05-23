import React, { useMemo } from 'react'
import { Scene } from '@/lib/scenes'
import { StoryPhase } from '@/app/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Circle } from "lucide-react"

interface OpenLoopsProps {
    scenes: Record<string, Scene>
    connections: { source: string; target: string }[]
}

const phaseColors: Record<StoryPhase, string> = {
    [StoryPhase.PEACEFUL_BEGINNINGS]: 'text-green-500',
    [StoryPhase.FIRST_VENTURES]: 'text-yellow-500',
    [StoryPhase.EXPANSION]: 'text-blue-500',
    [StoryPhase.SETTLEMENT]: 'text-purple-500',
    [StoryPhase.CONFLICT]: 'text-red-500',
    [StoryPhase.LEGACY]: 'text-gray-500',
}

export default function OpenLoopsComponent({ scenes, connections }: OpenLoopsProps) {
    const openLoops = useMemo(() => {
        const allSceneIds = new Set(Object.keys(scenes))
        const referencedScenes = new Set(connections.map(c => c.target))
        return Array.from(referencedScenes)
            .filter(id => !allSceneIds.has(id))
            .map(id => {
                const sourceScene = Object.values(scenes).find(scene =>
                    scene.choices.some(choice => choice.nextScene === id)
                )
                return {
                    id,
                    phase: sourceScene?.storyPhase || StoryPhase.PEACEFUL_BEGINNINGS,
                    status: 'Referenced but not created'
                }
            })
    }, [scenes, connections])

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">Phase</TableHead>
                    <TableHead>Scene</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {openLoops.map(({ id, phase, status }) => (
                    <TableRow key={id}>
                        <TableCell>
                            <Circle className={`h-4 w-4 ${phaseColors[phase]}`} />
                        </TableCell>
                        <TableCell>{id}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                {status}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}