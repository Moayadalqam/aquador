/**
 * PageTransition — pass-through wrapper (AnimatePresence removed to eliminate
 * per-route re-mount overhead and layout shift; kept as a no-op so existing
 * imports continue to work without changes).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
