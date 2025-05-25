'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Choice as ChoiceType } from '@/app/types'

interface ChoiceProps {
  choice: ChoiceType
  onChoice: (choice: ChoiceType) => void
}

export function ChoiceComponent({ choice, onChoice }: ChoiceProps) {
  return (
    <Button
      onClick={() => onChoice(choice)}
      className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left"
      style={{lineHeight: '1.1'}}
    >
      {choice.text}
    </Button>
  )
}