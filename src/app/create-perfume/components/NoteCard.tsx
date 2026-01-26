'use client'

import { motion } from 'framer-motion'
import { FragranceNote } from '@/lib/perfume/types'
import { noteCardVariants, categoryThemes } from '../motion'

interface NoteCardProps {
  note: FragranceNote
  isSelected: boolean
  onSelect: () => void
  reducedMotion?: boolean
}

export function NoteCard({ note, isSelected, onSelect, reducedMotion = false }: NoteCardProps) {
  const theme = categoryThemes[note.category]

  return (
    <motion.button
      variants={reducedMotion ? undefined : noteCardVariants}
      initial={reducedMotion ? undefined : 'initial'}
      animate={reducedMotion ? undefined : isSelected ? 'selected' : 'animate'}
      whileHover={reducedMotion ? undefined : 'hover'}
      whileTap={reducedMotion ? undefined : 'tap'}
      onClick={onSelect}
      aria-selected={isSelected}
      className={`
        group relative flex flex-col items-center gap-3 rounded-xl p-4
        transition-colors duration-300 overflow-hidden
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${isSelected
          ? 'bg-amber-500/20 ring-2 ring-amber-400'
          : 'bg-white/5 hover:bg-white/10'
        }
      `}
      style={{
        '--glow-color': theme.glow,
        '--note-color': note.color,
      } as React.CSSProperties}
    >
      {/* Glass morphism background */}
      <div
        className="absolute inset-0 backdrop-blur-sm opacity-50"
        style={{
          background: `radial-gradient(circle at center, ${note.color}10 0%, transparent 70%)`,
        }}
      />

      {/* Shimmer border effect on hover */}
      <div
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
          ${isSelected ? 'opacity-100' : ''}
        `}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${note.color}40 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: reducedMotion ? 'none' : 'shimmer 2s linear infinite',
        }}
      />

      {/* Selected glow effect */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            boxShadow: `inset 0 0 20px ${note.color}30, 0 0 20px ${theme.glow}`,
          }}
        />
      )}

      {/* Note icon */}
      <motion.span
        className="relative text-3xl z-10"
        animate={isSelected && !reducedMotion ? {
          scale: [1, 1.1, 1],
          transition: { duration: 0.3 }
        } : {}}
      >
        {note.icon}
      </motion.span>

      {/* Note name */}
      <span className={`
        relative text-center text-xs font-medium tracking-wide z-10 transition-colors duration-300
        ${isSelected ? 'text-amber-400' : 'text-gray-300 group-hover:text-white'}
      `}>
        {note.name}
      </span>

      {/* Subtle color indicator dot */}
      <div
        className={`
          absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full
          transition-all duration-300
          ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50'}
        `}
        style={{ backgroundColor: note.color }}
      />
    </motion.button>
  )
}
