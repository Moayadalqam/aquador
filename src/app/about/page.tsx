'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Heart, Leaf, Award, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion for Perfumery',
    description: 'Every fragrance we create is infused with decades of expertise and a deep love for the art of perfumery.',
  },
  {
    icon: Leaf,
    title: 'Premium Ingredients',
    description: 'We source only the finest ingredients from around the world, ensuring each scent is of the highest quality.',
  },
  {
    icon: Award,
    title: 'Artisan Craftsmanship',
    description: 'Our master perfumers blend tradition with innovation to create unique, memorable fragrances.',
  },
  {
    icon: Users,
    title: 'Personal Service',
    description: 'We believe every customer deserves a personalized experience in discovering their perfect scent.',
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 bg-gold-ambient">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80"
            alt="Luxury perfume bottles"
            fill
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/90 to-dark" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-playfair text-gradient-gold mb-6">
              Our Story
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Aquad&apos;or was born from a deep passion for the art of perfumery and a desire to bring the world&apos;s finest fragrances to Cyprus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
                Where Luxury Meets <span className="text-gold">Distinction</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Founded in the heart of Nicosia, Aquad&apos;or has established itself as Cyprus&apos;s premier destination for luxury fragrances. Our curated collection features high-end and niche perfumes from globally recognized brands, alongside our own signature creations.
                </p>
                <p>
                  We believe that fragrance is more than just a scent—it&apos;s an expression of identity, a memory captured in a bottle, and a journey of the senses. This philosophy drives everything we do, from selecting our products to serving our customers.
                </p>
                <p>
                  Our commitment to excellence extends beyond our products. We offer personalized consultations to help you discover fragrances that resonate with your unique personality and style. Whether you&apos;re seeking a signature scent or the perfect gift, our expert team is here to guide you.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80"
                alt="Perfume crafting"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gold-ambient-dark">
        <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do at Aquad&apos;or
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-playfair text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
              Experience the Aquad&apos;or Difference
            </h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Visit our boutique in Nicosia or explore our collection online. Let us help you find the fragrance that tells your story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg">Explore Collection</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
