import { getColorHex, HEX_TO_COLOR_MAP } from '../utils/colorUtils'
import { checkContrastWCAG, checkFontSize, checkLineHeight, generateContrastOptions } from '../utils/wcagUtils'

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
  
  const extractedFonts = Array.from(fonts)
  console.log('Extracted template fonts:', extractedFonts)
  return extractedFonts
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
  
  const extractedColors = Array.from(colors)
  console.log('Extracted template colors:', extractedColors)
  return extractedColors
}

// Check if all template elements are present in canvas
const checkTemplateCompleteness = (template, canvasElements) => {
  if (!template?.layout?.elements) return { score: 0, missing: [], total: 0 }
  
  const templateElementIds = new Set(
    template.layout.elements.map(el => el.id)
  )
  const canvasElementIds = new Set(
    canvasElements.map(el => el.id)
  )
  
  const missing = template.layout.elements
    .filter(el => !canvasElementIds.has(el.id))
    .map(el => el.id)
  
  const total = templateElementIds.size
  const present = total - missing.length
  
  // Score is 100% if all elements are present, otherwise percentage
  const score = total > 0 ? Math.round((present / total) * 100) : 0
  
  return { score, missing, total, present }
}

// Normalize font names for comparison
const normalizeFont = (font) => {
  if (!font) return ''
  const firstFont = font.split(',')[0].trim()
  return firstFont.replace(/['"]/g, '').toLowerCase().replace(/[\s-]/g, '')
}

// Check font matching with template - now checks against suggested fonts too
const checkFontMatching = (template, canvasElements, suggestedFonts = []) => {
  const templateFonts = extractTemplateFonts(template)
  
  // Combine template fonts and suggested fonts
  const allSuggestedFonts = [...new Set([...templateFonts, ...suggestedFonts])]
  if (allSuggestedFonts.length === 0) return { score: 100, matched: 0, total: 0 }
  
  // Normalize all suggested fonts
  const normalizedSuggestedFonts = new Set(allSuggestedFonts.map(normalizeFont))
  
  // Get fonts actually used in canvas elements
  const textElements = canvasElements.filter(el => el.type === 'text' && el.font)
  const usedFonts = textElements.map(el => normalizeFont(el.font))
  
  if (usedFonts.length === 0) return { score: 100, matched: 0, total: 0 }
  
  // Count how many match suggested fonts (if in suggestions, give 100%)
  const matched = usedFonts.filter(font => {
    return normalizedSuggestedFonts.has(font)
  }).length
  
  const total = usedFonts.length
  
  // Score: percentage of fonts that match suggested fonts
  const score = total > 0 ? Math.round((matched / total) * 100) : 100
  
  return { score, matched, total, unmatched: total - matched }
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
  
  console.log('Used colors in canvas:', usedColorDetails)
  
  if (usedColors.length === 0) return { score: 100, matched: 0, total: 0 }
  
  // Count how many used colors match suggested colors
  // Check both normalized names and hex values from the details
  const matched = usedColorDetails.filter(detail => detail.matches).length
  const total = usedColorDetails.length
  
  // Score: percentage of colors that match template
  const score = total > 0 ? Math.round((matched / total) * 100) : 100
  
  return { score, matched, total, unmatched: total - matched }
}

// Generate template-specific tips with WCAG violation detection
const generateTemplateTips = (template, completeness, fontMatching, colorMatching, canvasElements = [], canvasBackground = null) => {
  const tips = []
  
  if (!template) return tips
  
  const background = canvasBackground || template?.layout?.background || '#ffffff'
  
  // Completeness tips (most important)
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
    tips.push(`✓ All ${completeness.total} template elements are present!`)
  }
  
  // Font matching tips
  if (fontMatching && fontMatching.total > 0) {
    if (fontMatching.score === 100) {
      tips.push(`✓ All fonts match the template style`)
    } else if (fontMatching.unmatched > 0) {
      tips.push(`Consider using template fonts: ${fontMatching.matched}/${fontMatching.total} fonts match`)
    }
  }
  
  // Color matching tips
  if (colorMatching && colorMatching.total > 0) {
    if (colorMatching.score === 100) {
      tips.push(`✓ Colors match the template palette`)
    } else if (colorMatching.unmatched > 0) {
      tips.push(`Consider using template colors: ${colorMatching.matched}/${colorMatching.total} colors match`)
    }
  }
  
  // Perfect match message
  if (completeness.score === 100 && fontMatching?.score === 100 && colorMatching?.score === 100) {
    tips.push('Perfect! Your design matches the template perfectly')
  }
  
  // Template-specific style tips with WCAG rationale
  if (template.styleTags && Array.isArray(template.styleTags)) {
    if (template.styleTags.includes('Minimal') || template.styleTags.includes('Clean')) {
      tips.push('Maintain clean spacing and avoid overcrowding. Adequate white space improves readability and helps users focus on key information (WCAG 1.3.1)')
    }
    if (template.styleTags.includes('Bold') || template.styleTags.includes('High contrast')) {
      tips.push('Use strong color contrasts for visual impact. High contrast (7:1) enhances readability for all users, especially in varied lighting conditions (WCAG 1.4.6)')
    }
    if (template.styleTags.includes('Professional') || template.styleTags.includes('Corporate')) {
      tips.push('Keep typography consistent and aligned. Consistent styling creates clear visual relationships between related content (WCAG 1.3.1)')
    }
    if (template.styleTags.includes('Infographic') || template.styleTags.includes('Data-forward')) {
      tips.push('Use icons and visual elements to enhance readability. Ensure icons meet 3:1 contrast ratio and pair with text labels for clarity (WCAG 1.4.11, 1.4.1)')
    }
    if (template.styleTags.includes('Illustrated') || template.styleTags.includes('Playful')) {
      tips.push('Incorporate visual elements to add personality. Remember to maintain sufficient contrast so decorative elements don\'t interfere with text readability')
    }
  }
  
  // Poster type specific guidance with WCAG rationale
  if (template.posterTypes?.includes('RESEARCH/ACADEMIC POSTER')) {
    tips.push('Ensure text hierarchy guides the reader through your content. Clear headings and structure help readers navigate complex information efficiently (WCAG 1.3.1, 2.4.6)')
  }
  if (template.posterTypes?.includes('SOCIAL EVENT POSTER')) {
    tips.push('Make key event information (date, time, location) prominent. Use size, contrast, and spacing to ensure critical details are easily found and readable')
  }
  if (template.posterTypes?.includes('ORGANIZATIONAL')) {
    tips.push('Maintain brand consistency with organizational colors. Ensure brand colors meet contrast requirements (4.5:1) so text remains readable (WCAG 1.4.3)')
  }
  
  // Template description as tip if available
  if (template.description && completeness.score === 100) {
    tips.push(template.description)
  }
  
  // Dynamic WCAG violation tips - only show if violations exist
  let contrastViolations = 0
  let fontSizeViolations = 0
  let lineHeightViolations = 0
  
  canvasElements.forEach(element => {
    if (element.type === 'text') {
      const textColor = element.color || '#000000'
      const elementBg = element.backgroundColor && element.backgroundColor !== 'transparent' 
        ? element.backgroundColor 
        : background
      const fontSize = element.fontSize || 16
      const isBold = (element.fontWeight || 400) >= 700
      
      const contrastCheck = checkContrastWCAG(textColor, elementBg, fontSize, isBold)
      if (!contrastCheck.passes) contrastViolations++
      
      const elementStyle = element.style || 'body'
      const fontSizeCheck = checkFontSize(fontSize, elementStyle)
      if (!fontSizeCheck.passes) fontSizeViolations++
      
      const lineHeightCheck = checkLineHeight(fontSize, element.lineHeight)
      if (!lineHeightCheck.passes) lineHeightViolations++
    }
  })
  
  // Add actionable WCAG tips only if violations exist
  if (contrastViolations > 0) {
    tips.push({
      type: 'wcag-tip',
      category: 'contrast',
      message: `WCAG 1.4.3: ${contrastViolations} element${contrastViolations > 1 ? 's have' : ' has'} low contrast`,
      rationale: 'Text needs at least 4.5:1 contrast ratio for readability. Low contrast makes content hard to read, especially for users with visual impairments.',
      action: 'check-elements',
      priority: 'high'
    })
  }
  
  if (fontSizeViolations > 0) {
    tips.push({
      type: 'wcag-tip',
      category: 'font-size',
      message: `WCAG 1.4.4: ${fontSizeViolations} element${fontSizeViolations > 1 ? 's have' : ' has'} font size below 12pt`,
      rationale: 'Font sizes below 12pt (16px) reduce readability, especially when viewed from a distance. Text should remain readable when zoomed.',
      action: 'check-elements',
      priority: 'medium'
    })
  }
  
  if (lineHeightViolations > 0) {
    tips.push({
      type: 'wcag-tip',
      category: 'line-height',
      message: `WCAG 1.4.12: ${lineHeightViolations} element${lineHeightViolations > 1 ? 's have' : ' has'} insufficient line spacing`,
      rationale: 'Line height should be 1.5x font size. Adequate spacing improves readability and makes text easier to scan, reducing eye strain.',
      action: 'check-elements',
      priority: 'medium'
    })
  }
  
  // Only show static tips if no violations (positive reinforcement)
  if (contrastViolations === 0 && fontSizeViolations === 0 && lineHeightViolations === 0 && canvasElements.length > 0) {
    tips.push('✓ All text elements meet WCAG contrast requirements (4.5:1)')
    tips.push('✓ All text elements use readable font sizes (12pt+)')
    tips.push('✓ All text elements have adequate line spacing (1.5x)')
  }
  
  return tips.slice(0, 10) // Limit to 10 tips max
}

/**
 * Generate suggestions and calculate design score based on template requirements
 * 
 * SCORING LOGIC:
 * - 50% Completeness: All template elements (by ID) must be present
 * - 25% Font Matching: ALL suggested fonts (template + common) count as 100%
 * - 25% Color Matching: ALL suggested colors (template palette + common) count as 100%
 * 
 * SUGGESTION CARDS (Grammarly-style):
 * - Font card: Only appears if current font is NOT in suggested fonts
 * - Text color card: Only appears if current text color is NOT in suggested colors
 * - Background color card: Only appears if current background is NOT in suggested colors
 * - Cards disappear automatically when any correct option is applied
 * - Cards reappear if user changes back to incorrect option
 */
export const getSuggestions = (template, canvasElements = []) => {
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
  
  console.log('Template info:', {
    name: template.name,
    templateFonts,
    templateColors
  })
  
  // Check completeness
  const completeness = checkTemplateCompleteness(template, canvasElements)
  
  // Use ONLY template fonts (no common fonts)
  const allSuggestedFonts = templateFonts.length > 0 
    ? templateFonts 
    : ['Arial'] // Fallback if template has no fonts
  
  console.log('All suggested fonts (template only):', allSuggestedFonts)
  
  // Use ONLY template colors (no common colors)
  const colors = templateColors.length > 0
    ? templateColors
    : [] // No colors if template has no colors defined
  
  // Check font matching with ALL suggested fonts
  const fontMatching = checkFontMatching(template, canvasElements, allSuggestedFonts)
  
  // Check color matching with ALL suggested colors
  const colorMatching = checkColorMatching(template, canvasElements, colors)
  
  // Calculate WCAG compliance score
  const canvasBackground = template?.layout?.background || null
  const wcagScore = calculateWCAGScore(canvasElements, canvasBackground)
  
  // Calculate overall score: 40% completeness, 20% font matching, 20% color matching, 20% WCAG compliance
  const overallScore = Math.round(
    (completeness.score * 0.4) + 
    (fontMatching.score * 0.2) + 
    (colorMatching.score * 0.2) +
    (wcagScore * 0.2)
  )
  
  // Generate tips with WCAG violation detection
  const tips = generateTemplateTips(template, completeness, fontMatching, colorMatching, canvasElements, canvasBackground)
  
  // For display, use all template fonts
  const fonts = allSuggestedFonts
  
  // Generate element-specific suggestions (use all fonts, not just displayed ones)
  const elementSuggestions = generateElementSuggestions(template, canvasElements, allSuggestedFonts, colors, canvasBackground)
  
  console.log('Generated element suggestions:', elementSuggestions.length, elementSuggestions)

  console.log('Final scoring:', {
    completeness: completeness.score,
    fontMatching: fontMatching.score,
    colorMatching: colorMatching.score,
    wcagCompliance: wcagScore,
    overallScore
  })
  
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
  return canvasElements
    .filter(el => el.type === 'text' && el.font)
    .map(el => normalizeFont(el.font))
}

// Get colors currently used in canvas (normalized to lowercase hex)
const getUsedColors = (canvasElements) => {
  const colors = new Set()
  canvasElements.forEach(el => {
    if (el.color) {
      const normalized = el.color.toLowerCase().trim()
      if (normalized) colors.add(normalized)
    }
    if (el.backgroundColor && el.backgroundColor !== 'transparent') {
      const normalized = el.backgroundColor.toLowerCase().trim()
      if (normalized) colors.add(normalized)
    }
  })
  return Array.from(colors)
}

// Calculate WCAG compliance score (0-100)
const calculateWCAGScore = (canvasElements, canvasBackground) => {
  if (!canvasElements || canvasElements.length === 0) return 100
  
  const background = canvasBackground || '#ffffff'
  let violations = 0
  let totalChecks = 0
  
  canvasElements.forEach(element => {
    if (element.type === 'text') {
      // Check contrast
      const textColor = element.color || '#000000'
      const elementBg = element.backgroundColor && element.backgroundColor !== 'transparent' 
        ? element.backgroundColor 
        : background
      const fontSize = element.fontSize || 16
      const isBold = (element.fontWeight || 400) >= 700
      
      const contrastCheck = checkContrastWCAG(textColor, elementBg, fontSize, isBold)
      totalChecks++
      if (!contrastCheck.passes) violations++
      
      // Check font size
      const elementStyle = element.style || 'body'
      const fontSizeCheck = checkFontSize(fontSize, elementStyle)
      totalChecks++
      if (!fontSizeCheck.passes) violations++
      
      // Check line height
      const lineHeightCheck = checkLineHeight(fontSize, element.lineHeight)
      totalChecks++
      if (!lineHeightCheck.passes) violations++
    }
  })
  
  if (totalChecks === 0) return 100
  const score = Math.round(((totalChecks - violations) / totalChecks) * 100)
  return score
}

// Generate element-specific suggestions (Grammarly-style)
const generateElementSuggestions = (template, canvasElements, suggestedFonts, suggestedColors, canvasBackground = null) => {
  const suggestions = []
  
  if (!template?.layout?.elements) return suggestions
  
  // Get canvas background for contrast checks
  const background = canvasBackground || template?.layout?.background || '#ffffff'
  
  // Check for missing elements
  const templateElementIds = new Set(template.layout.elements.map(el => el.id))
  const canvasElementIds = new Set(canvasElements.map(el => el.id))
  const missingElements = template.layout.elements.filter(el => !canvasElementIds.has(el.id))
  
  missingElements.forEach(element => {
    suggestions.push({
      type: 'missing-element',
      elementId: element.id,
      elementType: element.type,
      message: `Add ${element.type === 'text' ? 'text element' : 'icon'}: ${element.id}`,
      action: 'add',
      priority: 'high'
    })
  })
  
  // Check each canvas element for improvements
  canvasElements.forEach(element => {
    if (element.type === 'text') {
      // WCAG Contrast Check
      const textColor = element.color || '#000000'
      const elementBg = element.backgroundColor && element.backgroundColor !== 'transparent' 
        ? element.backgroundColor 
        : background
      const fontSize = element.fontSize || 16
      const isBold = (element.fontWeight || 400) >= 700
      
      const contrastCheck = checkContrastWCAG(textColor, elementBg, fontSize, isBold)
      
      if (!contrastCheck.passes) {
        const fixOptions = generateContrastOptions(textColor, elementBg, fontSize, isBold)
        suggestions.push({
          type: 'contrast-warning',
          elementId: element.id,
          message: `Text contrast is too low (${contrastCheck.ratio}:1)`,
          rationale: contrastCheck.rationale,
          currentRatio: contrastCheck.ratio,
          requiredRatio: contrastCheck.requiredRatio,
          level: contrastCheck.level,
          options: fixOptions,
          action: 'update',
          priority: 'high'
        })
      }
      
      // WCAG Font Size Check
      const elementStyle = element.style || 'body'
      const fontSizeCheck = checkFontSize(fontSize, elementStyle)
      
      if (!fontSizeCheck.passes) {
        suggestions.push({
          type: 'font-size-warning',
          elementId: element.id,
          message: `Font size is too small (${fontSizeCheck.currentSize}pt)`,
          rationale: fontSizeCheck.rationale,
          currentSize: fontSizeCheck.currentSize,
          minSize: fontSizeCheck.minSize,
          options: [
            { name: `${fontSizeCheck.minSize}pt`, value: fontSizeCheck.minSize },
            { name: `${fontSizeCheck.minSize + 2}pt`, value: fontSizeCheck.minSize + 2 },
            { name: `${fontSizeCheck.minSize + 4}pt`, value: fontSizeCheck.minSize + 4 }
          ],
          action: 'update',
          priority: 'medium'
        })
      }
      
      // WCAG Line Height Check
      const lineHeightCheck = checkLineHeight(fontSize, element.lineHeight)
      
      if (!lineHeightCheck.passes) {
        suggestions.push({
          type: 'line-height-warning',
          elementId: element.id,
          message: `Line height is insufficient (${lineHeightCheck.currentRatio}x)`,
          rationale: lineHeightCheck.rationale,
          currentRatio: lineHeightCheck.currentRatio,
          recommended: lineHeightCheck.recommended,
          options: [
            { name: `${lineHeightCheck.recommended}x`, value: lineHeightCheck.recommended },
            { name: `${lineHeightCheck.recommended + 0.1}x`, value: lineHeightCheck.recommended + 0.1 }
          ],
          action: 'update',
          priority: 'medium'
        })
      }
      
      const normalizedFont = normalizeFont(element.font)
      const normalizedSuggestedFonts = suggestedFonts.map(normalizeFont)
      
      // Font suggestion card - ONLY if current font is NOT in suggested fonts
      const isUsingCorrectFont = normalizedSuggestedFonts.includes(normalizedFont)
      
      console.log('Checking font for element:', element.id, {
        currentFont: element.font,
        normalizedFont,
        suggestedFonts: suggestedFonts.slice(0, 10),
        normalizedSuggestedFonts: normalizedSuggestedFonts.slice(0, 10),
        isUsingCorrectFont,
        willShowSuggestion: !isUsingCorrectFont
      })
      
      if (!isUsingCorrectFont && suggestedFonts.length > 0) {
        console.log('✅ Adding font suggestion card for element:', element.id)
        // Single card with all font options
        suggestions.push({
          type: 'font-group',
          elementId: element.id,
          currentValue: element.font,
          options: suggestedFonts.slice(0, 5), // Show top 5 fonts as options
          message: `Font doesn't match template`,
          action: 'update',
          priority: 'high'
        })
      }
      
      // Text color card - check if using a suggested color
      const currentTextColor = element.color?.toLowerCase().trim()
      const currentTextColorName = getColorNameFromHex(element.color)
      const normalizedCurrentTextColor = currentTextColorName?.toLowerCase().replace(/[-\s]/g, '')
      
      // Check both by name (normalized) and by hex value
      const isUsingCorrectTextColor = suggestedColors.some(color => {
        const normalizedSuggestedColor = color.toLowerCase().replace(/[-\s]/g, '')
        const suggestedHex = getColorHex(color).toLowerCase().trim()
        // Match by normalized name OR by exact hex
        return normalizedSuggestedColor === normalizedCurrentTextColor || 
               suggestedHex === currentTextColor
      })
      
      console.log('Checking text color for element:', element.id, {
        currentHex: element.color,
        currentColorName: currentTextColorName,
        normalizedCurrent: normalizedCurrentTextColor,
        suggestedColors,
        isUsingCorrect: isUsingCorrectTextColor
      })
      
      if (!isUsingCorrectTextColor && suggestedColors.length > 0 && currentTextColorName && currentTextColorName !== 'Black') {
        // Single card with all color options
        suggestions.push({
          type: 'text-color-group',
          elementId: element.id,
          currentValue: element.color,
          options: suggestedColors.map(color => ({
            name: color,
            hex: getColorHex(color)
          })),
          message: `Text color doesn't match template`,
          action: 'update',
          priority: 'medium'
        })
      }
    }
    
    // Background color card - check if using a suggested color
    if (element.backgroundColor && element.backgroundColor !== 'transparent') {
      const currentBgColor = element.backgroundColor?.toLowerCase().trim()
      const currentBgColorName = getColorNameFromHex(element.backgroundColor)
      const normalizedCurrentBgColor = currentBgColorName?.toLowerCase().replace(/[-\s]/g, '')
      
      // Check both by name (normalized) and by hex value
      const isUsingCorrectBgColor = suggestedColors.some(color => {
        const normalizedSuggestedColor = color.toLowerCase().replace(/[-\s]/g, '')
        const suggestedHex = getColorHex(color).toLowerCase().trim()
        // Match by normalized name OR by exact hex
        return normalizedSuggestedColor === normalizedCurrentBgColor || 
               suggestedHex === currentBgColor
      })
      
      console.log('Checking background color for element:', element.id, {
        currentHex: element.backgroundColor,
        currentColorName: currentBgColorName,
        normalizedCurrent: normalizedCurrentBgColor,
        suggestedColors,
        isUsingCorrect: isUsingCorrectBgColor
      })
      
      if (!isUsingCorrectBgColor && suggestedColors.length > 0 && currentBgColorName && currentBgColorName !== 'White') {
        // Single card with all background color options
        suggestions.push({
          type: 'background-color-group',
          elementId: element.id,
          currentValue: element.backgroundColor,
          options: suggestedColors.map(color => ({
            name: color,
            hex: getColorHex(color)
          })),
          message: `Background color doesn't match template`,
          action: 'update',
          priority: 'medium'
        })
      }
    }
  })
  
  return suggestions
}

