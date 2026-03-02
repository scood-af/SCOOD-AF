import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import PoolCard from '@/components/pool-card'

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
                setAll: () => {}, // Read-only for this fetch
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

    // Extract dating preferences to use in our pool query
    // Now pulling gender directly from myProfile!
    const myDating = myProfile?.dating_profiles as unknown as DatingProfileType | null | undefined;
    const myGender = myProfile?.gender; 
    const myPreference = myDating?.preference;
    const myHobbies = myProfile?.likes || 'Update your profile to add likes/hobby!'

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

    // FILTER A: They must match MY preference (unless I am open to 'Everyone' or 'Any')
    if (myPreference && myPreference !== 'Everyone' && myPreference !== 'Any') {
        // Changed to filter the main profiles table gender
        poolQuery = poolQuery.eq('gender', myPreference);
    }

    // FILTER B: I must match THEIR preference (or they must be open to 'Everyone'/'Any')
    if (myGender) {
        poolQuery = poolQuery.or(
            `preference.eq.${myGender},preference.eq.Everyone,preference.eq.Any`, 
            { foreignTable: 'dating_profiles' }
        );
    }

    // Finally, execute the query
    const { data: poolUsers, error } = await poolQuery.limit(50)

    if (error) {
        console.error("Error fetching pool:", error)
    }

    return (
        <div className="h-full w-full">
            <main className="mx-auto flex h-full w-full flex-col gap-4 px-4 pb-4 md:flex-row md:gap-6 md:px-8 md:pb-6">
                
                {/* --- LEFT SIDEBAR: MY PROFILE CARD --- */}
                <Card className="hidden h-full w-full shrink-0 flex-col overflow-hidden rounded-4xl border-4 border-border bg-primary shadow-shadow md:flex md:w-[320px] lg:w-87.5">
                    <CardHeader className="flex flex-col items-center p-5 pb-0 text-center md:items-start md:text-left">
                        <div className="relative mb-3 aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-border bg-background lg:w-40 xl:w-48">
                            <Image
                                src={myProfile?.avatar_url || '/placeholder.svg'}
                                alt="Me"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <h2 className="line-clamp-1 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                            {myProfile?.full_name}
                        </h2>
                        <div className="text-sm font-medium tracking-tight text-foreground/80 lg:text-base">
                            {myProfile?.role || 'Student'},{' '}
                            {myProfile?.institution || 'Universitas Udayana'}
                        </div>
                    </CardHeader>

                    <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-5 text-left text-foreground">
                        <hr className="w-full border-2 border-border" />

                        <div className="flex flex-wrap gap-2">
                            {/* Updated to use myProfile.gender directly */}
                            {myProfile?.gender && (
                                <span className="rounded-md border-2 border-border bg-main px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">
                                    {myProfile.gender}
                                </span>
                            )}
                            {myDating?.preference && (
                                <span className="rounded-md border-2 border-border bg-background px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">
                                    Looking for: {myDating.preference}
                                </span>
                            )}
                            {myDating?.relationship_goals && (
                                <span className="rounded-md border-2 border-border bg-main px-2 py-1 text-[10px] font-extrabold uppercase text-secondary-background shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">
                                    {myDating.relationship_goals}
                                </span>
                            )}
                            {myDating?.love_language && (
                                <span className="rounded-md border-2 border-border bg-main/30 px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">
                                    {myDating.love_language}
                                </span>
                            )}
                        </div>

                        <div className="w-full shrink-0 rounded-xl border-4 border-border bg-background p-3 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border lg:p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60 lg:text-xs">
                                Bio
                            </p>
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground lg:text-base">
                                {myProfile?.bio || 'Cardiology Enthusiast'}
                            </p>
                        </div>

                        <div className="mt-1 w-full shrink-0 text-left">
                            <p className="text-sm font-bold text-foreground lg:text-base">
                                Likes:
                            </p>
                            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-foreground/80 lg:text-sm">
                                {myHobbies}
                            </p>
                        </div>

                        <div className="mt-auto shrink-0 rounded-xl border-4 border-border bg-foreground p-3 text-center lg:p-4">
                            <p className="text-sm font-extrabold leading-tight text-background lg:text-base">
                                Please do Mind Your Manner yh :D
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* --- RIGHT CONTENT (The Grid) --- */}
                <div className="flex h-full w-full flex-1 flex-col gap-4 md:gap-6">
                    <div className="flex shrink-0 flex-col items-start justify-between gap-4 rounded-2xl border-4 border-border bg-background p-4 shadow-shadow md:flex-row md:items-center md:rounded-[2rem] md:p-6">
                        <h1 className="text-xl font-extrabold uppercase leading-none tracking-tight text-foreground md:text-3xl lg:text-5xl">
                            Welcome to the{' '}
                            <span className="block text-primary md:inline">Dating Pool!</span>
                        </h1>

                        <div className="flex w-full flex-row gap-2 sm:w-auto md:gap-3">
                            <Link
                                href="/home"
                                className="flex flex-1 items-center justify-center rounded-lg border-4 border-border bg-primary px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-foreground shadow-border transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none sm:flex-none md:rounded-xl md:px-6 md:py-3 md:text-base"
                            >
                                Home
                            </Link>
                            <button className="flex flex-1 items-center justify-center rounded-lg border-4 border-border bg-foreground px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-background shadow-border transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none sm:flex-none md:rounded-xl md:px-6 md:py-3 md:text-base">
                                Shuffle
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pb-20 pr-2 md:pr-4">
                        {poolUsers && poolUsers.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
                                {poolUsers.map((person) => (
                                    <PoolCard
                                        key={person.id}
                                        person={person}
                                        currentUserId={user.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-background/50 p-6 text-center">
                                <span className="mb-2 text-4xl">🏜️</span>
                                <h3 className="text-xl font-extrabold uppercase text-foreground md:text-2xl">
                                    The Pool is Empty
                                </h3>
                                <p className="font-bold text-foreground/60">
                                    No matches found for your current preferences.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}