'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fragranceNotes } from '@/lib/products';
import { FragranceNote, CustomPerfume } from '@/types';
import Button from '@/components/ui/Button';
import { Check, Sparkles } from 'lucide-react';

type NoteLayer = 'top' | 'heart' | 'base';
type NoteCategory = 'floral' | 'fruity' | 'woody' | 'oriental' | 'gourmand';

const layers: { id: NoteLayer; name: string; subtitle: string }[] = [
  { id: 'top', name: 'Top Notes', subtitle: 'First Impression' },
  { id: 'heart', name: 'Heart Notes', subtitle: 'The Soul' },
  { id: 'base', name: 'Base Notes', subtitle: 'Foundation' },
];

const categoryNames: Record<NoteCategory, string> = {
  floral: 'Floral',
  fruity: 'Fruity',
  woody: 'Woody',
  oriental: 'Oriental',
  gourmand: 'Gourmand',
};

export default function CreatePage() {
  const [currentLayer, setCurrentLayer] = useState<NoteLayer>('top');
  const [currentCategory, setCurrentCategory] = useState<NoteCategory>('floral');
  const [selections, setSelections] = useState<Record<NoteLayer, FragranceNote | null>>({
    top: null,
    heart: null,
    base: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [perfumeName, setPerfumeName] = useState('');
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('50ml');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectNote = (note: FragranceNote) => {
    setSelections((prev) => ({ ...prev, [currentLayer]: note }));

    // Auto-advance to next layer
    if (currentLayer === 'top' && !selections.heart) {
      setTimeout(() => setCurrentLayer('heart'), 500);
    } else if (currentLayer === 'heart' && !selections.base) {
      setTimeout(() => setCurrentLayer('base'), 500);
    }
  };

  const isComplete = selections.top && selections.heart && selections.base;

  const handleSubmit = () => {
    if (!perfumeName.trim()) return;

    const perfumeData: CustomPerfume = {
      name: perfumeName,
      topNote: selections.top,
      heartNote: selections.heart,
      baseNote: selections.base,
      size: selectedSize,
      specialRequests,
    };

    // Save to localStorage
    localStorage.setItem('customPerfume', JSON.stringify(perfumeData));

    setShowModal(false);
    setShowSuccess(true);

    // Hide success after 4 seconds
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gold-ambient pt-20">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-16 text-center border-b border-gold/20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <h1 className="text-4xl md:text-5xl font-playfair text-gradient-gold relative z-10">
          Create Your Signature Fragrance
        </h1>
      </motion.section>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Bottle Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-dark-light rounded-2xl p-8 border border-gold/20"
          >
            <div className="aspect-square relative flex items-center justify-center">
              {/* Simplified bottle visualization */}
              <div className="relative w-48 h-64">
                {/* Bottle body */}
                <div className="absolute bottom-0 w-full h-52 bg-gradient-to-t from-gray-800 to-gray-700 rounded-lg overflow-hidden border border-gray-600">
                  {/* Liquid layers */}
                  <motion.div
                    className="absolute bottom-0 w-full transition-all duration-700"
                    style={{
                      height: selections.base ? '33%' : '0%',
                      background: selections.base
                        ? `linear-gradient(to top, ${selections.base.color}aa, ${selections.base.color}66)`
                        : 'transparent',
                    }}
                  />
                  <motion.div
                    className="absolute bottom-[33%] w-full transition-all duration-700"
                    style={{
                      height: selections.heart ? '33%' : '0%',
                      background: selections.heart
                        ? `linear-gradient(to top, ${selections.heart.color}aa, ${selections.heart.color}66)`
                        : 'transparent',
                    }}
                  />
                  <motion.div
                    className="absolute bottom-[66%] w-full transition-all duration-700"
                    style={{
                      height: selections.top ? '34%' : '0%',
                      background: selections.top
                        ? `linear-gradient(to top, ${selections.top.color}aa, ${selections.top.color}66)`
                        : 'transparent',
                    }}
                  />
                </div>
                {/* Bottle neck */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-lg border-x border-t border-gray-500" />
                {/* Cap */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-t-lg shadow-lg" />
              </div>
            </div>

            {/* Progress */}
            <div className="mt-8 space-y-4">
              <div className="flex gap-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                      selections[layer.id] ? 'bg-gold' : 'bg-dark-lighter'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-2 text-sm">
                {layers.map((layer) => (
                  <div key={layer.id} className="flex justify-between items-center">
                    <span className="text-gray-400">{layer.name}:</span>
                    <span className="text-gold">
                      {selections[layer.id]?.name || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center: Note Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            {/* Layer tabs */}
            <div className="flex gap-2 mb-6">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setCurrentLayer(layer.id)}
                  className={`flex-1 py-4 px-4 rounded-lg border transition-all duration-300 ${
                    currentLayer === layer.id
                      ? 'bg-gold/20 border-gold text-gold'
                      : 'bg-dark-light border-gold/20 text-gray-400 hover:border-gold/40'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{layer.name}</div>
                    <div className="text-xs opacity-70">{layer.subtitle}</div>
                    {selections[layer.id] && (
                      <div className="mt-1 text-xs text-gold flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" />
                        {selections[layer.id]?.name}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(Object.keys(categoryNames) as NoteCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    currentCategory === cat
                      ? 'bg-gold/20 text-gold border border-gold'
                      : 'text-gray-400 border border-transparent hover:text-gold'
                  }`}
                >
                  {categoryNames[cat]}
                </button>
              ))}
            </div>

            {/* Notes grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {fragranceNotes[currentCategory]?.map((note) => {
                const isSelected = selections[currentLayer]?.name === note.name;
                return (
                  <motion.button
                    key={note.name}
                    onClick={() => selectNote(note)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border transition-all duration-300 text-center ${
                      isSelected
                        ? 'bg-gold/20 border-gold shadow-gold'
                        : 'bg-dark-light border-gold/20 hover:border-gold/40'
                    }`}
                  >
                    <div className="text-2xl mb-2">{note.icon}</div>
                    <div className={`font-medium ${isSelected ? 'text-gold' : 'text-white'}`}>
                      {note.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{note.description}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            disabled={!isComplete}
            onClick={() => setShowModal(true)}
            className={`min-w-[250px] ${!isComplete && 'opacity-50 cursor-not-allowed'}`}
          >
            {isComplete ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Masterpiece
              </>
            ) : (
              'Select All Notes to Continue'
            )}
          </Button>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-light border border-gold/30 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-playfair text-gold mb-6 text-center">
                Finalize Your Creation
              </h2>

              {/* Composition summary */}
              <div className="bg-dark/50 rounded-lg p-4 mb-6 border border-gold/20">
                <h3 className="text-sm text-gold uppercase tracking-wider mb-3">
                  Your Composition
                </h3>
                {layers.map((layer) => (
                  <div key={layer.id} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                    <span className="text-gray-400">{layer.name}</span>
                    <span className="text-white">{selections[layer.id]?.name}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Perfume Name</label>
                  <input
                    type="text"
                    value={perfumeName}
                    onChange={(e) => setPerfumeName(e.target.value)}
                    placeholder="Enter your perfume name..."
                    maxLength={30}
                    className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Volume</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['50ml', '100ml'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 rounded-lg border transition-all ${
                          selectedSize === size
                            ? 'bg-gold/20 border-gold text-gold'
                            : 'border-gray-700 text-gray-400 hover:border-gold/50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requests..."
                    rows={3}
                    className="w-full bg-dark border border-gold/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={!perfumeName.trim()}>
                  Confirm Creation
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <Sparkles className="w-full h-full text-gold" />
              </motion.div>
              <h2 className="text-3xl font-playfair text-gold mb-2">Magnificent!</h2>
              <p className="text-gray-400">Your bespoke fragrance has been created</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
