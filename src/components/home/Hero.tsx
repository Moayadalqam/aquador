'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useState, useRef } from 'react';

export default function Hero() {
  const [videoError, setVideoError] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Main Hero Content */}
      <div ref={sectionRef} className="relative flex-1 flex items-center justify-center pt-24">
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
            {/* Logo */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Image
                src="/aquador.webp"
                alt="Aquad'or"
                width={600}
                height={200}
                className="w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] xl:w-[600px] h-auto object-contain drop-shadow-[0_0_40px_rgba(255,215,0,0.2)]"
                priority
              />
            </motion.div>

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

      </div>
    </section>
  );
}
