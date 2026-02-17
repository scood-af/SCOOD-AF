import { Button } from '@/components/ui/button'
import FloatingScreensaver from '@/components/ui/floating-screensaver'
import AnimatedIcon from '@/components/animate-homepage'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'

export default function LandingPage() {
    return (
        <main className="h-screen w-full font-heading">
            <FloatingScreensaver
                quantity={4}
                speed={0.67}
                backgroundColor="var(--primary)"
                shapeColor="var(--main)"
                className="h-full w-full"
            >
                <LogoutButton />
                {/* LAYOUT CONTAINER 
                   Removed 'group' from here so the full screen is no longer the trigger.
                */}
                <div className="relative flex h-full w-full flex-col items-center justify-center px-4 text-center">
                    <div className="peer z-50 flex w-fit flex-col items-center justify-center gap-10 transition-transform duration-500 ease-out hover:scale-116">
                        {/* Top Badge */}
                        <div className="-rotate-5 rounded-2xl border-4 border-border bg-secondary-background px-6 py-2 shadow-[4px_4px_0px_0px_var(--border)] transition-transform hover:rotate-0">
                            <span className="text-lg font-black uppercase tracking-wide text-foreground">
                                ✨ Match. Chat! Date?
                            </span>
                        </div>

                        {/* Animated Icon */}
                        <div className=" -mt-10 z-10 h-96 w-96 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:h-120 md:w-120">
                            <AnimatedIcon />
                        </div>

                        {/* CTA Button */}
                        <Link href={'/home'} className="-mt-20 z-20">
                            <Button
                                size="lg"
                                className="rounded-full bg-background text-foreground font-pixel"
                            >
                                Start Dating
                            </Button>
                        </Link>
                    </div>

                    <div className="pointer-events-none absolute inset-0 z-40 bg-black/10 backdrop-blur-sm opacity-0 transition-opacity duration-500 peer-hover:opacity-100" />
                </div>
            </FloatingScreensaver>
        </main>
    )
}
