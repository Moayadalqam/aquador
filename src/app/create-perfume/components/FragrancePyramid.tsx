'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PerfumeComposition } from '@/lib/perfume/types'
import { pyramidLayerVariants, glowPulseVariants } from '../motion'

type NoteLayer = 'top' | 'heart' | 'base'

interface FragrancePyramidProps {
  composition: PerfumeComposition
  activeLayer: NoteLayer
  reducedMotion?: boolean
}

const layerConfig = [
  { key: 'top' as NoteLayer, label: 'TOP', widthPercent: 60, defaultColor: 'rgba(255,215,0,0.1)' },
  { key: 'heart' as NoteLayer, label: 'HEART', widthPercent: 75, defaultColor: 'rgba(212,175,55,0.1)' },
  { key: 'base' as NoteLayer, label: 'BASE', widthPercent: 90, defaultColor: 'rgba(139,115,85,0.1)' },
]

export function FragrancePyramid({
  composition,
  activeLayer,
  reducedMotion = false,
}: FragrancePyramidProps) {
  return (
    <div className="relative mx-auto mb-8 hidden md:flex flex-col items-center w-full max-w-xs">
      {/* Ambient glow behind pyramid */}
      {!reducedMotion && (
        <motion.div
          variants={glowPulseVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 -z-10 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,175,55,0.15) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Pyramid layers */}
      <div className="relative w-full flex flex-col items-center gap-1.5">
        {layerConfig.map((layer) => {
          const note = composition[layer.key]
          const isActive = activeLayer === layer.key
          const isFilled = note !== null

          return (
            <motion.div
              key={layer.key}
              variants={reducedMotion ? undefined : pyramidLayerVariants}
              initial={reducedMotion ? undefined : 'initial'}
              animate={reducedMotion ? undefined : isFilled ? 'filled' : 'animate'}
              className="relative"
              style={{
                width: `${layer.widthPercent}%`,
                '--glow-color': note?.color ? `${note.color}40` : 'rgba(212,175,55,0.2)',
              } as React.CSSProperties}
            >
              {/* Pyramid trapezoid shape */}
              <div
                className={`
                  pyramid-layer relative h-14 flex items-center justify-center
                  transition-all duration-500
                  ${isActive && !reducedMotion ? 'scale-105' : ''}
                `}
                style={{
                  background: isFilled
                    ? `linear-gradient(135deg, ${note.color}30 0%, ${note.color}15 100%)`
                    : layer.defaultColor,
                  border: `1px solid ${isFilled ? `${note.color}50` : 'rgba(212,175,55,0.2)'}`,
                  boxShadow: isActive
                    ? `0 0 25px ${isFilled ? `${note.color}30` : 'rgba(212,175,55,0.2)'}, inset 0 0 20px ${isFilled ? `${note.color}10` : 'rgba(212,175,55,0.05)'}`
                    : 'none',
                }}
              >
                {/* Active layer pulse effect */}
                <AnimatePresence>
                  {isActive && !reducedMotion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.02, 1],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 pyramid-layer"
                      style={{
                        background: isFilled
                          ? `linear-gradient(135deg, ${note.color}20 0%, transparent 50%)`
                          : 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, transparent 50%)',
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Layer content */}
                <div className="relative z-10 flex items-center gap-2 text-xs">
                  <span
                    className={`
                      font-medium tracking-wider transition-colors duration-300
                      ${isActive ? 'text-amber-300' : isFilled ? 'text-white' : 'text-gray-500'}
                    `}
                  >
                    {layer.label}
                  </span>
                  {isFilled && (
                    <motion.span
                      initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 text-white/80"
                    >
                      <span>{note.icon}</span>
                      <span className="text-[10px]">{note.name}</span>
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Decorative corner accents for active layer */}
              {isActive && !reducedMotion && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-amber-400/50"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-amber-400/50"
                  />
                </>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Floating particles (decorative) */}
      {!reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-amber-400/30"
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: -50,
                x: Math.sin(i * 1.5) * 40,
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
              style={{
                left: `${15 + i * 14}%`,
                bottom: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
