'use client'
import './globals.css'
import { useState } from 'react'
import { NewGameModal } from '@/components/Game/NewGameModal'
import { MenuPopover } from '@/components/Game/MenuPopover'
// import { GameModal } from '@/components/ModalComponent'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [showNewGameModal, setShowNewGameModal] = useState(false);

    return (
        <html lang="en">
        <body>
        {/* Floating menu button in the top-right corner */}
        <MenuPopover onNewGame={() => setShowNewGameModal(true)} />
        <main className="container mx-auto">
            {children}
            {/* <GameModal /> */}
        </main>
        <NewGameModal 
            isOpen={showNewGameModal} 
            onClose={() => setShowNewGameModal(false)} 
        />
       
        </body>
        </html>
    )
}