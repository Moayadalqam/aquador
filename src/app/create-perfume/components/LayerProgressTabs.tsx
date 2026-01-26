'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PerfumeComposition } from '@/lib/perfume/types'
import { tabVariants, activeIndicatorVariants, staggerContainer } from '../motion'

type NoteLayer = 'top' | 'heart' | 'base'

interface LayerProgressTabsProps {
  activeLayer: NoteLayer
  composition: PerfumeComposition
  onLayerChange: (layer: NoteLayer) => void
  reducedMotion?: boolean
}

const layerInfo: { key: NoteLayer; label: string; description: string }[] = [
  { key: 'top', label: 'Top Note', description: 'First impression' },
  { key: 'heart', label: 'Heart Note', description: 'Core character' },
  { key: 'base', label: 'Base Note', description: 'Lasting trail' },
]

export function LayerProgressTabs({
  activeLayer,
  composition,
  onLayerChange,
  reducedMotion = false,
}: LayerProgressTabsProps) {
  return (
    <motion.div
      variants={reducedMotion ? undefined : staggerContainer}
      initial={reducedMotion ? undefined : 'initial'}
      animate={reducedMotion ? undefined : 'animate'}
      className="mb-12 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4"
      role="tablist"
      aria-label="Fragrance layer selection"
    >
      {layerInfo.map((layer, index) => {
        const isActive = activeLayer === layer.key
        const isCompleted = composition[layer.key] !== null
        const selectedNote = composition[layer.key]

        return (
          <motion.button
            key={layer.key}
            variants={reducedMotion ? undefined : tabVariants}
            whileHover={reducedMotion ? undefined : 'hover'}
            whileTap={reducedMotion ? undefined : 'tap'}
            onClick={() => onLayerChange(layer.key)}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'step' : undefined}
            className={`
              relative px-6 sm:px-8 py-4 text-sm tracking-widest transition-all duration-300
              rounded-lg overflow-hidden
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
              ${isActive
                ? 'bg-amber-500/20 text-amber-400'
                : isCompleted
                  ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-400'
              }
            `}
          >
            {/* Step number indicator */}
            <div className="flex items-center gap-3">
              <span
                className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                  transition-all duration-300
                  ${isActive
                    ? 'bg-amber-400 text-black'
                    : isCompleted
                      ? 'bg-green-500 text-black'
                      : 'bg-white/10 text-gray-500'
                  }
                `}
              >
                {isCompleted && !isActive ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>

              <div className="text-left">
                <span className="block uppercase text-xs sm:text-sm">{layer.label}</span>
                {selectedNote && (
                  <motion.span
                    initial={reducedMotion ? undefined : { opacity: 0, y: -5 }}
                    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    className="block text-[10px] sm:text-xs mt-0.5 opacity-70"
                  >
                    {selectedNote.icon} {selectedNote.name}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Active indicator bar */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  variants={reducedMotion ? undefined : activeIndicatorVariants}
                  initial={reducedMotion ? { scaleX: 1 } : 'initial'}
                  animate={reducedMotion ? undefined : 'animate'}
                  exit={reducedMotion ? undefined : 'exit'}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 origin-left"
                />
              )}
            </AnimatePresence>

            {/* Glow effect for active state */}
            {isActive && !reducedMotion && (
              <motion.div
                className="absolute inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(212,175,55,0.15) 0%, transparent 70%)',
                }}
              />
            )}
          </motion.button>
        )
      })}

      {/* Progress connector lines (visible on desktop) */}
      <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4 pointer-events-none -z-10">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`w-20 h-px transition-all duration-500 ${
              (i === 0 && (composition.top || composition.heart || composition.base)) ||
              (i === 1 && (composition.heart || composition.base))
                ? 'bg-gradient-to-r from-green-500/50 to-green-500/50'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
