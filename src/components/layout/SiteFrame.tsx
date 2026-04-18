// M13: Considered extracting usePathname() into a thin SiteChromeSwitch RSC wrapper,
// but all children (Navbar, Footer, CartDrawer, etc.) are client components anyway.
// Splitting would add complexity without meaningful bundle savings. Keeping as-is.
'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import Navbar from './Navbar';
import { CartDrawer } from '@/components/cart';
import CookieConsent from '@/components/ui/CookieConsent';
import ScrollProgress from '@/components/ui/ScrollProgress';
import VisitorTracker from '@/components/VisitorTracker';
import { PageTransition } from '@/components/providers/PageTransition';
import { ScrollDepthTracker } from '@/components/analytics/ScrollDepthTracker';

const ChatWidget = dynamic(() => import('@/components/ai/ChatWidget'), { ssr: false });

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  if (isAdmin) {
    return (
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <PageTransition>
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </PageTransition>
      <Footer />
      <CartDrawer />
      <CookieConsent />
      <ScrollDepthTracker />
      <ChatWidget />
      <VisitorTracker />
    </>
  );
}
