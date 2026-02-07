import { Button } from '@/components/ui/button'
import FloatingScreensaver from '@/components/ui/floating-screensaver'
import AnimatedIcon from '@/components/animate-homepage'

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
                {/* Main Flex Column Container */}
                <div className="relative z-20 flex h-full w-full flex-col items-center justify-center gap-10 px-4 text-center">
                    {/* 1. Top Badge */}
                    <div className="-rotate-5 rounded-2xl border-4 border-border bg-secondary-background px-6 py-2 shadow-[4px_4px_0px_0px_var(--border)] transition-transform hover:rotate-0">
                        <span className="text-lg font-black uppercase tracking-wide text-foreground">
                            ✨ Match. Chat! Date?
                        </span>
                    </div>

                    {/* 2. Animated Icon */}
                    <div className=" -mt-10 z-10 h-96 w-96 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] md:h-120 md:w-120">
                        <AnimatedIcon />
                    </div>

                    {/* 3. CTA Button */}
                    <Button
                        size="lg"
                        className="rounded-full bg-background font-bold text-foreground -mt-20"
                    >
                        Start Dating
                    </Button>
                </div>
            </FloatingScreensaver>
        </main>
    )
}
