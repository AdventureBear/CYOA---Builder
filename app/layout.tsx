'use client'
import './globals.css'
import Toaster from '../components/ui/toaster'

export default function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en">
        <body>
        <main className="w-full min-h-screen">
            {children}
        </main>
        <Toaster />
        </body>
        </html>
    )
}