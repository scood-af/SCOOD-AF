'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Camera, Save, Loader2, ArrowLeft } from 'lucide-react'

function ProfileContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    // If they came from a successful Google login but have no profile, we can read a query param like ?onboarding=true
    const isOnboarding = searchParams.get('onboarding') === 'true'

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Form State
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('Informatics Student')
    const [institution, setInstitution] = useState('')
    const [bio, setBio] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    // File upload state
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setUserId(user.id)

            // Try to fetch existing profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                setFullName(profile.full_name || '')
                setRole(profile.role || 'Informatics Student')
                setInstitution(profile.institution || '')
                setBio(profile.bio || '')
                setAvatarUrl(profile.avatar_url || '')
            } else {
                // If no profile exists, pre-fill name from Google Auth metadata if available
                setFullName(user.user_metadata?.full_name || '')
                setAvatarUrl(user.user_metadata?.avatar_url || '')
            }

            setIsLoading(false)
        }

        fetchUserData()
    }, [router, supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setAvatarFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId || !fullName.trim()) return
        setIsSaving(true)

        let finalAvatarUrl = avatarUrl

        // 1. Upload new avatar if selected
        // Note: Make sure you create a public bucket called 'avatars' in Supabase!
        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop()
            const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true })

            // Add this error catch!
            if (uploadError) {
                console.error('Storage Upload Error:', uploadError)
                setIsSaving(false)
                alert('Failed to upload image. Check console.')
                return
            }

            // If we get here, uploadError is null
            const {
                data: { publicUrl },
            } = supabase.storage.from('avatars').getPublicUrl(filePath)
            finalAvatarUrl = publicUrl
        }

        // 2. Update the existing profile data (Changed from upsert)
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName.trim(),
                role: role.trim() || null,
                institution: institution.trim() || null,
                bio: bio.trim() || null,
                avatar_url: finalAvatarUrl || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId) // <-- Essential when using update()

        setIsSaving(false)

        if (!error) {
            // Update local state to ensure subsequent saves use the new avatar URL
            setAvatarUrl(finalAvatarUrl)
            setAvatarFile(null)

            // If it was their first time, push them to the app. Otherwise, maybe just go back.
            if (isOnboarding) {
                router.push('/home')
            } else {
                router.back() // Or router.back()
            }
        } else {
            console.error('Error saving profile:', error)
        }
    }

    // Display image logic for the live preview
    const displayAvatar = previewUrl || avatarUrl || '/placeholder.svg'
    const displayRole =
        [role.trim(), institution.trim()].filter(Boolean).join(', ') ||
        'Student'

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-foreground" />
            </div>
        )
    }

    return (
        // Locks to the 100vh constraint set by layout.tsx
        <div className="flex h-full w-full flex-col">
            {/* Header Area outside the split layout */}
            <div className="mx-auto flex w-full shrink-0 items-center gap-4 px-6 pb-6 md:px-8">
                {!isOnboarding && (
                    <button
                        onClick={() => router.back()}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-border bg-primary text-foreground transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border active:translate-y-0 active:shadow-none"
                    >
                        <ArrowLeft strokeWidth={3} />
                    </button>
                )}
                <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground md:text-5xl">
                    {isOnboarding ? 'Complete Your ID' : 'Edit Profile'}
                </h1>
            </div>

            <main className="mx-auto flex w-full flex-1 min-h-0 flex-col gap-6 px-6 md:flex-row md:px-8">
                {/* --- LEFT COLUMN: LIVE PREVIEW CARD --- */}
                {/* Visual feedback makes forms way less boring to fill out */}
                <Card className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-[2rem] border-4 border-border bg-primary shadow-shadow md:h-full md:w-[350px] lg:w-[400px]">
                    <div className="absolute -right-12 top-8 z-10 w-48 rotate-45 bg-foreground py-3 text-center text-xs font-extrabold uppercase tracking-widest text-background shadow-sm">
                        Live Preview ✴︎
                    </div>

                    <CardHeader className="flex flex-col items-center p-6 pb-2 text-center md:items-start md:text-left">
                        <div className="relative mb-4 aspect-square w-40 shrink-0 rounded-2xl border-4 border-border bg-background lg:w-48 overflow-hidden">
                            <Image
                                src={displayAvatar}
                                alt="Avatar Preview"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2 className="line-clamp-2 text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
                            {fullName || 'Your Name'}
                        </h2>
                        <div className="text-sm font-medium tracking-tight text-foreground/80 lg:text-base">
                            {displayRole}
                        </div>
                    </CardHeader>

                    <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-6 pt-2 text-left text-foreground">
                        <hr className="w-full border-2 border-border" />
                        <div className="w-full shrink-0 rounded-xl border-4 border-border bg-background p-4 shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-foreground/60 lg:text-xs">
                                Bio
                            </p>
                            <p className="line-clamp-4 text-sm font-bold leading-snug text-foreground lg:text-base">
                                {bio ||
                                    'Write something cool about yourself here...'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* --- RIGHT COLUMN: THE FORM --- */}
                <div className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-4xl border-4 border-border bg-background shadow-shadow">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <form
                            id="profile-form"
                            onSubmit={handleSave}
                            className="flex flex-col gap-8"
                        >
                            {/* Avatar Picker */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                    Profile Picture
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="flex items-center gap-2 rounded-xl border-4 border-border bg-primary px-6 py-3 font-extrabold text-foreground transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border active:translate-y-0 active:shadow-none"
                                    >
                                        <Camera size={20} strokeWidth={3} />
                                        Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    {avatarFile && (
                                        <span className="text-sm font-bold opacity-70">
                                            Image selected
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                    Display Name{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    placeholder="Aldy Sunada"
                                    className="w-full rounded-2xl border-4 border-border bg-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                                />
                            </div>

                            {/* Role */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                    Your Role
                                </label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="Informatics Student"
                                    className="w-full rounded-2xl border-4 border-border bg-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                                />
                            </div>

                            {/* Institution */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    value={institution}
                                    onChange={(e) =>
                                        setInstitution(e.target.value)
                                    }
                                    placeholder="Udayana University"
                                    className="w-full rounded-2xl border-4 border-border bg-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                                />
                            </div>

                            {/* Bio */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="I hate backend development..."
                                    rows={4}
                                    className="w-full resize-none rounded-2xl border-4 border-border bg-background px-6 py-4 text-lg font-bold text-foreground outline-none transition-shadow focus:shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Fixed Bottom Action Bar */}
                    <div className="shrink-0 border-t-4 border-border bg-background p-6">
                        <button
                            form="profile-form"
                            type="submit"
                            disabled={isSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-border bg-foreground px-6 py-4 text-xl font-extrabold uppercase tracking-wide text-background transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--tw-shadow-color)] shadow-border disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none md:w-auto"
                        >
                            {isSaving ? (
                                <Loader2
                                    className="animate-spin"
                                    size={24}
                                    strokeWidth={3}
                                />
                            ) : (
                                <Save size={24} strokeWidth={3} />
                            )}
                            {isSaving
                                ? 'Saving...'
                                : isOnboarding
                                  ? 'Join Pool'
                                  : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-full items-center justify-center bg-background">
                    <Loader2 className="h-12 w-12 animate-spin text-foreground" />
                </div>
            }
        >
            <ProfileContent />
        </Suspense>
    )
}
