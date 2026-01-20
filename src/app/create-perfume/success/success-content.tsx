'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const redirectStatus = searchParams.get('redirect_status')

    if (redirectStatus === 'succeeded') {
      setStatus('success')
    } else {
      setStatus('error')
    }
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

        {status === 'success' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-6xl">👑</div>
            <div>
              <h1 className="text-3xl text-amber-400 tracking-wider mb-4">MAGNIFICENT</h1>
              <p className="text-gray-400">Your Bespoke Fragrance Is Ready</p>
            </div>
            <div className="rounded-xl border border-amber-900/30 bg-black/50 p-6">
              <p className="text-sm text-gray-400 mb-2">ORDER CONFIRMED</p>
              <p className="text-lg">Thank you for creating with Aquad&apos;or Atelier</p>
              <p className="mt-4 text-sm text-gray-500">
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
