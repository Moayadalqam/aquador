'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Upload, X, Check, AlertCircle } from 'lucide-react'

type ProductType = '50ml-perfume' | '100ml-perfume' | '10ml-oil'

interface FormulaRow {
  id: string
  code: string
  category: 'N' | 'W' | 'M' | ''
  amount: string
}

interface ProductConfig {
  label: string
  description: string
  min: number
  max: number
}

const productConfigs: Record<ProductType, ProductConfig> = {
  '50ml-perfume': {
    label: '50ml Perfume',
    description: 'Classic size for everyday elegance',
    min: 16,
    max: 20,
  },
  '100ml-perfume': {
    label: '100ml Perfume',
    description: 'Generous size for the devoted connoisseur',
    min: 32,
    max: 40,
  },
  '10ml-oil': {
    label: '10ml Oil Essence',
    description: 'Pure concentrated fragrance oil',
    min: 0,
    max: 10,
  },
}

const categoryLabels: Record<string, string> = {
  N: 'Niche',
  W: 'Women',
  M: 'Men',
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export default function ReorderPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [formulaRows, setFormulaRows] = useState<FormulaRow[]>([
    { id: generateId(), code: '', category: '', amount: '' },
  ])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const reducedMotion = useReducedMotion()

  // Calculate total amount
  const totalAmount = formulaRows.reduce((sum, row) => {
    const amount = parseFloat(row.amount) || 0
    return sum + amount
  }, 0)

  // Get validation status (only used on submit)
  const getValidationStatus = (): { isValid: boolean; message: string } => {
    if (!selectedProduct) {
      return { isValid: false, message: 'Please select a product type' }
    }

    const config = productConfigs[selectedProduct]
    const hasAnyFormula = formulaRows.some(row => row.code && row.amount)

    if (!hasAnyFormula) {
      return { isValid: false, message: 'Please enter at least one formula' }
    }

    // Check if any row has incomplete data
    const incompleteRows = formulaRows.filter(
      row => (row.code || row.amount) && (!row.code || !row.category || !row.amount)
    )
    if (incompleteRows.length > 0) {
      return { isValid: false, message: 'Please complete all formula entries' }
    }

    if (totalAmount < config.min) {
      return { isValid: false, message: `Total amount must be at least ${config.min}` }
    }

    if (totalAmount > config.max) {
      return { isValid: false, message: `Total amount cannot exceed ${config.max}` }
    }

    return { isValid: true, message: '' }
  }

  const addRow = () => {
    if (formulaRows.length < 6) {
      setFormulaRows([...formulaRows, { id: generateId(), code: '', category: '', amount: '' }])
    }
  }

  const removeRow = (id: string) => {
    if (formulaRows.length > 1) {
      setFormulaRows(formulaRows.filter(row => row.id !== id))
    }
  }

  const updateRow = (id: string, field: keyof FormulaRow, value: string) => {
    setFormulaRows(
      formulaRows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      )
    )
    setSubmitError(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        setSubmitError('Please upload a JPG, PNG, or HEIC image')
        return
      }

      setUploadedFile(file)
      setSubmitError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validation = getValidationStatus()
    if (!validation.isValid) {
      setSubmitError(validation.message)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // For now, just show success
    setIsSubmitting(false)
    setSubmitSuccess(true)
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 pb-20">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/8 via-emerald-500/3 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/5 via-gold/2 to-transparent rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="w-20 h-20 rounded-full bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8"
          >
            <Check className="w-10 h-10 text-emerald-400" />
          </motion.div>

          <h1 className="font-playfair text-4xl text-white mb-4">
            Request Received
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Thank you for your re-order request. Our fragrance specialists will review your formula and contact you within 24-48 hours to confirm your order.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-gold via-amber-300 to-gold text-black font-medium text-sm tracking-wider uppercase"
          >
            Return Home
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-amber-500/8 via-amber-500/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/5 via-gold/2 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-radial from-amber-400/4 to-transparent rounded-full blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block text-[10px] tracking-[0.4em] text-gold/60 uppercase mb-4">
            Returning Customer
          </span>
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6">
            Re-Order Your{' '}
            <span className="text-gradient-gold">Signature</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed">
            Already have your perfect formula? Enter it below to re-order your custom fragrance,
            or attach a photo of your handwritten formula.
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4">
        {/* Product Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <label className="block text-[10px] text-gold/60 tracking-[0.2em] uppercase mb-4">
            Select Product Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(productConfigs) as ProductType[]).map((type) => {
              const config = productConfigs[type]
              const isSelected = selectedProduct === type

              return (
                <motion.button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedProduct(type)
                    setSubmitError(null)
                  }}
                  whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
                  whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
                  className={`
                    relative p-5 rounded-2xl border text-left transition-all duration-300
                    ${isSelected
                      ? 'border-gold/50 bg-gradient-to-b from-gold/15 to-gold/5'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                  <div className={`font-medium mb-1 ${isSelected ? 'text-gold' : 'text-white'}`}>
                    {config.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {config.description}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Formula Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] text-gold/60 tracking-[0.2em] uppercase">
              Your Formula
            </label>
            <span className="text-xs text-gray-500">
              {formulaRows.length} of 6 rows
            </span>
          </div>

          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_40px] gap-3 mb-3 px-2">
            <span className="text-[10px] text-gray-500 tracking-wider uppercase">Code</span>
            <span className="text-[10px] text-gray-500 tracking-wider uppercase">Category</span>
            <span className="text-[10px] text-gray-500 tracking-wider uppercase">Amount</span>
            <span></span>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {formulaRows.map((row) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px_40px] gap-3 p-4 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  {/* Code input */}
                  <div className="sm:contents">
                    <label className="sm:hidden text-[10px] text-gray-500 tracking-wider uppercase mb-1 block">
                      Code
                    </label>
                    <input
                      type="text"
                      value={row.code}
                      onChange={(e) => updateRow(row.id, 'code', e.target.value)}
                      placeholder="e.g., 42"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-gray-600
                                 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all text-sm"
                    />
                  </div>

                  {/* Category selector */}
                  <div className="sm:contents">
                    <label className="sm:hidden text-[10px] text-gray-500 tracking-wider uppercase mb-1 block">
                      Category
                    </label>
                    <select
                      value={row.category}
                      onChange={(e) => updateRow(row.id, 'category', e.target.value as 'N' | 'W' | 'M' | '')}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-white
                                 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all text-sm
                                 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1rem',
                      }}
                    >
                      <option value="" className="bg-black">Select</option>
                      <option value="N" className="bg-black">{categoryLabels.N}</option>
                      <option value="W" className="bg-black">{categoryLabels.W}</option>
                      <option value="M" className="bg-black">{categoryLabels.M}</option>
                    </select>
                  </div>

                  {/* Amount input */}
                  <div className="sm:contents">
                    <label className="sm:hidden text-[10px] text-gray-500 tracking-wider uppercase mb-1 block">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.5"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder-gray-600
                                 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all text-sm
                                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Remove button */}
                  <div className="flex items-center justify-end sm:justify-center">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={formulaRows.length === 1}
                      className={`
                        p-2 rounded-lg transition-all
                        ${formulaRows.length === 1
                          ? 'text-gray-700 cursor-not-allowed'
                          : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                        }
                      `}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add row button */}
          {formulaRows.length < 6 && (
            <motion.button
              type="button"
              onClick={addRow}
              whileHover={!reducedMotion ? { scale: 1.01 } : undefined}
              className="mt-4 w-full py-4 rounded-xl border border-dashed border-white/20 text-gray-400 text-sm
                         hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Row
            </motion.button>
          )}

          {/* Total indicator */}
          {selectedProduct && (
            <div className="mt-6 flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-sm text-gray-400">Total</span>
              <span className={`text-lg font-light ${
                totalAmount > 0 ? 'text-white' : 'text-gray-600'
              }`}>
                {totalAmount.toFixed(1)}
                <span className="text-xs text-gray-500 ml-2">
                  / {productConfigs[selectedProduct].min}-{productConfigs[selectedProduct].max}
                </span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Photo Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <label className="block text-[10px] text-gold/60 tracking-[0.2em] uppercase mb-4">
            Attach Formula Photo <span className="text-gray-600">(Optional)</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!uploadedFile ? (
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              whileHover={!reducedMotion ? { scale: 1.01 } : undefined}
              className="w-full py-12 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02]
                         hover:border-gold/30 hover:bg-gold/5 transition-all group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <Upload className="w-6 h-6 text-gray-500 group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Click to upload your handwritten formula</p>
                  <p className="text-xs text-gray-600">JPG, PNG, or HEIC accepted</p>
                </div>
              </div>
            </motion.button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              {uploadPreview && (
                <Image
                  src={uploadPreview}
                  alt="Formula preview"
                  width={800}
                  height={192}
                  className="w-full h-48 object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-gray-400 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{submitError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting && !reducedMotion ? { scale: 1.02 } : undefined}
            whileTap={!isSubmitting && !reducedMotion ? { scale: 0.98 } : undefined}
            className={`
              relative w-full rounded-full py-5 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-500 overflow-hidden
              ${isSubmitting
                ? 'cursor-wait bg-white/5 text-gray-600 border border-white/10'
                : 'text-black'
              }
            `}
          >
            {!isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gold via-amber-300 to-gold"
                animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 100%' }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting Request...
                </>
              ) : (
                'Submit Re-Order Request'
              )}
            </span>
          </motion.button>

          <p className="text-center text-xs text-gray-600 mt-4">
            Our team will review your formula and contact you to confirm your order.
          </p>
        </motion.div>
      </form>
    </div>
  )
}
