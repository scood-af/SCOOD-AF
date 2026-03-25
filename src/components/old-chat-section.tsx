'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function ChatSection({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="w-full shrink-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-2xl border-4 border-border bg-secondary-background px-5 py-3 text-lg font-extrabold uppercase tracking-wide text-foreground shadow-shadow transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--tw-shadow-color)] active:translate-y-0 active:shadow-none"
            >
                <span className="flex items-center gap-3">
                    <span className="text-2xl">💬</span>
                    <span>Your Chats</span>
                </span>
                <span className={cn("text-xl transition-transform duration-300", isOpen && "rotate-180")}>
                    ▼
                </span>
            </button>

            <div
                className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] mt-4 opacity-100" : "grid-rows-[0fr] mt-0 opacity-0"
                )}
            >
                {/* The overflow-hidden is required for the accordion, but we add padding/margin inside it */}
                <div className="overflow-hidden">
                    
                    {/* The mr-2 mb-2 gives the heavy bottom-right shadow physical room to breathe */}
                    <div className="mr-2 mb-2">
                        <div className="rounded-2xl border-4 border-border bg-background p-4 shadow-shadow">
                            
                            {/* The p-2 and -m-2 trick prevents the scrollbar from clipping the internal chat cards */}
                            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2 -m-2 pr-4">
                                {children}
                            </div>
                            
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}