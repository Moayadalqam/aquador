'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume, FragranceCategory } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { calculatePrice } from '@/lib/perfume/pricing'
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities'
import { ChevronLeft, Sparkles, Check, Loader2, ArrowRight, RotateCcw } from 'lucide-react'

const CustomPerfumeBottle = dynamic(
  () => import('@/components/3d/CustomPerfumeBottle').then(mod => ({ default: mod.CustomPerfumeBottle })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] bg-white/50 backdrop-blur-sm rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    )
  }
)

const Scene = dynamic(
  () => import('@/components/3d/Scene').then(mod => ({ default: mod.Scene })),
  { ssr: false }
)

const Lighting = dynamic(
  () => import('@/components/3d/Lighting').then(mod => ({ default: mod.Lighting })),
  { ssr: false }
)

type NoteLayer = 'top' | 'heart' | 'base'

const categoryThemes: Record<FragranceCategory, { primary: string; glow: string; accent: string }> = {
  floral: { primary: '#E8A0BF', glow: 'rgba(232,160,191,0.15)', accent: '#C77DA3' },
  fruity: { primary: '#F0C75E', glow: 'rgba(240,199,94,0.15)', accent: '#D4A843' },
  woody: { primary: '#A89078', glow: 'rgba(168,144,120,0.15)', accent: '#8B7355' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.15)', accent: '#B8960F' },
  gourmand: { primary: '#C08B5C', glow: 'rgba(192,139,92,0.15)', accent: '#A06B3C' },
}

const categoryIcons: Record<FragranceCategory, React.ReactNode> = {
  floral: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M12 3c-1.5 2-4 3.5-4 6a4 4 0 008 0c0-2.5-2.5-4-4-6z"/><path d="M12 15v6m-3-3h6"/></svg>,
  fruity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><circle cx="12" cy="14" r="7"/><path d="M12 7V3m-2 4c1-1 3-1 4 0"/></svg>,
  woody: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M12 3l-7 10h5v8l7-10h-5V3z"/></svg>,
  oriental: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>,
  gourmand: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M18 8a6 6 0 00-12 0c0 7 6 13 6 13s6-6 6-13z"/><circle cx="12" cy="8" r="2"/></svg>,
}

