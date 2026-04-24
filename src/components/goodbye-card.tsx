'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, HeartPulse } from 'lucide-react'

export default function ShutdownModal() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasSeen = sessionStorage.getItem('shutdown_notified')
        if (!hasSeen) {
            setIsOpen(true)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        sessionStorage.setItem('shutdown_notified', 'true')
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={handleClose} />

            {/* MODAL CONTAINER: Added w-[90vw] and max-h-[90vh] for small screens */}
            <div className="relative z-10 flex w-[90vw] max-w-[640px] max-h-[90vh] flex-col overflow-hidden rounded-[2.5rem] border-4 border-border bg-[#FFB6C1] shadow-[8px_8px_0px_0px_var(--tw-shadow-color)] shadow-border animate-in zoom-in-95 duration-200 md:shadow-[10px_10px_0px_0px_var(--tw-shadow-color)]">
                
                {/* 1. TOP SECTION: DOMINANT IMAGE */}
                <div className="relative aspect-[4/3] w-full shrink-0 border-b-4 border-border overflow-hidden bg-background">
                    <img 
                        src="/picture/shoot.jpg" 
                        alt="Shoot ur shot"
                        className="h-full w-full object-cover"
                    />
                    
                    <button 
                        onClick={handleClose}
                        className="absolute right-3 top-3 z-20 rounded-xl border-4 border-border bg-background p-1.5 text-foreground shadow-[2px_2px_0_0_var(--tw-shadow-color)] shadow-border transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                        aria-label="Close modal"
                    >
                        <X strokeWidth={3} size={18} />
                    </button>
                </div>

                {/* 2. BOTTOM SECTION: SCROLLABLE PADDED CONTENT */}
                {/* Added overflow-y-auto so text doesn't get cut off on short screens */}
                <div className="flex flex-col items-center overflow-y-auto p-5 text-center sm:p-6 scrollbar-hide">
                    {/* Title: Slightly smaller on mobile */}
                    <h2 className="mb-3 text-xl font-extrabold uppercase tracking-tight text-foreground sm:text-2xl">
                        Jujurly, Kita Overcapacity! 😭
                    </h2>

                    {/* The Jaksel/Med Body Text */}
                    <p className="mb-5 text-xs font-bold leading-relaxed text-foreground/90 sm:text-sm">
                        Animonya literally gila banget sampe bikin sistem kita tachycardia! So basically, app ini bakal permanently shutdown on <span className="whitespace-nowrap rounded-md border-2 border-border bg-[#A3FF47] px-1.5 py-0.5 font-extrabold">April 26, 2026</span>.
                        <br /><br />
                        Which is, ini your last chance buat shoot your shot! Jangan sampe nyesel at the end of the day. Chat history bakal literally gone forever kalo kalian nggak tukeran WA atau IG sekarang. Please secure your matches, yah!
                    </p>

                    {/* Footer Notes */}
                    <div className="mb-5 flex w-full flex-col items-center justify-center gap-1 text-[10px] font-extrabold text-foreground/80 sm:text-xs">
                        <p className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-foreground sm:w-3.5 sm:h-3.5" /> 
                            Thank you for the massive hype!
                        </p>
                        <p className="flex items-center gap-1.5">
                            <HeartPulse size={12} className="text-foreground sm:w-3.5 sm:h-3.5" /> 
                            We literally love you guys.
                        </p>
                        <p className="mt-1 uppercase tracking-widest text-foreground">
                            - your beloved atmin
                        </p>
                    </div>

                    {/* Action Button: Reduced padding slightly for mobile */}
                    <button 
                        onClick={handleClose}
                        className="w-full shrink-0 rounded-full border-4 border-border bg-foreground py-2.5 text-base font-extrabold uppercase tracking-widest text-background shadow-[4px_4px_0_0_var(--tw-shadow-color)] shadow-border transition-transform hover:-translate-y-1 active:translate-y-0 active:shadow-none sm:py-3 sm:text-lg"
                    >
                        OKAY, NOTED!
                    </button>
                </div>
            </div>
        </div>
    )
}