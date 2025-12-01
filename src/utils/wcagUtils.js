// WCAG 2.1 Accessibility Utilities

// Convert hex to RGB
const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return null
  const normalized = hex.replace('#', '').toLowerCase()
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }
}

// Calculate relative luminance (WCAG formula)
const getLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Calculate contrast ratio between two colors
export const calculateContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const lum1 = getLuminance(rgb1)
  const lum2 = getLuminance(rgb2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Check if contrast meets WCAG AA standards
export const checkContrastWCAG = (textColor, backgroundColor, fontSize, isBold = false) => {
  const ratio = calculateContrastRatio(textColor, backgroundColor)
  
  // Large text: 18px+ (24px+) or 14px+ (18px+) bold
  // Note: fontSize is in pixels
  const isLargeText = fontSize >= 24 || (fontSize >= 18 && isBold)
  const requiredRatio = isLargeText ? 3.0 : 4.5
  
  return {
    passes: ratio >= requiredRatio,
    ratio: Math.round(ratio * 10) / 10,
    requiredRatio,
    level: isLargeText ? 'AA (Large Text)' : 'AA (Standard)',
    rationale: `WCAG 1.4.3 requires ${requiredRatio}:1 contrast for ${isLargeText ? 'large text' : 'standard text'}. Low contrast makes content hard to read, especially for users with visual impairments.`
  }
}

// Check font size against WCAG minimums
// Note: fontSize is expected in pixels (px) as used in templates
export const checkFontSize = (fontSize, elementType = 'body') => {
  const minSizes = {
    body: 16, // 16px = 12pt minimum for body text
    heading: 18, // 18px = 13.5pt minimum for headings
    title: 24 // 24px = 18pt minimum for titles
  }
  
  const minSize = minSizes[elementType] || minSizes.body
  const fontSizePx = fontSize || 16
  
  return {
    passes: fontSizePx >= minSize,
    currentSize: fontSizePx,
    minSize,
    rationale: `WCAG 1.4.4 requires text to be readable when zoomed. Font sizes below ${minSize}px reduce readability, especially when viewed from a distance.`
  }
}

// Check line height for readability
export const checkLineHeight = (fontSize, lineHeight) => {
  if (!fontSize) return { passes: true, recommended: 1.5 }
  
  // If lineHeight is a number (like 1.5), convert to ratio
  let ratio = lineHeight
  if (typeof lineHeight === 'string') {
    // Parse "1.5" or "24px" format
    if (lineHeight.includes('px')) {
      ratio = parseFloat(lineHeight) / fontSize
    } else {
      ratio = parseFloat(lineHeight) || 1.5
    }
  }
  
  const recommended = 1.5
  const passes = ratio >= recommended
  
  return {
    passes,
    currentRatio: ratio,
    recommended,
    rationale: `WCAG 1.4.12 recommends line height of 1.5x font size. Adequate spacing improves readability and makes text easier to scan, reducing eye strain.`
  }
}

// Check element spacing (minimum 8px between elements)
export const checkElementSpacing = (elements) => {
  const issues = []
  const minSpacing = 8 // pixels
  
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const el1 = elements[i]
      const el2 = elements[j]
      
      if (!el1.x || !el1.y || !el2.x || !el2.y) continue
      
      // Calculate distance between element centers
      const dx = Math.abs(el1.x - el2.x)
      const dy = Math.abs(el1.y - el2.y)
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // Rough check: if elements are very close (within 50px), check spacing
      if (distance < 50 && distance < minSpacing) {
        issues.push({
          element1: el1.id,
          element2: el2.id,
          distance: Math.round(distance),
          minSpacing
        })
      }
    }
  }
  
  return {
    passes: issues.length === 0,
    issues,
    rationale: `WCAG 1.3.1 recommends adequate spacing between elements (minimum ${minSpacing}px). Proper spacing creates visual breathing room and improves the overall readability of your poster.`
  }
}

// Generate contrast fix options
export const generateContrastOptions = (textColor, backgroundColor, fontSize, isBold) => {
  const options = []
  const currentRatio = calculateContrastRatio(textColor, backgroundColor)
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold)
  const requiredRatio = isLargeText ? 3.0 : 4.5
  
  if (currentRatio < requiredRatio) {
    // Suggest darker text or lighter background
    const rgb = hexToRgb(textColor)
    const bgRgb = hexToRgb(backgroundColor)
    
    if (rgb) {
      // Darker text options
      const darkerOptions = [
        { name: 'Black', hex: '#000000' },
        { name: 'Dark Gray', hex: '#1f2937' },
        { name: 'Charcoal', hex: '#374151' }
      ]
      
      darkerOptions.forEach(opt => {
        const ratio = calculateContrastRatio(opt.hex, backgroundColor)
        if (ratio >= requiredRatio) {
          options.push({
            name: opt.name,
            hex: opt.hex,
            ratio: Math.round(ratio * 10) / 10,
            type: 'text-color'
          })
        }
      })
    }
    
    if (bgRgb) {
      // Lighter background options
      const lighterOptions = [
        { name: 'White', hex: '#ffffff' },
        { name: 'Light Gray', hex: '#f3f4f6' },
        { name: 'Cream', hex: '#fef3c7' }
      ]
      
      lighterOptions.forEach(opt => {
        const ratio = calculateContrastRatio(textColor, opt.hex)
        if (ratio >= requiredRatio) {
          options.push({
            name: opt.name,
            hex: opt.hex,
            ratio: Math.round(ratio * 10) / 10,
            type: 'background-color'
          })
        }
      })
    }
  }
  
  return options.slice(0, 4) // Limit to 4 options
}

