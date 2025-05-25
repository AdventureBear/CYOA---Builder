'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Choice as ChoiceType, Scene } from '@/app/types'
import { useGameStore } from '@/store/gameStore'
import { useModalStore } from '@/store/modalStore'
import InlineGameModal from './InlineGameModal'
import { ChoiceComponent } from './Choice'
import GameSidebar from './GameSidebar'
import InventoryOverlay from './InventoryOverlay'
import MapOverlay from './MapOverlay'
import AchievementsOverlay from './AchievementsOverlay'
import JournalOverlay from './JournalOverlay'
import FooterToggles from './FooterToggles'
import Breadcrumbs from './Breadcrumbs'

interface SceneProps {
  scene: Scene;
  onChoice: (choice: ChoiceType) => void
}


export default function SceneComponent({ scene, onChoice }: SceneProps) {
    

  const gameState = useGameStore((state) => state.gameState)
  const modal = useModalStore((state) => state.current())

  // const [showMenu, setShowMenu] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const descRef = useRef<HTMLDivElement>(null)
  const descTextRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // 1. Get timeOfDay from useGameStore
  const timeOfDay = useGameStore((state) => state.gameState.timeOfDay);

  // 2. Add a function to get icon and color for timeOfDay
  function getTimeOfDayStyle(timeOfDay: string) {
    switch (timeOfDay) {
      case 'morning':
        return { icon: '🌅', bg: 'bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-100', text: 'text-orange-700' };
      case 'afternoon':
        return { icon: '🌞', bg: 'bg-gradient-to-r from-blue-200 via-yellow-100 to-blue-100', text: 'text-blue-700' };
      case 'dusk':
        return { icon: '🌇', bg: 'bg-gradient-to-r from-orange-400 via-pink-300 to-purple-400', text: 'text-purple-700' };
      case 'night':
        return { icon: '🌙', bg: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-black', text: 'text-white' };
      default:
        return { icon: '⏰', bg: 'bg-gray-200', text: 'text-gray-700' };
    }
  }
  const timeStyle = getTimeOfDayStyle(timeOfDay);

  // Check if the description is actually truncated (overflows 5 lines)
  useEffect(() => {
    if (descTextRef.current && !descExpanded) {
      const el = descTextRef.current;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
      const maxHeight = lineHeight * 5.2; // 5 lines, add a small buffer
      setIsTruncated(el.scrollHeight > maxHeight + 2); // +2 for rounding
    } else {
      setIsTruncated(false);
    }
  }, [scene.description, descExpanded]);

  const choiceStack = useGameStore((state) => state.choiceStack);

  if (!scene) return <div>Scene not found.</div>

  // Scroll overlay into view when collapsing
  const handleShowLess = () => {
    setDescExpanded(false);
    setTimeout(() => {
      descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Separate choices and actions
  const choices = scene.choices || [];
  // const actions = scene.actions || [];

  // if (!mounted) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-[#3d2c1a]">
      {/* Virtual aspect ratio container */}
      <div className="relative w-full max-w-md aspect-[9/16] lg:max-w-5xl lg:aspect-auto bg-[#ece5db] shadow-lg flex flex-col lg:flex-row overflow-hidden lg:h-[75vh] rounded-2xl">
        
        {/* Main content area (left) */}
        {/* Mobile First Design */}
        <div className="flex-1 flex flex-col min-w-[320px] lg:min-w-[600px] lg:h-full overflow-y-auto pb-20 ">
         
          {/* Scene Location Bar at the top */}
          <div className={`w-full flex justify-end items-center px-4 py-2 ${timeStyle.bg} border-b-2 border-[#bfae99] font-runic ${timeStyle.text} text-base tracking-wide font-bold`}> 
            <span className="flex items-center gap-1">{timeStyle.icon} {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}</span>
          </div>

      {/* Scene & Actions including actionts image */}
      <div className=" text-[#5a4632] bg-[#ece5db]/90">
          {/* Scene location, name and description below image */}
          <div className="w-full flex flex-col items-center px-4 py-3">
            {/* Breadcrumbs above location, fixed height, small text */}
            <div className="w-full flex items-center justify-center min-h-[24px] max-h-[32px] text-xs text-[#a89b8c] mb-1 overflow-hidden">
              <Breadcrumbs />
            </div>
            {/* Scene Location - larger and bolder */}
            <div className="font-bold text-[#b35c1e] text-2xl lg:text-3xl mb-1">{scene.location}</div>
            <div className="font-bold text-2xl lg:text-2xl text-[#5a4632] font-runic truncate whitespace-nowrap mb-1">
              {scene.name}
            </div>
            {/* Scene description with fixed height for 5 lines, and Read more/Show less */}
            <div
              ref={descTextRef}
              className={`text-[#3d2c1a] text-base leading-snug mb-4 w-full ${!descExpanded ? 'line-clamp-5 min-h-[6.5em] max-h-[6.5em] overflow-hidden' : 'min-h-[6.5em] max-h-[20em] overflow-y-auto'}`}
              style={descExpanded ? {} : { maxHeight: '6.5em', minHeight: '6.5em', overflow: 'hidden' }}
            >
              {scene.description}
            </div>
            {isTruncated && !descExpanded && (
              <button
                className="mt-1 text-xs text-[#5a4632] underline hover:text-amber-700 transition"
                onClick={() => setDescExpanded(true)}
              >
                Read more
              </button>
            )}
            {isTruncated && descExpanded && (
              <button
                className="mt-1 text-xs text-[#5a4632] underline hover:text-amber-700 transition"
                onClick={handleShowLess}
              >
                Show less
              </button>
            )}
          </div>

          {/* Single, left-aligned choiceStack breadcrumb above the panel */}
          {choiceStack.length > 0 && (
            <div className="w-full flex items-center justify-start mb-2 px-4">
              <div className="text-xs text-[#bfae99] font-semibold italic">
                {choiceStack.map((c, i) => (
                  <span key={i}>
                    {i === 0 ? 'You chose: ' : ''}<span className="font-bold text-[#5a4632]">{c}</span>{i < choiceStack.length - 1 && <span> &raquo; </span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inline Game Modal */}
          <InlineGameModal />

          {/* Only show choices if there is no modal active (from the global modal store) */}
          {(!modal) && (
            <div className="flex flex-col gap-2 px-2 py-0 flex-1 overflow-y-auto">
              {/* Choices Panel for mobile */}
              <div className="bg-[#f5eee5] rounded-xl shadow-sm p-3 flex flex-col gap-2 lg:hidden">
                <div className="text-xs text-[#bfae99] font-semibold mb-1">What do you do?</div>
                {choices.map((choice, idx) => (
                  <ChoiceComponent key={idx} choice={choice} onChoice={onChoice} />
                ))}
              </div>
              {/* Desktop choices (if needed) could go here */}
            </div>
          )}

          </div>

            {/* Breadcrumbs */}
            
    <div className="absolute left-0 right-0 bottom-20 z-30 bg-[#ece5db] border-t-2 border-[#bfae99] px-4 py-2 flex lg:hidden  w-full">
      <Breadcrumbs />
    </div>


          {/* Footer toggles (mobile only) */}
          <FooterToggles
            onInventory={() => setShowInventory(true)}
            onMap={() => setShowMap(true)}
            onAchievements={() => setShowAchievements(true)}
            onJournal={() => setShowJournal(true)}
          />
        </div>
        {/* Sidebar (desktop only) */}
        <GameSidebar inventory={gameState.inventory as Record<string, number>} achievements={gameState.flags as Record<string, boolean>} />

        {/* Inventory Overlay (mobile only, inside game area) */}
        <InventoryOverlay open={showInventory} onClose={() => setShowInventory(false)} inventory={gameState.inventory as Record<string, number>} />

        {/* Map Overlay (all screens, styled modal) */}
        <MapOverlay open={showMap} onClose={() => setShowMap(false)} />

        {/* Achievements Overlay (mobile only, inside game area) */}
        <AchievementsOverlay open={showAchievements} onClose={() => setShowAchievements(false)} achievements={gameState.flags as Record<string, boolean>} />

        {/* Journal Overlay (mobile only, inside game area) */}
        <JournalOverlay open={showJournal} onClose={() => setShowJournal(false)} />
      </div>
    </div>
  )
}