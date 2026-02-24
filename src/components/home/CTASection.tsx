'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Shield, Award } from 'lucide-react';
import Button from '@/components/ui/Button';

const features = [
  {
    icon: Sparkles,
    title: 'Personal Service',
    description: 'Tailored consultations',
  },
  {
    icon: Shield,
    title: 'Expert Guidance',
    description: 'Professional advice',
  },
  {
    icon: Award,
    title: 'Exclusive Scents',
    description: 'Rare collections',
  },
];

export default function CTASection() {
  return (
    <section className="relative section-lg overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://i.ibb.co/Mg00Phx/DSC-1932.jpg')`,
          filter: 'brightness(0.3) saturate(0.7)',
        }}
      />

      {/* Dark overlay with gold tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/aquador.webp"
          alt=""
          aria-hidden="true"
          className="w-[300px] md:w-[400px] lg:w-[500px] h-auto opacity-[0.08]"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(212, 175, 55, 0.1))',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-gradient-gold mb-5">
              Experience Aquad&apos;or
            </h2>
            <p className="text-base md:text-lg text-gray-400 mb-10 max-w-xl mx-auto">
              Book a personal consultation and discover your perfect scent with our fragrance experts.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-white text-sm font-medium mb-0.5">{feature.title}</h3>
                  <p className="text-gray-500 text-xs">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link href="/contact">
                <Button size="lg" className="min-w-[200px]">
                  Book Your Experience
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
