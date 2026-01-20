import { validateComposition, isCompositionComplete } from '../composition'
import { PerfumeComposition, FragranceNote } from '../types'

describe('Perfume Composition Validation', () => {
  // Test data
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

  describe('isCompositionComplete', () => {
    it('should return false when composition has no notes', () => {
      const composition: PerfumeComposition = {
        top: null,
        heart: null,
        base: null
      }

      expect(isCompositionComplete(composition)).toBe(false)
    })

    it('should return false when only top note is selected', () => {
      const composition: PerfumeComposition = {
        top: mockTopNote,
        heart: null,
        base: null
      }

      expect(isCompositionComplete(composition)).toBe(false)
    })

    it('should return false when only two notes are selected', () => {
      const composition: PerfumeComposition = {
        top: mockTopNote,
        heart: mockHeartNote,
        base: null
      }

      expect(isCompositionComplete(composition)).toBe(false)
    })

    it('should return true when all three notes are selected', () => {
      const composition: PerfumeComposition = {
        top: mockTopNote,
        heart: mockHeartNote,
        base: mockBaseNote
      }

      expect(isCompositionComplete(composition)).toBe(true)
    })
  })

  describe('validateComposition', () => {
    it('should return error when top note is missing', () => {
      const composition: PerfumeComposition = {
        top: null,
        heart: mockHeartNote,
        base: mockBaseNote
      }

      const result = validateComposition(composition)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Top note is required')
    })

    it('should return error when heart note is missing', () => {
      const composition: PerfumeComposition = {
        top: mockTopNote,
        heart: null,
        base: mockBaseNote
      }

      const result = validateComposition(composition)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Heart note is required')
    })

    it('should return error when base note is missing', () => {
      const composition: PerfumeComposition = {
        top: mockTopNote,
        heart: mockHeartNote,
        base: null
      }

      const result = validateComposition(composition)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Base note is required')
    })

    it('should return all errors when all notes are missing', () => {
      const composition: PerfumeComposition = {
        top: null,
        heart: null,
        base: null
      }

      const result = validateComposition(composition)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors).toContain('Top note is required')
      expect(result.errors).toContain('Heart note is required')
      expect(result.errors).toContain('Base note is required')
    })

    it('should return valid when all notes are present', () => {
      const composition: PerfumeComposition = {
        top: mockTopNote,
        heart: mockHeartNote,
        base: mockBaseNote
      }

      const result = validateComposition(composition)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
