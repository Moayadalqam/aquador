'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { formatPrice } from '@/lib/utils'
import { motion } from 'motion/react'
import { Check, ArrowLeft, AlertCircle } from 'lucide-react'

interface OrderData {
  orderNumber: string;
  perfumeName: string;
  composition: { top: string; heart: string; base: string };
  volume: string;
  total: number;
}

export function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setStatus('error')
      return
    }

    fetch(`/api/checkout/session-details?session_id=${sessionId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch session details')
        }
        return response.json()
      })
      .then((data) => {
        const item = data.items?.[0]
        if (item?.composition) {
          setOrderData({
            orderNumber: data.orderNumber,
            perfumeName: item.name.replace('Custom Perfume: ', ''),
            composition: item.composition,
            volume: item.size || '50ml',
            total: data.total / 100,
          })
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch((error) => {
        Sentry.addBreadcrumb({
          category: 'perfume-success',
          message: 'Error fetching session details',
          level: 'error',
          data: { error }
        })
        setStatus('error')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="mx-auto w-14 h-14 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 tracking-wider uppercase">Confirming your order...</p>
          </div>
        )}

        {status === 'success' && orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
              className="w-20 h-20 rounded-full bg-gradient-to-b from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto"
            >
              <Check className="w-8 h-8 text-emerald-500" />
            </motion.div>

            <div>
              <span className="eyebrow text-gold/50 block mb-2">Order Confirmed</span>
              <h1 className="font-playfair text-3xl text-black mb-2">Magnificent</h1>
              <p className="text-gray-400 text-sm">Your bespoke fragrance is being prepared</p>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 space-y-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-gray-400">Order Number</span>
                <span className="text-sm font-medium text-gold">{orderData.orderNumber}</span>
              </div>

              <div className="h-px bg-black/[0.04]" />

              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-2">Your Creation</span>
                <p className="font-playfair text-lg text-black mb-3">{orderData.perfumeName}</p>
                <div className="space-y-2">
                  {(['top', 'heart', 'base'] as const).map(layer => (
                    <div key={layer} className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 w-10">{layer}</span>
                      <span className="text-sm text-black">{orderData.composition[layer]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-black/[0.04]" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Volume: {orderData.volume}</span>
                <span className="text-xl font-playfair text-gold">{formatPrice(orderData.total)}</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                You will receive an email confirmation with your order details shortly.
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black font-medium text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <div>
              <h1 className="font-playfair text-2xl text-black mb-2">Payment Incomplete</h1>
              <p className="text-gray-400 text-sm">Something went wrong with your payment</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/create-perfume')}
                className="rounded-full border border-gold/30 px-6 py-3 text-sm text-gold hover:bg-gold/[0.04] transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="rounded-full bg-black/[0.04] px-6 py-3 text-sm text-gray-500 hover:bg-black/[0.08] transition-all"
              >
                Home
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
