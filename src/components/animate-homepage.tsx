'use client'

import dynamic from 'next/dynamic'
// Make sure this path is correct based on your alias setup!
import animationData from '@public/animation/Doctor.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export default function AnimatedIcon() {
    return (
        // CHANGED: Removed 'w-96'. Used 'w-full h-full' to fit the parent div perfectly.
        <div className="w-full h-full flex items-center justify-center">
            <Lottie
                animationData={animationData}
                loop={true}
                // This ensures the SVG itself scales down/up to fit the div
                className="w-full h-full"
            />
        </div>
    )
}
