'use client';

import { useVisitorHeartbeat } from '@/hooks/useVisitorHeartbeat';

export default function VisitorTracker() {
  useVisitorHeartbeat();
  return null;
}
