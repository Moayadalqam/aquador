'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { formatPrice } from '@/lib/utils'

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

    // Fetch session details from API
    fetch(`/api/checkout/session-details?session_id=${sessionId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch session details')
        }
        return response.json()
      })
      .then((data) => {
        // Extract custom perfume data from response
        const item = data.items?.[0]
        if (item?.composition) {
          setOrderData({
            orderNumber: data.orderNumber,
            perfumeName: item.name.replace('Custom Perfume: ', ''),
            composition: item.composition,
            volume: item.size || '50ml',
            total: data.total / 100, // Convert cents to euros
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-2xl text-amber-400 tracking-wider">PROCESSING...</h1>
          </div>
        )}

        {status === 'success' && orderData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-6xl">👑</div>
            <div>
              <h1 className="text-3xl text-amber-400 tracking-wider mb-4">MAGNIFICENT</h1>
              <p className="text-gray-400">Your Bespoke Fragrance Is Ready</p>
            </div>
            <div className="rounded-xl border border-amber-900/30 bg-black/50 p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">ORDER CONFIRMED</p>
                <p className="text-2xl text-amber-400 font-semibold">{orderData.orderNumber}</p>
              </div>
              <div className="border-t border-amber-900/20 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Creation</p>
                <p className="text-lg text-white font-medium mb-3">{orderData.perfumeName}</p>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><span className="text-amber-400">Top:</span> {orderData.composition.top}</p>
                  <p><span className="text-amber-400">Heart:</span> {orderData.composition.heart}</p>
                  <p><span className="text-amber-400">Base:</span> {orderData.composition.base}</p>
                </div>
              </div>
              <div className="border-t border-amber-900/20 pt-4 flex justify-between items-center">
                <span className="text-sm text-gray-400">Volume: {orderData.volume}</span>
                <span className="text-xl text-amber-400 font-semibold">{formatPrice(orderData.total)}</span>
              </div>
              <p className="text-sm text-gray-500 border-t border-amber-900/20 pt-4">
                You will receive an email confirmation with your order details shortly.
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="rounded-full bg-amber-500 px-8 py-3 text-black font-medium hover:bg-amber-400 transition-all"
            >
              RETURN HOME
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-8">
            <div className="text-6xl">⚠️</div>
            <div>
              <h1 className="text-2xl text-red-400 tracking-wider mb-4">PAYMENT INCOMPLETE</h1>
              <p className="text-gray-400">Something went wrong with your payment</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/create-perfume')}
                className="rounded-full border border-amber-400 px-6 py-3 text-amber-400 hover:bg-amber-400/10 transition-all"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => router.push('/')}
                className="rounded-full bg-white/10 px-6 py-3 text-gray-400 hover:bg-white/20 transition-all"
              >
                HOME
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
