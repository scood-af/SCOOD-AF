'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import * as Shapes from '../shapes-homepage'

interface ShapeEntity {
    id: number
    x: number
    y: number
    vx: number
    vy: number
    rotation: number
    vRot: number
    scale: number
    Component: React.ComponentType<any>
}

interface FloatingScreensaverProps {
    className?: string
    quantity?: number
    speed?: number
    backgroundColor?: string
    shapeColor?: string
    children?: React.ReactNode
}

export default function FloatingScreensaver({
    className,
    quantity = 4, // REDUCED DEFAULT: 4 big shapes is plenty
    speed = 0.8,
    backgroundColor = 'var(--background)',
    shapeColor = 'var(--main)',
    children,
}: FloatingScreensaverProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const requestRef = useRef<number>()
    const [entities, setEntities] = useState<ShapeEntity[]>([])
    const entitiesRef = useRef<ShapeEntity[]>([])

    useEffect(() => {
        const availableShapes = Object.values(Shapes)
        const newEntities: ShapeEntity[] = []
        const { innerWidth: w, innerHeight: h } = window

        for (let i = 0; i < quantity; i++) {
            const RandomShape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
            
            // Adjusted Scale: 500-900 is big but manageable. 1400 was too big for separation to work well.
            const size = 600 + Math.random() * 400 

            // Spawn logic (Keep existing logic to spawn at edges)
            const side = Math.floor(Math.random() * 4)
            let x, y
            switch (side) {
                case 0: x = Math.random() * w; y = -size * 0.5; break;
                case 1: x = w - size * 0.2; y = Math.random() * h; break;
                case 2: x = Math.random() * w; y = h - size * 0.2; break;
                default: x = -size * 0.5; y = Math.random() * h; break;
            }

            newEntities.push({
                id: i,
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 0.5,
                scale: size,
                Component: RandomShape,
            })
        }

        setEntities(newEntities)
        entitiesRef.current = newEntities
    }, [quantity, speed])

    const updatePhysics = () => {
        if (!containerRef.current) return
        const { clientWidth: width, clientHeight: height } = containerRef.current
        const shapes = entitiesRef.current

        // 1. Calculate Movement & Separation
        for (let i = 0; i < shapes.length; i++) {
            const p1 = shapes[i]

            // --- NEW: SHAPE SEPARATION LOGIC ---
            // Check against every other shape
            for (let j = i + 1; j < shapes.length; j++) {
                const p2 = shapes[j]
                
                // Calculate center points (approximate)
                const c1x = p1.x + p1.scale / 2
                const c1y = p1.y + p1.scale / 2
                const c2x = p2.x + p2.scale / 2
                const c2y = p2.y + p2.scale / 2

                const dx = c1x - c2x
                const dy = c1y - c2y
                const dist = Math.sqrt(dx * dx + dy * dy)
                
                // If distance is less than 60% of their combined size, push them apart
                // This allows *some* overlap (artistic), but prevents total stacking
                const minDist = (p1.scale + p2.scale) * 0.35 

                if (dist < minDist && dist > 0) {
                    const angle = Math.atan2(dy, dx)
                    const force = 0.05 // Gentle push force
                    
                    // Push p1 away
                    p1.vx += Math.cos(angle) * force
                    p1.vy += Math.sin(angle) * force
                    
                    // Push p2 opposite way
                    p2.vx -= Math.cos(angle) * force
                    p2.vy -= Math.sin(angle) * force
                }
            }

            // Apply Velocity Limits (Friction)
            // This prevents them from zooming off screen after getting pushed
            const maxSpeed = speed * 2
            const currentSpeed = Math.sqrt(p1.vx * p1.vx + p1.vy * p1.vy)
            if (currentSpeed > maxSpeed) {
                p1.vx = (p1.vx / currentSpeed) * maxSpeed
                p1.vy = (p1.vy / currentSpeed) * maxSpeed
            }

            // Move
            p1.x += p1.vx
            p1.y += p1.vy
            p1.rotation += p1.vRot

            // --- EXISTING: SAFE ZONE COLLISION ---
            const safeW = width * 0.4
            const safeH = height * 0.4
            const safeLeft = (width - safeW) / 2
            const safeRight = safeLeft + safeW
            const safeTop = (height - safeH) / 2
            const safeBottom = safeTop + safeH

            const shapeRight = p1.x + p1.scale
            const shapeBottom = p1.y + p1.scale

            const isOverlapping =
                shapeRight > safeLeft &&
                p1.x < safeRight &&
                shapeBottom > safeTop &&
                p1.y < safeBottom

            if (isOverlapping) {
                if (p1.vx > 0 && shapeRight > safeLeft && p1.x < safeLeft) p1.vx = -Math.abs(p1.vx)
                else if (p1.vx < 0 && p1.x < safeRight && shapeRight > safeRight) p1.vx = Math.abs(p1.vx)
                
                if (p1.vy > 0 && shapeBottom > safeTop && p1.y < safeTop) p1.vy = -Math.abs(p1.vy)
                else if (p1.vy < 0 && p1.y < safeBottom && shapeBottom > safeBottom) p1.vy = Math.abs(p1.vy)
            }

            // --- EXISTING: WALL BOUNCE ---
            if (p1.x + p1.scale >= width) p1.vx = -Math.abs(p1.vx)
            else if (p1.x <= -p1.scale * 0.2) p1.vx = Math.abs(p1.vx)

            if (p1.y + p1.scale >= height) p1.vy = -Math.abs(p1.vy)
            else if (p1.y <= -p1.scale * 0.2) p1.vy = Math.abs(p1.vy)

            // Update DOM
            const element = document.getElementById(`shape-${p1.id}`)
            if (element) {
                element.style.transform = `translate3d(${p1.x}px, ${p1.y}px, 0) rotate(${p1.rotation}deg)`
            }
        }
        
        requestRef.current = requestAnimationFrame(updatePhysics)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePhysics)
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [entities])

    return (
        <div
            ref={containerRef}
            className={cn('relative h-full w-full overflow-hidden', className)}
            style={{ backgroundColor }}
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {entities.map((entity) => {
                    const ShapeComponent = entity.Component
                    return (
                        <div
                            key={entity.id}
                            id={`shape-${entity.id}`}
                            className="absolute top-0 left-0 will-change-transform opacity-100 drop-shadow-[8px_8px_0px_var(--border)]/7"
                            style={{
                                color: shapeColor,
                                width: `${entity.scale}px`,
                                height: `${entity.scale}px`,
                                transform: `translate3d(${entity.x}px, ${entity.y}px, 0) rotate(${entity.rotation}deg)`,
                                fontSize: `${entity.scale}px`,
                            }}
                        >
                            <ShapeComponent className="w-full h-full" />
                        </div>
                    )
                })}
            </div>

            <div className="relative z-10 h-full w-full">{children}</div>
        </div>
    )
}