'use client'

import { motion, useMotionValue, animate } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { FragranceNote, FragranceCategory } from '@/lib/perfume/types'
import { categoryThemes } from '../motion'

interface NoteCarouselProps {
  notes: FragranceNote[]
  category: FragranceCategory
  selectedNoteName: string | null
  onSelectNote: (note: FragranceNote) => void
}

export function NoteCarousel({
  notes,
  category,
  selectedNoteName,
  onSelectNote,
}: NoteCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const theme = categoryThemes[category]

  // Calculate card width + gap
  const cardWidth = 140
  const gap = 16

  const handleDragEnd = (_: never, info: { velocity: { x: number }; offset: { x: number } }) => {
    const velocity = info.velocity.x
    const offset = info.offset.x

    let newIndex = currentIndex

    if (velocity < -500 || offset < -50) {
      newIndex = Math.min(currentIndex + 1, notes.length - 1)
    } else if (velocity > 500 || offset > 50) {
      newIndex = Math.max(currentIndex - 1, 0)
    }

    setCurrentIndex(newIndex)
    animate(x, -newIndex * (cardWidth + gap), { type: 'spring', stiffness: 300, damping: 30 })
  }

  // Snap to selected note when category changes
  useEffect(() => {
    if (selectedNoteName) {
      const selectedIndex = notes.findIndex(n => n.name === selectedNoteName)
      if (selectedIndex >= 0) {
        setCurrentIndex(selectedIndex)
        animate(x, -selectedIndex * (cardWidth + gap), { type: 'spring', stiffness: 300, damping: 30 })
      }
    } else {
      setCurrentIndex(0)
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
  }, [category, notes, selectedNoteName, x])

  return (
    <div className="relative overflow-hidden py-4">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        ref={containerRef}
        className="flex cursor-grab active:cursor-grabbing pl-4"
        drag="x"
        dragConstraints={{
          left: -((notes.length - 1) * (cardWidth + gap)),
          right: 0,
        }}
        style={{ x }}
        onDragEnd={handleDragEnd}
      >
        {notes.map((note) => {
          const isSelected = selectedNoteName === note.name

          return (
            <motion.button
              key={note.name}
              onClick={() => onSelectNote(note)}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl p-5
                transition-all duration-300 mr-4
                ${isSelected
                  ? 'bg-gradient-to-b from-gold/20 to-gold/5 ring-2 ring-gold shadow-lg'
                  : 'bg-white/[0.05] border border-white/10'
                }
              `}
              style={{ width: cardWidth, height: 160 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Note glow */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    boxShadow: `inset 0 0 30px ${note.color}30, 0 0 30px ${theme.glow}`,
                  }}
                />
              )}

              {/* Icon */}
              <motion.span
                className="text-4xl relative z-10"
                animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {note.icon}
              </motion.span>

              {/* Name */}
              <span className={`
                text-sm font-medium tracking-wide relative z-10
                ${isSelected ? 'text-gold' : 'text-gray-300'}
              `}>
                {note.name}
              </span>

              {/* Color indicator */}
              <div
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${isSelected ? 'scale-100' : 'scale-0'}
                `}
                style={{ backgroundColor: note.color }}
              />
            </motion.button>
          )
        })}
      </motion.div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {notes.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index)
              animate(x, -index * (cardWidth + gap), { type: 'spring', stiffness: 300, damping: 30 })
            }}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === currentIndex
                ? 'bg-gold w-6'
                : 'bg-white/20 hover:bg-white/40'
              }
            `}
            aria-label={`Go to note ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
