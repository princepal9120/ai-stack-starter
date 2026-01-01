import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
    title: 'AI Stack - RAG-Powered Chat',
    description: 'Production-grade AI application with retrieval-augmented generation',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className="antialiased">
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}
