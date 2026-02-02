'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume, FragranceCategory } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { calculatePrice } from '@/lib/perfume/pricing'

type NoteLayer = 'top' | 'heart' | 'base'

const categoryThemes = {
  floral: { primary: '#FF6B9D', glow: 'rgba(255,107,157,0.3)' },
  fruity: { primary: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
  woody: { primary: '#8B7355', glow: 'rgba(139,115,85,0.3)' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.3)' },
  gourmand: { primary: '#AF6E4D', glow: 'rgba(175,110,77,0.3)' },
}

const categoryIcons: Record<FragranceCategory, string> = {
  floral: '🌸',
  fruity: '🍊',
  woody: '🌲',
  oriental: '✨',
  gourmand: '🍯',
}

const layerDescriptions: Record<NoteLayer, { title: string; subtitle: string }> = {
  top: { title: 'Top Notes', subtitle: 'The first impression — light, fresh, evaporates quickly' },
  heart: { title: 'Heart Notes', subtitle: 'The soul of your fragrance — emerges as top fades' },
  base: { title: 'Base Notes', subtitle: 'The foundation — rich, deep, long-lasting' },
}

// Custom hook for reduced motion preference
function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}

export default function CreatePerfumePage() {
  const [composition, setComposition] = useState<PerfumeComposition>({
    top: null,
    heart: null,
    base: null,
  })
  const [activeLayer, setActiveLayer] = useState<NoteLayer>('top')
  const [activeCategory, setActiveCategory] = useState<FragranceCategory>('floral')

  const [perfumeName, setPerfumeName] = useState('')
  const [selectedVolume, setSelectedVolume] = useState<PerfumeVolume | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const reducedMotion = useReducedMotion()

  const handleSelectNote = (layer: NoteLayer, note: FragranceNote) => {
    setComposition(prev => ({ ...prev, [layer]: note }))

    // Auto-advance to next layer
    if (layer === 'top') {
      setActiveLayer('heart')
      setActiveCategory('floral')
    } else if (layer === 'heart') {
      setActiveLayer('base')
      setActiveCategory('woody')
    }
  }

  const isComplete = isCompositionComplete(composition)

  const handleStartCheckout = () => {
    if (isComplete) {
      setShowForm(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const formData = {
      name: perfumeName,
      composition,
      volume: selectedVolume,
      specialRequests,
    }

    const validationResult = validatePerfumeForm(formData)
    if (!validationResult.isValid) {
      const errorMessages = Object.values(validationResult.errors).flat()
      setError(errorMessages[0] || 'Please fix the errors')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/create-perfume/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfumeName: perfumeName,
          composition: {
            top: composition.top?.name,
            heart: composition.heart?.name,
            base: composition.base?.name,
          },
          volume: selectedVolume,
          specialRequests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to Stripe Checkout (same as regular product checkout)
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  const notes = fragranceDatabase[activeCategory] || []
  const theme = categoryThemes[activeCategory]
  const completedLayers = (['top', 'heart', 'base'] as NoteLayer[]).filter(l => composition[l] !== null).length

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-amber-500/8 via-amber-500/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/5 via-gold/2 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-radial from-amber-400/4 to-transparent rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Top vignette */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="composer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Hero Section */}
            <div className="text-center mb-16 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block text-[10px] tracking-[0.4em] text-gold/60 uppercase mb-4">
                  Bespoke Fragrance Atelier
                </span>
                <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
                  Create Your{' '}
                  <span className="text-gradient-gold">Signature</span>
                </h1>
                <p className="max-w-xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed">
                  Craft a fragrance as unique as you are. Select your top, heart, and base notes
                  to compose a scent that tells your story.
                </p>
              </motion.div>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-4xl mx-auto px-4 mb-12">
              <div className="flex items-center justify-center gap-2 md:gap-4">
                {(['top', 'heart', 'base'] as NoteLayer[]).map((layer, index) => {
                  const isActive = activeLayer === layer
                  const isCompleted = composition[layer] !== null
                  const selectedNote = composition[layer]

                  return (
                    <motion.button
                      key={layer}
                      onClick={() => setActiveLayer(layer)}
                      className="relative group flex-1 max-w-xs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      {/* Connection line */}
                      {index < 2 && (
                        <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px">
                          <div className={`h-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-gold/50 to-gold/20' : 'bg-white/10'}`} />
                        </div>
                      )}

                      <div className={`
                        relative p-4 md:p-6 rounded-2xl transition-all duration-500 border
                        ${isActive
                          ? 'bg-gradient-to-b from-gold/15 to-gold/5 border-gold/40 shadow-lg shadow-gold/10'
                          : isCompleted
                            ? 'bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border-emerald-500/30'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20'
                        }
                      `}>
                        {/* Step number */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`
                              flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300
                              ${isActive
                                ? 'bg-gold text-black'
                                : isCompleted
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-white/10 text-gray-500'
                              }
                            `}
                          >
                            {isCompleted && !isActive ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </span>
                          {selectedNote && (
                            <span className="text-lg">{selectedNote.icon}</span>
                          )}
                        </div>

                        {/* Layer info */}
                        <div className="text-left">
                          <span className={`
                            block text-xs md:text-sm font-medium tracking-wider uppercase transition-colors duration-300
                            ${isActive ? 'text-gold' : isCompleted ? 'text-emerald-400' : 'text-gray-400'}
                          `}>
                            {layerDescriptions[layer].title}
                          </span>
                          {selectedNote ? (
                            <span className="block text-white text-sm mt-1 font-light">{selectedNote.name}</span>
                          ) : (
                            <span className="block text-gray-600 text-xs mt-1 hidden md:block">{layerDescriptions[layer].subtitle}</span>
                          )}
                        </div>

                        {/* Active indicator glow */}
                        {isActive && (
                          <motion.div
                            layoutId="activeGlow"
                            className="absolute inset-0 -z-10 rounded-2xl bg-gold/10 blur-xl"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Category Selection */}
            <div className="max-w-5xl mx-auto px-4 mb-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-2 md:gap-3"
              >
                {fragranceCategories.map((cat, index) => {
                  const isActive = activeCategory === cat.key
                  const catTheme = categoryThemes[cat.key]

                  return (
                    <motion.button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className={`
                        relative px-5 md:px-7 py-3 text-xs md:text-sm tracking-wider transition-all duration-300 rounded-full overflow-hidden
                        ${isActive
                          ? 'text-white'
                          : 'text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/10'
                        }
                      `}
                      style={isActive ? {
                        background: `linear-gradient(135deg, ${catTheme.primary}25 0%, ${catTheme.primary}10 100%)`,
                        border: `1px solid ${catTheme.primary}50`,
                        boxShadow: `0 0 30px ${catTheme.primary}15`,
                      } : undefined}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base md:text-lg">{categoryIcons[cat.key]}</span>
                        <span className="uppercase font-medium">{cat.label}</span>
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            </div>

            {/* Notes Grid */}
            <div className="max-w-6xl mx-auto px-4 mb-16">
              <div className="relative">
                {/* Category ambient glow */}
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 -z-10 pointer-events-none"
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-3xl opacity-30"
                    style={{
                      background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${theme.glow} 0%, transparent 70%)`,
                    }}
                  />
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
                  }}
                >
                  {notes.map((note) => {
                    const isSelected = composition[activeLayer]?.name === note.name
                    const isUsedElsewhere = Object.values(composition).some(
                      (n, idx) => n?.name === note.name && (['top', 'heart', 'base'] as NoteLayer[])[idx] !== activeLayer
                    )

                    return (
                      <motion.button
                        key={note.name}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        whileHover={reducedMotion ? undefined : { scale: 1.03, y: -4 }}
                        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                        onClick={() => handleSelectNote(activeLayer, note)}
                        disabled={isUsedElsewhere}
                        className={`
                          relative flex flex-col items-center gap-3 rounded-xl p-5 md:p-6
                          transition-all duration-300 group
                          ${isSelected
                            ? 'bg-gradient-to-b from-gold/20 to-gold/5 ring-2 ring-gold shadow-lg shadow-gold/20'
                            : isUsedElsewhere
                              ? 'bg-white/[0.02] opacity-40 cursor-not-allowed'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/20'
                          }
                        `}
                      >
                        {/* Glass morphism background */}
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(circle at center, ${note.color}15 0%, transparent 70%)`,
                          }}
                        />

                        {/* Note icon with glow */}
                        <div className="relative">
                          <span className="relative text-3xl md:text-4xl z-10 transition-transform duration-300 group-hover:scale-110 block">
                            {note.icon}
                          </span>
                          {isSelected && (
                            <div
                              className="absolute inset-0 blur-xl opacity-60"
                              style={{ backgroundColor: note.color }}
                            />
                          )}
                        </div>

                        {/* Note name */}
                        <span className={`
                          relative text-center text-xs md:text-sm font-medium tracking-wide z-10 transition-colors duration-300
                          ${isSelected ? 'text-gold' : 'text-gray-300 group-hover:text-white'}
                        `}>
                          {note.name}
                        </span>

                        {/* Selected indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="selectedIndicator"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                            style={{ backgroundColor: note.color }}
                            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </motion.div>
              </div>
            </div>

            {/* Composition Summary Panel */}
            <div className="max-w-lg mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden"
              >
                {/* Premium glass card */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl" />
                <div className="absolute inset-0 border border-white/10 rounded-3xl" />

                {/* Gold accent line at top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

                <div className="relative p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase">Your Composition</span>
                    <h3 className="font-playfair text-2xl text-white mt-2">
                      {completedLayers === 3 ? 'Complete' : `${completedLayers} of 3 Notes`}
                    </h3>
                  </div>

                  {/* Composition display */}
                  <div className="space-y-4 mb-8">
                    {(['top', 'heart', 'base'] as NoteLayer[]).map((layer, index) => {
                      const note = composition[layer]
                      const isLast = index === 2

                      return (
                        <div
                          key={layer}
                          className={`flex justify-between items-center py-4 px-2 ${!isLast ? 'border-b border-white/10' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${note ? '' : 'bg-white/20'}`}
                              style={note ? { backgroundColor: note.color, boxShadow: `0 0 10px ${note.color}` } : undefined}
                            />
                            <span className="text-xs text-gray-400 tracking-[0.15em] uppercase font-medium">
                              {layerDescriptions[layer].title}
                            </span>
                          </div>
                          {note ? (
                            <span className="flex items-center gap-2 text-white">
                              <span className="text-lg">{note.icon}</span>
                              <span className="font-light">{note.name}</span>
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm italic">Awaiting selection</span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-3 mb-8">
                    {(['top', 'heart', 'base'] as NoteLayer[]).map((layer) => {
                      const note = composition[layer]
                      return (
                        <motion.div
                          key={layer}
                          className="w-3 h-3 rounded-full transition-all duration-500"
                          animate={{
                            backgroundColor: note ? note.color : 'rgba(255,255,255,0.15)',
                            boxShadow: note ? `0 0 15px ${note.color}50` : 'none',
                            scale: note ? 1 : 0.8,
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Continue button */}
                  <motion.button
                    onClick={handleStartCheckout}
                    disabled={!isComplete}
                    whileHover={isComplete && !reducedMotion ? { scale: 1.02 } : undefined}
                    whileTap={isComplete && !reducedMotion ? { scale: 0.98 } : undefined}
                    className={`
                      relative w-full rounded-full py-5 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-500 overflow-hidden
                      ${isComplete
                        ? 'text-black'
                        : 'cursor-not-allowed bg-white/5 text-gray-600 border border-white/10'
                      }
                    `}
                  >
                    {isComplete && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gold via-amber-300 to-gold"
                        animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 100%' }}
                      />
                    )}
                    <span className="relative z-10">
                      {isComplete ? 'Continue to Checkout' : 'Complete Your Selection'}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Checkout Form */
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="container mx-auto max-w-xl px-4"
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowForm(false)}
              className="mb-10 flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 group-hover:border-gold/50 group-hover:bg-gold/5 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              <span className="text-sm tracking-wider">Back to Composer</span>
            </motion.button>

            {/* Form card */}
            <div className="relative rounded-3xl overflow-hidden">
              {/* Premium glass background */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-3xl" />

              {/* Gold accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

              <div className="relative p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-10">
                  <span className="text-[10px] tracking-[0.4em] text-gold/60 uppercase">Final Step</span>
                  <h2 className="font-playfair text-3xl text-white mt-3">
                    Finalize Your Creation
                  </h2>
                </div>

                {/* Composition Review */}
                <div className="mb-10 rounded-2xl bg-white/[0.03] p-5 border border-white/5">
                  <span className="text-[10px] text-gold/60 tracking-[0.2em] uppercase block mb-4">Your Signature Blend</span>
                  <div className="flex items-center gap-3 text-white flex-wrap">
                    {composition.top && (
                      <span className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                        <span>{composition.top.icon}</span>
                        <span className="text-sm">{composition.top.name}</span>
                      </span>
                    )}
                    <span className="text-gold/30">+</span>
                    {composition.heart && (
                      <span className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                        <span>{composition.heart.icon}</span>
                        <span className="text-sm">{composition.heart.name}</span>
                      </span>
                    )}
                    <span className="text-gold/30">+</span>
                    {composition.base && (
                      <span className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2">
                        <span>{composition.base.icon}</span>
                        <span className="text-sm">{composition.base.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Perfume Name Input */}
                  <div>
                    <label className="mb-3 block text-[10px] text-gold/60 tracking-[0.2em] uppercase">
                      Name Your Creation *
                    </label>
                    <input
                      type="text"
                      value={perfumeName}
                      onChange={(e) => setPerfumeName(e.target.value)}
                      placeholder="e.g., Midnight Bloom"
                      maxLength={30}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white placeholder-gray-600
                                 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 focus:bg-white/[0.05] transition-all"
                    />
                    <span className="mt-2 block text-right text-xs text-gray-600">
                      {perfumeName.length}/30
                    </span>
                  </div>

                  {/* Volume Selection */}
                  <div>
                    <label className="mb-4 block text-[10px] text-gold/60 tracking-[0.2em] uppercase">
                      Select Volume *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => (
                        <motion.button
                          key={vol}
                          type="button"
                          onClick={() => setSelectedVolume(vol)}
                          whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
                          whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
                          className={`
                            relative rounded-2xl border p-6 transition-all duration-300 overflow-hidden
                            ${selectedVolume === vol
                              ? 'border-gold/50 bg-gradient-to-b from-gold/15 to-gold/5 text-gold'
                              : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:bg-white/[0.04]'
                            }
                          `}
                        >
                          {selectedVolume === vol && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <div className="font-playfair text-3xl font-light">{vol}</div>
                          <div className="mt-2 text-lg font-medium">€{calculatePrice(vol).toFixed(2)}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="mb-3 block text-[10px] text-gold/60 tracking-[0.2em] uppercase">
                      Special Requests <span className="text-gray-600">(Optional)</span>
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Share any specific preferences or notes about your fragrance..."
                      maxLength={500}
                      rows={4}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white placeholder-gray-600
                                 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 focus:bg-white/[0.05] transition-all resize-none"
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Footer with total and submit */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-8">
                    <div>
                      <div className="text-[10px] text-gold/60 tracking-[0.2em] uppercase mb-1">Total</div>
                      <div className="font-playfair text-4xl text-white">
                        €{selectedVolume ? calculatePrice(selectedVolume).toFixed(2) : '0.00'}
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isProcessing || !perfumeName || !selectedVolume}
                      whileHover={!isProcessing && perfumeName && selectedVolume && !reducedMotion ? { scale: 1.02 } : undefined}
                      whileTap={!isProcessing && perfumeName && selectedVolume && !reducedMotion ? { scale: 0.98 } : undefined}
                      className={`
                        relative rounded-full px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 overflow-hidden
                        ${isProcessing || !perfumeName || !selectedVolume
                          ? 'cursor-not-allowed bg-white/5 text-gray-600 border border-white/10'
                          : 'text-black'
                        }
                      `}
                    >
                      {!isProcessing && perfumeName && selectedVolume && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gold via-amber-300 to-gold" />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {isProcessing ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Pay with Stripe'
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
