import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import PoolCard from '@/components/pool-card'

type DatingProfileType = {
    gender?: string;
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

    // 1. Fetch Current User (For the Sidebar)
    const { data: myProfile } = await supabase
        .from('profiles')
        .select(
            `
        full_name, avatar_url, role, bio, institution, likes,
        dating_profiles!inner(
            gender,
            love_language, 
            preference,
            relationship_goals
        )
    `
        )
        .eq('id', user.id)
        .single()

    // 2. Fetch The Pool
    const { data: poolUsers, error } = await supabase
        .from('profiles')
        .select(
            `
      id, full_name, avatar_url, role,
      dating_profiles!inner (
        gender, love_language, relationship_goals
      ),
      pool_memberships!inner (
        pool_type
      )
    `
        )
        .eq('pool_memberships.pool_type', 'dating')
        .neq('id', user.id)
        .limit(50)

    // Helper to get hobbies text
    const myHobbies =
        myProfile?.likes || 'Update your profile to add likes/hobby!'
    // Use 'unknown' first to safely bypass the array type conflict
    const myDating = myProfile?.dating_profiles as unknown as DatingProfileType | null | undefined;
    //   console.log(myProfile?.dating_profiles)

    return (
        // Uses h-full to respect the 100vh wrapper from layout.tsx
        <div className="h-full w-full">
            <main className="mx-auto flex h-full w-full flex-col gap-6 px-6 md:flex-row md:px-8">
                {/* --- LEFT SIDEBAR: MY PROFILE CARD --- */}
                {/* Set strictly to h-full so it doesn't push past the bottom */}
                <Card className="hidden h-full w-full shrink-0 flex-col overflow-hidden rounded-4xl border-4 border-border bg-primary shadow-shadow md:flex md:w-[320px] lg:w-87.5">
                    {/* Reduced padding from p-6 to p-5 to save vertical space */}
                    <CardHeader className="flex flex-col items-center p-5 pb-0 text-center md:items-start md:text-left">
                        {/* Shrunk the avatar! It was full width before, now it's constrained so the card fits in 100vh */}
                        <div className="relative mb-3 aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-border bg-background lg:w-40 xl:w-48">
                            <Image
                                src={
                                    myProfile?.avatar_url || '/placeholder.svg'
                                }
                                alt="Me"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Added line-clamp-1 so super long names don't break to two lines */}
                        <h2 className="line-clamp-1 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                            {myProfile?.full_name}
                        </h2>
                        <div className="text-sm font-medium tracking-tight text-foreground/80 lg:text-base">
                            {myProfile?.role || 'Student'},{' '}
                            {myProfile?.institution || 'Universitas Udayana'}
                        </div>
                        <div className="text-xs font-bold tracking-wide text-foreground/60"></div>
                    </CardHeader>

                    <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-5 text-left text-foreground">
                        <hr className="w-full border-2 border-border" />

                        <div className="flex flex-wrap gap-2">
                            {myDating?.gender && (
                                <span className="rounded-md border-2 border-border bg-main px-2 py-1 text-[10px] font-extrabold uppercase text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border">
                                    {myDating.gender}
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

                        {/* Bio Section - Tighter padding */}
                        <div className="w-full shrink-0 rounded-xl border-4 border-border bg-background p-3 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border lg:p-4">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60 lg:text-xs">
                                Bio
                            </p>
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground lg:text-base">
                                {myProfile?.bio || 'Cardiology Enthusiast'}
                            </p>
                        </div>

                        {/* Likes Section - Scaled down text slightly */}
                        <div className="mt-1 w-full shrink-0 text-left">
                            <p className="text-sm font-bold text-foreground lg:text-base">
                                Likes:
                            </p>
                            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-foreground/80 lg:text-sm">
                                {myHobbies}
                            </p>
                        </div>

                        {/* Mind Your Manner Box - mt-auto forces this to the absolute bottom of the card */}
                        <div className="mt-auto shrink-0 rounded-xl border-4 border-border bg-foreground p-3 text-center lg:p-4">
                            <p className="text-sm font-extrabold leading-tight text-background lg:text-base">
                                Please do Mind Your Manner yh :D
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* --- RIGHT CONTENT (The Grid) --- */}
                <div className="flex h-full w-full flex-1 flex-col gap-6 ">
                    {/* Header Section - shrink-0 ensures it never squishes */}
                    <div className="flex shrink-0 flex-col items-start justify-between gap-4 rounded-[2rem] border-4 border-border bg-background p-6 shadow-shadow md:flex-row md:items-center">
                        <h1 className="text-3xl font-extrabold uppercase leading-none tracking-tight text-foreground lg:text-5xl">
                            Welcome to the <br />
                            <span className="text-primary">Dating Pool!</span>
                        </h1>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            <Link
                                href="/home"
                                className="flex items-center justify-center rounded-xl border-4 border-border bg-primary px-5 py-2.5 font-extrabold uppercase tracking-wide text-foreground transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border active:translate-y-0 active:shadow-none lg:px-6 lg:py-3"
                            >
                                Home
                            </Link>
                            <button className="flex items-center justify-center rounded-xl border-4 border-border bg-foreground px-5 py-2.5 font-extrabold uppercase tracking-wide text-background transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border active:translate-y-0 active:shadow-none lg:px-6 lg:py-3">
                                Shuffle
                            </button>
                        </div>
                    </div>

                    {/* The Pool Grid - Wrapper controls the internal scroll */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-4 pb-20">
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {poolUsers?.map((person) => (
                                <PoolCard
                                    key={person.id}
                                    person={person}
                                    currentUserId={user.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
