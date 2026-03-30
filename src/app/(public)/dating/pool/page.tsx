import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ChatList from '@/components/chat-list'
import DatingPoolClient from './client'

// Removed gender from here since it now lives on the main profile
type DatingProfileType = {
    love_language?: string;
    preference?: string;
    relationship_goals?: string;
};

export default async function DatingPoolPage() {
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
            dating_profiles!inner(
                love_language, 
                preference,
                relationship_goals
            )
        `)
        .eq('id', user.id)
        .single()

    const myDating = myProfile?.dating_profiles as unknown as DatingProfileType | null | undefined;
    const myGender = myProfile?.gender; 
    const myPreference = myDating?.preference;

    // 2. Build The Pool Query dynamically
    let poolQuery = supabase
        .from('profiles')
        .select(`
            id, full_name, avatar_url, role, gender, institution,
            dating_profiles!inner (
                love_language, relationship_goals, preference
            ),
            pool_memberships!inner (
                pool_type
            )
        `)
        .eq('pool_memberships.pool_type', 'dating')
        .neq('id', user.id)

    if (myPreference && myPreference !== 'Everyone' && myPreference !== 'Any') {
        poolQuery = poolQuery.eq('gender', myPreference);
    }

    if (myGender) {
        poolQuery = poolQuery.or(
            `preference.eq.${myGender},preference.eq.Everyone,preference.eq.Any`, 
            { foreignTable: 'dating_profiles' }
        );
    }

    const { data: poolUsers, error } = await poolQuery.limit(50)

    if (error) {
        console.error("Error fetching pool:", error)
    }

    return (
        <DatingPoolClient
            myProfile={myProfile}
            myDating={myDating}
            initialPoolUsers={poolUsers || []}
            currentUserId={user.id}
            chats={
                <ChatList />
            }
        />
    )
}