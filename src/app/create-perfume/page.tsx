'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fragranceDatabase } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume, FragranceCategory } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { loadStripe } from '@stripe/stripe-js'

import {
  LayerProgressTabs,
  CategoryTabs,
  NotesGrid,
  FragrancePyramid,
  CompositionSummary,
  CheckoutForm,
} from './components'
import { headerVariants, pageVariants } from './motion'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type NoteLayer = 'top' | 'heart' | 'base'

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
  // ALL EXISTING STATE - UNCHANGED
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

  // ALL EXISTING HANDLERS - UNCHANGED
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

    // Validate form
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

      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const { error: stripeError } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/create-perfume/success`,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      variants={reducedMotion ? undefined : pageVariants}
      initial={reducedMotion ? undefined : 'initial'}
      animate={reducedMotion ? undefined : 'animate'}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white"
    >
      {/* Ambient background glow */}
      {!reducedMotion && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Header */}
      <motion.header
        variants={reducedMotion ? undefined : headerVariants}
        initial={reducedMotion ? undefined : 'initial'}
        animate={reducedMotion ? undefined : 'animate'}
        className="border-b border-amber-900/30 bg-black/50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-center text-3xl md:text-4xl font-light tracking-[0.3em] text-amber-400">
            AQUAD&apos;OR ATELIER
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400 tracking-[0.2em]">
            CREATE YOUR SIGNATURE FRAGRANCE
          </p>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="composer"
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            className="container mx-auto px-4 py-8"
          >
            {/* Fragrance Pyramid (desktop only) */}
            <FragrancePyramid
              composition={composition}
              activeLayer={activeLayer}
              reducedMotion={reducedMotion}
            />

            {/* Progress Steps */}
            <LayerProgressTabs
              activeLayer={activeLayer}
              composition={composition}
              onLayerChange={setActiveLayer}
              reducedMotion={reducedMotion}
            />

            {/* Category Tabs */}
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              reducedMotion={reducedMotion}
            />

            {/* Notes Grid */}
            <NotesGrid
              notes={fragranceDatabase[activeCategory]}
              category={activeCategory}
              selectedNoteName={composition[activeLayer]?.name ?? null}
              onSelectNote={(note) => handleSelectNote(activeLayer, note)}
              reducedMotion={reducedMotion}
            />

            {/* Composition Summary */}
            <CompositionSummary
              composition={composition}
              isComplete={isComplete}
              onCheckout={handleStartCheckout}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        ) : (
          <CheckoutForm
            key="checkout"
            composition={composition}
            perfumeName={perfumeName}
            onPerfumeNameChange={setPerfumeName}
            selectedVolume={selectedVolume}
            onVolumeChange={setSelectedVolume}
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
            error={error}
            isProcessing={isProcessing}
            onSubmit={handleSubmit}
            onBack={() => setShowForm(false)}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
