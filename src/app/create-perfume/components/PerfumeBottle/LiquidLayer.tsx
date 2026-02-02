'use client'

import { motion } from 'framer-motion'

interface LiquidLayerProps {
  layer: 'top' | 'heart' | 'base'
  color: string | null
  isFilled: boolean
}

// Each layer takes up ~33% of the bottle height
const layerConfig = {
  base: { y: 67, height: 33 }, // Bottom third
  heart: { y: 34, height: 33 }, // Middle third
  top: { y: 1, height: 33 }, // Top third
}

export default function LiquidLayer({ layer, color, isFilled }: LiquidLayerProps) {
  const config = layerConfig[layer]
  const fillColor = color || 'rgba(212,175,55,0.3)' // Default gold tint

  return (
    <motion.g>
      {/* Main liquid fill */}
      <motion.rect
        x="15"
        y={config.y}
        width="70"
        height={config.height}
        rx="2"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{
          scaleY: isFilled ? 1 : 0,
          opacity: isFilled ? 1 : 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          fill: fillColor,
          transformOrigin: layer === 'base' ? 'center bottom' : layer === 'top' ? 'center top' : 'center center',
        }}
      />

      {/* Glow effect */}
      {isFilled && (
        <motion.rect
          x="15"
          y={config.y}
          width="70"
          height={config.height}
          rx="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            fill: fillColor,
            filter: 'blur(4px)',
          }}
        />
      )}
    </motion.g>
  )
}
