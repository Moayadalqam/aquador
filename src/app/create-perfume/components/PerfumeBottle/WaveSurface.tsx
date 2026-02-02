'use client'

import { motion } from 'framer-motion'

interface WaveSurfaceProps {
  y: number
  color: string
  isVisible: boolean
}

export default function WaveSurface({ y, color, isVisible }: WaveSurfaceProps) {
  if (!isVisible) return null

  return (
    <motion.g>
      {/* Wave path */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          d: [
            `M15 ${y} Q35 ${y - 2} 50 ${y} Q65 ${y + 2} 85 ${y}`,
            `M15 ${y} Q35 ${y + 2} 50 ${y} Q65 ${y - 2} 85 ${y}`,
            `M15 ${y} Q35 ${y - 2} 50 ${y} Q65 ${y + 2} 85 ${y}`,
          ],
        }}
        transition={{
          d: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
          opacity: {
            duration: 0.5,
          },
        }}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity={0.6}
      />

      {/* Secondary wave for depth */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.3,
          d: [
            `M15 ${y + 1} Q40 ${y + 3} 50 ${y + 1} Q60 ${y - 1} 85 ${y + 1}`,
            `M15 ${y + 1} Q40 ${y - 1} 50 ${y + 1} Q60 ${y + 3} 85 ${y + 1}`,
            `M15 ${y + 1} Q40 ${y + 3} 50 ${y + 1} Q60 ${y - 1} 85 ${y + 1}`,
          ],
        }}
        transition={{
          d: {
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          },
          opacity: {
            duration: 0.5,
          },
        }}
        fill="none"
        stroke={color}
        strokeWidth="0.5"
      />
    </motion.g>
  )
}
