'use client'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en">
        <body>
        <main className="container mx-auto">
            {children}
        </main>
      
       
        </body>
        </html>
    )
}