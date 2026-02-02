'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface ParticlesProps {
  isActive: boolean
  colors: (string | null)[]
}

interface Bubble {
  id: number
  x: number
  delay: number
  duration: number
  size: number
}

export default function Particles({ isActive, colors }: ParticlesProps) {
  // Generate random bubble positions
  const bubbles = useMemo<Bubble[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60, // Random x position within bottle
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 1 + Math.random() * 2,
    }))
  }, [])

  // Get an active color from the composition
  const activeColor = colors.find(c => c !== null) || 'rgba(212,175,55,0.5)'

  if (!isActive) return null

  return (
    <g className="particles">
      {bubbles.map((bubble) => (
        <motion.circle
          key={bubble.id}
          cx={bubble.x}
          r={bubble.size}
          fill={activeColor}
          opacity={0.4}
          initial={{ cy: 95, opacity: 0 }}
          animate={{
            cy: [95, 10],
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  )
}
