'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import type {
  PerfumeComposition,
  FragranceNote,
  PerfumeVolume,
  FragranceCategory,
} from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { calculatePrice } from '@/lib/perfume/pricing'
import { AnimationBudgetProvider } from '@/lib/performance/animation-budget'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Sparkles,
  RotateCcw,
  Flower2,
  TreePine,
  Flame,
  Apple,
  Cookie,
  Droplet,
  ShieldCheck,
  Truck,
  Package,
} from 'lucide-react'
import dynamic from 'next/dynamic'

const PerfumeBottle3D = dynamic(
  () => import('@/components/create-perfume/PerfumeBottle3D'),
  { ssr: false }
)

type NoteLayer = 'top' | 'heart' | 'base'
type Step = 'intro' | 'base' | 'heart' | 'top' | 'checkout'

const LAYER_ORDER: NoteLayer[] = ['base', 'heart', 'top']
const STEP_ORDER: Step[] = ['intro', 'base', 'heart', 'top', 'checkout']

const layerMeta: Record<
  NoteLayer,
  { title: string; subtitle: string; description: string; number: number; suggest: FragranceCategory }
> = {
  base: {
    title: 'Base Notes',
    subtitle: 'The Foundation',
    description:
      'The soul of your fragrance — deep and lasting. Base notes linger on skin for hours, anchoring everything above them.',
    number: 1,
    suggest: 'woody',
  },
  heart: {
    title: 'Heart Notes',
    subtitle: 'The Character',
    description:
      'The emotional core. Heart notes emerge as your fragrance opens and define its true personality.',
    number: 2,
    suggest: 'floral',
  },
  top: {
    title: 'Top Notes',
    subtitle: 'First Impression',
    description:
      'The opening spark — light, bright, vibrant. Top notes are what people first notice, volatile and unforgettable.',
    number: 3,
    suggest: 'fruity',
  },
}

// Professional Lucide icons per fragrance category — replaces emoji usage
const categoryIcons: Record<FragranceCategory, typeof Flower2> = {
  floral: Flower2,
  fruity: Apple,
  woody: TreePine,
  oriental: Flame,
  gourmand: Cookie,
}

