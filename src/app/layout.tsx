import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Pixelify_Sans } from 'next/font/google'
import './globals.css'

const pixelify = Pixelify_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-pixel', // This is the variable name
})

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'SCOODAF',
    description: 'Super Cool Dating App for Fakultas Kedokteratn',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${pixelify.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    )
}
