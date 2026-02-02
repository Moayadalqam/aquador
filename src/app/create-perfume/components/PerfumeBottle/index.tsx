'use client'

import { motion } from 'framer-motion'
import { FragranceNote } from '@/lib/perfume/types'
import LiquidLayer from './LiquidLayer'
import Particles from './Particles'
import WaveSurface from './WaveSurface'

type NoteLayer = 'top' | 'heart' | 'base'

interface PerfumeBottleProps {
  composition: {
    top: FragranceNote | null
    heart: FragranceNote | null
    base: FragranceNote | null
  }
  activeLayer: NoteLayer
  className?: string
}

export default function PerfumeBottle({ composition, activeLayer, className = '' }: PerfumeBottleProps) {
  const hasAnyLiquid = composition.top || composition.heart || composition.base

  // Calculate the top surface position based on filled layers
  const getTopSurfaceY = () => {
    if (composition.top) return 1
    if (composition.heart) return 34
    if (composition.base) return 67
    return 100
  }

  // Get the top visible color for the wave
  const getTopColor = () => {
    if (composition.top) return composition.top.color
    if (composition.heart) return composition.heart.color
    if (composition.base) return composition.base.color
    return 'rgba(212,175,55,0.5)'
  }

  return (
    <div className={`relative pt-6 ${className}`} style={{ overflow: 'visible' }}>
      {/* Ambient glow behind bottle */}
      {hasAnyLiquid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse 60% 80% at 50% 60%, ${getTopColor()}30 0%, transparent 60%)`,
            filter: 'blur(40px)',
          }}
        />
      )}

      {/* Layer indicator labels */}
      <div className="absolute left-0 top-6 h-[calc(100%-1.5rem)] flex flex-col justify-between py-8 -translate-x-full pr-4 hidden lg:flex">
        {(['top', 'heart', 'base'] as NoteLayer[]).map((layer) => {
          const isActive = activeLayer === layer
          const note = composition[layer]
          return (
            <motion.div
              key={layer}
              animate={{
                opacity: isActive ? 1 : 0.4,
                x: isActive ? 0 : -10,
              }}
              className="text-right"
            >
              <span className={`text-xs uppercase tracking-widest ${isActive ? 'text-gold' : 'text-gray-500'}`}>
                {layer}
              </span>
              {note && (
                <span className="block text-sm text-white mt-1">{note.name}</span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* SVG Bottle */}
      <svg
        viewBox="0 -22 100 142"
        className="w-full h-full"
        style={{ maxWidth: '280px', maxHeight: '420px', overflow: 'visible' }}
      >
        <defs>
          {/* Glass gradient */}
          <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>

          {/* Bottle shine */}
          <linearGradient id="bottleShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>

          {/* Clip path for liquid */}
          <clipPath id="bottleClip">
            <rect x="15" y="1" width="70" height="99" rx="4" />
          </clipPath>

          {/* Gold gradient for cap */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>

        {/* Bottle cap/neck */}
        <g className="bottle-cap">
          {/* Cap base */}
          <rect
            x="35"
            y="-18"
            width="30"
            height="20"
            rx="3"
            fill="url(#goldGradient)"
          />
          {/* Cap highlight */}
          <rect
            x="35"
            y="-18"
            width="30"
            height="20"
            rx="3"
            fill="url(#bottleShine)"
          />
          {/* Cap ring */}
          <rect
            x="33"
            y="-2"
            width="34"
            height="4"
            rx="1"
            fill="#B8860B"
          />
        </g>

        {/* Bottle body outline */}
        <rect
          x="14"
          y="0"
          width="72"
          height="100"
          rx="5"
          fill="none"
          stroke="rgba(212,175,55,0.3)"
          strokeWidth="1"
        />

        {/* Glass background */}
        <rect
          x="15"
          y="1"
          width="70"
          height="98"
          rx="4"
          fill="url(#glassGradient)"
        />

        {/* Liquid layers (clipped to bottle shape) */}
        <g clipPath="url(#bottleClip)">
          {/* Base layer (bottom) */}
          <LiquidLayer
            layer="base"
            color={composition.base?.color || null}
            isFilled={!!composition.base}
          />

          {/* Heart layer (middle) */}
          <LiquidLayer
            layer="heart"
            color={composition.heart?.color || null}
            isFilled={!!composition.heart}
          />

          {/* Top layer (top) */}
          <LiquidLayer
            layer="top"
            color={composition.top?.color || null}
            isFilled={!!composition.top}
          />

          {/* Rising bubbles/particles */}
          <Particles
            isActive={!!hasAnyLiquid}
            colors={[composition.top?.color || null, composition.heart?.color || null, composition.base?.color || null]}
          />

          {/* Animated wave on liquid surface */}
          <WaveSurface
            y={getTopSurfaceY()}
            color={getTopColor()}
            isVisible={!!hasAnyLiquid}
          />
        </g>

        {/* Glass reflection lines */}
        <g className="reflections" opacity={0.4}>
          <line
            x1="22"
            y1="10"
            x2="22"
            y2="90"
            stroke="white"
            strokeWidth="0.5"
            opacity={0.3}
          />
          <line
            x1="25"
            y1="15"
            x2="25"
            y2="85"
            stroke="white"
            strokeWidth="1"
            opacity={0.15}
          />
        </g>

        {/* Layer separator lines (subtle) */}
        <g className="layer-separators" opacity={0.2}>
          <line x1="15" y1="34" x2="85" y2="34" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="15" y1="67" x2="85" y2="67" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
        </g>

        {/* Active layer indicator */}
        <motion.rect
          x="12"
          y={activeLayer === 'top' ? 1 : activeLayer === 'heart' ? 34 : 67}
          width="76"
          height="33"
          rx="4"
          fill="none"
          stroke="rgba(212,175,55,0.6)"
          strokeWidth="2"
          initial={false}
          animate={{
            y: activeLayer === 'top' ? 1 : activeLayer === 'heart' ? 34 : 67,
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            y: { duration: 0.3, ease: 'easeOut' },
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Bottle bottom */}
        <rect
          x="15"
          y="98"
          width="70"
          height="2"
          rx="1"
          fill="rgba(212,175,55,0.2)"
        />
      </svg>

    </div>
  )
}
