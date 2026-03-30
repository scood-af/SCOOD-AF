'use client'

import { useState, useEffect } from 'react'

// This component ensures that the time is formatted on the client-side,
// using the user's local timezone, preventing hydration mismatches.
export default function ClientTime({ isoString }: { isoString: string }) {
    const [localTime, setLocalTime] = useState('')

    useEffect(() => {
        if (isoString) {
            const date = new Date(isoString)
            setLocalTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
    }, [isoString])

    // To avoid a hydration mismatch, we return null on the initial server render.
    // The actual time will be rendered on the client after useEffect runs.
    if (!localTime) return null

    return <>{localTime}</>
}