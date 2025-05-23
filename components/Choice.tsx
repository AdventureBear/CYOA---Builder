'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Choice as ChoiceType } from '@/app/types'

interface ChoiceProps {
  choice: ChoiceType
  onSelect: () => void
}

export function ChoiceComponent({ choice, onSelect }: ChoiceProps) {
  return (
    <Button
      onClick={onSelect}
      className="w-full justify-start text-left p-4 transition-all duration-200 bg-[#2d2d2d]/80 hover:bg-[#2d2d2d] border border-amber-900/30 backdrop-blur-sm hover:scale-[1.02]"
      variant="ghost"
    >
      <div className="flex items-center space-x-3">
        <span className="text-amber-200/90 font-runic text-lg">{choice.text}</span>
      </div>
    </Button>
  )
}