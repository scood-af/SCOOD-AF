'use client'

import React, { useState } from 'react'
import BasePoolLayout from '@/components/base-pool-layout'
import PoolCard from '@/components/pool-card'

function fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export default function DatingPoolClient({
    myProfile,
    myDating,
    initialPoolUsers,
    currentUserId,
    chats
}: {
    myProfile: any;
    myDating: any;
    initialPoolUsers: any[];
    currentUserId: string;
    chats: React.ReactNode;
}) {
    const BATCH_SIZE = 6

    // 2. State to hold the fully shuffled "deck" of users
    const [shuffledPool, setShuffledPool] = useState(() => fisherYatesShuffle(initialPoolUsers))
    
    // 3. State to track where we are in the deck
    const [currentIndex, setCurrentIndex] = useState(0)

    // 4. Just slice the deck based on our current index
    const displayedUsers = shuffledPool.slice(currentIndex, currentIndex + BATCH_SIZE)

    const handleShuffle = () => {
        const nextIndex = currentIndex + BATCH_SIZE

        // If we still have unseen users in the deck, just deal the next batch
        if (nextIndex < shuffledPool.length) {
            setCurrentIndex(nextIndex)
        } else {
            // If we hit the bottom of the deck, reshuffle everything and start from the top!
            setShuffledPool(fisherYatesShuffle(initialPoolUsers))
            setCurrentIndex(0)
        }
    }

    return (
        <BasePoolLayout
            myProfile={myProfile}
            sidebarTags={
                <>
                    {myProfile?.gender && (
                        <span className="rounded-md border-2 border-border bg-main px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">{myProfile.gender}</span>
                    )}
                    {myDating?.preference && (
                        <span className="rounded-md border-2 border-border bg-background px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">Looking for: {myDating.preference}</span>
                    )}
                    {myDating?.relationship_goals && (
                        <span className="rounded-md border-2 border-border bg-main px-2 py-1 text-[10px] font-extrabold uppercase text-secondary-background shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">{myDating.relationship_goals}</span>
                    )}
                    {myDating?.love_language && (
                        <span className="rounded-md border-2 border-border bg-main/30 px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">{myDating.love_language}</span>
                    )}
                </>
            }
            titlePrefix="Welcome to the"
            titleHighlight="Dating Pool!"
            sidebarBgClass="bg-primary"
            titleHighlightClass="text-primary"
            headerActions={
                <button 
                    onClick={handleShuffle}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border-4 border-border bg-foreground px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-background shadow-border transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none sm:flex-none md:rounded-xl md:px-6 md:py-3 md:text-base"
                >
                    <span className="md:hidden lg:inline">🔀</span> Shuffle
                </button>
            }
            poolUsers={displayedUsers}
            renderPoolCard={(person) => (
                <PoolCard
                    person={{
                        ...person,
                        dating_profiles: Array.isArray(person.dating_profiles)
                            ? person.dating_profiles[0]
                            : person.dating_profiles
                    }}
                    currentUserId={currentUserId}
                />
            )}
            chats={chats}
        />
    )
}