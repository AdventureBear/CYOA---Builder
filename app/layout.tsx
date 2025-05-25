'use client'
import './globals.css'
import { useState } from 'react'
import { NewGameModal } from '@/components/Game/NewGameModal'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [showNewGameModal, setShowNewGameModal] = useState(false);

    return (
        <html lang="en">
        <body>
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