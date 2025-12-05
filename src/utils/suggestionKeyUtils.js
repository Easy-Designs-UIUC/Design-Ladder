// Shared utility for generating stable suggestion keys
// This ensures consistent key generation across all components

export const getSuggestionKey = (suggestion, index = 0) => {
  if (!suggestion) return `unknown-${index}`
  const elementId = suggestion.elementId || 'unknown'
  const type = suggestion.type || 'unknown'
  
  // Build a unique identifier from suggestion properties
  // Use normalized values to ensure consistency
  const parts = [elementId, type]
  
  // Add distinguishing properties based on suggestion type
  // Normalize currentValue to handle color variations
  if (suggestion.currentValue) {
    const val = String(suggestion.currentValue).toLowerCase().trim()
    // For hex colors, normalize format
    if (val.startsWith('#')) {
      parts.push(val.substring(0, 7)) // #rrggbb format
    } else {
      parts.push(val.substring(0, 20).replace(/\s+/g, '-'))
    }
  }
  // Normalize backgroundColor
  if (suggestion.backgroundColor) {
    const bg = String(suggestion.backgroundColor).toLowerCase().trim()
    parts.push(bg.startsWith('#') ? bg.substring(0, 7) : bg.substring(0, 10))
  }
  // Use exact contrast ratio value
  if (suggestion.contrastRatio !== undefined) {
    parts.push(`cr${Math.round(suggestion.contrastRatio * 10) / 10}`)
  }
  if (suggestion.otherElementId) {
    parts.push(suggestion.otherElementId)
  }
  // Use exact spacing value
  if (suggestion.spacing !== undefined) {
    parts.push(`sp${Math.round(suggestion.spacing)}`)
  }
  // Use message hash for additional uniqueness (normalized)
  if (suggestion.message) {
    const msgHash = suggestion.message.toLowerCase().replace(/\s+/g, '-').substring(0, 30)
    if (parts.length < 4) {
      parts.push(msgHash)
    }
  }
  
  return parts.join('-')
}

