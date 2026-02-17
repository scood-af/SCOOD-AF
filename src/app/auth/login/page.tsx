'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { SVGProps } from 'react'
import FloatingScreensaver from '@/components/ui/floating-other'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// --- Assets ---

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
    </svg>
)

export default function LoginPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleGoogleLogin = async () => {
        setLoading(true)
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault()
        // Add your email login logic here
        console.log('Email login triggered')
    }

    // Shared styles to ensure Inputs and Buttons match perfectly
    // const pillStyles = "h-14 rounded-full border-2 border-stone-800 text-center text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
    // const inputColor = "bg-[#fffcd6] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-stone-400/70"

    return (
        <main className="relative h-screen w-full overflow-hidden font-sans">
            {/* Background Layer: Lime Green with Pink Flowers */}
            <FloatingScreensaver
                quantity={6}
                speed={0.67}
                backgroundColor="#a3ff47" // The Lime Green
                shapeColor="#ff5cd9" // The Pink Flower
                className="absolute inset-0 z-0"
            />

            {/* Content Layer */}
            <div className="relative z-10 flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-4">
                    <form
                        onSubmit={handleEmailLogin}
                        className="flex flex-col gap-4"
                    >
                        <Input
                            type="email"
                            placeholder="email"
                            required
                            className={``}
                        />
                        <Input
                            type="password"
                            placeholder="password"
                            required
                            className={``}
                        />

                        {/* Login Button */}
                        <Button type="submit" className={`mt-2`}>
                            log in
                        </Button>
                    </form>

                    <div className="relative py-1 text-center">
                        <span className="bg-transparent px-2 text-sm font-bold text-stone-800">
                            or
                        </span>
                    </div>

                    {/* Google Button */}
                    <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        className={`w-full gap-3 bg-white text-stone-900 hover:bg-white/90`}
                    >
                        <GoogleIcon className="h-5 w-5" />
                        <span>sign up</span>
                    </Button>
                </div>
            </div>
        </main>
    )
}
