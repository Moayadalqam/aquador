'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume, FragranceCategory } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { calculatePrice } from '@/lib/perfume/pricing'
import { PerfumeBottle, CategoryTabs, NoteCarousel } from './components'
import { categoryThemes } from './motion'

type NoteLayer = 'top' | 'heart' | 'base'

const layerDescriptions: Record<NoteLayer, { title: string; subtitle: string; icon: string }> = {
  top: { title: 'Top Notes', subtitle: 'First impression', icon: '✨' },
  heart: { title: 'Heart Notes', subtitle: 'The soul', icon: '💫' },
  base: { title: 'Base Notes', subtitle: 'Foundation', icon: '🌟' },
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
  const [activeLayer, setActiveLayer] = useState<NoteLayer>('base')
  const [activeCategory, setActiveCategory] = useState<FragranceCategory>('woody')

  const [perfumeName, setPerfumeName] = useState('')
  const [selectedVolume, setSelectedVolume] = useState<PerfumeVolume | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const reducedMotion = useReducedMotion()

  const handleSelectNote = (layer: NoteLayer, note: FragranceNote) => {
    setComposition(prev => ({ ...prev, [layer]: note }))

    // Auto-advance to next layer (base -> heart -> top)
    if (layer === 'base') {
      setActiveLayer('heart')
      setActiveCategory('floral')
    } else if (layer === 'heart') {
      setActiveLayer('top')
      setActiveCategory('fruity')
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

      // Redirect to Stripe Checkout
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
    <div className="min-h-screen bg-black text-white pt-24 pb-20 overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-amber-500/8 via-amber-500/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/5 via-gold/2 to-transparent rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
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
            <div className="text-center mb-8 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block text-[10px] tracking-[0.4em] text-gold/60 uppercase mb-3">
                  Bespoke Fragrance Atelier
                </span>
                <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4">
                  Create Your{' '}
                  <span className="text-gradient-gold">Signature</span>
                </h1>
              </motion.div>
            </div>

            {/* Main Layout - Desktop: Side by side, Mobile: Stacked */}
            <div className="max-w-7xl mx-auto px-4">
              {/* Desktop Layout */}
              <div className="hidden lg:grid lg:grid-cols-[1fr,320px,1fr] gap-8 items-start">
                {/* Left: Layer Steps & Note Selection */}
                <div className="space-y-6">
                  {/* Layer Progress Steps */}
                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                    <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase mb-4 block">Build Your Scent</span>
                    <div className="space-y-3">
                      {(['base', 'heart', 'top'] as NoteLayer[]).map((layer) => {
                        const isActive = activeLayer === layer
                        const isCompleted = composition[layer] !== null
                        const selectedNote = composition[layer]

                        return (
                          <motion.button
                            key={layer}
                            onClick={() => setActiveLayer(layer)}
                            className={`
                              w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left
                              ${isActive
                                ? 'bg-gradient-to-r from-gold/15 to-transparent border border-gold/30'
                                : isCompleted
                                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                                  : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'
                              }
                            `}
                            whileHover={!reducedMotion ? { x: 4 } : undefined}
                          >
                            <span
                              className={`
                                flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold
                                ${isActive
                                  ? 'bg-gold text-black'
                                  : isCompleted
                                    ? 'bg-emerald-500 text-black'
                                    : 'bg-white/10 text-gray-500'
                                }
                              `}
                            >
                              {isCompleted && !isActive ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span>{layerDescriptions[layer].icon}</span>
                              )}
                            </span>
                            <div className="flex-1">
                              <span className={`block text-sm font-medium ${isActive ? 'text-gold' : 'text-white'}`}>
                                {layerDescriptions[layer].title}
                              </span>
                              {selectedNote ? (
                                <span className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                  <span>{selectedNote.icon}</span>
                                  <span>{selectedNote.name}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-gray-600">{layerDescriptions[layer].subtitle}</span>
                              )}
                            </div>
                            {isActive && (
                              <span className="text-gold text-xs uppercase tracking-wider">Selecting</span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                    <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase mb-4 block">Fragrance Family</span>
                    <CategoryTabs
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                      reducedMotion={reducedMotion}
                    />
                  </div>
                </div>

                {/* Center: Bottle */}
                <div className="flex flex-col items-center sticky top-24" style={{ overflow: 'visible' }}>
                  <PerfumeBottle
                    composition={composition}
                    activeLayer={activeLayer}
                    className="w-full max-w-[280px] mx-auto"
                  />
                </div>

                {/* Right: Notes Grid & Continue */}
                <div className="space-y-6">
                  {/* Notes Selection */}
                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase">
                        Select {layerDescriptions[activeLayer].title.split(' ')[0]} Note
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${theme.primary}20`,
                          color: theme.primary,
                        }}
                      >
                        {fragranceCategories.find(c => c.key === activeCategory)?.label}
                      </span>
                    </div>

                    {/* Category glow */}
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative"
                    >
                      <div
                        className="absolute inset-0 -z-10 blur-3xl opacity-20 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${theme.glow} 0%, transparent 70%)`,
                        }}
                      />

                      {/* Notes Grid */}
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {notes.map((note) => {
                          const isSelected = composition[activeLayer]?.name === note.name
                          const isUsedElsewhere = Object.entries(composition).some(
                            ([key, n]) => n?.name === note.name && key !== activeLayer
                          )

                          return (
                            <motion.button
                              key={note.name}
                              onClick={() => handleSelectNote(activeLayer, note)}
                              disabled={isUsedElsewhere}
                              whileHover={!reducedMotion && !isUsedElsewhere ? { scale: 1.03 } : undefined}
                              whileTap={!reducedMotion && !isUsedElsewhere ? { scale: 0.97 } : undefined}
                              className={`
                                relative flex flex-col items-center gap-2 rounded-xl p-4
                                transition-all duration-300
                                ${isSelected
                                  ? 'bg-gradient-to-b from-gold/20 to-gold/5 ring-2 ring-gold'
                                  : isUsedElsewhere
                                    ? 'bg-white/[0.02] opacity-40 cursor-not-allowed'
                                    : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20'
                                }
                              `}
                            >
                              {/* Glow effect */}
                              {isSelected && (
                                <div
                                  className="absolute inset-0 rounded-xl opacity-40"
                                  style={{
                                    boxShadow: `inset 0 0 20px ${note.color}40`,
                                  }}
                                />
                              )}

                              <span className="text-2xl relative z-10">{note.icon}</span>
                              <span className={`
                                text-xs font-medium text-center relative z-10
                                ${isSelected ? 'text-gold' : 'text-gray-300'}
                              `}>
                                {note.name}
                              </span>

                              {isUsedElsewhere && (
                                <span className="absolute top-1 right-1 text-[10px] text-gray-500">Used</span>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  </div>

                  {/* Continue Button */}
                  <motion.button
                    onClick={handleStartCheckout}
                    disabled={!isComplete}
                    whileHover={isComplete && !reducedMotion ? { scale: 1.02 } : undefined}
                    whileTap={isComplete && !reducedMotion ? { scale: 0.98 } : undefined}
                    className={`
                      relative w-full rounded-2xl py-5 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-500 overflow-hidden
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
                      {isComplete ? 'Continue to Checkout' : `Select ${3 - completedLayers} More Note${3 - completedLayers !== 1 ? 's' : ''}`}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="lg:hidden space-y-6">
                {/* Layer Steps - Horizontal */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                  {(['base', 'heart', 'top'] as NoteLayer[]).map((layer) => {
                    const isActive = activeLayer === layer
                    const isCompleted = composition[layer] !== null
                    const selectedNote = composition[layer]

                    return (
                      <button
                        key={layer}
                        onClick={() => setActiveLayer(layer)}
                        className={`
                          flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl transition-all
                          ${isActive
                            ? 'bg-gold/15 border border-gold/30'
                            : isCompleted
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-white/[0.03] border border-white/10'
                          }
                        `}
                      >
                        <span
                          className={`
                            w-6 h-6 rounded-full text-xs flex items-center justify-center
                            ${isActive ? 'bg-gold text-black' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-500'}
                          `}
                        >
                          {isCompleted && !isActive ? '✓' : layerDescriptions[layer].icon}
                        </span>
                        <div className="text-left">
                          <span className={`block text-xs font-medium ${isActive ? 'text-gold' : 'text-white'}`}>
                            {layer.charAt(0).toUpperCase() + layer.slice(1)}
                          </span>
                          {selectedNote && (
                            <span className="text-[10px] text-gray-400">{selectedNote.name}</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Bottle - Centered */}
                <div className="flex justify-center py-4">
                  <PerfumeBottle
                    composition={composition}
                    activeLayer={activeLayer}
                    className="w-48"
                  />
                </div>

                {/* Category Tabs */}
                <div className="px-2">
                  <CategoryTabs
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    reducedMotion={reducedMotion}
                  />
                </div>

                {/* Note Carousel for Mobile */}
                <NoteCarousel
                  notes={notes}
                  category={activeCategory}
                  selectedNoteName={composition[activeLayer]?.name || null}
                  onSelectNote={(note) => handleSelectNote(activeLayer, note)}
                />

                {/* Continue Button */}
                <div className="px-2">
                  <motion.button
                    onClick={handleStartCheckout}
                    disabled={!isComplete}
                    whileTap={isComplete && !reducedMotion ? { scale: 0.98 } : undefined}
                    className={`
                      relative w-full rounded-2xl py-5 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-500 overflow-hidden
                      ${isComplete
                        ? 'text-black'
                        : 'cursor-not-allowed bg-white/5 text-gray-600 border border-white/10'
                      }
                    `}
                  >
                    {isComplete && (
                      <div className="absolute inset-0 bg-gradient-to-r from-gold via-amber-300 to-gold" />
                    )}
                    <span className="relative z-10">
                      {isComplete ? 'Continue to Checkout' : `Select ${3 - completedLayers} More Note${3 - completedLayers !== 1 ? 's' : ''}`}
                    </span>
                  </motion.button>
                </div>
              </div>
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
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl" />
              <div className="absolute inset-0 border border-white/10 rounded-3xl" />
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
