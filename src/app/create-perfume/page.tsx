'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume, FragranceCategory } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { calculatePrice } from '@/lib/perfume/pricing'

type NoteLayer = 'top' | 'heart' | 'base'

const categoryThemes: Record<FragranceCategory, { primary: string; glow: string }> = {
  floral: { primary: '#FF6B9D', glow: 'rgba(255,107,157,0.3)' },
  fruity: { primary: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
  woody: { primary: '#8B7355', glow: 'rgba(139,115,85,0.3)' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.3)' },
  gourmand: { primary: '#AF6E4D', glow: 'rgba(175,110,77,0.3)' },
}

const layerInfo: Record<NoteLayer, { title: string; subtitle: string; icon: string }> = {
  base: { title: 'Base Notes', subtitle: 'Foundation', icon: '🌟' },
  heart: { title: 'Heart Notes', subtitle: 'The soul', icon: '💫' },
  top: { title: 'Top Notes', subtitle: 'First impression', icon: '✨' },
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reducedMotion
}

// Simple SVG Bottle Component
function BottleSVG({ composition, activeLayer }: { composition: PerfumeComposition; activeLayer: NoteLayer }) {
  const getLayerColor = (layer: NoteLayer) => composition[layer]?.color || 'transparent'

  return (
    <svg viewBox="0 -25 100 145" className="w-full h-auto max-w-[240px]">
      <defs>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <clipPath id="liquidClip">
          <rect x="16" y="2" width="68" height="96" rx="3" />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect x="36" y="-20" width="28" height="22" rx="3" fill="url(#capGrad)" />
      <rect x="34" y="-1" width="32" height="4" rx="1" fill="#B8860B" />

      {/* Bottle outline */}
      <rect x="15" y="1" width="70" height="98" rx="4" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" />

      {/* Liquid layers */}
      <g clipPath="url(#liquidClip)">
        {/* Base - bottom third */}
        <motion.rect
          x="16" y="66" width="68" height="32"
          fill={getLayerColor('base')}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: composition.base ? 1 : 0 }}
          style={{ transformOrigin: 'center bottom' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Heart - middle third */}
        <motion.rect
          x="16" y="34" width="68" height="32"
          fill={getLayerColor('heart')}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: composition.heart ? 1 : 0 }}
          style={{ transformOrigin: 'center bottom' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Top - top third */}
        <motion.rect
          x="16" y="2" width="68" height="32"
          fill={getLayerColor('top')}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: composition.top ? 1 : 0 }}
          style={{ transformOrigin: 'center bottom' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>

      {/* Layer dividers */}
      <line x1="16" y1="34" x2="84" y2="34" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
      <line x1="16" y1="66" x2="84" y2="66" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3,3" />

      {/* Active layer highlight */}
      <motion.rect
        x="14"
        width="72"
        height="32"
        rx="4"
        fill="none"
        stroke="rgba(212,175,55,0.7)"
        strokeWidth="2"
        animate={{
          y: activeLayer === 'top' ? 2 : activeLayer === 'heart' ? 34 : 66,
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          y: { duration: 0.3 },
          opacity: { duration: 2, repeat: Infinity },
        }}
      />

      {/* Glass shine */}
      <line x1="22" y1="10" x2="22" y2="90" stroke="white" strokeWidth="1" opacity="0.1" />
    </svg>
  )
}

