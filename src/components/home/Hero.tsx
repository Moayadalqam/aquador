'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Truck } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Announcement Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-20 bg-black border-b border-gold/20 py-3 mt-24"
      >
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 flex items-center justify-center gap-3">
          <Truck className="w-5 h-5 text-gold" />
          <p className="text-sm text-gray-200 tracking-wider uppercase">
            <span className="text-gold font-medium">Free Delivery</span> on orders over €100
          </p>
        </div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute w-full h-full object-cover opacity-40"
              style={{ filter: 'brightness(0.5)' }}
              onError={() => setVideoError(true)}
            >
              <source
                src="https://static1.squarespace.com/static/66901f0f8865462c0ac066ba/t/6899a19131e4b55cddf56fb2/1754898858755/download+%2820%29.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </div>

        {/* Animated background effects */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Floating particles - reduced for cleaner look */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gold-light rounded-full"
              style={{
                left: `${15 + i * 14}%`,
                boxShadow: '0 0 6px rgba(255, 215, 0, 0.6)',
              }}
              animate={{
                y: ['100vh', '-10vh'],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 12 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 1.2,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Brand name */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-normal tracking-[0.2em] mb-6"
              style={{
                background: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700, #D4AF37, #FFD700)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.25))',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '200% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              AQUAD&apos;OR
            </motion.h1>

            {/* Separator line */}
            <motion.div
              className="relative w-32 h-px mx-auto mb-6 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-300 tracking-[0.25em] uppercase font-light mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Where Luxury Meets Distinction
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Link href="/shop">
                <Button size="lg" className="min-w-[220px]">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" size="lg" className="min-w-[220px]">
                  Create Your Own
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-6 h-10 border border-gold/40 rounded-full flex justify-center p-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-1 bg-gold rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
