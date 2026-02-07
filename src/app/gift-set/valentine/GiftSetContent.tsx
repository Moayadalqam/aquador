'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Gift, Package, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCart } from '@/components/cart/CartProvider';
import { formatPrice } from '@/lib/currency';
import { VALENTINE_GIFT_SET } from '@/lib/gift-sets';

interface SelectOption {
  id: string;
  name: string;
}

interface GiftSetContentProps {
  isSoldOut: boolean;
  perfumes: SelectOption[];
  lotions: SelectOption[];
}

export default function GiftSetContent({ isSoldOut, perfumes, lotions }: GiftSetContentProps) {
  const { addItem } = useCart();
  const [selectedPerfume, setSelectedPerfume] = useState('');
  const [selectedLotion, setSelectedLotion] = useState('');
  const [added, setAdded] = useState(false);

  const canAdd = selectedPerfume && selectedLotion && !isSoldOut;

  const perfumeOption = perfumes.find((p) => p.id === selectedPerfume);
  const lotionOption = lotions.find((l) => l.id === selectedLotion);

  const handleAddToCart = () => {
    if (!canAdd || !perfumeOption || !lotionOption) return;

    addItem({
      productId: VALENTINE_GIFT_SET.id,
      variantId: `valentine-gift-set-${selectedPerfume}-${selectedLotion}`,
      quantity: 1,
      name: VALENTINE_GIFT_SET.name,
      image: VALENTINE_GIFT_SET.image,
      price: VALENTINE_GIFT_SET.price,
      size: '100ml',
      productType: 'gift-set',
      metadata: {
        giftSetSelections: {
          perfumeName: perfumeOption.name,
          perfumeId: perfumeOption.id,
          lotionName: lotionOption.name,
          lotionId: lotionOption.id,
        },
      },
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-dark pt-28 pb-20">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-lighter">
              <Image
                src={VALENTINE_GIFT_SET.image}
                alt={VALENTINE_GIFT_SET.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Badge */}
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-black/70 backdrop-blur-sm border border-gold/30 rounded-full text-gold text-xs uppercase tracking-widest font-medium">
                  <Heart className="w-3 h-3 fill-gold" />
                  {VALENTINE_GIFT_SET.badge}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-8"
          >
            {/* Title + Price */}
            <div>
              <p className="text-gold/70 text-xs uppercase tracking-[0.2em] mb-3">
                {VALENTINE_GIFT_SET.badge}
              </p>
              <h1 className="text-4xl md:text-5xl font-playfair text-white mb-4">
                {VALENTINE_GIFT_SET.name}
              </h1>
              <p className="text-2xl font-playfair text-gold">
                {formatPrice(VALENTINE_GIFT_SET.price)}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed text-base">
              {VALENTINE_GIFT_SET.description}
            </p>

            {/* What's Included */}
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-[0.15em] text-gray-300 font-medium">
                What&apos;s Included
              </h3>
              <ul className="space-y-2.5">
                {VALENTINE_GIFT_SET.includes.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Package className="w-4 h-4 text-gold/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Separator */}
            <div className="w-full h-px bg-gold/10" />

            {/* Selection Dropdowns */}
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="perfume-select"
                  className="block text-sm text-gray-300 mb-2 font-medium"
                >
                  Choose Your 100 ml Perfume <span className="text-gold">*</span>
                </label>
                <select
                  id="perfume-select"
                  value={selectedPerfume}
                  onChange={(e) => setSelectedPerfume(e.target.value)}
                  disabled={isSoldOut}
                  className="w-full bg-dark-lighter border border-gold/20 text-white px-4 py-3 rounded-lg text-sm focus:border-gold/50 focus:outline-none transition-colors disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="">Select a perfume...</option>
                  {perfumes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lotion-select"
                  className="block text-sm text-gray-300 mb-2 font-medium"
                >
                  Choose Your 100 ml Body Lotion <span className="text-gold">*</span>
                </label>
                <select
                  id="lotion-select"
                  value={selectedLotion}
                  onChange={(e) => setSelectedLotion(e.target.value)}
                  disabled={isSoldOut}
                  className="w-full bg-dark-lighter border border-gold/20 text-white px-4 py-3 rounded-lg text-sm focus:border-gold/50 focus:outline-none transition-colors disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="">Select a body lotion...</option>
                  {lotions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              {isSoldOut ? (
                <div className="w-full py-4 text-center text-red-400 border border-red-400/30 rounded-lg text-sm uppercase tracking-widest font-medium">
                  Sold Out
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                  size="lg"
                  className="w-full"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {added ? 'Added to Cart' : 'Add to Cart'}
                </Button>
              )}

              {!isSoldOut && (
                <p className="text-center text-gray-500 text-xs tracking-wide">
                  Limited stock available
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
