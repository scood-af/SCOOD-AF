'use client'

import { AlertTriangle, Ghost, X } from 'lucide-react'

export default function GhostModeBanner({ startedAt, onDismiss }: { startedAt?: string, onDismiss: () => void }) {

    let deletionText = "Chat & Media auto-delete 24h after the first message."
    if (startedAt) {
        const deletionDate = new Date(new Date(startedAt).getTime() + 24 * 60 * 60 * 1000)
        const timeString = deletionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const dateString = deletionDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
        deletionText = `Chat wipes on ${dateString} at ${timeString}`
    }

    return (
        <div className="relative w-full shrink-0 border-border bg-background px-4 py-2 z-100">
            <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-center pr-6 md:pr-0">
                <Ghost size={18} strokeWidth={3} className="shrink-0 animate-bounce text-foreground" />
                <p className="text-xs font-extrabold uppercase tracking-wider text-foreground md:text-sm">
                    {deletionText}
                </p>
                <AlertTriangle size={18} strokeWidth={3} className="shrink-0 text-foreground" />
            </div>
            <button 
                onClick={onDismiss}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-foreground transition-transform hover:scale-110 active:scale-95"
                title="Dismiss"
            >
                <X size={16} strokeWidth={3} />
            </button>
        </div>
    )
}