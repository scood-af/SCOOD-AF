export default function AuthErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
            <h1 className="text-2xl font-bold">Authentication Error</h1>
            <p>Something went wrong during the login process.</p>
        </div>
    )
}
