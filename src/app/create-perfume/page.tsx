'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume, FragranceCategory } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { calculatePrice } from '@/lib/perfume/pricing'
import { ChevronLeft, Sparkles, Check, Loader2, ArrowRight, RotateCcw } from 'lucide-react'

type NoteLayer = 'top' | 'heart' | 'base'
type Step = 'intro' | 'base' | 'heart' | 'top' | 'checkout'

const LAYER_ORDER: NoteLayer[] = ['base', 'heart', 'top']
const STEP_ORDER: Step[] = ['intro', 'base', 'heart', 'top', 'checkout']

const layerMeta: Record<NoteLayer, { title: string; subtitle: string; description: string; number: number; suggest: FragranceCategory }> = {
  base: { title: 'Base Notes', subtitle: 'The Foundation', description: 'Deep, lasting notes that anchor your fragrance for hours. They form the soul of your scent.', number: 1, suggest: 'woody' },
  heart: { title: 'Heart Notes', subtitle: 'The Character', description: 'The emotional core. These notes emerge as the fragrance develops and define its true personality.', number: 2, suggest: 'floral' },
  top: { title: 'Top Notes', subtitle: 'First Impression', description: 'The opening spark. Light, vibrant notes that captivate from the very first moment.', number: 3, suggest: 'fruity' },
}

const categoryThemes: Record<FragranceCategory, { primary: string; glow: string }> = {
  floral: { primary: '#E8A0BF', glow: 'rgba(232,160,191,0.2)' },
  fruity: { primary: '#F0C75E', glow: 'rgba(240,199,94,0.2)' },
  woody: { primary: '#A89078', glow: 'rgba(168,144,120,0.2)' },
  oriental: { primary: '#D4AF37', glow: 'rgba(212,175,55,0.2)' },
  gourmand: { primary: '#C08B5C', glow: 'rgba(192,139,92,0.2)' },
}

// Ambient floating particles — deterministic seeds to avoid hydration mismatch
const PARTICLE_SEEDS = Array.from({ length: 20 }, (_, i) => ({
  w: ((i * 7 + 3) % 30) / 10 + 1,
  left: ((i * 37 + 13) % 100),
  top: ((i * 53 + 7) % 100),
  drift: 60 + ((i * 17 + 11) % 80),
  dur: 4 + ((i * 23 + 5) % 40) / 10,
  delay: ((i * 41 + 3) % 50) / 10,
}))

