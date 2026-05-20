'use client';

import { motion } from 'motion/react';
import { Check, Sparkles } from 'lucide-react';
import { parseProductDescription } from '@/lib/product-description';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RichDescriptionProps {
  description: string;
}

export default function RichDescription({ description }: RichDescriptionProps) {
  const reducedMotion = useReducedMotion();
  const parsed = parseProductDescription(description);

  const reveal = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
      };

  return (
    <div className="product-description-premium">
      {parsed.summary.length > 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-gold/15 bg-white/70 p-5 shadow-[0_18px_45px_rgba(20,16,8,0.06)] backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gold-600">
            <Sparkles className="h-3.5 w-3.5" />
            Fragrance profile
          </div>
          <div className="space-y-3">
            {parsed.summary.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`} className="text-[0.95rem] leading-[1.85] text-[#2f2a22]">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {parsed.sections.length > 0 && (
        <div className="mt-5 space-y-4">
          {parsed.sections.map((section, index) => (
            <motion.section
              key={`${section.title}-${index}`}
              {...reveal}
              transition={{ duration: 0.45, delay: reducedMotion ? 0 : index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-black/10 pt-5"
            >
              <h4 className="font-playfair text-xl font-medium tracking-normal text-black">
                {section.title}
              </h4>
              {section.body.length > 0 && (
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph, paragraphIndex) => (
                    <p key={`${paragraph}-${paragraphIndex}`} className="text-[0.93rem] leading-[1.8] text-[#4b463d]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
              {section.bullets.length > 0 && (
                <ul className="mt-4 grid gap-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-[0.92rem] leading-relaxed text-[#3c372f]">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-gold-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
      )}

      {parsed.notes.length > 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-[#11100d] text-white shadow-[0_22px_55px_rgba(0,0,0,0.14)]"
        >
          {parsed.notes.map((note) => (
            <div key={note.label} className="grid gap-2 border-b border-white/10 px-5 py-4 last:border-b-0 sm:grid-cols-[130px_1fr]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gold-400">{note.label}</p>
              <p className="text-sm leading-relaxed text-white/82">{note.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {parsed.assurances.length > 0 && (
        <motion.ul
          {...reveal}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 grid gap-2 sm:grid-cols-3"
        >
          {parsed.assurances.map((assurance) => (
            <li
              key={assurance}
              className="flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
            >
              <Check className="h-3.5 w-3.5 flex-none" />
              <span>{assurance}</span>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
