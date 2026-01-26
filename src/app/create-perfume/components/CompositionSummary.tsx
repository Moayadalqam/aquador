'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PerfumeComposition } from '@/lib/perfume/types'
import { summaryRowVariants, buttonVariants, fadeInScaleVariants } from '../motion'

interface CompositionSummaryProps {
  composition: PerfumeComposition
  isComplete: boolean
  onCheckout: () => void
  reducedMotion?: boolean
}

const layers: { key: 'top' | 'heart' | 'base'; label: string }[] = [
  { key: 'top', label: 'Top Note' },
  { key: 'heart', label: 'Heart Note' },
  { key: 'base', label: 'Base Note' },
]

export function CompositionSummary({
  composition,
  isComplete,
  onCheckout,
  reducedMotion = false,
}: CompositionSummaryProps) {
  return (
    <motion.div
      variants={reducedMotion ? undefined : fadeInScaleVariants}
      initial={reducedMotion ? undefined : 'initial'}
      animate={reducedMotion ? undefined : 'animate'}
      className="mx-auto max-w-md rounded-2xl border border-amber-900/30 bg-black/40 p-6 backdrop-blur-lg overflow-hidden relative"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-900/5 to-transparent" />

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-400/20" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-amber-400/20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-amber-400/20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-400/20" />

      {/* Header */}
      <h3 className="mb-6 text-center text-lg text-amber-400 tracking-[0.2em] font-light">
        YOUR COMPOSITION
      </h3>

      {/* Composition rows */}
      <div className="space-y-3 text-sm" role="region" aria-live="polite" aria-label="Selected fragrance notes">
        {layers.map((layer, index) => {
          const note = composition[layer.key]
          const isLast = index === layers.length - 1

          return (
            <motion.div
              key={layer.key}
              variants={reducedMotion ? undefined : summaryRowVariants}
              initial={reducedMotion ? undefined : 'initial'}
              animate={reducedMotion ? undefined : note ? 'filled' : 'animate'}
              className={`
                flex justify-between items-center py-2.5 px-1
                ${!isLast ? 'border-b border-white/10' : ''}
              `}
            >
              <span className="text-gray-400 tracking-wider text-xs uppercase">
                {layer.label}
              </span>
              <AnimatePresence mode="wait">
                {note ? (
                  <motion.span
                    key={note.name}
                    initial={reducedMotion ? undefined : { opacity: 0, x: 10 }}
                    animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <span className="text-base">{note.icon}</span>
                    <span className="font-light">{note.name}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: note.color }}
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="empty"
                    className="text-gray-600 italic"
                  >
                    Select a note
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Checkout button */}
      <motion.button
        variants={reducedMotion ? undefined : buttonVariants}
        initial={reducedMotion ? undefined : 'initial'}
        animate={reducedMotion ? undefined : isComplete ? 'animate' : 'disabled'}
        whileHover={reducedMotion || !isComplete ? undefined : 'hover'}
        whileTap={reducedMotion || !isComplete ? undefined : 'tap'}
        onClick={onCheckout}
        disabled={!isComplete}
        className={`
          mt-8 w-full rounded-full py-4 text-sm tracking-[0.15em] transition-all duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
          ${isComplete
            ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-medium hover:shadow-lg hover:shadow-amber-500/30'
            : 'cursor-not-allowed bg-white/10 text-gray-600'
          }
        `}
      >
        {isComplete ? 'CONTINUE TO CHECKOUT' : 'SELECT ALL NOTES'}
      </motion.button>

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center gap-2">
        {layers.map((layer) => (
          <motion.div
            key={layer.key}
            animate={reducedMotion ? undefined : {
              scale: composition[layer.key] ? 1 : 0.8,
              backgroundColor: composition[layer.key]
                ? composition[layer.key]!.color
                : 'rgba(255,255,255,0.2)',
            }}
            transition={{ duration: 0.3 }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  )
}
