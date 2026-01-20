'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Shield, Headphones } from 'lucide-react';
import Button from '@/components/ui/Button';

const features = [
  {
    icon: Sparkles,
    title: 'Personalized Service',
    description: 'Tailored fragrance consultations',
  },
  {
    icon: Shield,
    title: 'Expert Guidance',
    description: 'Professional perfume experts',
  },
  {
    icon: Headphones,
    title: 'Exclusive Collection',
    description: 'Rare and unique scents',
  },
];

export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-light text-gradient-gold mb-6">
            Experience Aquad&apos;or
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Book a personal consultation with our fragrance experts and discover your perfect scent.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full border border-gold/50 bg-gold/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/contact">
              <Button size="lg" className="min-w-[220px]">
                Book Your Experience
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-2 bg-gold rounded-full"
        animate={{
          y: [0, 20, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-3 h-3 bg-gold-light rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </section>
  );
}
