'use client'

import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

const RetroScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
))
RetroScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            'flex touch-none select-none transition-colors',
            // Made the track completely invisible, just acting as a bounding box.
            // Added padding on the right to give the drop shadow room to breathe!
            orientation === 'vertical' && 'h-full w-6 p-[2px] pr-2',
            orientation === 'horizontal' && 'h-6 flex-col p-[2px] pb-2',
            className
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb
            className={cn(
                // The floating neo-brutalist pill styling (from your 3rd image)
                'relative flex-1 rounded-full bg-primary',
                'border-[3px] border-border shadow-[2px_2px_0_0_var(--tw-shadow-color)]',
                'transition-transform hover:bg-foreground/90 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            )}
        />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { RetroScrollArea, ScrollBar }