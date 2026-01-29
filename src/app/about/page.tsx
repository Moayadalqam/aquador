'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { PageHero, SectionHeader } from '@/components/ui/Section';
import { FeatureCard } from '@/components/ui/Card';
import { Heart, Leaf, Award, Users } from 'lucide-react';

const values = [
  {
    icon: <Heart className="w-6 h-6 text-gold" />,
    title: 'Passion',
    description: 'Every fragrance is infused with expertise and a deep love for the art of perfumery.',
  },
  {
    icon: <Leaf className="w-6 h-6 text-gold" />,
    title: 'Quality',
    description: 'We source only the finest ingredients from around the world.',
  },
  {
    icon: <Award className="w-6 h-6 text-gold" />,
    title: 'Craftsmanship',
    description: 'Our perfumers blend tradition with innovation to create unique fragrances.',
  },
  {
    icon: <Users className="w-6 h-6 text-gold" />,
    title: 'Service',
    description: 'Every customer deserves a personalized experience.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gold-ambient">
      <PageHero
        title="Our Story"
        subtitle="Aquad'or was born from a deep passion for the art of perfumery and a desire to bring the world's finest fragrances to Cyprus."
        backgroundImage="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80"
      />

      {/* Story Section */}
      <section className="section">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-playfair text-white mb-6">
                Where Luxury Meets <span className="text-gold">Distinction</span>
              </h2>
              <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                <p>
                  Founded in the heart of Nicosia, Aquad&apos;or has established itself as Cyprus&apos;s premier destination for luxury fragrances. Our curated collection features high-end and niche perfumes from globally recognized brands.
                </p>
                <p>
                  We believe that fragrance is more than just a scent—it&apos;s an expression of identity, a memory captured in a bottle, and a journey of the senses.
                </p>
                <p>
                  Our commitment to excellence extends beyond our products. We offer personalized consultations to help you discover fragrances that resonate with your unique personality and style.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] lg:aspect-square overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80"
                alt="Perfume crafting"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/50 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gold-ambient-dark">
        <div className="container-wide">
          <SectionHeader
            title="Our Values"
            subtitle="The principles that guide everything we do"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, index) => (
              <FeatureCard
                key={value.title}
                icon={value.icon}
                title={value.title}
                description={value.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-playfair text-white mb-5">
              Experience the Difference
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Visit our boutique in Nicosia or explore our collection online.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/shop">
                <Button size="md">Explore Collection</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="md">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
