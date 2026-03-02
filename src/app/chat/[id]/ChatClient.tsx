'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { ArrowLeft, Image as ImageIcon, Send, X } from 'lucide-react'
import { RetroScrollArea } from '@/components/ui/retro-scroll'

type Message = {
    id: string
    chat_id: string
    sender_id: string
    content: string
    created_at: string
    type: string
}

type MatchProfile = {
    id: string
    full_name: string
    avatar_url: string
}

type ChatClientProps = {
    chatId: string
    currentUserId: string
    matchProfile: MatchProfile
    initialMessages: Message[]
}

export default function ChatClient({
    chatId,
    currentUserId,
    matchProfile,
    initialMessages,
}: ChatClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const router = useRouter()
    const supabase = createClient()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages or when an image is selected
    useEffect(() => {
        // When using Radix ScrollArea (RetroScrollArea), the scrolling happens in the viewport element
        const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement || scrollRef.current
        if (scrollContainer)
            scrollContainer.scrollTop = scrollContainer.scrollHeight
    }, [messages, imageFile])

    // SUPABASE REALTIME HOOK
    useEffect(() => {
        const channel = supabase
            .channel(`chat_${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ephemeral_messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message
                    setMessages((prev) => {
                        // Prevent duplicates if we already optimistically added it
                        if (prev.some((msg) => msg.id === newMessage.id))
                            return prev
                        return [...prev, newMessage]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatId, supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0])
        }
    }

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!input.trim() && !imageFile) return
        if (isUploading) return

        setIsUploading(true)

        let imageUrl = ''

        // 1. Handle Image Upload First (if attached)
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop()
            const filePath = `${chatId}/${crypto.randomUUID()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('chat_images')
                .upload(filePath, imageFile)

            if (uploadError) {
                console.error('Error uploading image', uploadError)
                setIsUploading(false)
                return
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from('chat_images').getPublicUrl(filePath)

            imageUrl = publicUrl
        }

        // 2. Generate the ID we will use for BOTH client and server
        const messageId = crypto.randomUUID()
        const isImageMessage = !!imageUrl

        const newMessage = {
            id: messageId,
            chat_id: chatId,
            sender_id: currentUserId,
            content: isImageMessage ? imageUrl : input.trim(),
            type: isImageMessage ? 'image' : 'text',
            created_at: new Date().toISOString(),
        }

        // 3. Optimistic Update
        setInput('')
        setImageFile(null)
        setMessages((prev) => [...prev, newMessage])

        // 4. Push to database WITH the exact same ID attached
        const { error } = await supabase.from('ephemeral_messages').insert([
            {
                id: messageId,
                chat_id: chatId,
                sender_id: currentUserId,
                content: newMessage.content,
                type: newMessage.type,
            },
        ])

        if (error) {
            console.error('Failed to send message', error)
            setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
        }

        setIsUploading(false)
    }

    // Handles submitting via the Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="flex h-[100dvh] w-full flex-col bg-background px-2 pt-2 pb-0 font-sans md:p-8">
            {/* TOP HEADER */}
            <header className="relative z-10 flex shrink-0 items-center justify-between rounded-full border-4 border-border bg-[#FF47D6] p-2 pr-6 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border">
                <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-4 border-border bg-background">
                        <Image
                            src={matchProfile.avatar_url || '/placeholder.svg'}
                            alt={matchProfile.full_name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
                        {matchProfile.full_name}
                    </h1>
                </div>

                <button
                    onClick={() => router.push('/dating/pool')}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-border bg-background text-foreground shadow-border transition-transform hover:-translate-x-1 hover:shadow-[2px_2px_0_0_var(--tw-shadow-color)]"
                >
                    <ArrowLeft strokeWidth={4} />
                </button>
            </header>

            {/* CHAT AREA */}
            <main className="flex-1 min-h-0 -mt-12 -mb-24 z-0">
                {/* UPDATED: Removed padding from here so the viewport goes edge-to-edge. 
                    This stops the shadows from getting clipped. 
                */}
                <RetroScrollArea ref={scrollRef} className="h-full w-full">
                    
                    {/* UPDATED: Added padding inside this div instead. Added pr-6 so bubbles don't hit the custom scrollbar */}
                    <div className="flex flex-col gap-6 px-2 pb-32 pt-24 md:px-4 md:pr-6">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                            relative max-w-[85%] rounded-3xl border-4 border-border p-3 text-lg font-bold text-foreground shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border md:max-w-[75%] md:text-xl
                                            ${isMe ? 'rounded-br-sm bg-primary' : 'rounded-bl-sm bg-background'}
                                            ${msg.type === 'image' ? 'p-2' : 'px-6 py-3'} 
                                        `}
                                    >
                                        {msg.type === 'image' ? (
                                            <div className="relative aspect-square w-48 overflow-hidden rounded-2xl border-4 border-border bg-background sm:w-64">
                                                <Image
                                                    src={msg.content}
                                                    alt="Sent image"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <p className="break-words">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </RetroScrollArea>
            </main>

            {/* INPUT AREA */}
            <footer className="relative z-10 shrink-0 pt-4 pb-2 md:pb-0">
                {/* Image Preview Popup */}
                {imageFile && (
                    <div className="animate-in slide-in-from-bottom-2 absolute bottom-full right-0 mb-4 rounded-3xl border-4 border-border bg-background p-3 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border">
                        <div className="relative aspect-square w-32 overflow-hidden rounded-xl border-4 border-border">
                            <Image
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={() => setImageFile(null)}
                                className="absolute right-2 top-2 rounded-full border-2 border-border bg-foreground p-1 text-background hover:scale-110"
                            >
                                <X size={16} strokeWidth={4} />
                            </button>
                        </div>
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm">
                                <span className="font-bold">Sending...</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Attach Image Button */}
                    <label
                        className={`flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-border bg-[#A3FF47] text-foreground shadow-border transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        <ImageIcon strokeWidth={3} size={24} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </label>

                    {/* Text Input */}
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isUploading || !!imageFile} // Disable text input if image is queued
                        placeholder={
                            imageFile ? 'Image attached...' : 'Type message...'
                        }
                        className="flex-1 min-w-0 rounded-full border-4 border-border bg-background px-6 py-4 text-lg font-bold text-foreground shadow-border outline-none transition-shadow placeholder:text-foreground/50 focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] disabled:opacity-50"
                    />

                    {/* Send Button */}
                    <button
                        onClick={() => sendMessage()}
                        disabled={isUploading || (!input.trim() && !imageFile)}
                        className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-border bg-foreground text-background shadow-border transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] disabled:text-border disabled:bg-background disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        <Send strokeWidth={3} size={24} className="-ml-1" />
                    </button>
                </div>
            </footer>
        </div>
    )
}