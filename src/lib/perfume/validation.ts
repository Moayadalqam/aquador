import { PerfumeFormData, FormValidationResult, PerfumeVolume } from './types'
import { validateComposition } from './composition'

const MAX_NAME_LENGTH = 30
const MAX_SPECIAL_REQUESTS_LENGTH = 500
const VALID_VOLUMES: PerfumeVolume[] = ['50ml', '100ml']

export function validatePerfumeForm(formData: PerfumeFormData): FormValidationResult {
  const errors: FormValidationResult['errors'] = {}

  // Validate name
  const trimmedName = formData.name.trim()
  if (!trimmedName) {
    errors.name = ['Perfume name is required']
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.name = ['Perfume name must be 30 characters or less']
  }

  // Validate volume
  if (!formData.volume) {
    errors.volume = ['Volume selection is required']
  } else if (!VALID_VOLUMES.includes(formData.volume)) {
    errors.volume = ['Invalid volume selected']
  }

  // Validate composition
  const compositionResult = validateComposition(formData.composition)
  if (!compositionResult.isValid) {
    errors.composition = compositionResult.errors
  }

  // Validate special requests (optional, but limited length)
  if (formData.specialRequests && formData.specialRequests.length > MAX_SPECIAL_REQUESTS_LENGTH) {
    errors.specialRequests = ['Special requests must be 500 characters or less']
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export type { PerfumeFormData }
