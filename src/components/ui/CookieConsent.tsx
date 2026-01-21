'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'aquador_cookie_consent';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

export default function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      setConsentStatus(stored as ConsentStatus);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setConsentStatus('accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setConsentStatus('declined');
    setIsVisible(false);
  };

  // Don't render if consent already given
  if (consentStatus !== 'pending') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-dark-light border border-gold/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-gold/10 border border-gold/30 items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-gold" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-playfair text-white mb-2">
                        We Value Your Privacy
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 max-w-2xl">
                        We use cookies to enhance your browsing experience, serve personalized content,
                        and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                        Read our{' '}
                        <Link href="/privacy" className="text-gold hover:text-gold-light underline">
                          Privacy Policy
                        </Link>{' '}
                        to learn more.
                      </p>
                    </div>

                    <button
                      onClick={handleDecline}
                      className="p-2 text-gray-500 hover:text-white transition-colors md:hidden"
                      aria-label="Close cookie banner"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAccept}
                      className="px-6 py-3 bg-gold text-black font-semibold rounded-full hover:bg-gold-light transition-colors"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleDecline}
                      className="px-6 py-3 border border-gold/30 text-gold rounded-full hover:bg-gold/10 transition-colors"
                    >
                      Decline
                    </button>
                    <Link
                      href="/privacy"
                      className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-center"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
