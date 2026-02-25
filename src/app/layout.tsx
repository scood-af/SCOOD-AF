import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Pixelify_Sans } from 'next/font/google'
import ClickSpark from '@/components/ClickSpark'
// import StaggeredMenu from '@/components/StaggeredMenu';
import './globals.css'

// const menuItems = [
//   { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
//   { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
//   { label: 'Services', ariaLabel: 'View our services', link: '/services' },
//   { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
// ];

// const socialItems = [
//   { label: 'Twitter', link: 'https://twitter.com' },
//   { label: 'GitHub', link: 'https://github.com' },
//   { label: 'LinkedIn', link: 'https://linkedin.com' }
// ];

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
                <ClickSpark
                    sparkColor="#000"
                    sparkSize={10}
                    sparkRadius={15}
                    sparkCount={8}
                    duration={400}
                >
                    {/* <StaggeredMenu
                        position="right"
                        isFixed={true}
                        items={menuItems}
                        socialItems={socialItems}
                        displaySocials
                        displayItemNumbering={true}
                        menuButtonColor="var(--main-foreground)"
                        openMenuButtonColor="var(--foreground)"
                        changeMenuColorOnOpen={true}
                        colors={['var(--primary)', 'var(--main)']}
                        logoUrl="/path-to-your-logo.svg"
                        accentColor="var(--main)"
                    /> */}
                    <div className="min-h-screen">{children}</div>
                </ClickSpark>
            </body>
        </html>
    )
}
