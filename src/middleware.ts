import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Create an unmodified response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Update the response with the new cookies
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 2. Refresh the session (this is the magic part that keeps users logged in)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 3. Define your protected routes logic
    const path = request.nextUrl.pathname

    // EXCLUSION LIST: These paths should NEVER be protected
    if (
        path === '/' || // Landing page
        path.startsWith('/auth') || // Auth folder (login, callback, error)
        path.startsWith('/_next') || // Next.js internals
        path.includes('.') // Static files (images, favicon.ico)
    ) {
        return response
    }

    // 4. If no user, redirect to login
    if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return response
}

// Optional: Matcher to filter which routes the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
