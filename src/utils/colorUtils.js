// Map color names to hex values
export const COLOR_MAP = {
  // Primary Colors
  'Red': '#ef4444',
  'Blue': '#3b82f6',
  'Yellow': '#eab308',
  'Green': '#22c55e',
  
  // Secondary Colors
  'Orange': '#f97316',
  'Purple': '#9333ea',
  'Pink': '#ec4899',
  
  // Tertiary & Blended Colors
  'Yellow-Green': '#84cc16',
  'Blue-Purple': '#6366f1',
  'Red-Orange': '#ff5722',
  'Blue-Green': '#06b6d4',
  'Red-Purple': '#d946ef',
  'Yellow-Orange': '#fb923c',
  
  // Blues
  'Sky Blue': '#38bdf8',
  'Light Blue': '#60a5fa',
  'Navy': '#1e3a8a',
  'Cyan': '#06b6d4',
  'Teal': '#14b8a6',
  'Indigo': '#6366f1',
  'Periwinkle': '#818cf8',
  
  // Greens
  'Lime': '#84cc16',
  'Emerald': '#10b981',
  'Forest Green': '#166534',
  'Mint': '#6ee7b7',
  'Olive': '#84cc16',
  'Sea Green': '#2dd4bf',
  
  // Reds & Pinks
  'Crimson': '#dc2626',
  'Rose': '#f43f5e',
  'Coral': '#fb7185',
  'Burgundy': '#991b1b',
  'Magenta': '#d946ef',
  'Hot Pink': '#ec4899',
  'Salmon': '#fb923c',
  
  // Purples
  'Violet': '#8b5cf6',
  'Lavender': '#a78bfa',
  'Plum': '#c084fc',
  'Fuchsia': '#e879f9',
  
  // Oranges & Yellows
  'Amber': '#f59e0b',
  'Gold': '#eab308',
  'Peach': '#fed7aa',
  'Tangerine': '#fb923c',
  
  // Neutrals
  'White': '#ffffff',
  'Black': '#000000',
  'Gray': '#6b7280',
  'Light Gray': '#d1d5db',
  'Dark Gray': '#374151',
  'Charcoal': '#1f2937',
  'Silver': '#9ca3af',
  'Slate': '#64748b',
  
  // Earth Tones
  'Brown': '#92400e',
  'Beige': '#d6d3d1',
  'Tan': '#a8a29e',
  'Cream': '#fef3c7',
  
  // Special
  'transparent': 'transparent'
}

// Reverse map for hex to color name lookup
export const HEX_TO_COLOR_MAP = Object.entries(COLOR_MAP).reduce((acc, [name, hex]) => {
  acc[hex.toLowerCase()] = name
  return acc
}, {})

// Convert color name to hex
export const getColorHex = (colorName) => {
  if (!colorName) return '#000000'
  // If it's already a hex, return it
  if (colorName.startsWith('#')) return colorName
  // Look up in map
  return COLOR_MAP[colorName] || COLOR_MAP[colorName.replace(/\s+/g, ' ')] || '#000000'
}

// Get all available colors
export const getAllColors = () => Object.keys(COLOR_MAP)

