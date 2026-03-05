import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

export default async function ChatList() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!, // Use ANON_KEY, not PUBLISHABLE (Publishable is for Clerk/Stripe)
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Fetch Active Chats, Match Requests (to find the partner), and Messages
    // RLS policies guarantee this will ONLY return chats where the user is the sender or receiver
    const { data: activeChats, error: chatsError } = await supabase
        .from('active_chats')
        .select(`
            id,
            created_at,
            match_requests!inner(
                sender_id,
                receiver_id,
                sender:profiles!sender_id(id, full_name, avatar_url),
                receiver:profiles!receiver_id(id, full_name, avatar_url)
            ),
            ephemeral_messages(
                content,
                created_at,
                sender_id
            )
        `)

    if (chatsError) {
        console.error('Error fetching chats:', chatsError)
        return (
            <div className="p-4 text-center text-sm text-red-500">
                Unable to load chats.
            </div>
        )
    }

    if (!activeChats || activeChats.length === 0) {
        return (
            <div className="flex w-full flex-col gap-2">
                <Card className="border-4 border-border bg-background shadow-sm">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p className="font-extrabold uppercase">No active chats found.</p>
                        <p className="mt-1 text-xs font-bold">Start matching to connect with others!</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 2. Process and map the raw database data to our UI
    const chats = activeChats.map((chat: any) => {
        const request = chat.match_requests
        const isSender = request.sender_id === user.id
        
        // Figure out who the "partner" is
        const partner = isSender ? request.receiver : request.sender

        const messages = chat.ephemeral_messages || []
        
        // Sort messages by date descending to get the latest one
        const lastMessage = messages.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        // Use the last message time for sorting, fallback to chat creation time
        const sortTime = lastMessage 
            ? new Date(lastMessage.created_at).getTime() 
            : new Date(chat.created_at).getTime()

        return {
            id: chat.id,
            partnerName: partner?.full_name || 'Unknown User',
            partnerAvatar: partner?.avatar_url,
            lastMessage: lastMessage?.content || 'No messages yet...',
            lastMessageTime: lastMessage?.created_at,
            isMe: lastMessage?.sender_id === user.id,
            sortTime
        }
    })
    
    // Sort the list so the most recently active chats are at the top
    .sort((a, b) => b.sortTime - a.sortTime)

    return (
        <div className="flex w-full flex-col gap-3">
            {chats.map((chat) => (
                <Link key={chat.id} href={`/chat/${chat.id}`} className="group block">
                    <Card className="overflow-hidden rounded-2xl border-4 border-border bg-background shadow-shadow transition-all group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-4 border-border bg-muted">
                                <Image
                                    src={chat.partnerAvatar || '/placeholder.svg'}
                                    alt={chat.partnerName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="mb-0.5 flex items-baseline justify-between">
                                    <span className="truncate text-sm font-extrabold text-foreground md:text-base">
                                        {chat.partnerName}
                                    </span>
                                    {chat.lastMessageTime && (
                                        <span className="shrink-0 text-[10px] font-bold uppercase text-muted-foreground">
                                            {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-xs font-bold text-muted-foreground md:text-sm">
                                    {chat.isMe && <span className="text-primary">You: </span>}
                                    {chat.lastMessage}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}