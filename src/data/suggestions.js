import { getColorHex, HEX_TO_COLOR_MAP } from '../utils/colorUtils'

// Extract unique fonts from template elements
const extractTemplateFonts = (template) => {
  if (!template?.layout?.elements) return []
  
  const fonts = new Set()
  template.layout.elements.forEach(element => {
    if (element.type === 'text') {
      // Check if style is an object with fontFamily
      if (typeof element.style === 'object' && element.style?.fontFamily) {
        fonts.add(element.style.fontFamily)
      }
    }
  })
  
  return Array.from(fonts)
}

// Convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Determine color name from hex
const getColorNameFromHex = (hex) => {
  if (!hex || typeof hex !== 'string') return null
  
  // Normalize hex: remove # if present, ensure lowercase, handle 3-char hex
  let normalizedHex = hex.toLowerCase().trim()
  if (normalizedHex.startsWith('#')) {
    normalizedHex = normalizedHex.substring(1)
  }
  // Convert 3-char hex to 6-char
  if (normalizedHex.length === 3) {
    normalizedHex = normalizedHex.split('').map(c => c + c).join('')
  }
  // Add # back for lookup
  const lookupHex = '#' + normalizedHex
  
  // First check if it's in our HEX_TO_COLOR_MAP (exact match)
  if (HEX_TO_COLOR_MAP[lookupHex]) {
    return HEX_TO_COLOR_MAP[lookupHex]
  }
  
  // Also check without # prefix
  if (HEX_TO_COLOR_MAP[normalizedHex]) {
    return HEX_TO_COLOR_MAP[normalizedHex]
  }
  
  // Handle named colors
  if (normalizedHex === 'ffffff' || normalizedHex === 'fff') return 'White'
  if (normalizedHex === '000000' || normalizedHex === '000') return 'Black'
  
  const rgb = hexToRgb(lookupHex)
  if (!rgb) return null
  
  const { r, g, b } = rgb
  
  // Determine dominant color (fallback for colors not in our map)
  if (r > g && r > b && r > 200) {
    if (g > 150 && b < 100) return 'Orange'
    if (b > 150) return 'Purple'
    return 'Red'
  }
  if (g > r && g > b && g > 200) {
    if (r > 150) return 'Yellow'
    if (b > 150) return 'Yellow-Green'
    return 'Green'
  }
  if (b > r && b > g && b > 200) {
    if (r > 150) return 'Purple'
    if (g > 150) return 'Blue-Purple'
    return 'Blue'
  }
  if (r < 50 && g < 50 && b < 50) return 'Black'
  if (r > 200 && g > 200 && b > 200) return 'White'
  if (r > 150 && g > 100 && b < 100) return 'Orange'
  if (r > 150 && g < 100 && b < 100) return 'Red'
  if (g > 150 && r < 100 && b < 100) return 'Green'
  if (b > 150 && r < 100 && g < 100) return 'Blue'
  if (r > 100 && b > 100 && g < 100) return 'Purple'
  
  return 'Gray'
}

// Extract colors from template (background + element colors)
const extractTemplateColors = (template) => {
  const colors = new Set()
  
  // Use template's colorPalette first (most accurate)
  if (template?.colorPalette && Array.isArray(template.colorPalette)) {
    template.colorPalette.forEach(color => {
      if (color) colors.add(color)
    })
  }
  
  // Extract from background
  if (template?.layout?.background) {
    const bgColorName = getColorNameFromHex(template.layout.background)
    if (bgColorName && bgColorName !== 'White') colors.add(bgColorName)
  }
  
  // Extract from element colors (text colors and backgrounds)
  if (template?.layout?.elements) {
    template.layout.elements.forEach(element => {
      // Text color (fill)
      if (element.style?.fill) {
        const colorName = getColorNameFromHex(element.style.fill)
        if (colorName && colorName !== 'White' && colorName !== 'Black') colors.add(colorName)
      }
      // Background color
      if (element.style?.backgroundColor) {
        const colorName = getColorNameFromHex(element.style.backgroundColor)
        if (colorName && colorName !== 'White' && colorName !== 'transparent') colors.add(colorName)
      }
    })
  }
  
  return Array.from(colors)
}

// Check required sections: title, subtitle/heading, body text, element
const checkRequiredSections = (canvasElements) => {
  // Defensive check for null/undefined
  const elements = canvasElements || []
  
  const hasTitle = elements.some(el => el?.type === 'text' && el?.style === 'title')
  const hasSubtitleOrHeading = elements.some(el => 
    el?.type === 'text' && (el?.style === 'subtitle' || el?.style === 'heading')
  )
  const hasBodyText = elements.some(el => el?.type === 'text' && el?.style === 'body')
  const hasElement = elements.some(el => el?.type === 'element')
  
  const requirements = [
    { name: 'title', met: hasTitle },
    { name: 'subtitle/heading', met: hasSubtitleOrHeading },
    { name: 'body text', met: hasBodyText },
    { name: 'element', met: hasElement }
  ]
  
  const metCount = requirements.filter(r => r.met).length
  const score = Math.round((metCount / 4) * 100)
  
  return { score, requirements, metCount, total: 4 }
}

