import { FragranceNote, FragranceCategory } from './types'

export const fragranceDatabase: Record<FragranceCategory, FragranceNote[]> = {
  floral: [
    { name: 'Rose', category: 'floral', icon: '🌹', color: '#FF6B9D', description: 'Velvety Damascus rose' },
    { name: 'Jasmine', category: 'floral', icon: '🌸', color: '#F8F8FF', description: 'Night-blooming jasmine' },
    { name: 'Ylang-Ylang', category: 'floral', icon: '🌼', color: '#FFE135', description: 'Exotic ylang-ylang' },
    { name: 'Tuberose', category: 'floral', icon: '💮', color: '#E6E6FA', description: 'Creamy tuberose' },
    { name: 'Violet', category: 'floral', icon: '💜', color: '#8A2BE2', description: 'Powdery violet' },
    { name: 'Peony', category: 'floral', icon: '🌷', color: '#FFB6C1', description: 'Fresh peony' },
    { name: 'Orange Blossom', category: 'floral', icon: '🍊', color: '#FFA500', description: 'Citrus blossom' },
    { name: 'Lily', category: 'floral', icon: '⚪', color: '#FFF8DC', description: 'Pure white lily' },
  ],
  fruity: [
    { name: 'Bergamot', category: 'fruity', icon: '🍋', color: '#32CD32', description: 'Earl Grey bergamot' },
    { name: 'Lemon', category: 'fruity', icon: '🍋', color: '#FFFF00', description: 'Sicilian lemon' },
    { name: 'Apple', category: 'fruity', icon: '🍎', color: '#90EE90', description: 'Crisp green apple' },
    { name: 'Peach', category: 'fruity', icon: '🍑', color: '#FFCBA4', description: 'Juicy white peach' },
    { name: 'Blackcurrant', category: 'fruity', icon: '🫐', color: '#800080', description: 'Tart blackcurrant' },
    { name: 'Pineapple', category: 'fruity', icon: '🍍', color: '#FFD700', description: 'Tropical pineapple' },
    { name: 'Pear', category: 'fruity', icon: '🍐', color: '#D1E231', description: 'Anjou pear' },
    { name: 'Mandarin', category: 'fruity', icon: '🍊', color: '#FF8C00', description: 'Sweet mandarin' },
  ],
  woody: [
    { name: 'Sandalwood', category: 'woody', icon: '🪵', color: '#DEB887', description: 'Creamy sandalwood' },
    { name: 'Cedar', category: 'woody', icon: '🌲', color: '#A0522D', description: 'Virginia cedarwood' },
    { name: 'Vetiver', category: 'woody', icon: '🌿', color: '#8FBC8F', description: 'Haitian vetiver' },
    { name: 'Patchouli', category: 'woody', icon: '🍂', color: '#654321', description: 'Dark patchouli' },
    { name: 'Oakmoss', category: 'woody', icon: '🌱', color: '#9CAF88', description: 'Forest oakmoss' },
    { name: 'Pine', category: 'woody', icon: '🌲', color: '#228B22', description: 'Mountain pine' },
  ],
  oriental: [
    { name: 'Oud', category: 'oriental', icon: '🪵', color: '#8B4513', description: 'Precious oud wood' },
    { name: 'Amber', category: 'oriental', icon: '✨', color: '#FFBF00', description: 'Warm amber resin' },
    { name: 'Incense', category: 'oriental', icon: '🔥', color: '#696969', description: 'Sacred incense' },
    { name: 'Saffron', category: 'oriental', icon: '🌾', color: '#F4C430', description: 'Golden saffron' },
    { name: 'Cardamom', category: 'oriental', icon: '🌿', color: '#90EE90', description: 'Green cardamom' },
    { name: 'Cinnamon', category: 'oriental', icon: '🫚', color: '#D2691E', description: 'Ceylon cinnamon' },
  ],
  gourmand: [
    { name: 'Vanilla', category: 'gourmand', icon: '🍦', color: '#F3E5AB', description: 'Madagascar vanilla' },
    { name: 'Chocolate', category: 'gourmand', icon: '🍫', color: '#7B3F00', description: 'Dark chocolate' },
    { name: 'Coffee', category: 'gourmand', icon: '☕', color: '#6F4E37', description: 'Roasted coffee' },
    { name: 'Caramel', category: 'gourmand', icon: '🍮', color: '#AF6E4D', description: 'Burnt caramel' },
    { name: 'Honey', category: 'gourmand', icon: '🍯', color: '#FFC649', description: 'Wildflower honey' },
    { name: 'Almond', category: 'gourmand', icon: '🥜', color: '#FFDBCD', description: 'Sweet almond' },
  ],
}

export const fragranceCategories: { key: FragranceCategory; label: string }[] = [
  { key: 'floral', label: 'Floral' },
  { key: 'fruity', label: 'Fruity' },
  { key: 'woody', label: 'Woody' },
  { key: 'oriental', label: 'Oriental' },
  { key: 'gourmand', label: 'Gourmand' },
]
