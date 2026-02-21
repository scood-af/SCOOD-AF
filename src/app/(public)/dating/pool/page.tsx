import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 1. Fetch Current User (For the Sidebar)
  const { data: myProfile } = await supabase
    .from('profiles')
    .select(`
        full_name, avatar_url, role, bio,
        dating_profiles!inner(
            love_language, 
            preference
        )
    `)
    .eq('id', user.id)
    .single()

    // console.log(user.id, myProfile, error)

  // 2. Fetch The Pool (Ideally filtered by preference, but all for now)
  // We exclude the current user using .neq('id', user.id)
  const { data: poolUsers, error } = await supabase
    .from('profiles')
    .select(`
      id, full_name, avatar_url, role,
      dating_profiles!inner (
        gender, love_language, relationship_goals
      ),
      pool_memberships!inner (
        pool_type
      )
    `)
    .eq('pool_memberships.pool_type', 'dating')
    .neq('id', user.id)
    .limit(50)

    console.log(poolUsers, error)

  // Helper to get hobbies text
  const myHobbies = myProfile?.hangout_profiles?.[0]?.hobbies || "No hobbies added"
  const myLoveLang = myProfile?.dating_profiles?.[0]?.love_language || "N/A"

  return (
    <div className="flex min-h-screen flex-col bg-background p-4 md:flex-row md:p-8 gap-8">
      
      {/* --- LEFT SIDEBAR (My Profile) --- */}
      <aside className="w-full shrink-0 md:w-80">
        <div className="sticky top-8 flex flex-col overflow-hidden rounded-4xl border-4 border-border bg-primary shadow-shadow">
          <div className="flex flex-col items-center p-6 pb-2">
            <div className="relative mb-4 h-40 w-40 overflow-hidden rounded-2xl border-4 border-border">
              <Image
                src={myProfile?.avatar_url || '/placeholder.svg'}
                alt="Me"
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">{myProfile?.full_name}</h2>
            <p className="text-center font-medium text-foreground/70">
                {myProfile?.role?.toUpperCase() || 'UDAYANA' }
            </p>
          </div>
          
          <div className="flex-1 space-y-4 p-6 pt-2">
            {/* Bio / Tagline */}
            <div className="rounded-xl border-2 border-border bg-chart-1 p-3">
               <p className="text-xs font-bold uppercase text-foreground/60">Bio</p>
               <p className="font-bold text-foreground">{myProfile?.bio || "Cardiology Enthusiast"}</p>
            </div>

            <div className="space-y-1 text-sm font-bold text-foreground">
                <p>Likes:</p>
                <p className="opacity-70">{myHobbies}</p>
            </div>

            <div className="mt-8 rounded-xl bg-foreground/10 p-4 text-center">
                <p className="text-lg font-extrabold leading-tight text-foreground">
                    Please do Mind Your Manner yh :D
                </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- RIGHT CONTENT (The Grid) --- */}
      <main className="flex-1">
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-foreground md:text-5xl uppercase leading-none">
                Welcome to the <br/>Dating Pool!
            </h1>
            <div className="flex flex-col gap-2 text-right">
                <Link href="/" className="font-bold underline decoration-2 underline-offset-4 hover:text-blue-600">Home</Link>
                <button className="font-bold underline decoration-2 underline-offset-4 hover:text-blue-600">Shuffle</button>
            </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {poolUsers?.map((person) => {
                const dating = person.dating_profiles[0] // Since it's 1-to-1
                return (
                    <div key={person.id} className="flex overflow-hidden rounded-3xl border-4 border-border bg-primary shadow-shadow transition-transform hover:-translate-y-1">
                        {/* Avatar Left */}
                        <div className="relative w-1/3 border-r-4 border-border">
                            <Image 
                                src={person.avatar_url || '/placeholder.svg'}
                                alt={person.full_name || 'User'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Info Right */}
                        <div className="flex flex-1 flex-col justify-center p-4 gap-2">
                            <div>
                                <h3 className="text-xl font-extrabold leading-none text-foreground">{person.full_name}</h3>
                                <p className="text-xs font-bold text-foreground/60">FK Udayana</p>
                            </div>
                            
                            <div className="w-full h-1 bg-foreground rounded-full my-1"></div>

                            <div className="flex flex-wrap gap-1">
                                {dating?.gender && (
                                    <span className="text-[10px] font-bold border border-border px-2 py-0.5 rounded-full bg-secondary-background/50">{dating.gender}</span>
                                )}
                                {dating?.relationship_goals && (
                                    <span className="text-[10px] font-bold border border-border px-2 py-0.5 rounded-full bg-secondary-background/50">{dating.relationship_goals}</span>
                                )}
                                {dating?.love_language && (
                                    <span className="text-[10px] font-bold border border-border px-2 py-0.5 rounded-full bg-secondary-background/50">{dating.love_language}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </main>
    </div>
  )
}