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

    if (error || !profile) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl font-bold text-destructive">
                    404! Error loading profile data.
                </p>
            </div>
        )
    }

    // Format Hobbies/Likes based on what we fetched
    const likesText =
        profile.hangout_profiles && profile.hangout_profiles[0]?.hobbies
            ? profile.hangout_profiles[0].hobbies
            : 'Update your profile to add likes!'

    // Format Role (capitalize first letter)
    const formattedRole =
        profile.role.charAt(0).toUpperCase() + profile.role.slice(1)

    return (
        // The wrapper handles the top padding so the content starts comfortably below your floating navbar.
        <div className="w-full pb-8">
            
            {/* Changed from "container" to a max-w wrapper that spreads out. 
              px-6 md:px-8 perfectly matches your navbar padding.
            */}
            <main className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-8 md:flex-row">
                
                {/* --- LEFT COLUMN: PROFILE CARD --- */}
                {/* Fixed width on desktop, full width on mobile, using your exact shadcn vars */}
                <Card className="hidden w-full shrink-0 flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-primary shadow-shadow md:flex md:w-[350px] lg:w-[400px]">
                    <CardHeader className="flex flex-col items-start p-6 pb-2">
                        {/* Avatar matches the picture: full width square inside the card */}
                        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl border-4 border-border bg-background">
                            <Image
                                src={profile.avatar_url || '/placeholder.svg'}
                                alt={profile.full_name || 'User'}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Name */}
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {profile.full_name || 'Anon User'}
                        </h2>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col gap-4 p-6 pt-0 text-left text-foreground">
                        {/* Role / Tagline */}
                        <div className="text-lg font-medium tracking-tight text-foreground/80">
                            {formattedRole} Enthusiast
                        </div>

                        {/* Divider Line */}
                        <hr className="w-full border-2 border-border" />

                        {/* Likes Section */}
                        <div className="w-full text-left">
                            <p className="font-bold text-foreground">Likes:</p>
                            <p className="text-sm font-medium leading-relaxed text-foreground/80">
                                {likesText}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* --- RIGHT COLUMN: ACTIONS --- */}
                {/* flex-1 ensures this column stretches out to fill all remaining horizontal space */}
                <div className="flex w-full flex-1 flex-col gap-6 lg:gap-8">
                    
                    {/* The Prompt Box - Stretches full width of the right column */}
                    <div className="flex w-full min-h-40 md:min-h-50 items-center justify-center rounded-4xl border-4 border-border bg-primary p-8 text-center shadow-shadow">
                        <h1 className="text-3xl font-extrabold text-foreground md:text-5xl lg:text-6xl">
                            "What are you in the mood for?"
                        </h1>
                    </div>

                    {/* The Three Action Buttons Grid - Stretches to match the prompt box */}
                    <div className="grid w-full flex-1 grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
                        
                        {/* Hangout Link */}
                        <Link
                            href="/pools/hangout"
                            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-4xl border-4 border-border bg-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-y-0 active:shadow-none"
                        >
                            <Image
                                src="/placeholder.svg"
                                alt="Hangout"
                                fill
                                className="object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-transparent" />
                            <span className="relative z-10 text-4xl font-extrabold tracking-wide text-background drop-shadow-[3px_3px_0_var(--tw-shadow-color)] shadow-border">
                                Hangout
                            </span>
                        </Link>

                        {/* Date Link */}
                        <Link
                            href="/dating/intro" 
                            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-4xl border-4 border-border bg-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-y-0 active:shadow-none"
                        >
                            <Image
                                src="/placeholder.svg"
                                alt="Date"
                                fill
                                className="object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-transparent" />
                            <span className="relative z-10 text-4xl font-extrabold tracking-wide text-background drop-shadow-[3px_3px_0_var(--tw-shadow-color)] shadow-border">
                                Date.
                            </span>
                        </Link>

                        {/* Study Buddy Link */}
                        <Link
                            href="/pools/study"
                            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-4xl border-4 border-border bg-foreground shadow-shadow transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-y-0 active:shadow-none"
                        >
                            <Image
                                src="/placeholder.svg"
                                alt="Study Buddy"
                                fill
                                className="object-cover opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-transparent" />
                            <span className="relative z-10 text-center text-4xl font-extrabold leading-tight tracking-wide text-background drop-shadow-[3px_3px_0_var(--tw-shadow-color)] shadow-border">
                                Study<br/>Buddy
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

        </div>
    )
}