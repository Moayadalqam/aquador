'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

const stages = [
  {
    title: 'Begin with Top Notes',
    description: 'Choose citrus, fruity, or spicy opening notes.',
    image: 'https://i.ibb.co/HfY2jbSH/1.jpg',
  },
  {
    title: 'Add Heart Notes',
    description: 'Layer with floral, green, or woody middle notes.',
    image: 'https://i.ibb.co/xSqkdDL6/image-Cap-Cut-Commerce-Pro-202502202047.jpg',
  },
  {
    title: 'Finish with Base Notes',
    description: 'Complete with warm, rich foundation notes.',
    image: 'https://i.ibb.co/M5PhxzZm/image-Cap-Cut-Commerce-Pro-202502202047-1.jpg',
  },
];

export default function CreateSection() {
  return (
    <section className="py-24 bg-gold-ambient-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 40%),
                           radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 40%)`,
        }} />
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-light text-gradient-gold mb-4">
            Create Your Signature Fragrance
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Design a perfume that&apos;s uniquely yours. Select from our premium notes and craft your personal masterpiece.
          </p>
        </motion.div>

        {/* Stages grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden bg-dark-lighter border border-gold/20 hover:border-gold/40 transition-all duration-500">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={stage.image}
                    alt={stage.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-light to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-playfair text-gold mb-3">
                    {stage.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {stage.description}
                  </p>
                </div>

                {/* Step indicator */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-gold font-semibold">{index + 1}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/create-perfume">
            <Button size="lg" className="min-w-[200px]">
              Start Creating
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
