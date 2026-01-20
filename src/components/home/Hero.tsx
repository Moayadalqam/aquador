'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute w-full h-full object-cover opacity-40"
          style={{ filter: 'brightness(0.6)' }}
        >
          <source
            src="https://static1.squarespace.com/static/66901f0f8865462c0ac066ba/t/6899a19131e4b55cddf56fb2/1754898858755/download+%2820%29.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-dark" />
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

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-light rounded-full"
            style={{
              left: `${10 + i * 9}%`,
              boxShadow: '0 0 6px rgba(255, 215, 0, 0.8)',
            }}
            animate={{
              y: ['100vh', '-10vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Brand name */}
          <motion.h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-playfair font-normal tracking-[0.15em] mb-8"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700, #D4AF37, #FFD700)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '200% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            AQUAD&apos;OR
          </motion.h1>

          {/* Separator line */}
          <motion.div
            className="relative w-48 h-px mx-auto mb-8 overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-light to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-300 tracking-[0.3em] uppercase font-light mb-12"
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
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link href="/shop">
              <Button size="lg" className="min-w-[200px]">
                Explore Collection
              </Button>
            </Link>
            <Link href="/create">
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
          className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center p-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-1.5 bg-gold rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
