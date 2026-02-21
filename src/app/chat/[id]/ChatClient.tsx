'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { ArrowLeft } from 'lucide-react'

type Message = { 
    id: string; 
    chat_id: string;
    sender_id: string; 
    content: string; 
    created_at: string;
    type: string;
}

type MatchProfile = {
    id: string;
    full_name: string;
    avatar_url: string;
}

type ChatClientProps = {
    chatId: string;
    currentUserId: string;
    matchProfile: MatchProfile;
    initialMessages: Message[];
}

export default function ChatClient({ chatId, currentUserId, matchProfile, initialMessages }: ChatClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState('')
    const router = useRouter()
    const supabase = createClient()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages])

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
                    filter: `chat_id=eq.${chatId}` 
                },
                (payload) => {
                    const newMessage = payload.new as Message
                    setMessages((prev) => {
                        // Prevent duplicates if we already optimistically added it
                        if (prev.some((msg) => msg.id === newMessage.id)) return prev
                        return [...prev, newMessage]
                    })
                }
            )
            .subscribe()

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatId, supabase])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        // Temporary optimistic message
        const optimisticId = crypto.randomUUID()
        const newMessage = {
            id: optimisticId,
            chat_id: chatId,
            sender_id: currentUserId,
            content: input.trim(),
            type: 'text',
            created_at: new Date().toISOString()
        }

        setInput('') // Clear input instantly
        setMessages(prev => [...prev, newMessage]) // Show on screen instantly

        // Push to database
        const { error } = await supabase.from('ephemeral_messages').insert([{
            chat_id: chatId,
            sender_id: currentUserId,
            content: newMessage.content,
            type: 'text'
        }])

        if (error) {
            console.error("Failed to send message", error)
            // Optional: You could remove the optimistic message here if it fails
        }
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background p-4 font-sans md:p-8">
            
            {/* TOP HEADER (Pink Accent maintained for Pop style) */}
            <header className="flex shrink-0 items-center justify-between rounded-full border-4 border-border bg-[#FF47D6] p-2 pr-6 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border">
                <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-4 border-border bg-background">
                        <Image src={matchProfile.avatar_url || '/placeholder.svg'} alt={matchProfile.full_name} fill className="object-cover" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
                        {matchProfile.full_name}
                    </h1>
                </div>
                
                <button 
                    onClick={() => router.push('/dating/pool')}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-border bg-background text-foreground transition-transform hover:-translate-x-1 hover:shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border"
                >
                    <ArrowLeft strokeWidth={4} />
                </button>
            </header>

            {/* CHAT AREA */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-8 scrollbar-hide">
                <div className="flex flex-col gap-6">
                    {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId
                        return (
                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    relative max-w-[75%] rounded-3xl border-4 border-border px-6 py-3 text-lg font-bold text-foreground shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border md:text-xl
                                    ${isMe ? 'bg-primary rounded-br-sm' : 'bg-background rounded-bl-sm'}
                                `}>
                                    {msg.content}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* INPUT AREA */}
            <footer className="shrink-0 pt-4">
                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="type message..."
                        className="w-full rounded-full border-4 border-border bg-background px-6 py-4 text-lg font-bold text-foreground placeholder-foreground/50 outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                    />
                    <button type="submit" className="hidden" />
                </form>
            </footer>

        </div>
    )
}