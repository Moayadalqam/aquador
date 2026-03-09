'use client';

import { motion } from 'framer-motion';
import { filterVariants, FILTER_TIMING } from '@/lib/animations/filter-transitions';

export interface AnimatedFilterBarProps {
  filters: Array<{ id: string; label: string }>;
  activeFilter: string | null;
  onFilterChange: (id: string | null) => void;
  className?: string;
}

/**
 * AnimatedFilterBar Component
 *
 * Horizontal scrollable pill bar with shared layout animation.
 * Gold accent on active state with smooth spring transitions.
 *
 * Accessibility:
 * - 44px min-height touch targets (WCAG)
 * - Keyboard navigable
 * - Semantic button elements
 *
 * Responsive:
 * - Mobile: horizontal scroll with snap
 * - Desktop: centered flex-wrap layout
 */
export function AnimatedFilterBar({
  filters,
  activeFilter,
  onFilterChange,
  className = '',
}: AnimatedFilterBarProps) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-2 ${className}`}
      role="group"
      aria-label="Product category filters"
    >
      {/* All filter */}
      <motion.button
        onClick={() => onFilterChange(null)}
        className={`
          px-4 py-2.5 min-h-[44px] rounded-lg
          text-[10.5px] uppercase tracking-[0.15em] font-medium
          transition-colors
          ${
            activeFilter === null
              ? 'text-dark'
              : 'bg-dark-lighter border border-gold-500/20 text-gray-300 hover:border-gold-500/40 hover:text-white'
          }
        `}
        animate={activeFilter === null ? 'active' : 'inactive'}
        variants={filterVariants}
        aria-pressed={activeFilter === null}
      >
        All
      </motion.button>

      {/* Filter pills */}
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              px-4 py-2.5 min-h-[44px] rounded-lg
              text-[10.5px] uppercase tracking-[0.15em] font-medium
              transition-colors
              ${
                isActive
                  ? 'text-dark'
                  : 'bg-dark-lighter border border-gold-500/20 text-gray-300 hover:border-gold-500/40 hover:text-white'
              }
            `}
            animate={isActive ? 'active' : 'inactive'}
            variants={filterVariants}
            aria-pressed={isActive}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export interface AnimatedTypeFilterProps {
  types: Array<{ id: string | null; label: string }>;
  activeType: string | null;
  onTypeChange: (id: string | null) => void;
  className?: string;
}

/**
 * AnimatedTypeFilter Component
 *
 * Smaller, text-only filter variant for product type filtering.
 * Subtle gold accent on active state.
 */
export function AnimatedTypeFilter({
  types,
  activeType,
  onTypeChange,
  className = '',
}: AnimatedTypeFilterProps) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-1 ${className}`}
      role="group"
      aria-label="Product type filters"
    >
      {types.map((type) => {
        const isActive = activeType === type.id;

        return (
          <motion.button
            key={type.id || 'all'}
            onClick={() => onTypeChange(type.id)}
            className={`
              px-3 py-1 min-h-[44px] flex items-center
              text-[10px] uppercase tracking-[0.12em]
              transition-colors
              ${isActive ? 'text-gold' : 'text-gray-500 hover:text-gray-300'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              duration: FILTER_TIMING.pill,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-pressed={isActive}
          >
            {type.label}
          </motion.button>
        );
      })}
    </div>
  );
}
