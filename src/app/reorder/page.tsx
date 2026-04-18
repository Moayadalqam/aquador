'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Minus, Upload, X, Check, AlertCircle, Loader2, ArrowLeft, Droplets, FlaskConical, Pipette } from 'lucide-react'

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
  icon: React.ReactNode
}

const productConfigs: Record<ProductType, ProductConfig> = {
  '50ml-perfume': {
    label: '50ml Perfume',
    description: 'Classic size for everyday elegance',
    min: 16,
    max: 20,
    icon: <Droplets className="w-5 h-5" />,
  },
  '100ml-perfume': {
    label: '100ml Perfume',
    description: 'Generous size for the devoted connoisseur',
    min: 32,
    max: 40,
    icon: <FlaskConical className="w-5 h-5" />,
  },
  '10ml-oil': {
    label: '10ml Oil Essence',
    description: 'Pure concentrated fragrance oil',
    min: 0,
    max: 10,
    icon: <Pipette className="w-5 h-5" />,
  },
}

const categoryLabels: Record<string, string> = {
  N: 'Niche',
  W: 'Women',
  M: 'Men',
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

  const totalAmount = formulaRows.reduce((sum, row) => {
    const amount = parseFloat(row.amount) || 0
    return sum + amount
  }, 0)

  const getValidationStatus = (): { isValid: boolean; message: string } => {
    if (!selectedProduct) {
      return { isValid: false, message: 'Please select a product type' }
    }

    const config = productConfigs[selectedProduct]
    const hasAnyFormula = formulaRows.some(row => row.code && row.amount)

    if (!hasAnyFormula) {
      return { isValid: false, message: 'Please enter at least one formula' }
    }

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
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        setSubmitError('Please upload a JPG, PNG, or HEIC image')
        return
      }

      setUploadedFile(file)
      setSubmitError(null)

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
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setSubmitSuccess(true)
  }

  // Progress percentage
  const progressPercent = selectedProduct
    ? Math.min(100, (totalAmount / productConfigs[selectedProduct].min) * 100)
    : 0

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-black pt-32 md:pt-40 lg:pt-44 pb-20">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/[0.06] to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/[0.04] to-transparent rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="w-20 h-20 rounded-full bg-gradient-to-b from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-8"
          >
            <Check className="w-8 h-8 text-emerald-500" />
          </motion.div>

          <h1 className="font-playfair text-3xl md:text-4xl text-black mb-4">
            Request Received
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed max-w-sm mx-auto">
            Our fragrance specialists will review your formula and contact you within 24-48 hours to confirm your order.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black font-medium text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-black pt-28 md:pt-36 lg:pt-40 pb-20 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-amber-500/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-gold/[0.03] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow text-gold/50 block mb-3">
            Returning Customer
          </span>
          <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-black mb-5">
            Re-Order Your{' '}
            <span className="text-gradient-gold">Signature</span>
          </h1>
          <p className="max-w-lg mx-auto text-gray-400 text-sm md:text-base leading-relaxed">
            Enter your formula below to re-order your custom fragrance,
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
          <label className="eyebrow text-gold/50 block mb-4">
            Select Product Type
          </label>
          <div
            role="group"
            aria-label="Product type"
            aria-invalid={!!submitError && !selectedProduct}
            aria-describedby={submitError && !selectedProduct ? 'reorder-error' : undefined}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
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
                  whileHover={!reducedMotion ? { y: -2 } : undefined}
                  whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
                  className={`
                    relative p-5 rounded-2xl border text-left transition-all duration-300
                    ${isSelected
                      ? 'border-gold/40 bg-gradient-to-b from-gold/10 to-gold/[0.03] shadow-sm'
                      : 'border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-sm'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  <div className={`mb-3 ${isSelected ? 'text-gold' : 'text-gray-400'}`}>
                    {config.icon}
                  </div>
                  <div className={`font-medium text-sm mb-1 ${isSelected ? 'text-gold' : 'text-black'}`}>
                    {config.label}
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">
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
            <label className="eyebrow text-gold/50">
              Your Formula
            </label>
            <span className="text-xs text-gray-400">
              {formulaRows.length}/6 rows
            </span>
          </div>

          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_40px] gap-3 mb-3 px-3">
            <span className="text-[10px] text-gray-400 tracking-wider uppercase">Perfume Code</span>
            <span className="text-[10px] text-gray-400 tracking-wider uppercase">Category</span>
            <span className="text-[10px] text-gray-400 tracking-wider uppercase">Amount</span>
            <span></span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {formulaRows.map((row, i) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_120px_100px_40px] gap-3 p-4 sm:p-3 rounded-xl bg-white border border-black/[0.06] hover:border-black/[0.1] transition-colors"
                >
                  {/* Code input */}
                  <div className="sm:contents">
                    <label className="sm:hidden text-[10px] text-gray-400 tracking-wider uppercase mb-1 block">
                      Perfume Code
                    </label>
                    <input
                      type="text"
                      value={row.code}
                      onChange={(e) => updateRow(row.id, 'code', e.target.value)}
                      placeholder={`e.g., ${42 + i * 7}`}
                      aria-invalid={!!submitError && !row.code}
                      aria-describedby={submitError && !row.code ? 'reorder-error' : undefined}
                      className="w-full rounded-lg border border-black/[0.08] bg-[#FAFAF8] px-3.5 py-2.5 text-black placeholder-gray-300
                                 focus:border-gold/40 focus:outline-none focus:ring-1 focus-visible:ring-gold/60 transition-all text-sm"
                    />
                  </div>

                  {/* Category selector */}
                  <div className="sm:contents">
                    <label className="sm:hidden text-[10px] text-gray-400 tracking-wider uppercase mb-1 block">
                      Category
                    </label>
                    <select
                      value={row.category}
                      onChange={(e) => updateRow(row.id, 'category', e.target.value as 'N' | 'W' | 'M' | '')}
                      aria-invalid={!!submitError && !row.category}
                      aria-describedby={submitError && !row.category ? 'reorder-error' : undefined}
                      className="w-full rounded-lg border border-black/[0.08] bg-[#FAFAF8] px-3 py-2.5 text-black
                                 focus:border-gold/40 focus:outline-none focus:ring-1 focus-visible:ring-gold/60 transition-all text-sm
                                 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23aaa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '0.875rem',
                      }}
                    >
                      <option value="">Select</option>
                      <option value="N">{categoryLabels.N}</option>
                      <option value="W">{categoryLabels.W}</option>
                      <option value="M">{categoryLabels.M}</option>
                    </select>
                  </div>

                  {/* Amount input */}
                  <div className="sm:contents">
                    <label className="sm:hidden text-[10px] text-gray-400 tracking-wider uppercase mb-1 block">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, 'amount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.5"
                      aria-invalid={!!submitError && !row.amount}
                      aria-describedby={submitError && !row.amount ? 'reorder-error' : undefined}
                      className="w-full rounded-lg border border-black/[0.08] bg-[#FAFAF8] px-3.5 py-2.5 text-black placeholder-gray-300
                                 focus:border-gold/40 focus:outline-none focus:ring-1 focus-visible:ring-gold/60 transition-all text-sm
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
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
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
              whileHover={!reducedMotion ? { scale: 1.005 } : undefined}
              className="mt-3 w-full py-3.5 rounded-xl border border-dashed border-black/[0.1] text-gray-400 text-xs tracking-wider uppercase
                         hover:border-gold/30 hover:text-gold hover:bg-gold/[0.02] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </motion.button>
          )}

          {/* Progress indicator */}
          {selectedProduct && (
            <div className="mt-6 px-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Formula Total</span>
                <span className={`text-sm font-medium ${
                  totalAmount >= productConfigs[selectedProduct].min && totalAmount <= productConfigs[selectedProduct].max
                    ? 'text-emerald-500'
                    : totalAmount > productConfigs[selectedProduct].max
                    ? 'text-red-400'
                    : 'text-black'
                }`}>
                  {totalAmount.toFixed(1)}
                  <span className="text-xs text-gray-400 font-normal ml-1.5">
                    / {productConfigs[selectedProduct].min}&#8211;{productConfigs[selectedProduct].max}
                  </span>
                </span>
              </div>
              <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-300 ${
                    totalAmount >= productConfigs[selectedProduct].min && totalAmount <= productConfigs[selectedProduct].max
                      ? 'bg-emerald-400'
                      : totalAmount > productConfigs[selectedProduct].max
                      ? 'bg-red-400'
                      : 'bg-gold'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
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
          <label className="eyebrow text-gold/50 block mb-4">
            Attach Formula Photo <span className="text-gray-400">(Optional)</span>
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
              whileHover={!reducedMotion ? { y: -1 } : undefined}
              className="w-full py-10 rounded-2xl border-2 border-dashed border-black/[0.08] bg-white
                         hover:border-gold/25 hover:bg-gold/[0.01] transition-all group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FAFAF8] border border-black/[0.06] flex items-center justify-center group-hover:border-gold/20 group-hover:bg-gold/[0.04] transition-all">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Upload your handwritten formula</p>
                  <p className="text-xs text-gray-300">JPG, PNG, or HEIC</p>
                </div>
              </div>
            </motion.button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-black/[0.06]">
              {uploadPreview && (
                <Image
                  src={uploadPreview}
                  alt="Formula preview"
                  width={800}
                  height={192}
                  className="w-full h-44 object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center backdrop-blur-sm">
                    <Check className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-white/50 text-xs">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 rounded-lg text-white/60 hover:text-red-300 hover:bg-red-500/10 backdrop-blur-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              id="reorder-error"
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-500 text-sm">{submitError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            aria-describedby={submitError ? 'reorder-error' : undefined}
            className={`
              relative w-full rounded-full py-4 text-sm tracking-wider uppercase font-medium transition-all duration-500 overflow-hidden
              ${isSubmitting
                ? 'cursor-wait bg-gray-50 text-gray-400 border border-black/[0.06]'
                : 'text-black shadow-md hover:shadow-lg hover:scale-[1.01]'
              }
            `}
          >
            {!isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"
                animate={!reducedMotion ? { backgroundPosition: ['0% 50%', '200% 50%'] } : undefined}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 100%' }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Re-Order Request'
              )}
            </span>
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Our team will review your formula and contact you to confirm.
          </p>
        </motion.div>
      </form>
    </div>
  )
}
