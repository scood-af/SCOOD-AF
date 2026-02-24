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
        redirect('/auth/login')
    }

    // 3. Fetch Profile Data + Hangout Hobbies (for the "Likes" section)
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            full_name,
            avatar_url,
            role,
            bio,
            likes
        `)
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

    const likesText = profile.likes || 'Update your profile to add likes/hobby!'

    // Format Role (capitalize first letter)
    const formattedRole =
        profile.role.charAt(0).toUpperCase() + profile.role.slice(1)

    return (
        // Locks to the 100vh constraint set by layout.tsx
        <div className="h-full w-full">
            
            <main className="mx-auto flex h-full w-full flex-col gap-6 px-6 md:flex-row md:px-8">
                
                {/* --- LEFT COLUMN: PROFILE CARD --- */}
                {/* Set strictly to h-full so it fills the vertical space */}
                <Card className="hidden h-full w-full shrink-0 flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-primary shadow-shadow md:flex md:w-[320px] lg:w-[350px]">
                    <CardHeader className="flex flex-col items-center p-5 pb-0 text-center md:items-start md:text-left">
                        {/* Shrunk the avatar so the card doesn't overflow on short screens */}
                        <div className="relative mb-3 aspect-square w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-border bg-background lg:w-40 xl:w-48">
                            <Image
                                src={profile.avatar_url || '/placeholder.svg'}
                                alt={profile.full_name || 'User'}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <h2 className="line-clamp-1 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                            {profile.full_name || 'Anon User'}
                        </h2>
                        <div className="text-sm font-medium tracking-tight text-foreground/80 lg:text-base">
                            {formattedRole} Enthusiast
                        </div>
                    </CardHeader>
                    
                    <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-5 text-left text-foreground">
                        <hr className="w-full border-2 border-border" />

                        {/* Likes Section pushes down with mt-auto if there's extra space */}
                        <div className="mb-auto mt-2 w-full shrink-0 text-left">
                            <p className="text-sm font-bold text-foreground lg:text-base">Likes:</p>
                            <p className="line-clamp-4 text-xs font-medium leading-relaxed text-foreground/80 lg:text-sm">
                                {likesText}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* --- RIGHT COLUMN: ACTIONS --- */}
                <div className="flex h-full w-full flex-1 flex-col gap-6">
                    
                    {/* Internal scroll wrapper: Ensures mobile users can scroll the buttons if they stack */}
                    <div className="flex flex-1 min-h-0 flex-col gap-6 pr-2 lg:gap-8">
                        
                        {/* The Prompt Box - shrink-0 ensures it keeps its height */}
                        <div className="flex w-full shrink-0 min-h-[140px] md:min-h-[180px] items-center justify-center rounded-4xl border-4 border-border bg-primary p-8 text-center shadow-shadow lg:min-h-[200px]">
                            <h1 className="text-3xl font-extrabold text-foreground md:text-5xl lg:text-6xl">
                                "What are you in the mood for?"
                            </h1>
                        </div>

                        {/* The Three Action Buttons Grid */}
                        <div className="grid w-full flex-1 grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
                            
                            {/* Hangout Link - Removed 'aspect-square', added 'min-h-[160px]' to let it stretch! */}
                            <Link
                                href="/pools/hangout"
                                className="group relative flex h-full w-full min-h-[160px] items-center justify-center overflow-hidden rounded-4xl border-4 border-border bg-foreground shadow-shadow transition-all duration-300 hover:-translate-y-2 hover:rotate-2 hover:shadow-[8px_8px_0px_0px_var(--border)] active:translate-y-0 active:rotate-0 active:shadow-none"
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
                                className="group relative flex h-full w-full min-h-[160px] items-center justify-center overflow-hidden rounded-4xl border-4 border-border bg-foreground shadow-shadow transition-all duration-300 hover:-translate-y-2 hover:rotate-2 hover:shadow-[8px_8px_0px_0px_var(--border)] active:translate-y-0 active:rotate-0 active:shadow-none"
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
                                className="group relative flex h-full w-full min-h-[160px] items-center justify-center overflow-hidden rounded-4xl border-4 border-border bg-foreground shadow-shadow transition-all duration-300 hover:-translate-y-2 hover:rotate-2 hover:shadow-[8px_8px_0px_0px_var(--border)] active:translate-y-0 active:rotate-0 active:shadow-none"
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
                </div>
            </main>

        </div>
    )
}