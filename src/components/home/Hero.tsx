'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Truck } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Announcement Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-20 bg-black/80 backdrop-blur-sm border-b border-gold/10 py-3 mt-24"
      >
        <div className="container-wide flex items-center justify-center gap-3">
          <Truck className="w-4 h-4 text-gold" />
          <p className="text-xs sm:text-sm text-gray-300 tracking-wider uppercase">
            <span className="text-gold font-medium">Free Delivery</span> on orders over €100
          </p>
        </div>
      </motion.div>

      {/* Main Hero Content */}
      <div ref={sectionRef} className="relative flex-1 flex items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute w-full h-full object-cover opacity-30"
              style={{ filter: 'brightness(0.4) saturate(0.8)' }}
              onError={() => setVideoError(true)}
            >
              <source
                src="https://static1.squarespace.com/static/66901f0f8865462c0ac066ba/t/6899a19131e4b55cddf56fb2/1754898858755/download+%2820%29.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black via-dark-light to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        {/* Subtle ambient glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[100px]"
            animate={isInView ? {
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5],
            } : {}}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center container-wide py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            {/* Brand name */}
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-playfair font-normal tracking-[0.15em] sm:tracking-[0.2em] mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{
                background: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700, #D4AF37, #FFD700)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.2))',
              }}
            >
              AQUAD&apos;OR
            </motion.h1>

            {/* Separator line */}
            <motion.div
              className="relative w-24 h-px mx-auto mb-8"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 96, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-sm sm:text-base md:text-lg text-gray-400 tracking-[0.2em] sm:tracking-[0.25em] uppercase font-light mb-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Where Luxury Meets Distinction
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <Link href="/shop">
                <Button size="lg" className="min-w-[200px]">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/create-perfume">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Create Your Own
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-5 h-8 border border-gold/30 rounded-full flex justify-center pt-2"
            animate={isInView ? { y: [0, 4, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-0.5 h-2 bg-gold/60 rounded-full"
              animate={isInView ? { y: [0, 8, 0], opacity: [1, 0.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
