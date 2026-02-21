import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default async function Homepage() {
    // 1. Setup Supabase Server Client
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // internal nextjs stuff
                    }
                },
            },
        }
    )

    // 2. Get Current User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        // Middleware should catch this, but just in case.
        redirect('/auth/login')
    }

    // 3. Fetch Profile Data + Hangout Hobbies (for the "Likes" section)
    // We use !inner join to ensure we only get profiles that exist.
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(
            `
        full_name,
        avatar_url,
        role,
        bio
    `
        )
        .eq('id', user.id)
        .single()

    console.log(profile)

    if (error || !profile) {
        // In a real app, redirect to an onboarding page here if profile is missing
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl font-bold text-red-500">
                    404! Error loading profile data.
                </p>
            </div>
        )
    }

    // Format Hobbies/Likes based on what we fetched
    // hangout_profiles is an array because of the join, even though it's 1-to-1.
    const likesText =
        profile.hangout_profiles && profile.hangout_profiles[0]?.hobbies
            ? profile.hangout_profiles[0].hobbies
            : 'Update your profile to add likes!'

    // Format Role (capitalize first letter)
    const formattedRole =
        profile.role.charAt(0).toUpperCase() + profile.role.slice(1)

    return (
        // Main container ignoring navbar height
        <main className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center gap-8 p-4 md:flex-row md:items-stretch">
            {/* --- LEFT COLUMN: PROFILE CARD --- */}
            {/* We use custom Tailwind classes to match the thick border/shadow design */}
            <Card className="w-full max-w-sm shrink-0 overflow-hidden rounded-[2rem] border-4 border-border bg-primary shadow-shadow">
                <CardHeader className="flex flex-col items-center p-6 pb-2">
                    {/* Avatar Image Container with Border */}
                    <div className="relative mb-4 h-48 w-48 overflow-hidden rounded-2xl border-4 border-border">
                        <Image
                            src={profile.avatar_url || '/placeholder.svg'} // Fallback if no avatar
                            alt={profile.full_name || 'User'}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Name */}
                    <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                        {profile.full_name || 'Anon User'}
                    </h2>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-6 pt-2 text-center text-foreground">
                    {/* Role / Tagline */}
                    <div>
                        <span className="rounded-full border-2 border-border bg-chart-1 px-4 py-1 text-sm font-bold">
                            {formattedRole} Enthusiast
                        </span>
                    </div>

                    {/* Likes Section */}
                    <div className="mt-2 w-full rounded-xl border-2 border-border bg-chart-1/50 p-3 text-left">
                        <p className="font-bold">Likes:</p>
                        <p className="text-sm font-medium leading-tight">
                            {likesText}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* --- RIGHT COLUMN: ACTIONS --- */}
            <div className="flex w-full max-w-2xl flex-col justify-between gap-6">
                {/* The Prompt Box */}
                <div className="flex min-h-[180px] items-center justify-center rounded-[2rem] border-4 border-border bg-primary p-8 text-center shadow-shadow">
                    <h1 className="text-3xl font-extrabold text-foreground md:text-5xl">
                        "What are you in the mood for?"
                    </h1>
                </div>

                {/* The Three Action Buttons Grid */}
                <div className="grid flex-1 grid-cols-3 gap-4">
                    {/* Hangout Link */}
                    <Link
                        href="/pools/hangout"
                        className="group relative flex aspect-square w-full items-end overflow-hidden rounded-3xl border-4 border-border bg-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-y-0 active:shadow-none"
                    >
                        {/* Replace with your actual Minecraft chicken image */}
                        <Image
                            src="/placeholder.svg"
                            alt="Hangout"
                            fill
                            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        />
                        <div className="absolute bottom-0 w-full bg-foreground/50 p-2 text-center backdrop-blur-sm">
                            <span className="text-xl font-extrabold text-background">
                                Hangout
                            </span>
                        </div>
                    </Link>

                    {/* Date Link */}
                    <Link
                        href="/dating/intro" 
                        className="group relative flex aspect-square w-full items-end overflow-hidden rounded-3xl border-4 border-border bg-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-y-0 active:shadow-none"
                    >
                        {/* Replace with holding hands image */}
                        <Image
                            src="/placeholder.svg"
                            alt="Date"
                            fill
                            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        />
                        <div className="absolute bottom-0 w-full bg-foreground/50 p-2 text-center backdrop-blur-sm">
                        <span className="text-xl font-extrabold text-background">Date.</span>
                        </div>
                    </Link>

                    {/* Study Buddy Link */}
                    <Link
                        href="/pools/study"
                        className="group relative flex aspect-square w-full items-end overflow-hidden rounded-3xl border-4 border-border bg-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-y-0 active:shadow-none"
                    >
                        {/* Replace with typing image */}
                        <Image
                            src="/placeholder.svg"
                            alt="Study Buddy"
                            fill
                            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        />
                        <div className="absolute bottom-0 w-full bg-foreground/50 p-2 text-center backdrop-blur-sm">
                            <span className="text-xl font-extrabold leading-tight text-background">
                                Study Buddy
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className='h-100vh'>
                Hello
            </div>
        </main>
    )
}