function AmbientParticles({ color = '#D4AF37' }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_SEEDS.map((seed, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: seed.w,
            height: seed.w,
            left: `${seed.left}%`,
            top: `${seed.top}%`,
            background: color,
            opacity: 0,
          }}
          animate={{
            y: [0, -seed.drift],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: seed.dur,
            repeat: Infinity,
            delay: seed.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// Realistic luxury perfume bottle with curved silhouette
function CinematicBottle({ composition, activeLayer, className = '' }: { composition: PerfumeComposition; activeLayer: NoteLayer; className?: string }) {
  const getColor = (layer: NoteLayer) => composition[layer]?.color || 'transparent'
  const has = (layer: NoteLayer) => composition[layer] !== null
  const anyFilled = has('base') || has('heart') || has('top')

  return (
    <div className={`relative ${className}`}>
      {/* Ambient glow behind bottle */}
      {anyFilled && (
        <motion.div
          className="absolute inset-0 -z-10"
          style={{ filter: 'blur(60px)' }}
          animate={{
            background: `radial-gradient(ellipse at center, ${getColor(has('base') ? 'base' : has('heart') ? 'heart' : 'top')}25 0%, transparent 70%)`
          }}
          transition={{ duration: 1.5 }}
        />
      )}

      {/* Reflection surface */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-6 bg-gradient-to-t from-white/[0.03] to-transparent rounded-full blur-sm" />

      <svg viewBox="0 -50 140 220" className="w-full h-auto drop-shadow-2xl">
        <defs>
          {/* Gold gradient for cap */}
          <linearGradient id="capGold2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0DFA0" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="75%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8960F" />
          </linearGradient>
          <linearGradient id="capSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B7420" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#8B7420" />
          </linearGradient>

          {/* Glass body gradients */}
          <linearGradient id="glassBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
          <linearGradient id="glassEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="15%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="85%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
          </linearGradient>
          <linearGradient id="glassVertical" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.01)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>

          {/* Curved bottle body path for clipping */}
          <clipPath id="bottleBodyClip">
            <path d="M 30 15 C 30 12, 35 8, 42 5 L 42 -2 L 98 -2 L 98 5 C 105 8, 110 12, 110 15 L 112 40 C 114 60, 114 80, 114 100 L 114 130 C 114 148, 100 158, 70 158 C 40 158, 26 148, 26 130 L 26 100 C 26 80, 26 60, 28 40 Z" />
          </clipPath>

          {/* Bottle outline path */}
          <path id="bottlePath" d="M 30 15 C 30 12, 35 8, 42 5 L 42 -2 L 98 -2 L 98 5 C 105 8, 110 12, 110 15 L 112 40 C 114 60, 114 80, 114 100 L 114 130 C 114 148, 100 158, 70 158 C 40 158, 26 148, 26 130 L 26 100 C 26 80, 26 60, 28 40 Z" />

          {/* Liquid glow filter */}
          <filter id="liquidGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Shadow under bottle */}
          <radialGradient id="bottleShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Shadow ellipse */}
        <ellipse cx="70" cy="162" rx="38" ry="4" fill="url(#bottleShadow)" />

        {/* ===== CAP ===== */}
        {/* Cap top ornament */}
        <rect x="56" y="-46" width="28" height="6" rx="3" fill="url(#capGold2)" />
        <rect x="56" y="-46" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />

        {/* Cap body */}
        <rect x="52" y="-40" width="36" height="22" rx="4" fill="url(#capGold2)" />
        {/* Cap highlight streak */}
        <rect x="62" y="-38" width="8" height="18" rx="4" fill="rgba(255,255,255,0.12)" />
        {/* Cap bottom detail line */}
        <rect x="52" y="-20" width="36" height="2" fill="#8B7420" opacity="0.6" />

        {/* Neck ring */}
        <rect x="48" y="-18" width="44" height="6" rx="2" fill="url(#capSide)" />
        <rect x="48" y="-18" width="44" height="2" rx="1" fill="rgba(255,255,255,0.2)" />

        {/* Neck */}
        <path d="M 50 -12 L 42 -2 L 42 5 L 98 5 L 98 -2 L 90 -12 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(212,175,55,0.15)" strokeWidth="0.5" />

        {/* ===== BOTTLE BODY ===== */}
        {/* Glass body fill */}
        <use href="#bottlePath" fill="url(#glassBody)" />
        <use href="#bottlePath" fill="url(#glassVertical)" />
        {/* Glass outline */}
        <use href="#bottlePath" fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth="1" />

        {/* ===== LIQUID LAYERS ===== */}
        <g clipPath="url(#bottleBodyClip)" filter="url(#liquidGlow)">
          {/* Base layer — bottom third */}
          <motion.rect
            x="24" y="108" width="92" height="52"
            fill={getColor('base')}
            animate={{ scaleY: has('base') ? 1 : 0, opacity: has('base') ? 0.85 : 0 }}
            style={{ transformOrigin: 'center bottom' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Base liquid highlight */}
          {has('base') && (
            <motion.rect
              x="30" y="108" width="16" height="50"
              fill="rgba(255,255,255,0.08)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          )}

          {/* Heart layer — middle third */}
          <motion.rect
            x="24" y="58" width="92" height="50"
            fill={getColor('heart')}
            animate={{ scaleY: has('heart') ? 1 : 0, opacity: has('heart') ? 0.8 : 0 }}
            style={{ transformOrigin: 'center bottom' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {has('heart') && (
            <motion.rect
              x="30" y="58" width="16" height="48"
              fill="rgba(255,255,255,0.06)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          )}

          {/* Top layer — top third */}
          <motion.rect
            x="24" y="8" width="92" height="50"
            fill={getColor('top')}
            animate={{ scaleY: has('top') ? 1 : 0, opacity: has('top') ? 0.75 : 0 }}
            style={{ transformOrigin: 'center bottom' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {has('top') && (
            <motion.rect
              x="30" y="8" width="16" height="48"
              fill="rgba(255,255,255,0.05)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          )}
        </g>

        {/* Active layer indicator (pulsing dashed outline) */}
        <motion.rect
          x={activeLayer === 'base' ? 25 : activeLayer === 'heart' ? 25 : 28}
          width={activeLayer === 'base' ? 90 : activeLayer === 'heart' ? 90 : 84}
          height={activeLayer === 'base' ? 50 : 50}
          rx="6"
          fill="none"
          stroke="rgba(212,175,55,0.4)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          animate={{
            y: activeLayer === 'top' ? 8 : activeLayer === 'heart' ? 58 : 108,
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            y: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 3, repeat: Infinity },
          }}
        />

        {/* Glass reflections */}
        <g opacity="0.5">
          {/* Left edge highlight */}
          <line x1="32" y1="20" x2="28" y2="140" stroke="white" strokeWidth="1.5" opacity="0.08" />
          {/* Broad left reflection */}
          <line x1="36" y1="25" x2="30" y2="135" stroke="white" strokeWidth="3" opacity="0.03" />
          {/* Right subtle edge */}
          <line x1="108" y1="20" x2="112" y2="130" stroke="white" strokeWidth="0.5" opacity="0.06" />
        </g>

        {/* Layer divider lines (subtle) */}
        <g opacity="0.15">
          <line x1="30" y1="58" x2="110" y2="58" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="2,3" />
          <line x1="30" y1="108" x2="110" y2="108" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="2,3" />
        </g>

        {/* Layer text labels inside bottle */}
        <text x="70" y="36" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="sans-serif" letterSpacing="0.2em">TOP</text>
        <text x="70" y="86" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="sans-serif" letterSpacing="0.2em">HEART</text>
        <text x="70" y="136" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="6" fontFamily="sans-serif" letterSpacing="0.2em">BASE</text>

        {/* Bottom edge highlight */}
        <ellipse cx="70" cy="157" rx="30" ry="2" fill="rgba(212,175,55,0.08)" />
      </svg>
    </div>
  )
}

// Note selection card with emoji icon
function NoteCard({
  note,
  isSelected,
  isUsed,
  onClick,
  index,
  theme,
}: {
  note: FragranceNote
  isSelected: boolean
  isUsed: boolean
  onClick: () => void
  index: number
  theme: { primary: string; glow: string }
}) {
  return (
    <motion.button
      onClick={() => !isUsed && onClick()}
      disabled={isUsed}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!isUsed ? { y: -4, scale: 1.02 } : undefined}
      whileTap={!isUsed ? { scale: 0.97 } : undefined}
      className={`group relative flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border transition-all duration-500 ${
        isSelected
          ? 'border-transparent bg-white/[0.12] backdrop-blur-md'
          : isUsed
          ? 'border-white/[0.03] bg-white/[0.02] opacity-30 cursor-not-allowed'
          : 'border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.12] backdrop-blur-sm'
      }`}
      style={isSelected ? {
        boxShadow: `0 0 40px ${theme.glow}, 0 0 0 1px ${theme.primary}80`,
      } : undefined}
    >
      {/* Emoji icon */}
      <div className="relative">
        <motion.span
          className="text-3xl sm:text-4xl block"
          animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            filter: isSelected ? `drop-shadow(0 0 12px ${note.color}80)` : 'none',
          }}
        >
          {note.icon}
        </motion.span>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-2 w-5 h-5 rounded-full flex items-center justify-center bg-gold"
          >
            <Check className="w-3 h-3 text-black" />
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <span className={`block text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
          {note.name}
        </span>
        <span className="block text-[11px] text-white/40 mt-1">{note.description}</span>
      </div>

      {isUsed && (
        <span className="absolute top-2.5 right-2.5 text-[9px] uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
          Used
        </span>
      )}
    </motion.button>
  )
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
  const [selectionFlash, setSelectionFlash] = useState(false)

  const activeLayer: NoteLayer = step === 'base' || step === 'heart' || step === 'top' ? step : 'base'
  const isComplete = isCompositionComplete(composition)
  const notes = fragranceDatabase[activeCategory] || []
  const theme = categoryThemes[activeCategory]
  const completedCount = [composition.top, composition.heart, composition.base].filter(Boolean).length

  // When entering a layer step, suggest a category
  useEffect(() => {
    if (step === 'base' || step === 'heart' || step === 'top') {
      setActiveCategory(layerMeta[step].suggest)
    }
  }, [step])

  const handleSelectNote = useCallback((note: FragranceNote) => {
    if (step !== 'base' && step !== 'heart' && step !== 'top') return
    setComposition(prev => ({ ...prev, [step]: note }))
    setSelectionFlash(true)
    setTimeout(() => setSelectionFlash(false), 600)
    // Auto-advance after a beat
    setTimeout(() => {
      if (step === 'base') setStep('heart')
      else if (step === 'heart') setStep('top')
      else if (step === 'top') setStep('checkout')
    }, 800)
  }, [step])

  const handleReset = useCallback(() => {
    setComposition({ top: null, heart: null, base: null })
    setStep('base')
    setActiveCategory('woody')
  }, [])

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step)
    if (idx > 0) {
      const prevStep = STEP_ORDER[idx - 1]
      setStep(prevStep)
    }
  }, [step])

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
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Global ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.06),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(212,175,55,0.03),transparent_60%)]" />
      </div>

      <AnimatePresence mode="wait">
        {/* =================== INTRO =================== */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex flex-col items-center justify-center relative px-4"
          >
            <AmbientParticles />

            {/* Decorative rings */}
            <motion.div
              className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-gold/[0.06]"
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-gold/[0.04]"
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center relative z-10"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-gold/40 mb-6"
              >
                Bespoke Fragrance Atelier
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6"
                style={{
                  background: 'linear-gradient(180deg, #FFF8DC 0%, #FFD700 35%, #D4AF37 65%, #B8960C 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 40px rgba(212,175,55,0.2))',
                }}
              >
                Create Your<br />Signature Scent
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/40 text-sm sm:text-base max-w-md mx-auto mb-4 leading-relaxed"
              >
                Three layers. Infinite possibilities. Craft a fragrance
                that&apos;s uniquely, unmistakably yours.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/25 mb-12"
              >
                <span>Base</span>
                <div className="w-8 h-px bg-gold/20" />
                <span>Heart</span>
                <div className="w-8 h-px bg-gold/20" />
                <span>Top</span>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={() => setStep('base')}
                className="group relative px-10 py-4 rounded-full text-sm tracking-[0.2em] uppercase font-medium overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative text-black flex items-center gap-2">
                  Begin Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* =================== LAYER STEPS =================== */}
        {(step === 'base' || step === 'heart' || step === 'top') && (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-24 md:pt-28 pb-20"
          >
            {/* Selection flash overlay */}
            <AnimatePresence>
              {selectionFlash && (
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="fixed inset-0 z-50 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${theme.glow} 0%, transparent 60%)` }}
                />
              )}
            </AnimatePresence>

            <div className="container-wide">
              {/* Header row: Back + Step indicator + Reset */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between mb-8 md:mb-12"
              >
                <button onClick={goBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back
                </button>

                {/* Step dots */}
                <div className="flex items-center gap-3">
                  {LAYER_ORDER.map((layer, i) => {
                    const isCurrent = layer === step
                    const isDone = composition[layer] !== null
                    return (
                      <button
                        key={layer}
                        onClick={() => setStep(layer)}
                        className="flex items-center gap-2"
                      >
                        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500 ${
                          isCurrent
                            ? 'bg-gold/20 text-gold border border-gold/40'
                            : isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/5 text-white/30 border border-white/10'
                        }`}>
                          {isDone && !isCurrent ? <Check className="w-3.5 h-3.5" /> : i + 1}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full border border-gold/30"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>
                        {i < 2 && <div className={`w-6 h-px ${isDone ? 'bg-emerald-500/30' : 'bg-white/10'}`} />}
                      </button>
                    )
                  })}
                </div>

                {completedCount > 0 ? (
                  <button onClick={handleReset} className="flex items-center gap-1.5 text-white/30 hover:text-red-400 transition-colors text-xs uppercase tracking-wider">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                ) : <div className="w-16" />}
              </motion.div>

              {/* Main: Bottle + Notes */}
              <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-10 lg:gap-16 items-start">

                {/* Left: Bottle + Layer info */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex flex-col items-center lg:sticky lg:top-28"
                >
                  <CinematicBottle
                    composition={composition}
                    activeLayer={activeLayer}
                    className="w-full max-w-[200px] lg:max-w-[240px] mb-8"
                  />

                  {/* Current layer info */}
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="text-[9px] uppercase tracking-[0.3em] text-gold/40 mb-2">
                      Layer {layerMeta[activeLayer].number} of 3
                    </div>
                    <h2 className="font-playfair text-2xl md:text-3xl text-white mb-2">
                      {layerMeta[activeLayer].title}
                    </h2>
                    <p className="text-white/35 text-sm max-w-[260px] leading-relaxed">
                      {layerMeta[activeLayer].description}
                    </p>
                  </motion.div>

                  {/* Composition summary */}
                  {completedCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 w-full max-w-[260px] space-y-2"
                    >
                      {LAYER_ORDER.map(layer => {
                        const note = composition[layer]
                        if (!note) return null
                        return (
                          <div key={layer} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                            <span className="text-lg flex-shrink-0">{note.icon}</span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] uppercase tracking-wider text-white/30">{layer}</span>
                              <span className="block text-xs text-white/80 font-medium truncate">{note.name}</span>
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </motion.div>

                {/* Right: Categories + Notes */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {/* Category tabs */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">Fragrance Family</span>
                      <span className="text-xs text-white/30">
                        Selecting <span className="text-gold">{layerMeta[activeLayer].title.split(' ')[0]}</span>
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
                            className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-400 border ${
                              isActive
                                ? 'text-white border-transparent'
                                : 'text-white/50 border-white/[0.08] hover:border-white/[0.15] hover:text-white/70 bg-white/[0.02]'
                            }`}
                            style={isActive ? {
                              background: `linear-gradient(135deg, ${catTheme.primary}35, ${catTheme.primary}15)`,
                              borderColor: `${catTheme.primary}50`,
                              boxShadow: `0 0 20px ${catTheme.glow}`,
                            } : undefined}
                          >
                            {cat.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notes grid */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                    >
                      {notes.map((note, i) => {
                        const isSelected = composition[activeLayer]?.name === note.name
                        const isUsed = Object.entries(composition).some(([k, n]) => n?.name === note.name && k !== activeLayer)
                        return (
                          <NoteCard
                            key={note.name}
                            note={note}
                            isSelected={isSelected}
                            isUsed={isUsed}
                            onClick={() => handleSelectNote(note)}
                            index={i}
                            theme={theme}
                          />
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Skip ahead if already complete */}
                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <button
                        onClick={() => setStep('checkout')}
                        className="w-full rounded-full py-4 text-sm tracking-[0.15em] uppercase font-medium bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Continue to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            <AmbientParticles color={theme.primary} />
          </motion.div>
        )}

        {/* =================== CHECKOUT =================== */}
        {step === 'checkout' && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-24 md:pt-28 pb-20"
          >
            <div className="max-w-2xl mx-auto px-4">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={goBack}
                className="mb-10 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm">Back to Top Notes</span>
              </motion.button>

              {/* Composition review */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl p-8 md:p-10 border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-8"
              >
                <div className="text-center mb-8">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold/40 mb-3">Your Creation</p>
                  <h2 className="font-playfair text-3xl md:text-4xl"
                    style={{
                      background: 'linear-gradient(180deg, #FFF8DC 0%, #D4AF37 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Finalize Your Masterpiece
                  </h2>
                </div>

                {/* Bottle + notes side by side */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-10">
                  <CinematicBottle composition={composition} activeLayer="base" className="w-28 sm:w-32" />
                  <div className="space-y-4">
                    {(['top', 'heart', 'base'] as NoteLayer[]).map((layer, i) => {
                      const note = composition[layer]!
                      return (
                        <motion.div
                          key={layer}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <span className="text-2xl flex-shrink-0">{note.icon}</span>
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 block">{layer} note</span>
                            <span className="text-white/90 font-medium">{note.name}</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent mb-8" />

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="perfume-name" className="block text-[10px] uppercase tracking-[0.2em] text-gold/50 mb-2">Name Your Creation *</label>
                    <input
                      id="perfume-name"
                      type="text"
                      value={perfumeName}
                      onChange={(e) => setPerfumeName(e.target.value)}
                      placeholder="e.g., Midnight Bloom"
                      maxLength={30}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all"
                    />
                  </div>

                  <div>
                    <fieldset>
                      <legend className="block text-[10px] uppercase tracking-[0.2em] text-gold/50 mb-3">Select Volume *</legend>
                      <div className="grid grid-cols-2 gap-4">
                        {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => (
                          <button
                            key={vol}
                            type="button"
                            onClick={() => setSelectedVolume(vol)}
                            className={`relative p-6 rounded-2xl border text-center transition-all duration-500 ${
                              selectedVolume === vol
                                ? 'border-gold/40 bg-gold/[0.08]'
                                : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05]'
                            }`}
                            style={selectedVolume === vol ? {
                              boxShadow: '0 0 30px rgba(212,175,55,0.1)',
                            } : undefined}
                          >
                            {selectedVolume === vol && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-black" />
                              </motion.div>
                            )}
                            <div className={`text-3xl font-playfair ${selectedVolume === vol ? 'text-gold' : 'text-white/70'}`}>{vol}</div>
                            <div className={`text-sm mt-2 ${selectedVolume === vol ? 'text-gold/70' : 'text-white/30'}`}>
                              EUR {calculatePrice(vol).toFixed(2)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div>
                    <label htmlFor="special-requests" className="block text-[10px] uppercase tracking-[0.2em] text-gold/50 mb-2">
                      Special Requests <span className="text-white/20">(Optional)</span>
                    </label>
                    <textarea
                      id="special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any preferences for intensity, longevity, or special occasions..."
                      rows={3}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all resize-none"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">Total</div>
                      <div className="text-3xl font-playfair text-gold">
                        EUR {selectedVolume ? calculatePrice(selectedVolume).toFixed(2) : '0.00'}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isProcessing || !perfumeName || !selectedVolume}
                      className={`flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
                        isProcessing || !perfumeName || !selectedVolume
                          ? 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black shadow-lg hover:shadow-xl hover:scale-[1.02]'
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
              </motion.div>

              {/* Edit composition link */}
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="text-xs text-white/25 hover:text-white/50 transition-colors uppercase tracking-wider"
                >
                  Start Over
                </button>
              </div>
            </div>

            <AmbientParticles />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
