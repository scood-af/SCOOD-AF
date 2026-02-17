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
        await supabase.from('pool_memberships').upsert({
            profile_id: user.id,
            pool_type: 'dating',
            is_active: true
        }, { onConflict: 'profile_id, pool_type' })
        
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
        'rounded-full border-2 border-black px-6 py-2 text-lg font-bold transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        isSelected
          ? 'bg-[#FF47D6] text-white' // Selected: Hot Pink
          : 'bg-[#FF47D6]/40 text-black hover:bg-[#FF47D6]' // Unselected: Light Pink
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FEFCE8] p-4 text-center">
      <h1 className="mb-12 text-4xl font-extrabold text-[#3D3D3D] md:text-5xl">
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
          className="rounded-full border-4 border-black bg-[#A3FF47] px-8 py-4 text-xl font-extrabold text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
        >
          {loading ? 'SAVING...' : 'GO FIND ME MY LOVE!'}
        </button>
      </div>
    </div>
  )
}