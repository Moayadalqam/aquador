import { Suspense } from 'react'
import { SuccessContent } from './success-content'

export default function CreatePerfumeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
