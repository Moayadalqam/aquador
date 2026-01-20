export type FragranceCategory = 'floral' | 'fruity' | 'woody' | 'oriental' | 'gourmand'

export type PerfumeVolume = '50ml' | '100ml'

export interface FragranceNote {
  name: string
  category: FragranceCategory
  icon: string
  color: string
  description: string
}

export interface PerfumeComposition {
  top: FragranceNote | null
  heart: FragranceNote | null
  base: FragranceNote | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface CustomPerfume {
  name: string
  composition: PerfumeComposition
  volume: PerfumeVolume
  specialRequests?: string
  price: number
}
