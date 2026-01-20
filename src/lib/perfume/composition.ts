import { PerfumeComposition, ValidationResult } from './types'

/**
 * Checks if a perfume composition has all three required notes
 */
export function isCompositionComplete(composition: PerfumeComposition): boolean {
  return composition.top !== null &&
         composition.heart !== null &&
         composition.base !== null
}

/**
 * Validates a perfume composition and returns validation result with errors
 */
export function validateComposition(composition: PerfumeComposition): ValidationResult {
  const errors: string[] = []

  if (composition.top === null) {
    errors.push('Top note is required')
  }

  if (composition.heart === null) {
    errors.push('Heart note is required')
  }

  if (composition.base === null) {
    errors.push('Base note is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
