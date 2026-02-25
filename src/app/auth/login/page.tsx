'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { SVGProps } from 'react'
import FloatingScreensaver from '@/components/ui/floating-other'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
                <Card className="w-full max-w-md overflow-hidden rounded-[2.5rem] border-4 border-border bg-background shadow-shadow">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-4xl font-extrabold uppercase tracking-tight">
                            Welcome Back!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 p-8 pt-4">
                        {/* Google Button */}
                        <Button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full gap-3 rounded-xl border-4 border-border bg-white text-stone-900 shadow-sm hover:bg-gray-50 hover:-translate-y-1 hover:shadow-md transition-all h-14 text-lg font-bold"
                        >
                            <GoogleIcon className="h-6 w-6" />
                            <span>Continue with Google</span>
                        </Button>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t-4 border-border/20"></span>
                            </div>
                            <span className="relative bg-background px-4 text-sm font-extrabold uppercase text-muted-foreground">
                                Or with email
                            </span>
                        </div>

                        <form
                            onSubmit={handleEmailLogin}
                            className="flex flex-col gap-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-extrabold uppercase ml-1">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    placeholder="hello@example.com"
                                    required
                                    className="h-14 rounded-xl border-4 border-border bg-secondary/20 px-4 text-lg font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_0_var(--border)] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-extrabold uppercase ml-1">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-14 rounded-xl border-4 border-border bg-secondary/20 px-4 text-lg font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_0_var(--border)] transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-14 w-full rounded-xl border-4 border-border bg-primary text-xl font-extrabold uppercase text-foreground shadow-sm hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--border)] transition-all active:translate-y-0 active:shadow-none"
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </Button>
                        </form>

                        <div className="text-center mt-2">
                            <p className="text-sm font-bold text-muted-foreground">
                                Don't have an account?{' '}
                                <Link
                                    href="/auth/sign-up"
                                    className="text-foreground underline decoration-4 underline-offset-4 hover:text-primary transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
