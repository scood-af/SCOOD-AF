import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ChatList from '@/components/chat-list'
import StudyPoolClient from './client'

export default async function StudyPoolPage() {
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

    // 1. Fetch Current User (For the Sidebar & Filters)
    const { data: myProfile } = await supabase
        .from('profiles')
        .select(`
            full_name, avatar_url, role, bio, institution, likes, gender,
            study_profiles!inner(
                study_style, 
                study_topic
            )
        `)
        .eq('id', user.id)
        .single()

    const myStudy = Array.isArray(myProfile?.study_profiles) 
        ? myProfile.study_profiles[0] 
        : myProfile?.study_profiles

    // 2. Build The Pool Query dynamically
    let poolQuery = supabase
        .from('profiles')
        .select(`
            id, full_name, avatar_url, role, gender, institution, bio,
            study_profiles!inner (
                study_style, study_topic
            ),
            pool_memberships!inner (
                pool_type
            )
        `)
        .eq('pool_memberships.pool_type', 'study')
        .neq('id', user.id)

    // 3. Apply Study Style Filtering
    if (myStudy?.study_style) {
        poolQuery = poolQuery.eq('study_profiles.study_style', myStudy.study_style)
    }

    const { data: poolUsers, error } = await poolQuery.limit(50)

    if (error) {
        console.error("Error fetching pool:", error)
    }

    return (
        <StudyPoolClient
            myProfile={myProfile}
            myStudy={myStudy}
            initialPoolUsers={poolUsers || []}
            currentUserId={user.id}
            chats={
                <ChatList currentPool='study'/>
            }
        />
    )
}