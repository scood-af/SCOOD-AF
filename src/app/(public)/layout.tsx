import StaggeredMenu from '@/components/StaggeredMenu'

const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/home' },
    { label: 'Profile', ariaLabel: 'View Profile', link: '/profile' },
    { label: 'Dating Pool', ariaLabel: 'View Dating Pool', link: '/dating/pool' },
]

const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
]

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <StaggeredMenu
                position="right"
                isFixed={true}
                items={menuItems}
                socialItems={socialItems}
                displaySocials={false}
                displayItemNumbering={true}
                menuButtonColor="var(--main-foreground)"
                openMenuButtonColor="var(--foreground)"
                changeMenuColorOnOpen={true}
                colors={['var(--primary)', 'var(--main)']}
                logoUrl="/path-to-your-logo.svg"
                accentColor="var(--main)"
            />
            <div className="pt-24 md:pt-32 h-screen overflow-hidden flex flex-col pb-6">
                {children}
            </div>
        </>
    )
}