export default function CreatePerfumePage() {
  const [step, setStep] = useState<Step>('intro')
  const [composition, setComposition] = useState<PerfumeComposition>({ top: null, heart: null, base: null })
  const [activeCategory, setActiveCategory] = useState<FragranceCategory>('woody')
  const [perfumeName, setPerfumeName] = useState('')
  const [selectedVolume, setSelectedVolume] = useState<PerfumeVolume | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeLayer: NoteLayer =
    step === 'base' || step === 'heart' || step === 'top' ? step : 'base'
  const isComplete = isCompositionComplete(composition)
  const notes = fragranceDatabase[activeCategory] || []
  const completedCount = [composition.top, composition.heart, composition.base].filter(Boolean).length

  // When entering a layer step, suggest a category
  useEffect(() => {
    if (step === 'base' || step === 'heart' || step === 'top') {
      setActiveCategory(layerMeta[step].suggest)
    }
  }, [step])

  const handleSelectNote = useCallback(
    (note: FragranceNote) => {
      if (step !== 'base' && step !== 'heart' && step !== 'top') return
      setComposition((prev) => ({ ...prev, [step]: note }))
      // Auto-advance after a short beat — gives the user a moment to register the selection
      setTimeout(() => {
        if (step === 'base') setStep('heart')
        else if (step === 'heart') setStep('top')
        else if (step === 'top') setStep('checkout')
      }, 650)
    },
    [step]
  )

  const handleReset = useCallback(() => {
    setComposition({ top: null, heart: null, base: null })
    setStep('base')
    setActiveCategory('woody')
  }, [])

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step)
    if (idx > 0) setStep(STEP_ORDER[idx - 1])
  }, [step])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const validationResult = validatePerfumeForm({
      name: perfumeName,
      composition,
      volume: selectedVolume,
      specialRequests,
    })
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
      if (!response.ok) throw new Error(data.error || 'Payment failed')
      if (data.url) window.location.href = data.url
      else throw new Error('No checkout URL received')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  // Svg fallback for the 3D bottle on low-end devices
  const bottleFallback = (
    <div className="w-full h-full min-h-[340px] flex items-center justify-center">
      <svg viewBox="0 0 100 160" className="h-full w-auto" aria-hidden="true">
        <rect x="38" y="0" width="24" height="14" rx="2" fill="#1a1a1a" />
        <rect x="34" y="14" width="32" height="4" fill="#B8860B" />
        <path d="M 42 18 L 58 18 L 62 34 L 38 34 Z" fill="#B8860B" />
        <rect x="20" y="34" width="60" height="96" rx="8" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeOpacity="0.5" />
        <text x="50" y="82" textAnchor="middle" fill="#D4AF37" fontFamily="Playfair Display, serif" fontSize="10" fontWeight="600">
          AQUAD&apos;OR
        </text>
        <text x="50" y="94" textAnchor="middle" fill="#D4AF37" fontFamily="Playfair Display, serif" fontSize="6" fontStyle="italic" opacity="0.8">
          Cyprus
        </text>
      </svg>
    </div>
  )

  return (
    <AnimationBudgetProvider>
      <div className="min-h-screen bg-[#FAFAF8] text-neutral-900">
        {/* Ambient warm glow */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(212,175,55,0.04) 0%, transparent 60%)',
          }}
        />

        <AnimatePresence mode="wait">
          {/* =============== INTRO =============== */}
          {step === 'intro' && (
            <motion.section
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen flex items-center pt-24 pb-16"
            >
              <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
                {/* Copy column */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[10px] uppercase tracking-[0.32em] text-gold-dark mb-6">
                    Bespoke Fragrance Atelier
                  </p>
                  <h1
                    className="font-playfair font-semibold leading-[1.05] tracking-tight mb-6"
                    style={{ fontSize: 'clamp(2.25rem, 1.5rem + 3vw, 4rem)' }}
                  >
                    Your scent,
                    <br />
                    <span className="italic text-gold-dark">composed layer by layer.</span>
                  </h1>
                  <div className="w-14 h-px bg-gold-dark mb-6" />
                  <p className="text-neutral-600 text-base md:text-lg leading-relaxed max-w-xl mb-10">
                    Three notes. Base, heart and top. Choose each with intent — we&apos;ll distill,
                    age and bottle your signature in Nicosia and send it to your door in Cyprus.
                  </p>

                  {/* Process steps — inline editorial */}
                  <div className="flex flex-wrap gap-x-10 gap-y-4 mb-12">
                    {LAYER_ORDER.map((layer, idx) => (
                      <div key={layer} className="flex items-center gap-3">
                        <span className="font-playfair text-2xl text-gold-dark tabular-nums">
                          0{idx + 1}
                        </span>
                        <div>
                          <p className="text-[11px] tracking-[0.24em] uppercase text-neutral-500">
                            {layerMeta[layer].subtitle}
                          </p>
                          <p className="font-playfair text-lg text-neutral-900">
                            {layerMeta[layer].title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('base')}
                    className="group inline-flex items-center gap-3 bg-neutral-900 text-white px-8 py-4 rounded-full text-sm tracking-[0.18em] uppercase font-medium hover:bg-gold-dark transition-colors duration-300"
                  >
                    Begin Your Composition
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Trust line */}
                  <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.75} />
                      Secure checkout
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.75} />
                      50ml &middot; 100ml bottles
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.75} />
                      Island-wide delivery
                    </span>
                  </div>
                </motion.div>

                {/* Bottle preview column */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div className="relative aspect-[3/4] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)]">
                    <div
                      className="absolute inset-0 pointer-events-none"
                      aria-hidden="true"
                      style={{
                        background:
                          'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.25) 0%, transparent 60%)',
                      }}
                    />
                    <PerfumeBottle3D
                      composition={composition}
                      activeLayer={activeLayer}
                      className="absolute inset-0"
                      fallback={bottleFallback}
                    />
                  </div>
                  <p className="text-[10px] text-center mt-4 uppercase tracking-[0.24em] text-neutral-400">
                    Drag to rotate &middot; live composition preview
                  </p>
                </motion.div>
              </div>
            </motion.section>
          )}

          {/* =============== LAYER SELECTION =============== */}
          {(step === 'base' || step === 'heart' || step === 'top') && (
            <motion.section
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pt-24 pb-16"
            >
              <div className="max-w-7xl mx-auto px-6">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex items-center gap-4">
                    {LAYER_ORDER.map((layer) => {
                      const isDone = !!composition[layer]
                      const isActive = layer === activeLayer
                      return (
                        <button
                          key={layer}
                          onClick={() =>
                            (isDone || layer === activeLayer) && setStep(layer)
                          }
                          className="group flex items-center gap-2"
                          aria-label={`Go to ${layerMeta[layer].title}`}
                        >
                          <span
                            className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-medium transition-colors ${
                              isActive
                                ? 'bg-gold-dark text-white'
                                : isDone
                                ? 'bg-gold/20 text-gold-dark'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            {isDone && !isActive ? (
                              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                            ) : (
                              layerMeta[layer].number
                            )}
                          </span>
                          <span
                            className={`hidden sm:inline text-xs tracking-wider uppercase ${
                              isActive
                                ? 'text-neutral-900 font-medium'
                                : 'text-neutral-500'
                            }`}
                          >
                            {layerMeta[layer].title.split(' ')[0]}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16">
                  {/* Bottle preview — sticky on desktop */}
                  <div className="lg:sticky lg:top-24 self-start">
                    <div className="relative aspect-[3/4] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
                      <div
                        className="absolute inset-0 pointer-events-none"
                        aria-hidden="true"
                        style={{
                          background:
                            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.22) 0%, transparent 60%)',
                        }}
                      />
                      <PerfumeBottle3D
                        composition={composition}
                        activeLayer={activeLayer}
                        className="absolute inset-0"
                        fallback={bottleFallback}
                      />
                    </div>

                    {/* Current composition readout */}
                    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
                      <p className="text-[10px] tracking-[0.24em] uppercase text-neutral-500 mb-3">
                        Your Composition
                      </p>
                      <div className="space-y-2.5">
                        {LAYER_ORDER.map((layer) => {
                          const note = composition[layer]
                          const isActive = layer === activeLayer
                          return (
                            <div
                              key={layer}
                              className={`flex items-center justify-between py-1.5 ${
                                isActive ? 'opacity-100' : 'opacity-90'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="w-3 h-3 rounded-full border border-black/5 flex-shrink-0"
                                  style={{
                                    background: note?.color ?? '#E5E5E5',
                                    boxShadow: note ? `0 0 0 2px ${note.color}22` : undefined,
                                  }}
                                />
                                <span className="text-[11px] tracking-[0.18em] uppercase text-neutral-500">
                                  {layerMeta[layer].title}
                                </span>
                              </div>
                              <span
                                className={`text-sm font-playfair ${
                                  note ? 'text-neutral-900' : 'text-neutral-300'
                                }`}
                              >
                                {note?.name ?? 'Unselected'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Selection column */}
                  <div>
                    <p className="text-[10px] tracking-[0.28em] uppercase text-gold-dark mb-3">
                      Step {layerMeta[activeLayer].number} of 3 &middot; {layerMeta[activeLayer].subtitle}
                    </p>
                    <h2
                      className="font-playfair font-semibold leading-[1.1] tracking-tight mb-4"
                      style={{ fontSize: 'clamp(1.75rem, 1rem + 2.5vw, 2.75rem)' }}
                    >
                      Choose your {layerMeta[activeLayer].title.toLowerCase()}
                    </h2>
                    <p className="text-neutral-600 text-[15px] leading-relaxed max-w-xl mb-8">
                      {layerMeta[activeLayer].description}
                    </p>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-7">
                      {fragranceCategories.map((cat) => {
                        const Icon = categoryIcons[cat.key]
                        const isActive = activeCategory === cat.key
                        return (
                          <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 text-sm ${
                              isActive
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-gold-dark'}`}
                              strokeWidth={1.75}
                            />
                            <span className="tracking-wide">{cat.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Note cards */}
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                      {notes.map((note) => {
                        const selected = composition[activeLayer]?.name === note.name
                        return (
                          <button
                            key={note.name}
                            onClick={() => handleSelectNote(note)}
                            className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
                              selected
                                ? 'border-gold-dark bg-gold/[0.06] shadow-[0_0_0_3px_rgba(212,175,55,0.12)]'
                                : 'border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm'
                            }`}
                          >
                            {selected && (
                              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-dark flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </span>
                            )}
                            {/* Color swatch */}
                            <div
                              className="w-8 h-8 rounded-full mb-3 border border-black/5"
                              style={{
                                background: note.color,
                                boxShadow: `0 4px 14px -4px ${note.color}66`,
                              }}
                            />
                            <p className="font-playfair text-[15px] text-neutral-900 leading-tight mb-1">
                              {note.name}
                            </p>
                            <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                              {note.description}
                            </p>
                          </button>
                        )
                      })}
                    </motion.div>

                    {/* Hint */}
                    <p className="text-[11px] text-neutral-400 mt-6">
                      Select a note to continue &mdash; your composition advances automatically.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* =============== CHECKOUT =============== */}
          {step === 'checkout' && (
            <motion.section
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pt-24 pb-16"
            >
              <div className="max-w-5xl mx-auto px-6">
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Top Notes
                </button>

                <div className="mb-10">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold-dark mb-4">
                    Your Composition
                  </p>
                  <h1
                    className="font-playfair font-semibold leading-[1.05] tracking-tight"
                    style={{ fontSize: 'clamp(2rem, 1rem + 3vw, 3.25rem)' }}
                  >
                    Finalize your masterpiece
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-8 md:gap-12">
                  {/* Bottle + composition */}
                  <div className="md:sticky md:top-24 self-start">
                    <div className="relative aspect-[3/4] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]">
                      <div
                        className="absolute inset-0 pointer-events-none"
                        aria-hidden="true"
                        style={{
                          background:
                            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.25) 0%, transparent 60%)',
                        }}
                      />
                      <PerfumeBottle3D
                        composition={composition}
                        activeLayer="base"
                        className="absolute inset-0"
                        fallback={bottleFallback}
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 space-y-2.5">
                      {(['top', 'heart', 'base'] as NoteLayer[]).map((layer) => {
                        const note = composition[layer]
                        if (!note) return null
                        return (
                          <div key={layer} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className="w-3 h-3 rounded-full border border-black/5"
                                style={{ background: note.color }}
                              />
                              <span className="text-[11px] tracking-[0.18em] uppercase text-neutral-500">
                                {layer} note
                              </span>
                            </div>
                            <span className="text-sm font-playfair text-neutral-900">
                              {note.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-7">
                    <div>
                      <label
                        htmlFor="perfume-name"
                        className="block text-[10px] uppercase tracking-[0.22em] text-gold-dark mb-2"
                      >
                        Name your creation *
                      </label>
                      <input
                        id="perfume-name"
                        type="text"
                        value={perfumeName}
                        onChange={(e) => setPerfumeName(e.target.value)}
                        placeholder="e.g., Midnight Bloom"
                        maxLength={30}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-3.5 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-gold-dark focus:ring-2 focus:ring-gold/20 transition-all"
                      />
                    </div>

                    <fieldset>
                      <legend className="text-[10px] uppercase tracking-[0.22em] text-gold-dark mb-3">
                        Choose volume *
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => {
                          const active = selectedVolume === vol
                          return (
                            <button
                              key={vol}
                              type="button"
                              onClick={() => setSelectedVolume(vol)}
                              className={`relative p-6 rounded-2xl border text-center transition-all ${
                                active
                                  ? 'border-gold-dark bg-gold/[0.06] shadow-[0_0_0_3px_rgba(212,175,55,0.12)]'
                                  : 'border-neutral-200 bg-white hover:border-neutral-400'
                              }`}
                            >
                              {active && (
                                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-dark flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </span>
                              )}
                              <Droplet
                                className={`w-5 h-5 mx-auto mb-2 ${
                                  active ? 'text-gold-dark' : 'text-neutral-400'
                                }`}
                                strokeWidth={1.5}
                              />
                              <div
                                className={`text-2xl font-playfair ${
                                  active ? 'text-neutral-900' : 'text-neutral-700'
                                }`}
                              >
                                {vol}
                              </div>
                              <div className="text-sm text-neutral-500 mt-1">
                                &euro; {calculatePrice(vol).toFixed(2)}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>

                    <div>
                      <label
                        htmlFor="special-requests"
                        className="block text-[10px] uppercase tracking-[0.22em] text-gold-dark mb-2"
                      >
                        Special requests <span className="text-neutral-400 normal-case tracking-normal">(optional)</span>
                      </label>
                      <textarea
                        id="special-requests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any preferences for intensity, longevity, or occasion..."
                        rows={3}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-5 py-3.5 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-gold-dark focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                          Total
                        </div>
                        <div className="text-3xl font-playfair text-neutral-900">
                          &euro; {selectedVolume ? calculatePrice(selectedVolume).toFixed(2) : '0.00'}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessing || !perfumeName || !selectedVolume || !isComplete}
                        className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all ${
                          isProcessing || !perfumeName || !selectedVolume || !isComplete
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : 'bg-neutral-900 text-white hover:bg-gold-dark'
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

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-neutral-500 pt-2">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.75} />
                        Secure checkout via Stripe
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-gold-dark" strokeWidth={1.75} />
                        Free island-wide delivery
                      </span>
                    </div>
                  </form>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={handleReset}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700 uppercase tracking-[0.2em] transition-colors"
                  >
                    Start over
                  </button>
                </div>

                <p className="sr-only">Composition progress: {completedCount} of 3 notes selected.</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </AnimationBudgetProvider>
  )
}
