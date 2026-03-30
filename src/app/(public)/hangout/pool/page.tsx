import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HangoutPoolClient from './client'
import ChatList from '@/components/chat-list'

export default async function HangoutPoolPage() {
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

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // 1. Fetch Current User (For the Sidebar & Profile Tags)
    const { data: myProfile } = await supabase
        .from('profiles')
        .select(`
            full_name, avatar_url, role, bio, institution, likes, gender,
            hangout_profiles!inner(
                domicile, 
                topics,
                offline_open
            )
        `)
        .eq('id', user.id)
        .single()

    const myHangout = Array.isArray(myProfile?.hangout_profiles) 
        ? myProfile.hangout_profiles[0] 
        : myProfile?.hangout_profiles

    // 2. Fetch all users in the hangout pool without filtering
    const { data: poolUsers, error } = await supabase
        .from('profiles')
        .select(`
            id, full_name, avatar_url, role, gender, institution, bio,
            hangout_profiles!inner (
                domicile, topics, offline_open
            ),
            pool_memberships!inner (
                pool_type
            )
        `)
        .eq('pool_memberships.pool_type', 'hangout')
        .neq('id', user.id)
        .limit(50) // Grab up to 50 general folks for them to shuffle through

    return (
        <HangoutPoolClient 
            myProfile={myProfile}
            myHangout={myHangout}
            initialPoolUsers={poolUsers || []}
            currentUserId={user.id}
            chats={
                <ChatList />
            }
        />
    )
}