const layerConfig: Record<NoteLayer, { title: string; subtitle: string; description: string; order: number }> = {
  base: { title: 'Base', subtitle: 'The Foundation', description: 'Rich, lasting depth that anchors your fragrance', order: 1 },
  heart: { title: 'Heart', subtitle: 'The Soul', description: 'The emotional core that defines character', order: 2 },
  top: { title: 'Top', subtitle: 'First Impression', description: 'The opening spark that captivates instantly', order: 3 },
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

// Elegant note color swatch
function ColorSwatch({ color, size = 32 }: { color: string; size?: number }) {
  return (
    <div
      className="rounded-full border border-white/20 shadow-sm"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}dd, ${color}88)`,
        boxShadow: `0 2px 8px ${color}40`,
      }}
    />
  )
}

// Premium SVG Bottle
function PremiumBottle({ composition, activeLayer }: { composition: PerfumeComposition; activeLayer: NoteLayer }) {
  const getLayerColor = (layer: NoteLayer) => composition[layer]?.color || 'transparent'
  const hasLayer = (layer: NoteLayer) => composition[layer] !== null

  return (
    <div className="relative">
      <svg viewBox="0 -30 120 175" className="w-full h-auto max-w-[200px] mx-auto drop-shadow-lg">
        <defs>
          <linearGradient id="capGradPremium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8D5A3" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8960F" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
          <clipPath id="liquidClipPremium">
            <rect x="22" y="10" width="76" height="105" rx="6" />
          </clipPath>
          <filter id="liquidGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Cap - ornate */}
        <rect x="44" y="-26" width="32" height="8" rx="2" fill="url(#capGradPremium)" />
        <rect x="48" y="-18" width="24" height="16" rx="3" fill="url(#capGradPremium)" />
        <rect x="42" y="-3" width="36" height="5" rx="1.5" fill="#B8960F" />
        <line x1="48" y1="-14" x2="48" y2="-6" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />

        {/* Bottle body */}
        <rect x="20" y="8" width="80" height="110" rx="8" fill="rgba(250,248,242,0.6)" stroke="rgba(212,175,55,0.25)" strokeWidth="1" />

        {/* Liquid layers */}
        <g clipPath="url(#liquidClipPremium)" filter="url(#liquidGlow)">
          {/* Base */}
          <motion.rect
            x="22" y="78" width="76" height="37"
            fill={getLayerColor('base')}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: hasLayer('base') ? 1 : 0, opacity: hasLayer('base') ? 0.85 : 0 }}
            style={{ transformOrigin: 'center bottom' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Heart */}
          <motion.rect
            x="22" y="43" width="76" height="35"
            fill={getLayerColor('heart')}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: hasLayer('heart') ? 1 : 0, opacity: hasLayer('heart') ? 0.8 : 0 }}
            style={{ transformOrigin: 'center bottom' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Top */}
          <motion.rect
            x="22" y="10" width="76" height="33"
            fill={getLayerColor('top')}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: hasLayer('top') ? 1 : 0, opacity: hasLayer('top') ? 0.75 : 0 }}
            style={{ transformOrigin: 'center bottom' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </g>

        {/* Layer dividers */}
        <line x1="22" y1="43" x2="98" y2="43" stroke="rgba(212,175,55,0.12)" strokeWidth="0.5" />
        <line x1="22" y1="78" x2="98" y2="78" stroke="rgba(212,175,55,0.12)" strokeWidth="0.5" />

        {/* Active layer indicator */}
        <motion.rect
          x="18"
          width="84"
          height={activeLayer === 'base' ? 37 : activeLayer === 'heart' ? 35 : 33}
          rx="8"
          fill="none"
          stroke="rgba(212,175,55,0.5)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          animate={{
            y: activeLayer === 'top' ? 10 : activeLayer === 'heart' ? 43 : 78,
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            y: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 2.5, repeat: Infinity },
          }}
        />

        {/* Glass reflections */}
        <rect x="20" y="8" width="80" height="110" rx="8" fill="url(#glassGrad)" />
        <line x1="28" y1="16" x2="28" y2="108" stroke="white" strokeWidth="1" opacity="0.08" />
        <line x1="32" y1="20" x2="32" y2="100" stroke="white" strokeWidth="0.5" opacity="0.04" />

        {/* Layer labels */}
        <text x="60" y="28" textAnchor="middle" fill="rgba(0,0,0,0.25)" fontSize="6" fontFamily="sans-serif" letterSpacing="0.1em">TOP</text>
        <text x="60" y="63" textAnchor="middle" fill="rgba(0,0,0,0.25)" fontSize="6" fontFamily="sans-serif" letterSpacing="0.1em">HEART</text>
        <text x="60" y="100" textAnchor="middle" fill="rgba(0,0,0,0.25)" fontSize="6" fontFamily="sans-serif" letterSpacing="0.1em">BASE</text>
      </svg>
    </div>
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
  const [show3DPreview, setShow3DPreview] = useState(false)
  const { isMobile } = useDeviceCapabilities()
  const reducedMotion = useReducedMotion()

  const handleSelectNote = useCallback((note: FragranceNote) => {
    setComposition(prev => ({ ...prev, [activeLayer]: note }))
    if (activeLayer === 'base') {
      setActiveLayer('heart')
      setActiveCategory('floral')
    } else if (activeLayer === 'heart') {
      setActiveLayer('top')
      setActiveCategory('fruity')
    }
  }, [activeLayer])

  const handleReset = useCallback(() => {
    setComposition({ top: null, heart: null, base: null })
    setActiveLayer('base')
    setActiveCategory('woody')
  }, [])

  const isComplete = isCompositionComplete(composition)
  const notes = fragranceDatabase[activeCategory] || []
  const theme = categoryThemes[activeCategory]
  const completedCount = [composition.top, composition.heart, composition.base].filter(Boolean).length

  const topNoteColor = composition.top?.color || '#D4AF37'
  const heartNoteColor = composition.heart?.color || '#D4AF37'
  const baseNoteColor = composition.base?.color || '#D4AF37'

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
    <div className="min-h-screen bg-[#FAFAF8] text-black pt-28 md:pt-36 lg:pt-40 pb-20">
      {/* Background atmosphere */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-amber-500/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/[0.03] to-transparent rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            {/* Header */}
            <div className="text-center mb-10 md:mb-14 px-4">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="eyebrow text-gold/50 block mb-3"
              >
                Bespoke Fragrance Atelier
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-playfair text-3xl md:text-4xl lg:text-5xl text-black"
              >
                Compose Your <span className="text-gradient-gold">Signature</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-gray-400 text-sm md:text-base mt-3 max-w-md mx-auto"
              >
                Select one note for each layer to craft a fragrance uniquely yours
              </motion.p>
            </div>

            {/* Main Content */}
            <div className="container-wide">
              {/* Step Progress - Horizontal on all sizes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-10"
              >
                <div className="flex items-center justify-center gap-0 max-w-lg mx-auto">
                  {(['base', 'heart', 'top'] as NoteLayer[]).map((layer, i) => {
                    const isActive = activeLayer === layer
                    const isDone = composition[layer] !== null
                    const note = composition[layer]

                    return (
                      <div key={layer} className="flex items-center">
                        <button
                          onClick={() => setActiveLayer(layer)}
                          aria-label={`Select ${layer} notes layer`}
                          className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-gold/10 border border-gold/25'
                              : isDone
                              ? 'bg-emerald-50 border border-emerald-200/50 hover:border-emerald-300/70'
                              : 'border border-transparent hover:bg-black/[0.02]'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                            isActive
                              ? 'bg-gold text-white shadow-sm'
                              : isDone
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-black/[0.06] text-gray-400'
                          }`}>
                            {isDone && !isActive ? <Check className="w-3.5 h-3.5" /> : layerConfig[layer].order}
                          </div>
                          <div className="text-left hidden sm:block">
                            <span className={`block text-xs font-medium leading-none ${isActive ? 'text-gold' : isDone ? 'text-emerald-600' : 'text-gray-500'}`}>
                              {layerConfig[layer].title}
                            </span>
                            <span className="block text-[10px] text-gray-400 mt-0.5 leading-none">
                              {note ? note.name : layerConfig[layer].subtitle}
                            </span>
                          </div>
                        </button>
                        {i < 2 && (
                          <div className={`w-8 h-px mx-1 transition-colors duration-300 ${
                            isDone ? 'bg-emerald-300' : 'bg-black/[0.08]'
                          }`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Two-column layout: Bottle + Notes */}
              <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">

                {/* Left Column: Bottle + Info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center lg:sticky lg:top-36"
                >
                  {!show3DPreview ? (
                    <PremiumBottle composition={composition} activeLayer={activeLayer} />
                  ) : (
                    <div className="w-full max-w-[260px]">
                      <div className="bg-gradient-to-b from-gray-50 to-gray-100/60 backdrop-blur-sm rounded-xl border border-gold/15 overflow-hidden">
                        <Scene className="w-full h-[350px]">
                          <Lighting simplified={isMobile} />
                          <CustomPerfumeBottle
                            _topNoteColor={topNoteColor}
                            heartNoteColor={heartNoteColor}
                            _baseNoteColor={baseNoteColor}
                            autoRotate={true}
                          />
                        </Scene>
                      </div>
                    </div>
                  )}

                  {/* Current layer description */}
                  <div className="text-center mt-6 max-w-[220px]">
                    <p className="text-xs text-gray-400 leading-relaxed">{layerConfig[activeLayer].description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={() => setShow3DPreview(!show3DPreview)}
                      aria-pressed={show3DPreview}
                      aria-label="Toggle 3D preview"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wide uppercase transition-all ${
                        show3DPreview
                          ? 'bg-gold/10 text-gold border border-gold/25'
                          : 'bg-black/[0.03] text-gray-500 border border-black/[0.06] hover:text-gold hover:border-gold/20'
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      3D
                    </button>
                    {completedCount > 0 && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wide uppercase bg-black/[0.03] text-gray-500 border border-black/[0.06] hover:text-red-500 hover:border-red-200 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Composition Summary */}
                  {completedCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 w-full max-w-[260px] space-y-2"
                    >
                      {(['base', 'heart', 'top'] as NoteLayer[]).map(layer => {
                        const note = composition[layer]
                        if (!note) return null
                        return (
                          <div key={layer} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
                            <ColorSwatch color={note.color} size={20} />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] uppercase tracking-wider text-gray-400">{layer}</span>
                              <span className="block text-xs text-black font-medium truncate">{note.name}</span>
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Column: Category Tabs + Notes Grid */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  {/* Category Tabs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="eyebrow text-gold/50">Fragrance Family</span>
                      <span className="text-xs text-gray-400">
                        Selecting <span className="text-gold font-medium">{layerConfig[activeLayer].title}</span> Note
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fragranceCategories.map((cat) => {
                        const isActive = activeCategory === cat.key
                        const catTheme = categoryThemes[cat.key]
                        return (
                          <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            aria-pressed={isActive}
                            aria-label={`Select ${cat.label} fragrance category`}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                              isActive
                                ? 'text-black shadow-sm'
                                : 'bg-white text-gray-500 border border-black/[0.06] hover:border-black/[0.12] hover:text-black'
                            }`}
                            style={isActive ? {
                              background: `linear-gradient(135deg, ${catTheme.primary}30, ${catTheme.primary}15)`,
                              borderColor: `${catTheme.primary}50`,
                              border: `1px solid ${catTheme.primary}50`,
                            } : undefined}
                          >
                            {categoryIcons[cat.key]}
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notes Grid */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    >
                      {notes.map((note, i) => {
                        const isSelected = composition[activeLayer]?.name === note.name
                        const isUsed = Object.entries(composition).some(([k, n]) => n?.name === note.name && k !== activeLayer)
                        return (
                          <motion.button
                            key={note.name}
                            onClick={() => !isUsed && handleSelectNote(note)}
                            disabled={isUsed}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.3 }}
                            aria-label={`Select ${note.name} note for ${activeLayer} layer`}
                            aria-pressed={isSelected}
                            whileHover={!reducedMotion && !isUsed ? { y: -2 } : undefined}
                            whileTap={!reducedMotion && !isUsed ? { scale: 0.97 } : undefined}
                            className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 ${
                              isSelected
                                ? 'bg-white shadow-md'
                                : isUsed
                                ? 'bg-gray-50 opacity-35 cursor-not-allowed'
                                : 'bg-white border border-black/[0.06] hover:border-black/[0.12] hover:shadow-sm'
                            }`}
                            style={isSelected ? {
                              boxShadow: `0 4px 20px ${theme.glow}, 0 0 0 2px ${theme.primary}`,
                              borderColor: 'transparent',
                            } : undefined}
                          >
                            <ColorSwatch color={note.color} size={36} />
                            <div className="text-center">
                              <span className={`block text-xs font-medium ${isSelected ? 'text-black' : 'text-gray-700'}`}>
                                {note.name}
                              </span>
                              <span className="block text-[10px] text-gray-400 mt-0.5">{note.description}</span>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: theme.primary }}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                            {isUsed && (
                              <span className="absolute top-2 right-2 text-[9px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                Used
                              </span>
                            )}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Continue Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                  >
                    <button
                      onClick={() => isComplete && setShowForm(true)}
                      disabled={!isComplete}
                      className={`w-full rounded-full py-4 text-sm tracking-wider uppercase font-medium transition-all duration-500 flex items-center justify-center gap-2 ${
                        isComplete
                          ? 'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black shadow-lg hover:shadow-xl hover:scale-[1.01]'
                          : 'bg-black/[0.04] text-gray-400 cursor-not-allowed border border-black/[0.06]'
                      }`}
                    >
                      {isComplete ? (
                        <>
                          Continue to Checkout
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        `Select ${3 - completedCount} More Note${3 - completedCount !== 1 ? 's' : ''}`
                      )}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Checkout Form */
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl mx-auto px-4"
          >
            <button onClick={() => setShowForm(false)} aria-label="Go back to perfume composer" className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back to Composer</span>
            </button>

            {/* Composition Preview Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-black/[0.06] shadow-sm mb-6">
              <div className="text-center mb-6">
                <span className="eyebrow text-gold/50 block mb-2">Your Composition</span>
                <h2 className="font-playfair text-2xl md:text-3xl">Finalize Your Creation</h2>
              </div>

              {/* Visual pyramid summary */}
              <div className="flex items-center justify-center gap-8 mb-8 py-4">
                <div className="w-28">
                  <PremiumBottle composition={composition} activeLayer="base" />
                </div>
                <div className="space-y-3">
                  {(['top', 'heart', 'base'] as NoteLayer[]).map(layer => {
                    const note = composition[layer]!
                    return (
                      <div key={layer} className="flex items-center gap-3">
                        <ColorSwatch color={note.color} size={24} />
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 block">{layer}</span>
                          <span className="text-sm text-black font-medium">{note.name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-8" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="perfume-name" className="label-micro-gold block mb-2">Name Your Creation *</label>
                  <input
                    id="perfume-name"
                    type="text"
                    value={perfumeName}
                    onChange={(e) => setPerfumeName(e.target.value)}
                    placeholder="e.g., Midnight Bloom"
                    maxLength={30}
                    className="input-base"
                  />
                </div>

                <div>
                  <fieldset>
                    <legend className="label-micro-gold block mb-3">Select Volume *</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => (
                        <button
                          key={vol}
                          type="button"
                          onClick={() => setSelectedVolume(vol)}
                          aria-pressed={selectedVolume === vol}
                          className={`relative p-5 rounded-xl border text-center transition-all duration-300 ${
                            selectedVolume === vol
                              ? 'border-gold/40 bg-gradient-to-b from-gold/10 to-gold/5 shadow-sm'
                              : 'border-black/[0.08] bg-white hover:border-gold/20 hover:bg-gold/[0.02]'
                          }`}
                        >
                          {selectedVolume === vol && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className={`text-2xl font-playfair ${selectedVolume === vol ? 'text-gold' : 'text-black'}`}>{vol}</div>
                          <div className={`text-sm mt-1 ${selectedVolume === vol ? 'text-gold/80' : 'text-gray-500'}`}>
                            EUR {calculatePrice(vol).toFixed(2)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div>
                  <label htmlFor="special-requests" className="label-micro-gold block mb-2">Special Requests <span className="text-gray-400">(Optional)</span></label>
                  <textarea
                    id="special-requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any preferences for intensity, longevity, or special occasions..."
                    rows={3}
                    className="input-base resize-none"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400">Total</div>
                    <div className="text-3xl font-playfair text-black">
                      EUR {selectedVolume ? calculatePrice(selectedVolume).toFixed(2) : '0.00'}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || !perfumeName || !selectedVolume}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
                      isProcessing || !perfumeName || !selectedVolume
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black shadow-md hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Pay with Stripe
                      </>
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
