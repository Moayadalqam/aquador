'use client'

import { motion } from 'framer-motion'
import { PerfumeComposition, PerfumeVolume } from '@/lib/perfume/types'
import { calculatePrice } from '@/lib/perfume/pricing'
import { formVariants, buttonVariants, slideUpFadeVariants } from '../motion'

interface CheckoutFormProps {
  composition: PerfumeComposition
  perfumeName: string
  onPerfumeNameChange: (name: string) => void
  selectedVolume: PerfumeVolume | null
  onVolumeChange: (volume: PerfumeVolume) => void
  specialRequests: string
  onSpecialRequestsChange: (requests: string) => void
  error: string | null
  isProcessing: boolean
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  reducedMotion?: boolean
}

const volumes: PerfumeVolume[] = ['50ml', '100ml']

export function CheckoutForm({
  composition,
  perfumeName,
  onPerfumeNameChange,
  selectedVolume,
  onVolumeChange,
  specialRequests,
  onSpecialRequestsChange,
  error,
  isProcessing,
  onSubmit,
  onBack,
  reducedMotion = false,
}: CheckoutFormProps) {
  const price = selectedVolume ? calculatePrice(selectedVolume) : 0

  return (
    <motion.div
      variants={reducedMotion ? undefined : formVariants}
      initial={reducedMotion ? undefined : 'initial'}
      animate={reducedMotion ? undefined : 'animate'}
      exit={reducedMotion ? undefined : 'exit'}
      className="container mx-auto max-w-lg px-4 py-12"
    >
      {/* Back button */}
      <motion.button
        initial={reducedMotion ? undefined : { opacity: 0, x: -10 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group focus:outline-none focus-visible:text-amber-400"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Composer</span>
      </motion.button>

      {/* Form card */}
      <div className="rounded-2xl border border-amber-900/30 bg-black/50 p-8 backdrop-blur-lg relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-900/10 via-transparent to-transparent" />

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/30" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/30" />

        <motion.h2
          initial={reducedMotion ? undefined : { opacity: 0, y: -10 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="mb-8 text-center text-2xl text-amber-400 tracking-[0.15em] font-light"
        >
          FINALIZE YOUR FRAGRANCE
        </motion.h2>

        {/* Composition Review */}
        <motion.div
          variants={reducedMotion ? undefined : slideUpFadeVariants}
          initial={reducedMotion ? undefined : 'initial'}
          animate={reducedMotion ? undefined : 'animate'}
          className="mb-8 rounded-xl bg-gradient-to-br from-white/5 to-transparent p-4 border border-white/5"
        >
          <h3 className="mb-3 text-xs text-gray-400 tracking-[0.15em] uppercase">Your Composition</h3>
          <div className="flex items-center gap-3 text-white">
            {composition.top && (
              <span className="flex items-center gap-1">
                <span>{composition.top.icon}</span>
                <span className="text-sm">{composition.top.name}</span>
              </span>
            )}
            <span className="text-amber-400/50">•</span>
            {composition.heart && (
              <span className="flex items-center gap-1">
                <span>{composition.heart.icon}</span>
                <span className="text-sm">{composition.heart.name}</span>
              </span>
            )}
            <span className="text-amber-400/50">•</span>
            {composition.base && (
              <span className="flex items-center gap-1">
                <span>{composition.base.icon}</span>
                <span className="text-sm">{composition.base.name}</span>
              </span>
            )}
          </div>
        </motion.div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Perfume Name Input */}
          <motion.div
            variants={reducedMotion ? undefined : slideUpFadeVariants}
            initial={reducedMotion ? undefined : 'initial'}
            animate={reducedMotion ? undefined : 'animate'}
          >
            <label className="mb-2 block text-xs text-gray-400 tracking-[0.15em] uppercase">
              Perfume Name *
            </label>
            <input
              type="text"
              value={perfumeName}
              onChange={(e) => onPerfumeNameChange(e.target.value)}
              placeholder="Name your creation..."
              maxLength={30}
              className="w-full rounded-lg border border-amber-900/30 bg-white/5 px-4 py-3.5 text-white placeholder-gray-600
                         transition-all duration-300
                         focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50
                         hover:border-amber-900/50"
            />
            <span className="mt-1 block text-right text-xs text-gray-600">
              {perfumeName.length}/30
            </span>
          </motion.div>

          {/* Volume Selection */}
          <motion.div
            variants={reducedMotion ? undefined : slideUpFadeVariants}
            initial={reducedMotion ? undefined : 'initial'}
            animate={reducedMotion ? undefined : 'animate'}
          >
            <label className="mb-3 block text-xs text-gray-400 tracking-[0.15em] uppercase">
              Select Volume *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {volumes.map((vol) => (
                <motion.button
                  key={vol}
                  type="button"
                  whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => onVolumeChange(vol)}
                  className={`
                    relative rounded-xl border p-5 transition-all duration-300 overflow-hidden
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                    ${selectedVolume === vol
                      ? 'border-amber-400 bg-amber-500/20 text-amber-400'
                      : 'border-amber-900/30 bg-white/5 text-gray-400 hover:border-amber-400/50 hover:bg-white/10'
                    }
                  `}
                >
                  {/* Selected glow effect */}
                  {selectedVolume === vol && (
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-400/10 to-transparent" />
                  )}
                  <div className="text-3xl font-light">{vol}</div>
                  <div className="mt-2 text-sm font-medium">€{calculatePrice(vol).toFixed(2)}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Special Requests */}
          <motion.div
            variants={reducedMotion ? undefined : slideUpFadeVariants}
            initial={reducedMotion ? undefined : 'initial'}
            animate={reducedMotion ? undefined : 'animate'}
          >
            <label className="mb-2 block text-xs text-gray-400 tracking-[0.15em] uppercase">
              Special Requests
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => onSpecialRequestsChange(e.target.value)}
              placeholder="Any special requests for your fragrance..."
              maxLength={500}
              rows={4}
              className="w-full rounded-lg border border-amber-900/30 bg-white/5 px-4 py-3.5 text-white placeholder-gray-600
                         transition-all duration-300 resize-none
                         focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50
                         hover:border-amber-900/50"
            />
            <span className="mt-1 block text-right text-xs text-gray-600">
              {specialRequests.length}/500
            </span>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              className="rounded-lg bg-red-900/20 border border-red-900/50 px-4 py-3 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Footer with total and submit */}
          <motion.div
            variants={reducedMotion ? undefined : slideUpFadeVariants}
            initial={reducedMotion ? undefined : 'initial'}
            animate={reducedMotion ? undefined : 'animate'}
            className="flex items-center justify-between border-t border-white/10 pt-6"
          >
            <div>
              <div className="text-xs text-gray-400 tracking-wider uppercase">Total</div>
              <motion.div
                key={price}
                initial={reducedMotion ? undefined : { scale: 1.1 }}
                animate={reducedMotion ? undefined : { scale: 1 }}
                className="text-3xl text-amber-400 font-light"
              >
                €{price.toFixed(2)}
              </motion.div>
            </div>
            <motion.button
              type="submit"
              variants={reducedMotion ? undefined : buttonVariants}
              whileHover={reducedMotion || isProcessing || !perfumeName || !selectedVolume ? undefined : 'hover'}
              whileTap={reducedMotion || isProcessing || !perfumeName || !selectedVolume ? undefined : 'tap'}
              disabled={isProcessing || !perfumeName || !selectedVolume}
              className={`
                rounded-full px-8 py-4 text-sm tracking-[0.1em] transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
                ${isProcessing || !perfumeName || !selectedVolume
                  ? 'cursor-not-allowed bg-white/10 text-gray-600'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-medium hover:shadow-lg hover:shadow-amber-500/30'
                }
              `}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  PROCESSING...
                </span>
              ) : (
                'PAY WITH STRIPE'
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  )
}
