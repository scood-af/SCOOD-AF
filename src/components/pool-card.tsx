'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'

// Matches the data structure fetched in DatingPoolPage
type Person = {
    id: string
    full_name: string
    avatar_url: string
    role: string
    bio?: string
    dating_profiles: {
        gender: string
        love_language: string
        relationship_goals: string
    }[]
}

export default function PoolCard({
    person,
    currentUserId,
}: {
    person: Person
    currentUserId: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const dating = person.dating_profiles[0]

    const handleStartChat = async () => {
        setIsLoading(true)

        // 1. Check if a request already exists between you and this person
        const { data: existingRequests, error: fetchError } = await supabase
            .from('match_requests')
            .select('id, sender_id, receiver_id')
            .eq('pool_type', 'dating')

        // Find if any request involves both users
        const existingRequest = existingRequests?.find(
            (r) => r.sender_id === person.id || r.receiver_id === person.id
        )

        let requestId = existingRequest?.id

        // 2. If no request exists, create one
        if (!requestId) {
            const { data: requestData, error: requestError } = await supabase
                .from('match_requests')
                .insert({
                    sender_id: currentUserId,
                    receiver_id: person.id,
                    pool_type: 'dating',
                    status: 'accepted',
                })
                .select()
                .single()

            if (requestError || !requestData) {
                console.error('Failed to create request:', requestError)
                setIsLoading(false)
                return
            }
            requestId = requestData.id
        }

        // 3. Check if an active chat room already exists for this request
        const { data: existingChat } = await supabase
            .from('active_chats')
            .select('id')
            .eq('request_id', requestId)
            .maybeSingle()

        let chatId = existingChat?.id

        // 4. If no chat room exists, create one
        if (!chatId) {
            const { data: chatData, error: chatError } = await supabase
                .from('active_chats')
                .insert({
                    request_id: requestId,
                })
                .select()
                .single()

            if (chatError || !chatData) {
                console.error('Failed to create chat room:', chatError)
                setIsLoading(false)
                return
            }
            chatId = chatData.id
        }

        // 5. Route to the chat!
        router.push(`/chat/${chatId}`)
    }

    return (
        <>
            {/* THE CARD (Triggers the Modal) */}
            <div
                onClick={() => setIsOpen(true)}
                className="group flex cursor-pointer overflow-hidden rounded-4xl border-4 border-border bg-primary shadow-shadow transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_var(--tw-shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none"
            >
                {/* Avatar Left */}
                <div className="relative w-2/5 shrink-0 border-r-4 border-border bg-background md:w-1/3">
                    <Image
                        src={person.avatar_url || '/placeholder.svg'}
                        alt={person.full_name || 'User'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>

                {/* Info Right */}
                <div className="flex flex-1 flex-col justify-center gap-3 p-4 md:p-5">
                    <div>
                        <h3 className="text-xl font-extrabold leading-none tracking-tight text-foreground lg:text-2xl">
                            {person.full_name}
                        </h3>
                        <p className="mt-1 text-xs font-extrabold uppercase text-foreground/70 lg:text-sm">
                            {person.role || 'FK Udayana'}
                        </p>
                    </div>

                    <hr className="w-full border-2 border-border" />

                    <div className="flex flex-wrap gap-2">
                        {dating?.gender && (
                            <span className="rounded-md border-2 border-border bg-background px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border lg:text-[11px]">
                                {dating.gender}
                            </span>
                        )}
                        {dating?.relationship_goals && (
                            <span className="rounded-md border-2 border-border bg-background px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border lg:text-[11px]">
                                {dating.relationship_goals}
                            </span>
                        )}
                        {dating?.love_language && (
                            <span className="rounded-md border-2 border-border bg-background px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border lg:text-[11px]">
                                {dating.love_language}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* THE MODAL OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
                    {/* Click outside to close */}
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-primary p-6 shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-border animate-in fade-in zoom-in-95 duration-200">
                        {/* Top Profile Strip */}
                        <div className="mb-4 flex gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-4 border-border bg-background">
                                <Image
                                    src={
                                        person.avatar_url || '/placeholder.svg'
                                    }
                                    alt={person.full_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-2xl font-extrabold text-foreground">
                                    {person.full_name}
                                </h2>
                                <p className="text-sm font-bold text-foreground/70">
                                    {person.role || 'FK Udayana'}
                                </p>
                            </div>
                        </div>

                        {/* Bio Text */}
                        <p className="mb-8 text-base font-bold leading-snug text-foreground">
                            {person.bio ||
                                `Halo aku ${person.full_name}! Salam kenal!`}
                        </p>

                        {/* Action Button */}
                        <button
                            onClick={handleStartChat}
                            disabled={isLoading}
                            className="w-full rounded-full border-4 border-border bg-background py-3 text-xl font-extrabold uppercase tracking-widest text-foreground transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border active:translate-y-0 active:shadow-none disabled:opacity-50"
                        >
                            {isLoading ? '...' : 'START NGOBROL?'}
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
