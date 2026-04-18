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
const WelcomeSplash = dynamic(() => import('@/components/ui/WelcomeSplash'), { ssr: false });

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
      <WelcomeSplash />
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