// Check if all template elements are present in canvas
const checkTemplateCompleteness = (template, canvasElements) => {
  // No template = 100% (nothing to compare against)
  if (!template?.layout?.elements || template.layout.elements.length === 0) {
    return { score: 100, missing: [], total: 0, present: 0 }
  }
  
  const templateElementIds = new Set(
    template.layout.elements.map(el => el.id)
  )
  const canvasElementIds = new Set(
    (canvasElements || []).map(el => el.id)
  )
  
  const missing = template.layout.elements
    .filter(el => !canvasElementIds.has(el.id))
    .map(el => el.id)
  
  const total = templateElementIds.size
  const present = total - missing.length
  
  // Score is 100% if all elements are present, otherwise percentage
  const score = total > 0 ? Math.round((present / total) * 100) : 100
  
  return { score, missing, total, present }
}

// Normalize font names for comparison
const normalizeFont = (font) => {
  if (!font || typeof font !== 'string') return ''
  try {
    const firstFont = font.split(',')[0].trim()
    return firstFont.replace(/['"]/g, '').toLowerCase().replace(/[\s-]/g, '')
  } catch {
    return ''
  }
}

// Check font matching with template - now checks against suggested fonts too
const checkFontMatching = (template, canvasElements, suggestedFonts = []) => {
  const elements = canvasElements || []
  const templateFonts = extractTemplateFonts(template)
  
  // Combine template fonts and suggested fonts
  const allSuggestedFonts = [...new Set([...templateFonts, ...(suggestedFonts || [])])]
  
  // If no suggested fonts defined, return 100% (nothing to compare)
  if (allSuggestedFonts.length === 0) return { score: 100, matched: 0, total: 0, unmatched: 0 }
  
  // Normalize all suggested fonts
  const normalizedSuggestedFonts = new Set(allSuggestedFonts.map(normalizeFont).filter(f => f))
  
  // Get fonts actually used in canvas elements
  const textElements = elements.filter(el => el?.type === 'text' && el?.font)
  const usedFonts = textElements.map(el => normalizeFont(el.font)).filter(f => f)
  
  // If no fonts used, return 100% (nothing to check)
  if (usedFonts.length === 0) return { score: 100, matched: 0, total: 0, unmatched: 0 }
  
  // Count how many match suggested fonts
  const matched = usedFonts.filter(font => normalizedSuggestedFonts.has(font)).length
  const total = usedFonts.length
  
  // Score: percentage of fonts that match suggested fonts
  const score = total > 0 ? Math.round((matched / total) * 100) : 100
  
  return { score, matched, total, unmatched: total - matched }
}

// Calculate relative luminance for WCAG contrast
const getRelativeLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Normalize hex color (handle named colors, shorthand, etc.)
const normalizeHexColor = (color) => {
  if (!color || typeof color !== 'string') return null
  
  const trimmed = color.trim().toLowerCase()
  
  // Handle common named colors
  const namedColors = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#00ff00',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'purple': '#800080',
    'orange': '#ffa500',
    'transparent': null
  }
  
  if (namedColors[trimmed] !== undefined) return namedColors[trimmed]
  
  // Add # if missing
  let hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  
  // Expand shorthand hex (e.g., #abc -> #aabbcc)
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  
  // Validate hex format
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null
  
  return hex
}

// Calculate contrast ratio between two colors
const getContrastRatio = (color1Hex, color2Hex) => {
  const normalized1 = normalizeHexColor(color1Hex)
  const normalized2 = normalizeHexColor(color2Hex)
  
  if (!normalized1 || !normalized2) return 1
  
  const rgb1 = hexToRgb(normalized1)
  const rgb2 = hexToRgb(normalized2)
  
  if (!rgb1 || !rgb2) return 1
  
  const lum1 = getRelativeLuminance(rgb1)
  const lum2 = getRelativeLuminance(rgb2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Check color contrast for text elements
const checkColorContrast = (canvasElements, canvasBackground) => {
  const elements = canvasElements || []
  const contrastIssues = []
  
  elements.forEach(el => {
    if (el?.type === 'text' && el?.color) {
      // Get background color (element background or canvas background)
      const bgColor = el.backgroundColor && el.backgroundColor !== 'transparent' 
        ? el.backgroundColor 
        : (canvasBackground || '#ffffff')
      
      const contrastRatio = getContrastRatio(el.color, bgColor)
      const fontSize = el.fontSize || 16
      const fontWeight = el.fontWeight || 400
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700)
      
      // WCAG AA: 4.5:1 for normal text, 3:1 for large text
      const minRatio = isLargeText ? 3 : 4.5
      
      if (contrastRatio < minRatio) {
        contrastIssues.push({
          elementId: el.id,
          contrastRatio: Math.round(contrastRatio * 10) / 10,
          minRequired: minRatio,
          textColor: el.color,
          backgroundColor: bgColor,
          isLargeText
        })
      }
    }
  })
  
  const totalTextElements = elements.filter(el => el?.type === 'text' && el?.color).length
  const score = totalTextElements > 0 
    ? Math.round(((totalTextElements - contrastIssues.length) / totalTextElements) * 100)
    : 100
  
  return { score, issues: contrastIssues, total: totalTextElements }
}

// Estimate element height based on type and properties
const estimateElementHeight = (element) => {
  if (!element) return 24
  
  if (element.type === 'text') {
    const fontSize = element.fontSize || 16
    const lineHeight = 1.5
    const content = element.content || ''
    const lines = content.split('\n').length
    return Math.max(fontSize * lineHeight * lines, fontSize)
  }
  
  // For non-text elements, use a default size
  return element.height || 40
}

// Check spacing between elements
const checkSpacing = (canvasElements) => {
  const elements = canvasElements || []
  const spacingIssues = []
  const minSpacing = 20 // Minimum recommended spacing in pixels
  
  // Filter out elements without valid positions
  const validElements = elements.filter(el => 
    el && typeof el.y === 'number' && typeof el.x === 'number'
  )
  
  // Sort elements by y position
  const sortedElements = [...validElements].sort((a, b) => a.y - b.y)
  
  for (let i = 0; i < sortedElements.length - 1; i++) {
    const current = sortedElements[i]
    const next = sortedElements[i + 1]
    
    // Check vertical spacing using estimated height
    const currentHeight = estimateElementHeight(current)
    const currentBottom = current.y + currentHeight
    const spacing = next.y - currentBottom
    
    // Only flag if elements are vertically close but not overlapping
    if (spacing >= 0 && spacing < minSpacing) {
      spacingIssues.push({
        elementId1: current.id,
        elementId2: next.id,
        spacing: Math.round(spacing),
        minRequired: minSpacing
      })
    }
  }
  
  const totalComparisons = Math.max(0, sortedElements.length - 1)
  const score = totalComparisons > 0
    ? Math.round(((totalComparisons - spacingIssues.length) / totalComparisons) * 100)
    : 100
  
  return { score, issues: spacingIssues, total: totalComparisons }
}

// Check color matching with template and suggested colors
const checkColorMatching = (template, canvasElements, suggestedColors = []) => {
  const templateColors = extractTemplateColors(template)
  
  // Combine template colors and suggested colors
  const allSuggestedColors = [...new Set([...templateColors, ...suggestedColors])]
  if (allSuggestedColors.length === 0) return { score: 100, matched: 0, total: 0 }
  
  // Normalize color names for comparison
  const normalizeColor = (color) => color?.toLowerCase().replace(/[-\s]/g, '') || ''
  const normalizedSuggestedColors = new Set(allSuggestedColors.map(normalizeColor))
  
  // Also create a set of suggested hex values for direct comparison
  const suggestedHexValues = new Set(
    allSuggestedColors.map(color => getColorHex(color).toLowerCase().trim())
  )
  
  // Get colors actually used in canvas (text colors and backgrounds)
  const usedColors = []
  const usedColorDetails = []
  
  canvasElements.forEach(el => {
    // Check text color
    if (el.color) {
      const colorHex = el.color.toLowerCase().trim()
      const colorName = getColorNameFromHex(el.color)
      // Check if hex matches directly OR normalized name matches
      const normalizedColorName = normalizeColor(colorName)
      const matchesByHex = suggestedHexValues.has(colorHex)
      const matchesByName = colorName && normalizedSuggestedColors.has(normalizedColorName)
      
      if (colorName && colorName !== 'Black' && colorName !== 'White') {
        if (matchesByHex || matchesByName) {
          usedColors.push(normalizedColorName)
        } else {
          usedColors.push(normalizedColorName)
        }
        usedColorDetails.push({ 
          element: el.id, 
          type: 'text', 
          color: colorName,
          hex: colorHex,
          matches: matchesByHex || matchesByName
        })
      }
    }
    // Check background color
    if (el.backgroundColor && el.backgroundColor !== 'transparent') {
      const colorHex = el.backgroundColor.toLowerCase().trim()
      const colorName = getColorNameFromHex(el.backgroundColor)
      // Check if hex matches directly OR normalized name matches
      const normalizedColorName = normalizeColor(colorName)
      const matchesByHex = suggestedHexValues.has(colorHex)
      const matchesByName = colorName && normalizedSuggestedColors.has(normalizedColorName)
      
      if (colorName && colorName !== 'White') {
        if (matchesByHex || matchesByName) {
          usedColors.push(normalizedColorName)
        } else {
          usedColors.push(normalizedColorName)
        }
        usedColorDetails.push({ 
          element: el.id, 
          type: 'background', 
          color: colorName,
          hex: colorHex,
          matches: matchesByHex || matchesByName
        })
      }
    }
  })
  
  const matched = usedColorDetails.filter(detail => detail.matches).length
  const total = usedColorDetails.length
  
  // If no colors to check, return 100% (nothing to compare)
  const score = total > 0 ? Math.round((matched / total) * 100) : 100
  
  return { score, matched, total, unmatched: total - matched }
}

// Check if colors match selected color scheme
const checkColorSchemeMatch = (canvasElements, selectedColors = []) => {
  if (!selectedColors || selectedColors.length === 0) {
    return { score: 100, matched: 0, total: 0, issues: [] }
  }
  
  const normalizeColor = (color) => color?.toLowerCase().replace(/[-\s]/g, '') || ''
  const normalizedSelectedColors = new Set(selectedColors.map(normalizeColor))
  
  const colorDetails = []
  const issues = []
  
  canvasElements.forEach(el => {
    if (el.color) {
      const colorName = getColorNameFromHex(el.color)
      if (colorName && colorName !== 'Black' && colorName !== 'White') {
        const normalizedColorName = normalizeColor(colorName)
        const matches = normalizedSelectedColors.has(normalizedColorName)
        colorDetails.push({ element: el.id, color: colorName, matches })
        if (!matches) {
          issues.push({ elementId: el.id, color: colorName, type: 'text' })
        }
      }
    }
    if (el.backgroundColor && el.backgroundColor !== 'transparent') {
      const colorName = getColorNameFromHex(el.backgroundColor)
      if (colorName && colorName !== 'White') {
        const normalizedColorName = normalizeColor(colorName)
        const matches = normalizedSelectedColors.has(normalizedColorName)
        colorDetails.push({ element: el.id, color: colorName, matches })
        if (!matches) {
          issues.push({ elementId: el.id, color: colorName, type: 'background' })
        }
      }
    }
  })
  
  const total = colorDetails.length
  const matched = colorDetails.filter(d => d.matches).length
  const score = total > 0 ? Math.round((matched / total) * 100) : 100
  
  return { score, matched, total, issues }
}

// Generate template-specific tips
const generateTemplateTips = (template, completeness, fontMatching, colorMatching, requiredSections, contrastCheck, spacingCheck, colorSchemeMatch) => {
  const tips = []
  
  if (!template) return tips
  
  // Required sections tips
  if (requiredSections && requiredSections.metCount < requiredSections.total) {
    const missing = requiredSections.requirements.filter(r => !r.met)
    if (missing.length > 0) {
      tips.push(`Add required sections: ${missing.map(r => r.name).join(', ')}`)
    }
  } else if (requiredSections && requiredSections.metCount === requiredSections.total) {
      tips.push(`All required sections are present`)
  }
  
  // Completeness tips
  if (completeness.missing.length > 0) {
    const missingCount = completeness.missing.length
    const totalCount = completeness.total
    tips.push(`Template completeness: ${completeness.present}/${totalCount} elements (${completeness.score}%)`)
    if (missingCount <= 3) {
      tips.push(`Add ${missingCount} more element${missingCount > 1 ? 's' : ''} to reach 100%`)
    } else {
      tips.push(`Add ${missingCount} missing elements to complete the template`)
    }
  } else if (completeness.total > 0) {
    tips.push(`All ${completeness.total} template elements are present!`)
  }
  
  // Font matching tips
  if (fontMatching && fontMatching.total > 0) {
    if (fontMatching.score === 100) {
      tips.push(`All fonts match the template style`)
    } else if (fontMatching.unmatched > 0) {
      tips.push(`Consider using template fonts: ${fontMatching.matched}/${fontMatching.total} fonts match`)
    }
  }
  
  // Color matching tips
  if (colorMatching && colorMatching.total > 0) {
    if (colorMatching.score === 100) {
      tips.push(`Colors match the template palette`)
    } else if (colorMatching.unmatched > 0) {
      tips.push(`Consider using template colors: ${colorMatching.matched}/${colorMatching.total} colors match`)
    }
  } else if (colorMatching && colorMatching.total === 0) {
    // If no colors are used, don't give 100% - encourage adding colors
    tips.push(`Add colors to improve your design score`)
  }
  
  // Contrast tips
  if (contrastCheck && contrastCheck.issues.length > 0) {
    tips.push(`${contrastCheck.issues.length} text element${contrastCheck.issues.length > 1 ? 's' : ''} need${contrastCheck.issues.length === 1 ? 's' : ''} better contrast`)
  } else if (contrastCheck && contrastCheck.total > 0) {
    tips.push(`All text meets accessibility contrast standards`)
  }
  
  // Spacing tips
  if (spacingCheck && spacingCheck.issues.length > 0) {
    tips.push(`Improve spacing: ${spacingCheck.issues.length} area${spacingCheck.issues.length > 1 ? 's' : ''} need${spacingCheck.issues.length === 1 ? 's' : ''} more space`)
  }
  
  // Color scheme tips
  if (colorSchemeMatch && colorSchemeMatch.issues.length > 0) {
    tips.push(`${colorSchemeMatch.issues.length} color${colorSchemeMatch.issues.length > 1 ? 's' : ''} don't match your selected color scheme`)
  } else if (colorSchemeMatch && colorSchemeMatch.total > 0) {
    tips.push(`Colors match your selected color scheme`)
  }
  
  // Perfect match message
  if (requiredSections?.score === 100 && completeness.score === 100 && fontMatching?.score === 100 && colorMatching?.score === 100 && contrastCheck?.score === 100) {
    tips.push('Perfect! Your design matches the template perfectly')
  }
  
  // Template-specific style tips
  if (template.styleTags && Array.isArray(template.styleTags)) {
    if (template.styleTags.includes('Minimal') || template.styleTags.includes('Clean')) {
      tips.push('Maintain clean spacing and avoid overcrowding')
    }
    if (template.styleTags.includes('Bold') || template.styleTags.includes('High contrast')) {
      tips.push('Use strong color contrasts for visual impact')
    }
    if (template.styleTags.includes('Professional') || template.styleTags.includes('Corporate')) {
      tips.push('Keep typography consistent and aligned')
    }
    if (template.styleTags.includes('Infographic') || template.styleTags.includes('Data-forward')) {
      tips.push('Use icons and visual elements to enhance readability')
    }
    if (template.styleTags.includes('Illustrated') || template.styleTags.includes('Playful')) {
      tips.push('Incorporate visual elements to add personality')
    }
  }
  
  // Poster type specific guidance
  if (template.posterTypes?.includes('RESEARCH/ACADEMIC POSTER')) {
    tips.push('Ensure text hierarchy guides the reader through your content')
  }
  if (template.posterTypes?.includes('SOCIAL EVENT POSTER')) {
    tips.push('Make key event information (date, time, location) prominent')
  }
  if (template.posterTypes?.includes('ORGANIZATIONAL')) {
    tips.push('Maintain brand consistency with organizational colors')
  }
  
  // Template description as tip if available
  if (template.description && completeness.score === 100) {
    tips.push(template.description)
  }
  
  return tips.slice(0, 5) // Limit to 5 tips max
}

/**
 * Generate suggestions and calculate design score based on template requirements
 * 
 * SCORING LOGIC:
 * - 25% Required Sections: Need 1 title, 1 subtitle/heading, 1 body text, 1 element
 * - 25% Template Completeness: All template elements (by ID) must be present
 * - 20% Font Matching: ALL suggested fonts (template) count as 100%
 * - 15% Color Matching: ALL suggested colors (template palette) count as 100%
 * - 10% Color Contrast: WCAG AA compliance (4.5:1 for normal, 3:1 for large)
 * - 5% Spacing: Minimum spacing between elements
 * 
 * SUGGESTION CARDS (Grammarly-style):
 * - Font card: Only appears if current font is NOT in suggested fonts
 * - Text color card: Only appears if current text color is NOT in suggested colors
 * - Background color card: Only appears if current background is NOT in suggested colors
 * - Contrast card: Appears if text/background contrast doesn't meet WCAG AA
 * - Color scheme card: Appears if color doesn't match selected color scheme
 * - Spacing card: Appears if elements are too close together
 * - Cards disappear automatically when any correct option is applied
 * - Cards reappear if user changes back to incorrect option
 */
export const getSuggestions = (template, canvasElements = [], canvasBackground = null, selectedColors = []) => {
  // If no template, return default suggestions
  if (!template) {
    return {
      fonts: ['Arial'],
      colors: ['Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Orange'],
      designScore: 0,
      suggestions: ['Select a template to get started'],
      allSuggestedFonts: ['Arial']
    }
  }
  
  // Extract fonts and colors from template
  const templateFonts = extractTemplateFonts(template)
  const templateColors = extractTemplateColors(template)
  
  // Check required sections
  const requiredSections = checkRequiredSections(canvasElements)
  
  // Check completeness
  const completeness = checkTemplateCompleteness(template, canvasElements)
  
  // Use ONLY template fonts (no common fonts)
  const allSuggestedFonts = templateFonts.length > 0 
    ? templateFonts 
    : ['Arial'] // Fallback if template has no fonts
  
  // Use ONLY template colors (no common colors)
  const colors = templateColors.length > 0
    ? templateColors
    : [] // No colors if template has no colors defined
  
  // Check font matching with ALL suggested fonts
  const fontMatching = checkFontMatching(template, canvasElements, allSuggestedFonts)
  
  // Check color matching with ALL suggested colors
  const colorMatching = checkColorMatching(template, canvasElements, colors)
  
  // Check color contrast
  const contrastCheck = checkColorContrast(canvasElements, canvasBackground)
  
  // Check spacing
  const spacingCheck = checkSpacing(canvasElements)
  
  // Check color scheme match
  const colorSchemeMatch = checkColorSchemeMatch(canvasElements, selectedColors)
  
  // Calculate overall score with new weighting
  const overallScore = Math.round(
    (requiredSections.score * 0.25) + 
    (completeness.score * 0.25) + 
    (fontMatching.score * 0.20) + 
    (colorMatching.score * 0.15) +
    (contrastCheck.score * 0.10) +
    (spacingCheck.score * 0.05)
  )
  
  // Generate tips
  const tips = generateTemplateTips(template, completeness, fontMatching, colorMatching, requiredSections, contrastCheck, spacingCheck, colorSchemeMatch)
  
  // For display, use all template fonts
  const fonts = allSuggestedFonts
  
  // Generate element-specific suggestions (use all fonts, not just displayed ones)
  const elementSuggestions = generateElementSuggestions(
    template, 
    canvasElements, 
    allSuggestedFonts, 
    colors, 
    canvasBackground,
    selectedColors,
    contrastCheck,
    spacingCheck
  )
  
  return {
    fonts: fonts,
    colors: colors,
    designScore: overallScore,
    suggestions: tips,
    elementSuggestions: elementSuggestions,
    usedFonts: getUsedFonts(canvasElements),
    usedColors: getUsedColors(canvasElements),
    allSuggestedFonts: allSuggestedFonts // Include all fonts for matching
  }
}

// Get fonts currently used in canvas
const getUsedFonts = (canvasElements) => {
  if (!Array.isArray(canvasElements)) return []
  return canvasElements
    .filter(el => el?.type === 'text' && el?.font)
    .map(el => normalizeFont(el.font))
    .filter(font => font)
}

// Get colors currently used in canvas (normalized to lowercase hex)
const getUsedColors = (canvasElements) => {
  if (!Array.isArray(canvasElements)) return []
  const colors = new Set()
  canvasElements.forEach(el => {
    if (el?.color && typeof el.color === 'string') {
      const normalized = el.color.toLowerCase().trim()
      if (normalized && normalized !== 'transparent') colors.add(normalized)
    }
    if (el?.backgroundColor && typeof el.backgroundColor === 'string' && el.backgroundColor !== 'transparent') {
      const normalized = el.backgroundColor.toLowerCase().trim()
      if (normalized) colors.add(normalized)
    }
  })
  return Array.from(colors)
}

// Generate element-specific suggestions (Grammarly-style)
const generateElementSuggestions = (template, canvasElements, suggestedFonts, suggestedColors, canvasBackground, selectedColors, contrastCheck, spacingCheck) => {
  const suggestions = []
  
  // Defensive checks for inputs
  if (!template?.layout?.elements) return suggestions
  const elements = Array.isArray(canvasElements) ? canvasElements : []
  const fonts = Array.isArray(suggestedFonts) ? suggestedFonts : []
  const colors = Array.isArray(suggestedColors) ? suggestedColors : []
  const schemeColors = Array.isArray(selectedColors) ? selectedColors : []
  const bgColor = canvasBackground || '#ffffff'
  
  // Check for missing elements
  const templateElementIds = new Set(template.layout.elements.map(el => el?.id).filter(Boolean))
  const canvasElementIds = new Set(elements.map(el => el?.id).filter(Boolean))
  const missingElements = template.layout.elements.filter(el => el?.id && !canvasElementIds.has(el.id))
  
  missingElements.forEach(element => {
    suggestions.push({
      type: 'missing-element',
      elementId: element.id,
      elementType: element.type,
      message: `Missing ${element.type === 'text' ? 'text element' : 'icon'}: ${element.id}`,
      nextStep: `Add this element from the toolbar to complete the template structure`,
      designPrinciple: 'Completeness',
      action: 'add',
      priority: 'high'
    })
  })
  
  // Check each canvas element for improvements
  elements.forEach(element => {
    if (!element || !element.id) return
    
    if (element.type === 'text') {
      const normalizedFont = normalizeFont(element.font)
      const normalizedSuggestedFonts = fonts.map(normalizeFont).filter(f => f)
      
      // Font suggestion card - ONLY if current font is NOT in suggested fonts
      const isUsingCorrectFont = normalizedSuggestedFonts.includes(normalizedFont)
      
      if (!isUsingCorrectFont && fonts.length > 0) {
        // Single card with all font options
        suggestions.push({
          type: 'font-group',
          elementId: element.id,
          currentValue: element.font || 'Unknown',
          options: fonts.slice(0, 5), // Show top 5 fonts as options
          message: `Font doesn't match template`,
          nextStep: `Select one of the template fonts below to maintain visual consistency`,
          designPrinciple: 'Hierarchy',
          action: 'update',
          priority: 'high'
        })
      }
      
      // Text color card - check if using a suggested color
      const currentTextColor = element.color?.toLowerCase()?.trim() || ''
      const currentTextColorName = getColorNameFromHex(element.color)
      const normalizedCurrentTextColor = currentTextColorName?.toLowerCase()?.replace(/[-\s]/g, '') || ''
      
      // Check both by name (normalized) and by hex value
      const isUsingCorrectTextColor = colors.some(color => {
        if (!color) return false
        const normalizedSuggestedColor = color.toLowerCase().replace(/[-\s]/g, '')
        const suggestedHex = getColorHex(color)?.toLowerCase()?.trim() || ''
        // Match by normalized name OR by exact hex
        return normalizedSuggestedColor === normalizedCurrentTextColor || 
               suggestedHex === currentTextColor
      })
      
      if (!isUsingCorrectTextColor && colors.length > 0 && currentTextColorName && currentTextColorName !== 'Black') {
        // Single card with all color options
        suggestions.push({
          type: 'text-color-group',
          elementId: element.id,
          currentValue: element.color || '#000000',
          options: colors.map(color => ({
            name: color,
            hex: getColorHex(color) || '#000000'
          })),
          message: `Text color doesn't match template`,
          nextStep: `Choose a color from the template palette to maintain design consistency`,
          designPrinciple: 'Consistency',
          action: 'update',
          priority: 'medium'
        })
      }
    }
    
    // Background color card - check if using a suggested color
    if (element.backgroundColor && element.backgroundColor !== 'transparent') {
      const currentBgColor = element.backgroundColor?.toLowerCase()?.trim() || ''
      const currentBgColorName = getColorNameFromHex(element.backgroundColor)
      const normalizedCurrentBgColor = currentBgColorName?.toLowerCase()?.replace(/[-\s]/g, '') || ''
      
      // Check both by name (normalized) and by hex value
      const isUsingCorrectBgColor = colors.some(color => {
        if (!color) return false
        const normalizedSuggestedColor = color.toLowerCase().replace(/[-\s]/g, '')
        const suggestedHex = getColorHex(color)?.toLowerCase()?.trim() || ''
        // Match by normalized name OR by exact hex
        return normalizedSuggestedColor === normalizedCurrentBgColor || 
               suggestedHex === currentBgColor
      })
      
      if (!isUsingCorrectBgColor && colors.length > 0 && currentBgColorName && currentBgColorName !== 'White') {
        // Single card with all background color options
        suggestions.push({
          type: 'background-color-group',
          elementId: element.id,
          currentValue: element.backgroundColor || '#ffffff',
          options: colors.map(color => ({
            name: color,
            hex: getColorHex(color) || '#000000'
          })),
          message: `Background color doesn't match template`,
          nextStep: `Select a template color to align with the design palette`,
          designPrinciple: 'Consistency',
          action: 'update',
          priority: 'medium'
        })
      }
    }
    
    // Contrast suggestion for text elements (check all text elements, not just those with backgrounds)
    if (element.type === 'text' && element.color) {
      const elementBg = element.backgroundColor && element.backgroundColor !== 'transparent' 
        ? element.backgroundColor 
        : bgColor
      
      const contrastRatio = getContrastRatio(element.color, elementBg)
      const fontSize = element.fontSize || 16
      const fontWeight = element.fontWeight || 400
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700)
      const minRatio = isLargeText ? 3 : 4.5
      
      if (contrastRatio < minRatio) {
        const normalizeColorName = (color) => color?.toLowerCase()?.replace(/[-\s]/g, '') || ''
        const betterColors = []
        
        // Priority 1: Try selected color scheme colors first (if they meet contrast)
        if (schemeColors.length > 0) {
          const schemeColorOptions = schemeColors.map(color => ({
            name: color,
            hex: getColorHex(color) || '#000000'
          })).filter(c => {
            const testRatio = getContrastRatio(c.hex, elementBg)
            return testRatio >= minRatio
          })
          betterColors.push(...schemeColorOptions)
        }
        
        // Priority 2: Try template colors (if they meet contrast and aren't already in betterColors)
        if (colors.length > 0) {
          const templateColorOptions = colors.map(color => ({
            name: color,
            hex: getColorHex(color) || '#000000'
          })).filter(c => {
            const testRatio = getContrastRatio(c.hex, elementBg)
            const alreadyAdded = betterColors.some(bc => bc.hex === c.hex)
            return testRatio >= minRatio && !alreadyAdded
          })
          betterColors.push(...templateColorOptions)
        }
        
        // Priority 3: Only suggest black/white as last resort if nothing else works
        if (betterColors.length === 0) {
          const blackRatio = getContrastRatio('#000000', elementBg)
          const whiteRatio = getContrastRatio('#ffffff', elementBg)
          if (blackRatio >= minRatio) {
            betterColors.push({ name: 'Black', hex: '#000000' })
          }
          if (whiteRatio >= minRatio) {
            betterColors.push({ name: 'White', hex: '#ffffff' })
          }
        }
        
        if (betterColors.length > 0) {
          // Check if current color matches selected scheme
          const currentColorName = getColorNameFromHex(element.color)
          const normalizedCurrentColor = normalizeColorName(currentColorName)
          const normalizedSchemeColorSet = schemeColors.length > 0
            ? new Set(schemeColors.map(normalizeColorName))
            : new Set()
          
          // Check if any of the suggested colors are from the selected scheme
          const suggestedSchemeColors = betterColors.filter(c => {
            const cName = getColorNameFromHex(c.hex)
            return cName && normalizedSchemeColorSet.has(normalizeColorName(cName))
          })
          const hasSchemeOptions = suggestedSchemeColors.length > 0
          
          suggestions.push({
            type: 'contrast-group',
            elementId: element.id,
            currentValue: element.color || '#000000',
            backgroundColor: elementBg,
            contrastRatio: Math.round(contrastRatio * 10) / 10,
            minRequired: minRatio,
            options: betterColors.slice(0, 5),
            message: `Text contrast is too low (${Math.round(contrastRatio * 10) / 10}:1, need ${minRatio}:1)`,
            nextStep: hasSchemeOptions
              ? `Choose a color from your selected scheme that meets accessibility standards (shown first)`
              : `Choose a color that meets contrast requirements${schemeColors.length > 0 ? ' - consider colors from your selected scheme if available' : ''}`,
            designPrinciple: 'Contrast',
            action: 'update',
            priority: 'high'
          })
        }
      }
    }
    
    // Color scheme suggestion (only show if contrast is already good)
    if (schemeColors.length > 0) {
      const normalizeColorNameLocal = (color) => color?.toLowerCase()?.replace(/[-\s]/g, '') || ''
      const normalizedSchemeColors = new Set(schemeColors.map(normalizeColorNameLocal))
      
      // Check text color - only show if:
      // 1. No contrast suggestion exists (contrast is good)
      // 2. Contrast actually meets requirements
      const hasContrastSuggestion = suggestions.some(s => 
        s.elementId === element.id && s.type === 'contrast-group'
      )
      
      // Also check if contrast is actually good
      let contrastIsGood = true
      if (element.type === 'text' && element.color) {
        const elementBgForScheme = element.backgroundColor && element.backgroundColor !== 'transparent' 
          ? element.backgroundColor 
          : bgColor
        const schemeContrastRatio = getContrastRatio(element.color, elementBgForScheme)
        const fontSize = element.fontSize || 16
        const fontWeight = element.fontWeight || 400
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700)
        const minRatio = isLargeText ? 3 : 4.5
        contrastIsGood = schemeContrastRatio >= minRatio
      }
      
      // Only show color scheme suggestion if contrast is good AND no contrast suggestion exists
      if (element.color && !hasContrastSuggestion && contrastIsGood) {
        const colorName = getColorNameFromHex(element.color)
        if (colorName && colorName !== 'Black' && colorName !== 'White') {
          const normalizedColorName = normalizeColorNameLocal(colorName)
          if (!normalizedSchemeColors.has(normalizedColorName)) {
            const matchingColors = schemeColors.map(color => ({
              name: color,
              hex: getColorHex(color) || '#000000'
            }))
            
            suggestions.push({
              type: 'color-scheme-group',
              elementId: element.id,
              currentValue: element.color || '#000000',
              currentColorName: colorName,
              options: matchingColors,
              message: `Color doesn't match your selected color scheme`,
              nextStep: `Pick a color from your selected scheme to maintain visual harmony`,
              designPrinciple: 'Color Harmony',
              action: 'update',
              priority: 'medium'
            })
          }
        }
      }
      
      // Check background color
      if (element.backgroundColor && element.backgroundColor !== 'transparent') {
        const bgColorName = getColorNameFromHex(element.backgroundColor)
        if (bgColorName && bgColorName !== 'White') {
          const normalizedBgColorName = normalizeColorNameLocal(bgColorName)
          if (!normalizedSchemeColors.has(normalizedBgColorName)) {
            const matchingColors = schemeColors.map(color => ({
              name: color,
              hex: getColorHex(color) || '#000000'
            }))
            
            suggestions.push({
              type: 'color-scheme-bg-group',
              elementId: element.id,
              currentValue: element.backgroundColor || '#ffffff',
              currentColorName: bgColorName,
              options: matchingColors,
              message: `Background color doesn't match your selected color scheme`,
              nextStep: `Select a background color from your chosen scheme for better cohesion`,
              designPrinciple: 'Color Harmony',
              action: 'update',
              priority: 'medium'
            })
          }
        }
      }
    }
    
    // Spacing suggestions - only show for the first element in each pair to avoid duplicates
    if (spacingCheck?.issues?.length > 0) {
      const elementSpacingIssue = spacingCheck.issues.find(issue => 
        issue.elementId1 === element.id || issue.elementId2 === element.id
      )
      
      if (elementSpacingIssue) {
        // Only show suggestion for elementId1 to avoid showing duplicate suggestions for both elements
        if (elementSpacingIssue.elementId1 === element.id) {
          const otherElement = elements.find(el => el?.id === elementSpacingIssue.elementId2)
          const otherElementLabel = otherElement 
            ? (otherElement.type === 'text' 
                ? (otherElement.content?.substring(0, 30) || 'element')
                : (otherElement.elementType || 'element'))
            : 'adjacent element'
          
          suggestions.push({
            type: 'spacing-group',
            elementId: element.id,
            spacing: elementSpacingIssue.spacing,
            minRequired: elementSpacingIssue.minRequired,
            otherElementId: elementSpacingIssue.elementId2,
            otherElementLabel: otherElementLabel,
            message: `Increase spacing (currently ${elementSpacingIssue.spacing}px, need ${elementSpacingIssue.minRequired}px)`,
            nextStep: `Drag this element further from "${otherElementLabel}" to improve readability and visual breathing room`,
            designPrinciple: 'Spacing',
            action: 'update',
            priority: 'low'
          })
        }
      }
    }
  })
  
  return suggestions
}

