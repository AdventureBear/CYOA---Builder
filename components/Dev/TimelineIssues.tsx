'use client'
import { Scene } from '@/app/types'
import React from 'react'

interface TimelineIssuesProps {
    scenes: Scene[]
}

export function TimelineIssuesComponent({ scenes }: TimelineIssuesProps) {
    const issues = Object.values(scenes).filter(scene => {
        const [year] = scene.season.split(' ').slice(-1)
        return parseInt(year) < 793 || parseInt(year) > 1066
    })

    return (
        <ul>
            {issues.map(scene => (
                <li key={scene.id}>
                    {scene.id}: {scene.season} (outside of Viking Age: 793-1066 AD)
                </li>
            ))}
        </ul>
    )
}