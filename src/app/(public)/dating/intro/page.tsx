'use client'

import { createClient } from '@/lib/client' // Use your client-side supabase helper
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils' // Shadcn utility

// Option Constants matching your design
const PREFERENCES = ['Guy', 'Girl'] // Maps to 'gender_preference' or 'preference'
const GOALS = ['Casual', 'Serious'] // Maps to 'relationship_goals'
const LOVE_LANGUAGES = [
    'Physical Touch',
    'Acts of Service',
    'Words of Affirmation',
    'Quality Time',
    'Giving Gifts',
]

export default function DatingIntroPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // State for selections
    const [selectedPref, setSelectedPref] = useState<string | null>(null)
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
    const [selectedLang, setSelectedLang] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!selectedPref || !selectedGoal || !selectedLang) {
            alert('Please select one from each category!')
            return
        }
        setLoading(true)

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (user) {
            // Upsert: Update if exists, Insert if not
            const { error } = await supabase.from('dating_profiles').upsert({
                profile_id: user.id,
                preference: selectedPref === 'Guy' ? 'Male' : 'Female', // Simple mapping
                relationship_goals: selectedGoal,
                love_language: selectedLang,
            })

            if (!error) {
                // Also ensure they are in the pool membership
                await supabase.from('pool_memberships').upsert(
                    {
                        profile_id: user.id,
                        pool_type: 'dating',
                        is_active: true,
                    },
                    { onConflict: 'profile_id, pool_type' }
                )

                router.push('/dating/pool')
            } else {
                console.error(error)
                setLoading(false)
            }
        }
    }

    // Reusable "Pill" Button Component
    const FilterPill = ({
        label,
        isSelected,
        onClick,
    }: {
        label: string
        isSelected: boolean
        onClick: () => void
    }) => (
        <button
            onClick={onClick}
            className={cn(
                'rounded-full border-2 border-border px-6 py-2 text-lg font-bold transition-all hover:-translate-y-1 shadow-shadow',
                isSelected
                    ? 'bg-main text-background' // Selected: Hot Pink
                    : 'bg-main/40 text-foreground hover:bg-main' // Unselected: Light Pink
            )}
        >
            {label}
        </button>
    )

    return (
        <div className="flex flex-col items-center my-auto justify-center bg-background p-4 text-center">
            <h1 className="mb-12 text-4xl font-extrabold text-foreground md:text-5xl">
                What&apos;s ur type?
            </h1>

            <div className="flex max-w-3xl flex-wrap justify-center gap-4 md:gap-6">
                {/* Gender Preference */}
                {PREFERENCES.map((item) => (
                    <FilterPill
                        key={item}
                        label={item}
                        isSelected={selectedPref === item}
                        onClick={() => setSelectedPref(item)}
                    />
                ))}

                {/* Goals */}
                {GOALS.map((item) => (
                    <FilterPill
                        key={item}
                        label={item}
                        isSelected={selectedGoal === item}
                        onClick={() => setSelectedGoal(item)}
                    />
                ))}

                {/* Love Languages */}
                {LOVE_LANGUAGES.map((item) => (
                    <FilterPill
                        key={item}
                        label={item}
                        isSelected={selectedLang === item}
                        onClick={() => setSelectedLang(item)}
                    />
                ))}
            </div>

            <div className="mt-16">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-full border-4 border-border bg-primary px-8 py-4 text-xl font-extrabold text-foreground shadow-shadow transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                    {loading ? 'SAVING...' : 'GO FIND ME MY LOVE!'}
                </button>
            </div>
        </div>
    )
}
