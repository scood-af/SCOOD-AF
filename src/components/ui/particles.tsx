"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const STAR_PATH_D = "M 128 0 C 147.68 0 164.04 14.213 167.377 32.934 C 182.974 22.055 204.594 23.574 218.51 37.49 C 232.426 51.406 233.944 73.025 223.066 88.622 C 241.787 91.96 256 108.32 256 128 C 256 147.68 241.787 164.04 223.065 167.377 C 233.944 182.974 232.426 204.594 218.51 218.51 C 204.594 232.426 182.974 233.944 167.377 223.065 C 164.04 241.787 147.68 256 128 256 C 108.32 256 91.959 241.787 88.622 223.065 C 73.025 233.944 51.406 232.426 37.49 218.51 C 23.574 204.594 22.055 182.974 32.934 167.377 C 14.213 164.04 0 147.68 0 128 C 0 108.32 14.213 91.96 32.934 88.622 C 22.056 73.025 23.574 51.406 37.49 37.49 C 51.406 23.574 73.025 22.055 88.622 32.934 91.96 14.213 108.32 0 128 0 Z"

interface MousePosition {
  x: number
  y: number
}

function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return mousePosition
}

export interface ParticlesProps {
  className?: string
  children?: React.ReactNode
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

function hexToRgb(hex: string): number[] {
  let normalized = hex.replace("#", "")

  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map(char => char + char)
      .join("")
  }

  const hexInt = Number.parseInt(normalized, 16)
  const red = (hexInt >> 16) & 255
  const green = (hexInt >> 8) & 255
  const blue = hexInt & 255
  return [red, green, blue]
}

