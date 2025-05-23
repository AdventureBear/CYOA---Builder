'use client'

import React from 'react'
import { Alignment } from '@/app/types'

interface AlignmentTrackerProps {
  alignmentScores: Record<Alignment, number>
}

export function AlignmentTrackerComponent({ alignmentScores }: AlignmentTrackerProps) {
  const totalChoices = Object.values(alignmentScores).reduce((sum, val) => sum + val, 0);

  const getDominantAlignment = (): Alignment => {
    return Object.entries(alignmentScores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as Alignment
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Your Alignment:</h3>
      <p>Dominant Alignment: {getDominantAlignment()}</p>
      <div className="grid grid-cols-2 gap-4">
        {(Object.entries(alignmentScores) as [Alignment, number][]).map(([alignment, score]) => {
          const percent = totalChoices > 0 ? Math.round((score / totalChoices) * 100) : 0;
          return (
            <div key={alignment}>
              <p className="font-semibold flex justify-between">
                <span>{alignment}</span>
                <span>{percent}%</span>
              </p>
              <div style={{ width: percent + '%', height: 10, background: 'blue', borderRadius: 4 }} />
            </div>
          );
        })}
      </div>
    </div>
  )
}