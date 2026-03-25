'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface BasePoolLayoutProps {
    // User Profile Data
    myProfile: {
        full_name?: string | null;
        avatar_url?: string | null;
        role?: string | null;
        institution?: string | null;
        bio?: string | null;
        likes?: string | null;
    } | null;
    
    // Customization & Theming
    sidebarTags?: React.ReactNode;
    sidebarBgClass?: string; // e.g. "bg-primary", "bg-secondary"
    titlePrefix?: string; // e.g. "Welcome to the"
    titleHighlight: string; // e.g. "Dating Pool!"
    titleHighlightClass?: string; // e.g. "text-primary"
    headerActions?: React.ReactNode; // e.g. Shuffle button
    
    // Pool Data & Render Logic
    poolUsers: any[] | null;
    renderPoolCard: (person: any) => React.ReactNode;
    chats?: React.ReactNode;
    
    // Empty State
    emptyIcon?: string;
    emptyHeading?: string;
    emptySubheading?: string;
}

export default function BasePoolLayout({
    myProfile,
    sidebarTags,
    sidebarBgClass = 'bg-primary',
    titlePrefix = 'Welcome to the',
    titleHighlight,
    titleHighlightClass = 'text-primary',
    headerActions,
    poolUsers,
    renderPoolCard,
    chats,
    emptyIcon = '🏜️',
    emptyHeading = 'The Pool is Empty',
    emptySubheading = 'No matches found for your current preferences.'
}: BasePoolLayoutProps) {
    const [mobileView, setMobileView] = useState<'pool' | 'chats'>('pool')
    const [desktopChatOpen, setDesktopChatOpen] = useState(false)

    return (
        <div className="h-full w-full">
            <main className="mx-auto flex h-full w-full flex-col gap-4 px-4 pb-4 md:flex-row md:gap-6 md:px-8 md:pb-6">
                
                {/* --- LEFT SIDEBAR: MY PROFILE CARD --- */}
                <Card className={`hidden h-full w-full shrink-0 flex-col overflow-hidden rounded-4xl border-4 border-border ${sidebarBgClass} shadow-shadow md:flex md:w-60 lg:w-87.5`}>
                    <CardHeader className="flex flex-col items-center p-5 pb-0 text-center md:items-start md:text-left">
                        <div className="relative mb-3 aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-border bg-background lg:w-40 xl:w-48">
                            <Image src={myProfile?.avatar_url || '/placeholder.svg'} alt="Me" fill className="object-cover" priority />
                        </div>
                        <h2 className="line-clamp-1 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                            {myProfile?.full_name}
                        </h2>
                        <div className="text-sm font-medium tracking-tight text-foreground/80 lg:text-base">
                            {myProfile?.role || 'Student'}, {myProfile?.institution || 'Universitas Udayana'}
                        </div>
                    </CardHeader>
                    <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-5 text-left text-foreground">
                        <hr className="w-full border-2 border-border" />
                        
                        <div className="flex flex-wrap gap-2">
                            {sidebarTags}
                        </div>
                        
                        <div className="w-full shrink-0 rounded-xl border-4 border-border bg-background p-3 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border lg:p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60 lg:text-xs">Bio</p>
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground lg:text-base">{myProfile?.bio || 'Cardiology Enthusiast'}</p>
                        </div>
                        <div className="mt-1 w-full shrink-0 text-left">
                            <p className="text-sm font-bold text-foreground lg:text-base">Likes:</p>
                            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-foreground/80 lg:text-sm">{myProfile?.likes || 'Update your profile to add likes/hobby!'}</p>
                        </div>
                        <div className="mt-auto shrink-0 rounded-xl border-4 border-border bg-foreground p-3 text-center lg:p-4">
                            <p className="text-sm font-extrabold leading-tight text-background lg:text-base">Please do Mind Your Manner yh :D</p>
                        </div>
                    </CardContent>
                </Card>

                {/* --- RIGHT CONTENT (The Grid) --- */}
                <div className="flex h-full w-full flex-1 flex-col gap-4 md:gap-6 min-h-0">
                    {/* 1. FIXED HEADER */}
                    <div className="flex shrink-0 flex-col items-start justify-between gap-4 rounded-2xl border-4 border-border bg-background p-4 shadow-shadow md:flex-row md:items-center md:rounded-[2rem] md:p-6">
                        <h1 className="text-xl font-extrabold uppercase leading-none tracking-tight text-foreground md:text-3xl lg:text-5xl">
                            {titlePrefix}{' '}
                            <span className={`block md:inline ${titleHighlightClass}`}>{titleHighlight}</span>
                        </h1>
                        <div className="flex w-full flex-row gap-2 sm:w-auto md:gap-3">
                            <Link href="/home" className={`flex flex-1 items-center justify-center rounded-lg border-4 border-border ${sidebarBgClass} px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-foreground shadow-border transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none sm:flex-none md:rounded-xl md:px-6 md:py-3 md:text-base`}>
                                Home
                            </Link>
                            {headerActions}
                        </div>
                    </div>

                    {/* MOBILE TOGGLE TABS */}
                    <div className="flex w-full shrink-0 gap-2 rounded-xl border-4 border-border bg-secondary-background p-2 shadow-shadow md:hidden">
                        <button
                            onClick={() => setMobileView('pool')}
                            className={cn(
                                "flex-1 rounded-lg border-4 px-4 py-2 text-sm font-extrabold uppercase tracking-wider transition-all",
                                mobileView === 'pool'
                                    ? "border-border bg-primary text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border"
                                    : "border-transparent bg-transparent text-muted-foreground hover:bg-black/5"
                            )}
                        >
                            Pool Grid
                        </button>
                        <button
                            onClick={() => setMobileView('chats')}
                            className={cn(
                                "flex-1 rounded-lg border-4 px-4 py-2 text-sm font-extrabold uppercase tracking-wider transition-all",
                                mobileView === 'chats'
                                    ? "border-border bg-foreground text-background shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border"
                                    : "border-transparent bg-transparent text-muted-foreground hover:bg-black/5"
                            )}
                        >
                            Chats
                        </button>
                    </div>

                    {/* 2. THE SCROLLABLE/FLEX AREA */}
                    <div className="flex-1 min-h-0 flex flex-col gap-4 md:gap-6 overflow-y-auto md:overflow-visible px-4 -mx-4 pb-8 -mb-4 md:px-0 md:mx-0 md:pb-0 md:mb-0">
                        
                        {/* CHATS SECTION */}
                        <div className={cn(
                            "shrink-0 flex-col gap-4 md:flex",
                            mobileView === 'chats' ? "flex flex-1 min-h-0" : "hidden",
                            desktopChatOpen ? "md:flex-1 md:max-h-[350px]" : "md:h-auto"
                        )}>
                            <button
                                onClick={() => setDesktopChatOpen(!desktopChatOpen)}
                                className="hidden md:flex w-full items-center justify-between rounded-2xl border-4 border-border bg-secondary-background px-5 py-3 text-lg font-extrabold uppercase tracking-wide text-foreground shadow-shadow transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none shrink-0"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-2xl">💬</span>
                                    <span>Your Chats</span>
                                </span>
                                <span className={cn("text-xl transition-transform duration-300", desktopChatOpen && "rotate-180")}>
                                    ▼
                                </span>
                            </button>
                            
                            <div className={cn(
                                "flex-1 min-h-0 overflow-hidden rounded-2xl border-4 border-border bg-background shadow-shadow flex-col",
                                mobileView === 'chats' ? "flex" : (desktopChatOpen ? "md:flex" : "hidden")
                            )}>
                                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                    {chats}
                                </div>
                            </div>
                        </div>

                        {/* POOL GRID SECTION */}
                        <div className={cn(
                            "flex-1 min-h-0 flex-col grid-cols-2",
                            mobileView === 'pool' ? "flex" : "hidden md:flex"
                        )}>
                            {poolUsers && poolUsers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 md:h-full md:auto-rows-fr">
                                    {poolUsers.map((person, index) => (
                                        <React.Fragment key={person.id || index}>
                                            {renderPoolCard(person)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-1 h-full w-full flex-col items-center justify-center rounded-2xl border-4 border-border bg-background shadow-shadow p-6 text-center">
                                    <span className="mb-2 text-4xl">{emptyIcon}</span>
                                    <h3 className="text-xl font-extrabold uppercase text-foreground md:text-2xl">
                                        {emptyHeading}
                                    </h3>
                                    <p className="font-bold text-foreground/60">
                                        {emptySubheading}
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
