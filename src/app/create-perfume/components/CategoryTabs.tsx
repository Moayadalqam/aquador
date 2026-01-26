'use client'

import { motion } from 'framer-motion'
import { FragranceCategory } from '@/lib/perfume/types'
import { fragranceCategories } from '@/lib/perfume/notes'
import { categoryTabVariants, categoryThemes, staggerContainer } from '../motion'

interface CategoryTabsProps {
  activeCategory: FragranceCategory
  onCategoryChange: (category: FragranceCategory) => void
  reducedMotion?: boolean
}

const categoryIcons: Record<FragranceCategory, string> = {
  floral: '🌸',
  fruity: '🍊',
  woody: '🌲',
  oriental: '✨',
  gourmand: '🍯',
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  reducedMotion = false,
}: CategoryTabsProps) {
  return (
    <motion.div
      variants={reducedMotion ? undefined : staggerContainer}
      initial={reducedMotion ? undefined : 'initial'}
      animate={reducedMotion ? undefined : 'animate'}
      className="mb-8 flex flex-wrap justify-center gap-2"
      role="tablist"
      aria-label="Fragrance category selection"
    >
      {fragranceCategories.map((cat) => {
        const isActive = activeCategory === cat.key
        const theme = categoryThemes[cat.key]

        return (
          <motion.button
            key={cat.key}
            variants={reducedMotion ? undefined : categoryTabVariants}
            whileHover={reducedMotion ? undefined : 'hover'}
            whileTap={reducedMotion ? undefined : 'tap'}
            onClick={() => onCategoryChange(cat.key)}
            role="tab"
            aria-selected={isActive}
            className={`
              relative px-5 py-2.5 text-sm tracking-wider transition-all duration-300
              rounded-full overflow-hidden
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
              ${isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
              }
            `}
            style={{
              '--category-color': theme.primary,
              '--category-glow': theme.glow,
            } as React.CSSProperties}
          >
            {/* Background fill for active state */}
            {isActive && (
              <motion.div
                layoutId={reducedMotion ? undefined : 'categoryBg'}
                className="absolute inset-0 -z-10"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}30 0%, ${theme.primary}10 100%)`,
                  border: `1px solid ${theme.primary}50`,
                }}
                transition={reducedMotion ? undefined : { type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Hover background for inactive state */}
            {!isActive && (
              <div
                className="absolute inset-0 -z-10 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"
              />
            )}

            {/* Content */}
            <span className="flex items-center gap-2">
              <span className="text-base">{categoryIcons[cat.key]}</span>
              <span className="uppercase">{cat.label}</span>
            </span>

            {/* Active indicator dot */}
            {isActive && (
              <motion.span
                initial={reducedMotion ? undefined : { scale: 0 }}
                animate={reducedMotion ? undefined : { scale: 1 }}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: theme.primary }}
              />
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