export default function CreatePerfumePage() {
  const [composition, setComposition] = useState<PerfumeComposition>({ top: null, heart: null, base: null })
  const [activeLayer, setActiveLayer] = useState<NoteLayer>('base')
  const [activeCategory, setActiveCategory] = useState<FragranceCategory>('woody')
  const [perfumeName, setPerfumeName] = useState('')
  const [selectedVolume, setSelectedVolume] = useState<PerfumeVolume | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const reducedMotion = useReducedMotion()

  const handleSelectNote = (note: FragranceNote) => {
    setComposition(prev => ({ ...prev, [activeLayer]: note }))
    // Auto-advance
    if (activeLayer === 'base') {
      setActiveLayer('heart')
      setActiveCategory('floral')
    } else if (activeLayer === 'heart') {
      setActiveLayer('top')
      setActiveCategory('fruity')
    }
  }

  const isComplete = isCompositionComplete(composition)
  const notes = fragranceDatabase[activeCategory] || []
  const theme = categoryThemes[activeCategory]
  const completedCount = [composition.top, composition.heart, composition.base].filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const validationResult = validatePerfumeForm({ name: perfumeName, composition, volume: selectedVolume, specialRequests })
    if (!validationResult.isValid) {
      setError(Object.values(validationResult.errors).flat()[0] || 'Please fix the errors')
      return
    }
    setIsProcessing(true)
    try {
      const response = await fetch('/api/create-perfume/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfumeName,
          composition: { top: composition.top?.name, heart: composition.heart?.name, base: composition.base?.name },
          volume: selectedVolume,
          specialRequests,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Payment failed')
      if (data.url) window.location.href = data.url
      else throw new Error('No checkout URL received')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-amber-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-gold/5 to-transparent rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Header */}
            <div className="text-center mb-8 px-4">
              <span className="text-[10px] tracking-[0.4em] text-gold/60 uppercase">Bespoke Fragrance Atelier</span>
              <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white mt-2">
                Create Your <span className="text-gradient-gold">Signature</span>
              </h1>
            </div>

            {/* Main Grid */}
            <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-[280px_240px_1fr] gap-8 items-start">

              {/* Left: Layer Steps */}
              <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase block mb-4">Build Your Scent</span>
                <div className="space-y-2">
                  {(['base', 'heart', 'top'] as NoteLayer[]).map((layer) => {
                    const isActive = activeLayer === layer
                    const isDone = composition[layer] !== null
                    const note = composition[layer]
                    return (
                      <button
                        key={layer}
                        onClick={() => setActiveLayer(layer)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          isActive ? 'bg-gold/15 border border-gold/30' : isDone ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isActive ? 'bg-gold text-black' : isDone ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-500'}`}>
                          {isDone && !isActive ? '✓' : layerInfo[layer].icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-sm font-medium ${isActive ? 'text-gold' : 'text-white'}`}>{layerInfo[layer].title}</span>
                          <span className="text-xs text-gray-500 truncate block">{note ? note.name : layerInfo[layer].subtitle}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Categories */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase block mb-3">Fragrance Family</span>
                  <div className="flex flex-wrap gap-2">
                    {fragranceCategories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                          activeCategory === cat.key
                            ? 'bg-gold/20 text-gold border border-gold/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Bottle */}
              <div className="flex flex-col items-center justify-start pt-4">
                <BottleSVG composition={composition} activeLayer={activeLayer} />
                <div className="mt-4 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < completedCount ? 'bg-gold' : 'bg-white/20'}`} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 mt-1">{completedCount}/3 selected</span>
              </div>

              {/* Right: Notes Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.3em] text-gold/60 uppercase">Select {layerInfo[activeLayer].title.split(' ')[0]} Note</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}>
                    {fragranceCategories.find(c => c.key === activeCategory)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {notes.map((note) => {
                    const isSelected = composition[activeLayer]?.name === note.name
                    const isUsed = Object.entries(composition).some(([k, n]) => n?.name === note.name && k !== activeLayer)
                    return (
                      <motion.button
                        key={note.name}
                        onClick={() => !isUsed && handleSelectNote(note)}
                        disabled={isUsed}
                        whileHover={!reducedMotion && !isUsed ? { scale: 1.03 } : undefined}
                        whileTap={!reducedMotion && !isUsed ? { scale: 0.97 } : undefined}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                          isSelected ? 'bg-gold/20 ring-2 ring-gold' : isUsed ? 'bg-white/[0.02] opacity-40 cursor-not-allowed' : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
                        }`}
                      >
                        <span className="text-2xl">{note.icon}</span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-gold' : 'text-gray-300'}`}>{note.name}</span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Continue Button */}
                <motion.button
                  onClick={() => isComplete && setShowForm(true)}
                  disabled={!isComplete}
                  className={`w-full mt-4 rounded-xl py-4 text-sm tracking-wider uppercase font-medium transition-all ${
                    isComplete ? 'bg-gradient-to-r from-gold to-amber-400 text-black' : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isComplete ? 'Continue to Checkout' : `Select ${3 - completedCount} More Note${3 - completedCount !== 1 ? 's' : ''}`}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Checkout Form */
          <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto px-4">
            <button onClick={() => setShowForm(false)} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm">Back</span>
            </button>

            <div className="bg-white/[0.03] rounded-2xl p-6 md:p-8 border border-white/5">
              <h2 className="font-playfair text-2xl text-center mb-6">Finalize Your Creation</h2>

              {/* Blend summary */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {composition.base && <span className="px-3 py-1 bg-white/5 rounded-full text-sm">{composition.base.icon} {composition.base.name}</span>}
                {composition.heart && <span className="px-3 py-1 bg-white/5 rounded-full text-sm">{composition.heart.icon} {composition.heart.name}</span>}
                {composition.top && <span className="px-3 py-1 bg-white/5 rounded-full text-sm">{composition.top.icon} {composition.top.name}</span>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs text-gold/60 uppercase tracking-wider mb-2">Name Your Creation *</label>
                  <input
                    type="text"
                    value={perfumeName}
                    onChange={(e) => setPerfumeName(e.target.value)}
                    placeholder="e.g., Midnight Bloom"
                    maxLength={30}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-gold/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gold/60 uppercase tracking-wider mb-2">Select Volume *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setSelectedVolume(vol)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          selectedVolume === vol ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <div className="text-2xl font-light">{vol}</div>
                        <div className="text-sm mt-1">€{calculatePrice(vol).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gold/60 uppercase tracking-wider mb-2">Special Requests (Optional)</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any preferences..."
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-gold/50 focus:outline-none resize-none"
                  />
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-3xl font-light text-white">€{selectedVolume ? calculatePrice(selectedVolume).toFixed(2) : '0.00'}</div>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || !perfumeName || !selectedVolume}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      isProcessing || !perfumeName || !selectedVolume
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gold to-amber-400 text-black'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Pay with Stripe'}
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
