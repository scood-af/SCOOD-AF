'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const OFFLINE_OPTIONS = ['Yes, let’s meet up!', 'No, online only']

export default function HangoutIntroPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // State for selections
    const [domicile, setDomicile] = useState('')
    const [topics, setTopics] = useState('')
    const [offlineOpen, setOfflineOpen] = useState<string | null>(null)
    const [step, setStep] = useState(1)

    const handleSubmit = async () => {
        if (!domicile.trim() || !topics.trim() || !offlineOpen) {
            alert('Please fill out all the fields so people know your vibe!')
            return
        }
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase.from('hangout_profiles').upsert({
                profile_id: user.id,
                domicile: domicile.trim(),
                topics: topics.trim(),
                offline_open: offlineOpen === 'Yes, let’s meet up!',
            })

            if (!error) {
                await supabase.from('pool_memberships').upsert(
                    { profile_id: user.id, pool_type: 'hangout', is_active: true },
                    { onConflict: 'profile_id, pool_type' }
                )
                router.push('/hangout/pool')
            } else {
                console.error(error)
                setLoading(false)
            }
        }
    }

    const FilterPill = ({ label, isSelected, onClick }: { label: string, isSelected: boolean, onClick: () => void }) => (
        <button
            onClick={onClick}
            className={cn(
                'rounded-full border-2 border-border px-6 py-2 text-lg font-bold transition-all hover:-translate-y-1 shadow-shadow',
                isSelected ? 'bg-primary text-foreground' : 'bg-primary/40 text-foreground hover:bg-primary'
            )}
        >
            {label}
        </button>
    )

    return (
        <div className="flex flex-col items-center md:justify-center bg-background p-4 md:-my-32 text-center min-h-screen">
            <h1 className="mb-8 text-4xl font-extrabold text-foreground md:text-5xl">
                What's the move?
            </h1>

            <div className="flex w-full max-w-xl flex-col gap-8 text-left">
                {/* Domicile Input */}
                <div className={cn("flex-col gap-3", step === 1 ? 'flex' : 'hidden md:flex')}>
                    <label className="text-sm font-extrabold uppercase tracking-wide text-foreground ml-1">General Area / Domicile</label>
                    <input
                        type="text"
                        value={domicile}
                        onChange={(e) => setDomicile(e.target.value)}
                        placeholder="e.g., Bali, Solo, Hatimu"
                        className="w-full rounded-2xl border-4 border-border bg-secondary-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                    />
                </div>

                {/* Topics Input */}
                <div className={cn("flex-col gap-3", step === 1 ? 'flex' : 'hidden md:flex')}>
                    <label className="text-sm font-extrabold uppercase tracking-wide text-foreground ml-1">Current Hyperfixations / Topics</label>
                    <input
                        type="text"
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder="e.g., Foods, Politics, Movies"
                        className="w-full rounded-2xl border-4 border-border bg-secondary-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                    />
                </div>

                {/* Offline Preference */}
                <div className={cn("flex-col gap-3 items-center mt-2", step === 2 ? 'flex' : 'hidden md:flex')}>
                    <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">Open to hanging out offline?</label>
                    <div className="flex flex-wrap justify-center gap-4">
                        {OFFLINE_OPTIONS.map((item) => (
                            <FilterPill
                                key={item}
                                label={item}
                                isSelected={offlineOpen === item}
                                onClick={() => setOfflineOpen(item)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
                {step === 1 && (
                    <button
                        onClick={() => {
                            if (!domicile.trim() || !topics.trim()) {
                                alert('Please fill out your domicile and topics first!')
                                return
                            }
                            setStep(2)
                        }}
                        className="rounded-full border-4 border-border bg-foreground px-8 py-4 text-xl font-extrabold text-background shadow-shadow transition-transform hover:-translate-y-1 active:translate-y-0 md:hidden"
                    >
                        NEXT
                    </button>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={cn(
                        "rounded-full border-4 border-border bg-main px-8 py-4 text-xl font-extrabold text-background shadow-shadow transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50",
                        step === 1 ? 'hidden md:block' : 'block'
                    )}
                >
                    {loading ? 'SAVING...' : 'JUMP INTO THE POOL!'}
                </button>

                {step === 2 && (
                    <button
                        onClick={() => setStep(1)}
                        className="text-sm font-bold text-muted-foreground underline md:hidden"
                    >
                        Go Back
                    </button>
                )}
            </div>
        </div>
    )
}