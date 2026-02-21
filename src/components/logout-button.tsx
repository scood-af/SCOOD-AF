'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    const router = useRouter()

    const logout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    return <Button variant={null} onClick={logout} className="-my-1 text-sm md:text-xl font-bold">⎋ Logout</Button>
}
