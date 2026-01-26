'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FragranceNote, FragranceCategory } from '@/lib/perfume/types'
import { NoteCard } from './NoteCard'
import { staggerFast, categoryThemes } from '../motion'

interface NotesGridProps {
  notes: FragranceNote[]
  category: FragranceCategory
  selectedNoteName: string | null
  onSelectNote: (note: FragranceNote) => void
  reducedMotion?: boolean
}

export function NotesGrid({
  notes,
  category,
  selectedNoteName,
  onSelectNote,
  reducedMotion = false,
}: NotesGridProps) {
  const theme = categoryThemes[category]

  return (
    <div className="relative mb-12">
      {/* Category ambient glow */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 -z-10 blur-3xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${theme.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      <motion.div
        key={category}
        variants={reducedMotion ? undefined : staggerFast}
        initial={reducedMotion ? undefined : 'initial'}
        animate={reducedMotion ? undefined : 'animate'}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
        role="listbox"
        aria-label={`${category} fragrance notes`}
      >
        <AnimatePresence mode="popLayout">
          {notes.map((note, index) => (
            <motion.div
              key={note.name}
              layout={!reducedMotion}
              initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
              transition={reducedMotion ? undefined : {
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              <NoteCard
                note={note}
                isSelected={selectedNoteName === note.name}
                onSelect={() => onSelectNote(note)}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
