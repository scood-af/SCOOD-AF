import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

// 1. Update the type to expect a Promise
type Props = {
    params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: Props) {
    // 2. Await the params to unwrap them
    const resolvedParams = await params
    const chatId = resolvedParams.id

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 3. Use the unwrapped chatId in your query
    const { data: chatData, error } = await supabase
        .from('active_chats')
        .select(`
            id,
            match_requests!inner(
                sender_id,
                receiver_id,
                sender:profiles!sender_id(id, full_name, avatar_url),
                receiver:profiles!receiver_id(id, full_name, avatar_url)
            )
        `)
        .eq('id', chatId) // <-- Updated here
        .single()

    if (error || !chatData) redirect('/dating/pool')

    const request = chatData.match_requests
    const isSender = request.sender_id === user.id
    const matchProfile = isSender ? request.receiver : request.sender

    const { data: initialMessages } = await supabase
        .from('ephemeral_messages')
        .select('*')
        .eq('chat_id', chatId) // <-- Updated here
        .order('created_at', { ascending: true })

    return (
        <ChatClient 
            chatId={chatId} // <-- Updated here
            currentUserId={user.id} 
            matchProfile={matchProfile} 
            initialMessages={initialMessages || []} 
        />
    )
}