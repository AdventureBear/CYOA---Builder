'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Choice as ChoiceType, Scene } from '@/app/types'
// import { MessageBox } from './MessageBox'
import { useGameStore } from '@/store/gameStore'
import { useModalStore } from '@/store/modalStore'
// import { MenuPopover } from './MenuPopover'
import { InventoryPanel } from '@/components/Game/InventoryPanel'
import { AchievementsPanel } from '@/components/Game/AchievementsPanel'
// import { GameModal } from './ModalComponent'
import InlineGameModal from './InlineGameModal'
import { ChoiceComponent } from './Choice'

interface SceneProps {
  scene: Scene;
  onChoice: (choice: ChoiceType) => void
}

// Add a type guard for Action objects
function isActionObject(action: unknown): action is { id: string; name?: string; description?: string } {
  return typeof action === 'object' && action !== null && 'id' in action && typeof (action as { id: unknown }).id === 'string';
}

export default function SceneComponent({ scene, onChoice }: SceneProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
    

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
  const [showActions, setShowActions] = useState(false);

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

  // Check if the description is actually truncated (overflows 3 lines)
  useEffect(() => {
    if (descTextRef.current && !descExpanded) {
      const el = descTextRef.current;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
      const maxHeight = lineHeight * 3.2; // add buffer for 3 lines
      setIsTruncated(el.scrollHeight > maxHeight + 2); // +2 for rounding
    } else {
      setIsTruncated(false);
    }
  }, [scene.description, descExpanded]);

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
  const actions = scene.actions || [];

  if (!mounted) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-[#3d2c1a]">
      {/* Virtual aspect ratio container */}
      <div className="relative w-full max-w-md aspect-[9/16] lg:max-w-5xl lg:aspect-auto bg-[#ece5db] shadow-lg flex flex-col lg:flex-row overflow-hidden lg:h-[75vh] rounded-2xl">
        
        {/* Main content area (left) */}
        {/* Mobile First Design */}
        <div className="flex-1 flex flex-col min-w-[320px] lg:min-w-[600px] lg:h-full overflow-y-auto pb-20 ">
         
          {/* Scene Location Bar at the top */}
          <div className={`w-full flex justify-between items-center px-4 py-2 ${timeStyle.bg} border-b-2 border-[#bfae99] font-runic ${timeStyle.text} text-base tracking-wide`}>
            <span>{scene.location}</span>
            <span className="flex items-center gap-1">{timeStyle.icon} {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}</span>
          </div>

      {/* Scene & Actions including actionts image */}
      <div className=" text-[#5a4632] bg-[#ece5db]/90">
          {/* Scene name and description below image */}
          <div className="w-full flex flex-col items-center  px-4 py-3 border-b-2 border-[#bfae99]">
            <div className="font-bold text-2xl lg:text-2xl text-[#5a4632] font-runic truncate whitespace-nowrap mb-1">{scene.name}</div>
            
            {/* Scene description */}
            <div
              ref={descTextRef}
              className={`text-[#3d2c1a]  text-base leading-snug ${!descExpanded && "line-clamp-3"}`}
              style={descExpanded ? {} : { maxHeight: '4.2em', overflow: 'hidden' }}
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

          {/* Inline Game Modal */}
         
            <InlineGameModal />
         
           


          {/* Only show choices if there is no modal active (from the global modal store) */}
          {(!modal) && (
            <div className="flex flex-col gap-2 px-4 py-2 flex-1 overflow-y-auto">
              {choices.map((choice, idx) => (
                <ChoiceComponent key={idx} choice={choice} onChoice={onChoice} />
              ))}
            </div>
          )}

          {/* Scene modal (if present, e.g. for other modal overlays) */}
          </div>

          {/* Footer toggles (mobile only) */}
          <div className="absolute bottom-0 left-0 w-full flex justify-around py-2 border-t bg-white z-40 lg:static lg:border-t-0 lg:bg-transparent">
            <button onClick={() => setShowInventory(true)} aria-label="Inventory" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
              <span className="text-2xl">🧺</span>
              <span className="text-[10px] font-runic">Inventory</span>
            </button>
            <button onClick={() => setShowMap(true)} aria-label="Map" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
              <span className="text-2xl">🗺️</span>
              <span className="text-[10px] font-runic">Map</span>
            </button>
            <button onClick={() => setShowAchievements(true)} aria-label="Achievements" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
              <span className="text-2xl">🏆</span>
              <span className="text-[10px] font-runic">Achievements</span>
            </button>
            <button onClick={() => setShowJournal(true)} aria-label="Journal" className="flex flex-col items-center text-blue-700 text-lg focus:outline-none">
              <span className="text-2xl">📖</span>
              <span className="text-[10px] font-runic">Journal</span>
            </button>
          </div>
        </div>
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:flex flex-col w-80 min-w-[18rem] max-w-xs border-l-2 border-[#bfae99] bg-[#ece5db]/90 p-4 gap-4 overflow-y-auto lg:h-full">
          <div>
            <h2 className="text-lg font-bold mb-2">Inventory</h2>
            <InventoryPanel inventory={gameState.inventory}  />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Achievements</h2>
            <AchievementsPanel achievements={gameState.flags} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Journal</h2>
            {/* You can add more detailed journal content here if needed */}
            <div className="text-sm text-[#5a4632]">Story progress and notes...</div>
          </div>
        </aside>

        {/* Inventory Overlay (mobile only, inside game area) */}
        {showInventory && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50 lg:hidden" onClick={() => setShowInventory(false)}>
            <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={() => setShowInventory(false)}>✕</button>
              <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Inventory</h2>
              <InventoryPanel inventory={gameState.inventory} />
            </div>
          </div>
        )}

        {/* Map Overlay (all screens, styled modal) */}
        {showMap && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50" onClick={() => setShowMap(false)}>
            <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2 flex flex-col items-center" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={() => setShowMap(false)}>✕</button>
              <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Map</h2>
              <div className="mt-4 mb-4 w-3/4 aspect-square bg-gray-700 flex items-center justify-center rounded-lg">
                <span className="text-white/80">[ Map Placeholder ]</span>
              </div>
            </div>
          </div>
        )}
        {/* Achievements Overlay (mobile only, inside game area) */}
        {showAchievements && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50 lg:hidden" onClick={() => setShowAchievements(false)}>
            <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={() => setShowAchievements(false)}>✕</button>
              <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Achievements</h2>
              <AchievementsPanel achievements={gameState.flags} />
            </div>
          </div>
        )}
        {/* Journal Overlay (mobile only, inside game area) */}
        {showJournal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50 lg:hidden" onClick={() => setShowJournal(false)}>
            <div className="w-full max-w-xs sm:max-w-sm bg-[#ece5db] text-[#3d2c1a] rounded-2xl shadow-2xl p-5 sm:p-6 relative border-2 border-[#bfae99] mx-2" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
              <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition" onClick={() => setShowJournal(false)}>✕</button>
              <h2 className="text-lg font-bold mb-2 font-runic text-[#5a4632]">Journal</h2>
              <div className="text-sm text-[#5a4632]">Story progress and notes...</div>
            </div>
          </div>
        )}
        {/* Actions Modal/Popup */}
        {showActions && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1a1a1a]/50" onClick={() => setShowActions(false)}>
            <div className="w-full max-w-xs sm:max-w-sm bg-[#6b3a2c] text-[#f5e9d6] rounded-2xl shadow-2xl p-0 relative border-2 border-[#bfae99] mx-2 flex flex-col" style={{ boxShadow: '0 8px 32px 0 rgba(60,40,20,0.25), 0 1.5px 8px 0 rgba(60,40,20,0.10)' }} onClick={e => e.stopPropagation()}>
              {/* Scene Title Header */}
              <div className="w-full flex justify-between items-center px-4 py-2 bg-[#ece5db]/90 border-b-2 border-[#bfae99] font-runic text-[#5a4632] text-base tracking-wide rounded-t-2xl">
                <span>{scene.name}</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#bfae99]/20 text-[#5a4632] hover:bg-[#bfae99]/30 transition ml-2" onClick={() => setShowActions(false)}>✕</button>
              </div>
              {/* Action Description Header */}
              {actions.length > 0 && (
                <div className="flex items-start gap-2 px-4 py-3 bg-[#f5e9d6] text-[#5a4632] border-b border-[#bfae99] rounded-b-none rounded-t-2xl">
                  <span className="text-2xl mt-0.5">🗺️</span>
                  <div className="flex-1 text-sm font-semibold">
                    {/* Show the first action's description if available */}
                    {(() => {
                      const firstAction = actions[0];
                      if (isActionObject(firstAction) && typeof firstAction.description === 'string') {
                        return firstAction.description;
                      }
                      return 'Side task available!';
                    })()}
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full p-4">
                {actions.map((action, idx) => {
                  let key: string;
                  let label: string;
                  if (isActionObject(action)) {
                    key = action.id;
                    label = typeof action.name === 'string' ? action.name : String(idx);
                  } else {
                    key = String(idx);
                    label = String(action);
                  }
                  return (
                    <button
                      key={key}
                      className="w-full bg-[#f5e9d6] text-[#1a1a1a] border-2 border-[#bfae99] font-bold py-2 px-3 rounded-lg shadow hover:bg-[#e0d3b8] transition text-left"
                      // TODO: Add action handler here
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}