'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Expanded Study Styles
const STUDY_STYLES = [
    'Writing & Research',
    'Casual Study',
    // 'Exam Cram',
    // 'Pomodoro Sprints',
    // 'Silent Body Doubling'
]

export default function StudyIntroPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // State for selections
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
    const [studyTopic, setStudyTopic] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: studyProfile } = await supabase
                    .from('study_profiles')
                    .select('study_style, study_topic')
                    .eq('profile_id', user.id)
                    .single()

                if (studyProfile) {
                    setSelectedStyle(studyProfile.study_style)
                    setStudyTopic(studyProfile.study_topic)
                }
            }
            setInitialLoading(false)
        }

        fetchProfile()
    }, [supabase])

    const handleSubmit = async () => {
        if (!selectedStyle || !studyTopic.trim()) {
            alert('Please select a study style and tell us what you are working on!')
            return
        }
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase.from('study_profiles').upsert({
                profile_id: user.id,
                study_style: selectedStyle,
                study_topic: studyTopic.trim(),
            })

            if (!error) {
                await supabase.from('pool_memberships').upsert(
                    { profile_id: user.id, pool_type: 'study', is_active: true },
                    { onConflict: 'profile_id, pool_type' }
                )
                router.push('/study/pool')
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

    if (initialLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-background text-center">
                <p className="text-xl font-bold text-foreground">Loading your preferences...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center md:justify-center bg-background p-4 md:-my-32 text-center min-h-screen">
            <h1 className="mb-14 text-5xl font-extrabold text-foreground md:text-6xl">
                Let's Lock In.
            </h1>
            {/* <p className="mb-10 font-bold text-muted-foreground">Find someone to match your academic grind.</p> */}

            <div className="flex w-full max-w-xl flex-col gap-10">
                {/* Topic Input */}
                <div className="flex flex-col gap-3 text-left">
                    <label className="text-sm font-extrabold uppercase tracking-wide text-foreground ml-1">What are you currently studying?</label>
                    <input
                        type="text"
                        value={studyTopic}
                        onChange={(e) => setStudyTopic(e.target.value)}
                        placeholder="e.g., Geriatrics, Cancers, Infections"
                        className="w-full rounded-2xl border-4 border-border bg-secondary-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                    />
                </div>

                {/* Study Styles */}
                <div className="flex flex-col gap-3 items-center">
                    <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">Preferred Study Style</label>
                    <div className="flex flex-wrap justify-center gap-4">
                        {STUDY_STYLES.map((item) => (
                            <FilterPill
                                key={item}
                                label={item}
                                isSelected={selectedStyle === item}
                                onClick={() => setSelectedStyle(item)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-full border-4 border-border bg-foreground px-8 py-4 text-xl font-extrabold text-background shadow-shadow transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                    {loading ? 'SAVING...' : 'FIND A STUDY BUDDY!'}
                </button>
            </div>
        </div>
    )
}