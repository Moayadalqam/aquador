import { validatePerfumeForm, PerfumeFormData } from '../validation'
import { PerfumeComposition, FragranceNote, PerfumeVolume } from '../types'

describe('Perfume Form Validation', () => {
  const mockTopNote: FragranceNote = {
    name: 'Bergamot',
    category: 'fruity',
    icon: 'fas fa-lemon',
    color: '#32CD32',
    description: 'Earl Grey bergamot'
  }

  const mockHeartNote: FragranceNote = {
    name: 'Rose',
    category: 'floral',
    icon: 'fas fa-spa',
    color: '#FF6B9D',
    description: 'Velvety Damascus rose'
  }

  const mockBaseNote: FragranceNote = {
    name: 'Sandalwood',
    category: 'woody',
    icon: 'fas fa-tree',
    color: '#DEB887',
    description: 'Creamy sandalwood'
  }

  const validComposition: PerfumeComposition = {
    top: mockTopNote,
    heart: mockHeartNote,
    base: mockBaseNote
  }

  describe('perfume name validation', () => {
    it('should reject empty perfume name', () => {
      const formData: PerfumeFormData = {
        name: '',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toContain('Perfume name is required')
    })

    it('should reject perfume name with only whitespace', () => {
      const formData: PerfumeFormData = {
        name: '   ',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toContain('Perfume name is required')
    })

    it('should reject perfume name longer than 30 characters', () => {
      const formData: PerfumeFormData = {
        name: 'This is a very long perfume name that exceeds the limit',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toContain('Perfume name must be 30 characters or less')
    })

    it('should accept perfume name with exactly 30 characters', () => {
      const formData: PerfumeFormData = {
        name: '123456789012345678901234567890', // exactly 30
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.name).toBeUndefined()
    })

    it('should accept valid perfume name', () => {
      const formData: PerfumeFormData = {
        name: 'Midnight Rose',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.name).toBeUndefined()
    })
  })

  describe('volume validation', () => {
    it('should reject missing volume', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: null as unknown as PerfumeVolume | null,
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.volume).toContain('Volume selection is required')
    })

    it('should reject invalid volume', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '75ml' as unknown as PerfumeVolume | null,
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.volume).toContain('Invalid volume selected')
    })

    it('should accept 50ml volume', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.volume).toBeUndefined()
    })

    it('should accept 100ml volume', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '100ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.volume).toBeUndefined()
    })
  })

  describe('composition validation', () => {
    it('should reject incomplete composition', () => {
      const incompleteComposition: PerfumeComposition = {
        top: mockTopNote,
        heart: null,
        base: mockBaseNote
      }

      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: incompleteComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.composition).toBeDefined()
    })

    it('should accept complete composition', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.composition).toBeUndefined()
    })
  })

  describe('special requests validation', () => {
    it('should accept empty special requests', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '50ml',
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.specialRequests).toBeUndefined()
    })

    it('should accept special requests up to 500 characters', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '50ml',
        specialRequests: 'a'.repeat(500)
      }

      const result = validatePerfumeForm(formData)

      expect(result.errors.specialRequests).toBeUndefined()
    })

    it('should reject special requests longer than 500 characters', () => {
      const formData: PerfumeFormData = {
        name: 'Test Perfume',
        composition: validComposition,
        volume: '50ml',
        specialRequests: 'a'.repeat(501)
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.specialRequests).toContain('Special requests must be 500 characters or less')
    })
  })

  describe('complete form validation', () => {
    it('should return all field errors for completely invalid form', () => {
      const formData: PerfumeFormData = {
        name: '',
        composition: { top: null, heart: null, base: null },
        volume: null as unknown as PerfumeVolume | null,
        specialRequests: ''
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
      expect(result.errors.composition).toBeDefined()
      expect(result.errors.volume).toBeDefined()
    })

    it('should return valid for completely valid form', () => {
      const formData: PerfumeFormData = {
        name: 'Midnight Rose',
        composition: validComposition,
        volume: '50ml',
        specialRequests: 'Please make it extra strong'
      }

      const result = validatePerfumeForm(formData)

      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })
})