export const Particles: React.FC<ParticlesProps> = ({
  className,
  children,
  quantity = 22,
  staticity = 36,
  ease = 42,
  size = 2,
  refresh = true,
  color = "#FF5CD9", // Neon Pink
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const entities = useRef<ParticleEntity[]>([])
  const mousePosition = useMousePosition()
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const animationRef = useRef<number>()
  const starPathRef = useRef<Path2D | null>(null)
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    starPathRef.current = new Path2D(STAR_PATH_D)
    
    initCanvas()
    animate()
    window.addEventListener("resize", initCanvas)

    return () => {
      window.removeEventListener("resize", initCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [color])

  useEffect(() => {
    onMouseMove()
  }, [mousePosition.x, mousePosition.y])

  useEffect(() => {
    initCanvas()
  }, [refresh])

  const initCanvas = () => {
    resizeCanvas()
    createParticles()
  }

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { w, h } = canvasSize.current
      const x = mousePosition.x - rect.left - w / 2
      const y = mousePosition.y - rect.top - h / 2
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2
      if (inside) {
        mouse.current.x = x
        mouse.current.y = y
      }
    }
  }

  interface ParticleEntity {
    x: number
    y: number
    translateX: number
    translateY: number
    size: number
    alpha: number
    targetAlpha: number
    dx: number
    dy: number
    magnetism: number
    connectionID: number
  }

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      entities.current.length = 0
      canvasSize.current.w = canvasContainerRef.current.offsetWidth
      canvasSize.current.h = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = canvasSize.current.w * dpr
      canvasRef.current.height = canvasSize.current.h * dpr
      canvasRef.current.style.width = `${canvasSize.current.w}px`
      canvasRef.current.style.height = `${canvasSize.current.h}px`
      context.current.scale(dpr, dpr)
    }
  }

  // --- CHANGED: Donut Spawning Logic ---
  const entityParams = (): ParticleEntity => {
    const { w, h } = canvasSize.current
    let x, y, isInsideSafeZone

    // Define the "Safe Zone" in the middle (where text lives)
    // Here we reserve the middle 40% of the screen width and height
    const safeZoneW = w * 0.4 
    const safeZoneH = h * 0.4
    const safeX = (w - safeZoneW) / 2
    const safeY = (h - safeZoneH) / 2

    // Keep rolling random coordinates until we find one OUTSIDE the safe zone
    do {
        x = Math.random() * w
        y = Math.random() * h
        isInsideSafeZone = 
            x > safeX && 
            x < safeX + safeZoneW && 
            y > safeY && 
            y < safeY + safeZoneH
    } while (isInsideSafeZone)

    const translateX = 0
    const translateY = 0
    const baseSize = Math.floor(Math.random() * 50) + 42
    const pSize = baseSize * size
    const alpha = 0
    const targetAlpha = 1
    const dx = (Math.random() - 0.5) * 0.1
    const dy = (Math.random() - 0.5) * 0.1
    const magnetism = 0.16 + Math.random() * 4
    const connectionID = Math.random() 
    
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
      connectionID,
    }
  }

  const rgb = hexToRgb(color)

  const drawEntity = (entity: ParticleEntity) => {
    if (context.current && starPathRef.current) {
      const { x, y, translateX, translateY, size, alpha } = entity
      
      context.current.save()
      context.current.translate(x + translateX, y + translateY)
      
      const scaleFactor = size / 256
      context.current.scale(scaleFactor, scaleFactor)
      
      context.current.translate(-128, -128)

      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`
      context.current.fill(starPathRef.current)
      
      context.current.restore()
    }
  }

  const drawConnections = () => {
    if (!context.current) return
    const ctx = context.current
    const particles = entities.current
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i]
        const p2 = particles[j]
        
        const x1 = p1.x + p1.translateX
        const y1 = p1.y + p1.translateY
        const x2 = p2.x + p2.translateX
        const y2 = p2.y + p2.translateY
        
        const dx = x2 - x1
        const dy = y2 - y1
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        const areRandomlyLinked = Math.abs(p1.connectionID - p2.connectionID) < 0.20

        // dist > 10 prevents the artifacts
        if (dist > 10 && dist < 300 && areRandomlyLinked) {
          const alphaStrength = (1 - dist / 300) * 1 
          ctx.strokeStyle = `rgba(${rgb.join(", ")}, ${alphaStrength})`
          ctx.lineWidth = 1.5

          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          
          const length = Math.sqrt(dx*dx + dy*dy)
          const nx = -dy / length
          const ny = dx / length
          
          const offset = 40 

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.quadraticCurveTo(midX + nx * offset, midY + ny * offset, x2, y2)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.quadraticCurveTo(midX - nx * offset, midY - ny * offset, x2, y2)
          ctx.stroke()
        }
      }
    }
  }

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)
    }
  }

  const createParticles = () => {
    entities.current = []
    const particleCount = quantity
    for (let i = 0; i < particleCount; i++) {
      const entity = entityParams()
      entities.current.push(entity)
    }
    clearContext()
    drawConnections()
    entities.current.forEach(entity => drawEntity(entity))
  }

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }

  const animate = () => {
    clearContext()
    
    entities.current.forEach((entity: ParticleEntity, i: number) => {
      const edgeBuffer = 100 
      const edge = [
        entity.x + entity.translateX - entity.size - edgeBuffer,
        canvasSize.current.w - entity.x - entity.translateX - entity.size - edgeBuffer,
        entity.y + entity.translateY - entity.size - edgeBuffer,
        canvasSize.current.h - entity.y - entity.translateY - entity.size - edgeBuffer,
      ]
      const closestEdge = edge.reduce((a, b) => Math.min(a, b))
      const remapClosestEdge = Number.parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2))
      if (remapClosestEdge > 1) {
        entity.alpha += 0.02
        if (entity.alpha > entity.targetAlpha) {
          entity.alpha = entity.targetAlpha
        }
      } else {
        entity.alpha = entity.targetAlpha * remapClosestEdge
      }
      
      entity.x += entity.dx + vx
      entity.y += entity.dy + vy
      entity.translateX +=
        (mouse.current.x / (staticity / entity.magnetism) - entity.translateX) / ease
      entity.translateY +=
        (mouse.current.y / (staticity / entity.magnetism) - entity.translateY) / ease

      const removalBuffer = entity.size * 2
      if (
        entity.x < -removalBuffer ||
        entity.x > canvasSize.current.w + removalBuffer ||
        entity.y < -removalBuffer ||
        entity.y > canvasSize.current.h + removalBuffer
      ) {
        entities.current.splice(i, 1)
        const newEntity = entityParams()
        entities.current.push(newEntity) 
      }
    })

    drawConnections()

    entities.current.forEach(entity => {
        drawEntity(entity)
    })

    animationRef.current = window.requestAnimationFrame(animate)
  }

  return (
    <div
      ref={canvasContainerRef}
      className={cn("fixed inset-0 overflow-hidden", className)}
      style={{ backgroundColor: '#A8FF43' }}
    >
      <canvas className="absolute inset-0 size-full" ref={canvasRef} />
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

Particles.displayName = "Particles"

export default function ParticlesDemo() {
  return <Particles quantity={20} />
}