import { Button } from "@/components/ui/button";
// Ensure you are importing the named export 'Particles' we defined earlier
// not just the default 'ParticlesDemo'
import { Particles } from "@/components/ui/particles"; 

export default function LandingPage() {
    return (
        <main className="h-screen w-full">
        {/* We use the Particles component as the wrapper. 
            It handles the fixed background and z-indexing for us.
        */}
        <Particles 
            quantity={15}
            className="h-screen w-full" // Ensures the container takes full height
        >
            {/* Everything here is rendered inside the {children} slot of the 
            Particles component, which is safely positioned above the canvas.
            */}
            <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">
                
                {/* Badge / Pill */}
                <div className="mb-6 inline-flex items-center rounded-full border-2 border-neutral-900 bg-white/20 px-4 py-1.5 text-sm font-bold text-neutral-900 backdrop-blur-sm">
                    <span>✨ New Physics Engine 2.0</span>
                </div>

                {/* Example for the Heading */}
                <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl">
                    <span className="bg-neutral-900 px-4 py-1 text-[#A8FF43] box-decoration-clone">
                        Intertwined
                    </span>
                    <br />
                    <span className="bg-[#FF5CD9] px-4 py-1 text-neutral-900 box-decoration-clone">
                        Universe
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed text-neutral-800 md:text-xl">
                    A comically large, interconnected web of rounded stars and neon dreams. 
                    Experience the sticky, gooey physics of our new design system.
                </p>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Button 
                        size="lg"
                        className="h-14 rounded-full border-2 border-neutral-900 bg-neutral-900 px-8 text-lg font-bold text-[#A8FF43] hover:bg-neutral-800 hover:scale-105 transition-all"
                    >
                        Get Connected
                    </Button>
                    
                    <Button 
                        size="lg"
                        variant="outline"
                        className="h-14 rounded-full border-2 border-neutral-900 bg-transparent px-8 text-lg font-bold text-neutral-900 hover:bg-neutral-900/10"
                    >
                        View Source
                    </Button>
                </div>
            </div>
        </Particles>
        </main>
    );
}