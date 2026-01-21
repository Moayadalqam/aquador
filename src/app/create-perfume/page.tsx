'use client'

import { useState } from 'react'
import { fragranceDatabase, fragranceCategories } from '@/lib/perfume/notes'
import { PerfumeComposition, FragranceNote, PerfumeVolume } from '@/lib/perfume/types'
import { isCompositionComplete } from '@/lib/perfume/composition'
import { calculatePrice } from '@/lib/perfume/pricing'
import { validatePerfumeForm } from '@/lib/perfume/validation'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type NoteLayer = 'top' | 'heart' | 'base'

export default function CreatePerfumePage() {
  const [composition, setComposition] = useState<PerfumeComposition>({
    top: null,
    heart: null,
    base: null,
  })
  const [activeLayer, setActiveLayer] = useState<NoteLayer>('top')
  const [activeCategory, setActiveCategory] = useState<'floral' | 'fruity' | 'woody' | 'oriental' | 'gourmand'>('floral')

  const [perfumeName, setPerfumeName] = useState('')
  const [selectedVolume, setSelectedVolume] = useState<PerfumeVolume | null>(null)
  const [specialRequests, setSpecialRequests] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

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
  const price = selectedVolume ? calculatePrice(selectedVolume) : 0

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-center text-3xl font-light tracking-[0.3em] text-amber-400">
            AQUAD&apos;OR ATELIER
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400 tracking-widest">
            CREATE YOUR SIGNATURE FRAGRANCE
          </p>
        </div>
      </header>

      {!showForm ? (
        <div className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-12 flex justify-center gap-4">
            {(['top', 'heart', 'base'] as NoteLayer[]).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`relative px-8 py-4 text-sm tracking-widest transition-all ${
                  activeLayer === layer
                    ? 'bg-amber-500/20 text-amber-400'
                    : composition[layer]
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                <span className="block uppercase">{layer} Note</span>
                {composition[layer] && (
                  <span className="mt-1 block text-xs">{composition[layer]!.name}</span>
                )}
                {layer === activeLayer && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {fragranceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-2 text-sm tracking-wider transition-all ${
                  activeCategory === cat.key
                    ? 'bg-amber-500/20 text-amber-400 border-b border-amber-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Notes Grid */}
          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {fragranceDatabase[activeCategory].map((note) => {
              const isSelected = composition[activeLayer]?.name === note.name
              return (
                <button
                  key={note.name}
                  onClick={() => handleSelectNote(activeLayer, note)}
                  className={`group flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 ring-2 ring-amber-400'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-3xl">{note.icon}</span>
                  <span className={`text-center text-xs ${isSelected ? 'text-amber-400' : 'text-gray-300'}`}>
                    {note.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Composition Summary */}
          <div className="mx-auto max-w-md rounded-xl border border-amber-900/30 bg-black/30 p-6 backdrop-blur">
            <h3 className="mb-4 text-center text-lg text-amber-400 tracking-wider">YOUR COMPOSITION</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-400">Top Note</span>
                <span className={composition.top ? 'text-white' : 'text-gray-600'}>
                  {composition.top?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-gray-400">Heart Note</span>
                <span className={composition.heart ? 'text-white' : 'text-gray-600'}>
                  {composition.heart?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Base Note</span>
                <span className={composition.base ? 'text-white' : 'text-gray-600'}>
                  {composition.base?.name || '—'}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartCheckout}
              disabled={!isComplete}
              className={`mt-6 w-full rounded-full py-4 text-sm tracking-widest transition-all ${
                isComplete
                  ? 'bg-amber-500 text-black hover:bg-amber-400'
                  : 'cursor-not-allowed bg-white/10 text-gray-600'
              }`}
            >
              {isComplete ? 'CONTINUE TO CHECKOUT' : 'SELECT ALL NOTES'}
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-lg px-4 py-12">
          <button
            onClick={() => setShowForm(false)}
            className="mb-8 text-gray-400 hover:text-white"
          >
            ← Back to Composer
          </button>

          <div className="rounded-2xl border border-amber-900/30 bg-black/50 p-8 backdrop-blur">
            <h2 className="mb-6 text-center text-2xl text-amber-400 tracking-wider">
              FINALIZE YOUR FRAGRANCE
            </h2>

            {/* Composition Review */}
            <div className="mb-8 rounded-xl bg-white/5 p-4">
              <h3 className="mb-3 text-sm text-gray-400 tracking-wider">COMPOSITION</h3>
              <p className="text-white">{composition.top?.name} • {composition.heart?.name} • {composition.base?.name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm text-gray-400">PERFUME NAME *</label>
                <input
                  type="text"
                  value={perfumeName}
                  onChange={(e) => setPerfumeName(e.target.value)}
                  placeholder="Enter your perfume name..."
                  maxLength={30}
                  className="w-full rounded-lg border border-amber-900/30 bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">SELECT VOLUME *</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['50ml', '100ml'] as PerfumeVolume[]).map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setSelectedVolume(vol)}
                      className={`rounded-lg border p-4 transition-all ${
                        selectedVolume === vol
                          ? 'border-amber-400 bg-amber-500/20 text-amber-400'
                          : 'border-amber-900/30 bg-white/5 text-gray-400 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="text-2xl font-light">{vol}</div>
                      <div className="mt-1 text-sm">€{calculatePrice(vol).toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">SPECIAL REQUESTS</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests for your fragrance..."
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-lg border border-amber-900/30 bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-900/20 border border-red-900/50 px-4 py-3 text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <div>
                  <div className="text-sm text-gray-400">TOTAL</div>
                  <div className="text-2xl text-amber-400">€{price.toFixed(2)}</div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !perfumeName || !selectedVolume}
                  className={`rounded-full px-8 py-4 text-sm tracking-widest transition-all ${
                    isProcessing || !perfumeName || !selectedVolume
                      ? 'cursor-not-allowed bg-white/10 text-gray-600'
                      : 'bg-amber-500 text-black hover:bg-amber-400'
                  }`}
                >
                  {isProcessing ? 'PROCESSING...' : 'PAY WITH STRIPE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
