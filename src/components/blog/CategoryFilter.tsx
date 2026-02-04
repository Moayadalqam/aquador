'use client';

import { motion } from 'framer-motion';
import type { BlogCategory } from '@/lib/blog-types';

interface CategoryFilterProps {
  categories: BlogCategory[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <motion.div
      className="flex flex-wrap gap-2 justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <button
        onClick={() => onCategoryChange(null)}
        className={`btn-filter ${
          !activeCategory ? 'btn-filter-active' : 'btn-filter-inactive'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug === activeCategory ? null : cat.slug)}
          className={`btn-filter ${
            activeCategory === cat.slug ? 'btn-filter-active' : 'btn-filter-inactive'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </motion.div>
  );
}
