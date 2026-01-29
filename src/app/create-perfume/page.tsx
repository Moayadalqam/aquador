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
  floral: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.2)' },
  fruity: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.2)' },
  woody: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.2)' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.2)' },
  gourmand: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.2)' },
}

const categoryIcons: Record<FragranceCategory, string> = {
  floral: '🌸',
  fruity: '🍊',
  woody: '🌲',
  oriental: '✨',
  gourmand: '🍯',
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

  return (
    <div className="min-h-screen bg-gold-ambient text-white pt-28">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Page Title */}
      <div className="text-center mb-10 px-4">
        <h1 className="text-3xl md:text-4xl font-playfair tracking-wide text-gold mb-3">
          Create Your Signature
        </h1>
        <p className="text-sm text-gray-400 tracking-wider max-w-md mx-auto">
          Select your top, heart, and base notes to craft your perfect scent
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="composer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container-wide pb-20"
          >
            {/* Fragrance Pyramid - Desktop Only */}
            <div className="hidden md:flex flex-col items-center mb-8 max-w-xs mx-auto">
              <div className="w-full flex flex-col items-center gap-2">
                {(['top', 'heart', 'base'] as NoteLayer[]).map((layer, idx) => {
                  const note = composition[layer]
                  const isActive = activeLayer === layer
                  const widths = ['60%', '75%', '90%']

                  return (
                    <div
                      key={layer}
                      className={`
                        h-14 flex items-center justify-center rounded transition-all duration-300
                        ${isActive ? 'ring-2 ring-gold' : ''}
                      `}
                      style={{
                        width: widths[idx],
                        clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
                        background: note
                          ? `linear-gradient(135deg, ${note.color}40 0%, ${note.color}20 100%)`
                          : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${note ? note.color + '60' : 'rgba(212,175,55,0.2)'}`,
                      }}
                    >
                      <span className={`text-xs font-medium tracking-wider ${isActive ? 'text-gold' : 'text-gray-400'}`}>
                        {layer.toUpperCase()}
                        {note && <span className="ml-2">{note.icon} {note.name}</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress Steps */}
            <div className="mb-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              {(['top', 'heart', 'base'] as NoteLayer[]).map((layer, index) => {
                const isActive = activeLayer === layer
                const isCompleted = composition[layer] !== null
                const selectedNote = composition[layer]

                return (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`
                      relative px-6 sm:px-8 py-4 text-sm tracking-widest transition-all duration-300
                      rounded-lg overflow-hidden
                      ${isActive
                        ? 'bg-gold/20 text-gold ring-1 ring-gold'
                        : isCompleted
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-white/5 text-gray-500 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                          ${isActive
                            ? 'bg-gold text-black'
                            : isCompleted
                              ? 'bg-green-500 text-black'
                              : 'bg-white/10 text-gray-500'
                          }
                        `}
                      >
                        {isCompleted && !isActive ? '✓' : index + 1}
                      </span>
                      <div className="text-left">
                        <span className="block uppercase text-xs sm:text-sm">
                          {layer === 'top' ? 'Top Note' : layer === 'heart' ? 'Heart Note' : 'Base Note'}
                        </span>
                        {selectedNote && (
                          <span className="block text-[10px] sm:text-xs mt-0.5 opacity-70">
                            {selectedNote.icon} {selectedNote.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Category Tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {fragranceCategories.map((cat) => {
                const isActive = activeCategory === cat.key
                const catTheme = categoryThemes[cat.key]

                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`
                      px-5 py-2.5 text-sm tracking-wider transition-all duration-300 rounded-full
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                      }
                    `}
                    style={isActive ? {
                      background: `linear-gradient(135deg, ${catTheme.primary}30 0%, ${catTheme.primary}10 100%)`,
                      border: `1px solid ${catTheme.primary}50`,
                    } : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{categoryIcons[cat.key]}</span>
                      <span className="uppercase">{cat.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Notes Grid */}
            <div className="relative mb-12">
              {/* Category ambient glow */}
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${theme.glow} 0%, transparent 70%)`,
                }}
              />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {notes.map((note) => {
                  const isSelected = composition[activeLayer]?.name === note.name

                  return (
                    <motion.button
                      key={note.name}
                      whileHover={reducedMotion ? undefined : { scale: 1.05, y: -4 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                      onClick={() => handleSelectNote(activeLayer, note)}
                      className={`
                        relative flex flex-col items-center gap-3 rounded-xl p-4
                        transition-colors duration-300 overflow-hidden
                        ${isSelected
                          ? 'bg-gold/20 ring-2 ring-gold'
                          : 'bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      {/* Glass morphism background */}
                      <div
                        className="absolute inset-0 backdrop-blur-sm opacity-50"
                        style={{
                          background: `radial-gradient(circle at center, ${note.color}10 0%, transparent 70%)`,
                        }}
                      />

                      {/* Note icon */}
                      <span className="relative text-3xl z-10">{note.icon}</span>

                      {/* Note name */}
                      <span className={`
                        relative text-center text-xs font-medium tracking-wide z-10 transition-colors duration-300
                        ${isSelected ? 'text-gold' : 'text-gray-300'}
                      `}>
                        {note.name}
                      </span>

                      {/* Color indicator dot */}
                      {isSelected && (
                        <div
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: note.color }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Composition Summary */}
            <div className="mx-auto max-w-md rounded-2xl border border-gold/20 bg-black/40 p-6 backdrop-blur-lg">
              <h3 className="mb-6 text-center text-lg text-gold tracking-[0.2em] font-light">
                YOUR COMPOSITION
              </h3>

              <div className="space-y-3 text-sm">
                {(['top', 'heart', 'base'] as NoteLayer[]).map((layer, index) => {
                  const note = composition[layer]
                  const isLast = index === 2

                  return (
                    <div
                      key={layer}
                      className={`flex justify-between items-center py-2.5 px-1 ${!isLast ? 'border-b border-white/10' : ''}`}
                    >
                      <span className="text-gray-400 tracking-wider text-xs uppercase">
                        {layer === 'top' ? 'Top Note' : layer === 'heart' ? 'Heart Note' : 'Base Note'}
                      </span>
                      {note ? (
                        <span className="flex items-center gap-2 text-white">
                          <span className="text-base">{note.icon}</span>
                          <span className="font-light">{note.name}</span>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: note.color }} />
                        </span>
                      ) : (
                        <span className="text-gray-600 italic">Select a note</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Checkout button */}
              <button
                onClick={handleStartCheckout}
                disabled={!isComplete}
                className={`
                  mt-8 w-full rounded-full py-4 text-sm tracking-[0.15em] transition-all duration-300
                  ${isComplete
                    ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-black font-medium hover:shadow-lg hover:shadow-gold/30'
                    : 'cursor-not-allowed bg-white/10 text-gray-600'
                  }
                `}
              >
                {isComplete ? 'CONTINUE TO CHECKOUT' : 'SELECT ALL NOTES'}
              </button>

              {/* Progress indicator */}
              <div className="mt-4 flex justify-center gap-2">
                {(['top', 'heart', 'base'] as NoteLayer[]).map((layer) => (
                  <div
                    key={layer}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: composition[layer]
                        ? composition[layer]!.color
                        : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
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
            className="container mx-auto max-w-lg px-4 py-12"
          >
            {/* Back button */}
            <button
              onClick={() => setShowForm(false)}
              className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Composer</span>
            </button>

            {/* Form card */}
            <div className="rounded-2xl border border-gold/20 bg-black/50 p-8 backdrop-blur-lg">
              <h2 className="mb-8 text-center text-2xl text-gold tracking-[0.15em] font-light">
                FINALIZE YOUR FRAGRANCE
              </h2>

              {/* Composition Review */}
              <div className="mb-8 rounded-xl bg-white/5 p-4 border border-white/10">
                <h3 className="mb-3 text-xs text-gray-400 tracking-[0.15em] uppercase">Your Composition</h3>
                <div className="flex items-center gap-3 text-white flex-wrap">
                  {composition.top && (
                    <span className="flex items-center gap-1">
                      <span>{composition.top.icon}</span>
                      <span className="text-sm">{composition.top.name}</span>
                    </span>
                  )}
                  <span className="text-gold/50">•</span>
                  {composition.heart && (
                    <span className="flex items-center gap-1">
                      <span>{composition.heart.icon}</span>
                      <span className="text-sm">{composition.heart.name}</span>
                    </span>
                  )}
                  <span className="text-gold/50">•</span>
                  {composition.base && (
                    <span className="flex items-center gap-1">
                      <span>{composition.base.icon}</span>
                      <span className="text-sm">{composition.base.name}</span>
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Perfume Name Input */}
                <div>
                  <label className="mb-2 block text-xs text-gray-400 tracking-[0.15em] uppercase">
                    Perfume Name *
                  </label>
                  <input
                    type="text"
                    value={perfumeName}
                    onChange={(e) => setPerfumeName(e.target.value)}
                    placeholder="Name your creation..."
                    maxLength={30}
                    className="w-full rounded-lg border border-gold/20 bg-white/5 px-4 py-3.5 text-white placeholder-gray-600
                               focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50"
                  />
                  <span className="mt-1 block text-right text-xs text-gray-600">
                    {perfumeName.length}/30
                  </span>
                </div>

                {/* Volume Selection */}
                <div>
                  <label className="mb-3 block text-xs text-gray-400 tracking-[0.15em] uppercase">
                    Select Volume *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setSelectedVolume(vol)}
                        className={`
                          rounded-xl border p-5 transition-all duration-300
                          ${selectedVolume === vol
                            ? 'border-gold bg-gold/20 text-gold'
                            : 'border-gold/20 bg-white/5 text-gray-400 hover:border-gold/50'
                          }
                        `}
                      >
                        <div className="text-3xl font-light">{vol}</div>
                        <div className="mt-2 text-sm font-medium">€{calculatePrice(vol).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="mb-2 block text-xs text-gray-400 tracking-[0.15em] uppercase">
                    Special Requests
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requests for your fragrance..."
                    maxLength={500}
                    rows={4}
                    className="w-full rounded-lg border border-gold/20 bg-white/5 px-4 py-3.5 text-white placeholder-gray-600
                               focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/50 resize-none"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-lg bg-red-900/20 border border-red-900/50 px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Footer with total and submit */}
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    <div className="text-xs text-gray-400 tracking-wider uppercase">Total</div>
                    <div className="text-3xl text-gold font-light">
                      €{selectedVolume ? calculatePrice(selectedVolume).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || !perfumeName || !selectedVolume}
                    className={`
                      rounded-full px-8 py-4 text-sm tracking-[0.1em] transition-all duration-300
                      ${isProcessing || !perfumeName || !selectedVolume
                        ? 'cursor-not-allowed bg-white/10 text-gray-600'
                        : 'bg-gradient-to-r from-gold via-gold-light to-gold text-black font-medium hover:shadow-lg hover:shadow-gold/30'
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
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
