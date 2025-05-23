'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Choice as ChoiceType, Scene } from '@/app/types'
import Image from 'next/image'
// import { MessageBox } from './MessageBox'
import { useGameStore } from '@/store/gameStore'
import { useModalStore } from '@/store/modalStore'
// import { MenuPopover } from './MenuPopover'
import { handleModalChoice } from '@/engine/actionRunner'
import { InventoryPanel } from '@/components/InventoryPanel'
import { AchievementsPanel } from '@/components/AchievementsPanel'

interface SceneProps {
  scene: Scene;
  onChoice: (choice: ChoiceType) => void
}

export default function SceneComponent({ scene, onChoice }: SceneProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
    

  const gameState = useGameStore((state) => state.gameState)
  const modal = useModalStore((state) => state.current())

  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localImageUrl, setLocalImageUrl] = useState(scene.imageUrl)
  // const [showMenu, setShowMenu] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const descRef = useRef<HTMLDivElement>(null)
  const descTextRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

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
    }, [scene.text, descExpanded]);

  if (!scene) return <div>Scene not found.</div>



  // Fallback image URL if scene.imageUrl is undefined
  const imageUrl = localImageUrl || scene.imageUrl || 'https://placehold.co/1920x1080/2d2d2d/ffffff.png?text=Adventure+Scene'

  // Handle image upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sceneId', scene.id)
      const res = await fetch('/api/uploadSceneImage', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const { imageUrl } = await res.json()
        setLocalImageUrl(imageUrl)
      } else {
        alert('Failed to upload image')
      }
    } catch (err) {
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  // If no image, show upload UI
  const showUploader = !localImageUrl && !scene.imageUrl

  // Scroll overlay into view when collapsing
  const handleShowLess = () => {
    setDescExpanded(false);
    setTimeout(() => {
      descRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  if (!mounted) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      {/* Virtual aspect ratio container */}
      <div className="relative w-full max-w-md aspect-[9/16] lg:max-w-5xl lg:aspect-auto bg-[#ece5db] shadow-lg flex flex-col lg:flex-row overflow-hidden lg:h-[75vh]">
        {/* Main content area (left) */}
        <div className="flex-1 flex flex-col min-w-[320px] lg:min-w-[600px] lg:h-full overflow-y-auto">
          {/* Header bar with location and season/time */}
          <div className="w-full flex justify-between items-center px-4 py-2 bg-[#ece5db]/90 border-b-2 border-[#bfae99] font-runic text-[#5a4632] text-base tracking-wide">
            <span>{scene.location}</span>
            <span>{scene.season}</span>
          </div>
          {/* Scene name and description */}
          <div className="w-full flex flex-col items-center bg-[#ece5db]/90 px-4 py-3 border-b-2 border-[#bfae99]">
            <div className="font-bold text-xl lg:text-2xl text-[#5a4632] font-runic truncate whitespace-nowrap mb-1">{scene.name}</div>
            <div
              ref={descTextRef}
              className={
                descExpanded
                  ? "text-[#3d2c1a] text-base leading-snug"
                  : "text-[#3d2c1a] text-base leading-snug line-clamp-3"
              }
              style={descExpanded ? {} : { maxHeight: '4.2em', overflow: 'hidden' }}
            >
              {scene.text}
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
          {/* Scene image */}
          <div className="relative w-full aspect-video bg-[#ece5db] flex items-center justify-center">
            {showUploader ? (
              <div className="flex flex-col items-center justify-center w-full h-full bg-[#ece5db] border-8 border-dashed border-[#bfae99] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <span className="text-2xl mb-1">📷</span>
                <span className="text-base text-[#5a4632]">{uploading ? 'Uploading...' : 'Click to upload a scene image'}</span>
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={scene.name}
                fill
                style={{ objectFit: 'cover' }}
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Choices (always visible) */}
          <div className="flex flex-col gap-2 px-4 py-2 flex-1 overflow-y-auto">
            {modal ? (
              <div className="bg-[#1a1a1a]/80 border border-amber-900/30 text-amber-100 p-2 text-sm">
                <div className="font-bold text-amber-200 font-runic mb-2">{modal.description}</div>
                <div className="space-y-2">
                  {modal.choices ? (
                    modal.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleModalChoice(choice)}
                        className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-900/30 py-1 px-2 rounded-none text-left"
                      >
                        {choice.text}
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => useModalStore.getState().pop()}
                      className="w-full bg-amber-900/50 hover:bg-amber-800/50 text-amber-100 border border-amber-900/30 py-1 px-2 rounded-none text-left"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {scene.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChoice(choice)}
                    className="w-full bg-[#e0d3b8]/90 border-2 border-[#bfae99] shadow text-xs font-bold text-[#5a4632] hover:bg-[#d1c2a3] transition py-2 px-2 rounded-none text-left"
                    style={{lineHeight: '1.1'}}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Footer toggles (mobile only) */}
          <div className="flex justify-around py-2 border-t bg-white lg:hidden">
            <button onClick={() => setShowInventory(true)} className="text-blue-700">Inventory</button>
            <button onClick={() => setShowMap(true)} className="text-blue-700">Map</button>
            <button onClick={() => setShowJournal(true)} className="text-blue-700">Journal</button>
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

        {/* Inventory Overlay (mobile only) */}
        {showInventory && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col p-4 text-white overflow-auto lg:hidden">
            <h2 className="text-lg font-bold mb-2">Inventory</h2>
            <InventoryPanel inventory={gameState.inventory} />
            <button onClick={() => setShowInventory(false)} className="mt-4 self-end bg-white text-black px-4 py-1 rounded">Close</button>
          </div>
        )}

        {/* Map Overlay (all screens) */}
        {showMap && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white">
            <h2 className="text-lg font-bold">Map</h2>
            <div className="mt-4 mb-4 w-3/4 aspect-square bg-gray-700 flex items-center justify-center">
              <span>[ Map Placeholder ]</span>
            </div>
            <button onClick={() => setShowMap(false)} className="bg-white text-black px-4 py-1 rounded">Close</button>
          </div>
        )}
        {/* Journal Overlay (mobile only) */}
        {showJournal && (
          <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white p-4 overflow-auto lg:hidden">
            <h2 className="text-lg font-bold mb-2">Journal</h2>
            <AchievementsPanel achievements={gameState.flags} />
            <button onClick={() => setShowJournal(false)} className="mt-4 self-end bg-white text-black px-4 py-1 rounded">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}