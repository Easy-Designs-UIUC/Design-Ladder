import React, { useState, useMemo } from 'react'
import { getColorHex } from '../utils/colorUtils'
import './SuggestionsSidebar.css'

// Normalize font for comparison
const normalizeFont = (font) => {
  if (!font) return ''
  const firstFont = font.split(',')[0].trim()
  return firstFont.replace(/['"]/g, '').toLowerCase().replace(/[\s-]/g, '')
}

function SuggestionsSidebar({ suggestions, onApplySuggestion, selectedElement, canvasElements }) {
  const [expandedSection, setExpandedSection] = useState({
    fonts: true,
    colors: true,
    elements: true
  })

  const toggleSection = (section) => {
    setExpandedSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  
  // Check if a font is currently used
  const isFontUsed = (font) => {
    if (!suggestions.usedFonts) return false
    const normalizedFont = normalizeFont(font)
    return suggestions.usedFonts.some(usedFont => normalizeFont(usedFont) === normalizedFont)
  }
  
  // Check if a font is in the suggested fonts list (for scoring)
  const isFontSuggested = (font) => {
    if (!suggestions.allSuggestedFonts) {
      // Fallback: check against displayed fonts
      return suggestions.fonts?.some(f => normalizeFont(f) === normalizeFont(font)) || false
    }
    return suggestions.allSuggestedFonts.some(f => normalizeFont(f) === normalizeFont(font))
  }
  
  // Check if a color is currently used
  const isColorUsed = (color) => {
    if (!suggestions.usedColors) return false
    const colorHex = getColorHex(color).toLowerCase()
    return suggestions.usedColors.includes(colorHex)
  }
  
  // Get suggestions for selected element
  const elementSuggestions = useMemo(() => {
    if (!selectedElement || !suggestions.elementSuggestions) {
      console.log('No element suggestions:', { selectedElement, hasElementSuggestions: !!suggestions.elementSuggestions })
      return []
    }
    const filtered = suggestions.elementSuggestions.filter(s => s.elementId === selectedElement)
    console.log('Element suggestions for', selectedElement, ':', filtered)
    return filtered
  }, [selectedElement, suggestions.elementSuggestions])

  return (
    <div className="suggestions-sidebar">
      <div className="design-score">
        <h3 className="score-title">Design Score</h3>
        <div className="score-bar-container">
          <div 
            className="score-bar"
            style={{ width: `${suggestions.designScore}%` }}
          >
            {suggestions.designScore}%
          </div>
        </div>
      </div>

      {selectedElement ? (
        <div className="suggestions-container">
          <h3 className="suggestions-header">
            {elementSuggestions.length > 0 ? 'Suggestions for this element' : 'No suggestions'}
          </h3>
          {elementSuggestions.length > 0 ? (
            <div className="grammarly-cards">
              {elementSuggestions.map((suggestion, index) => {
                // Determine card type
                const isFontGroup = suggestion.type === 'font-group'
                const isTextColorGroup = suggestion.type === 'text-color-group'
                const isBgColorGroup = suggestion.type === 'background-color-group'
                const isColorGroup = isTextColorGroup || isBgColorGroup
                
                return (
                  <div key={index} className="grammarly-card">
                    <div className="card-icon">
                      {isFontGroup ? '🔤' : isColorGroup ? '🎨' : '✨'}
                    </div>
                    <div className="card-content">
                      <div className="card-message">{suggestion.message}</div>
                      
                      {isFontGroup && (
                        <div className="card-options">
                          {suggestion.options.map((font) => (
                            <button
                              key={font}
                              className="option-btn font-option"
                              style={{ fontFamily: font }}
                              onClick={() => onApplySuggestion('font', font)}
                            >
                              {font}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {isColorGroup && (
                        <div className="card-options color-options">
                          {suggestion.options.map((color) => (
                            <button
                              key={color.name}
                              className="option-btn color-option"
                              onClick={() => {
                                if (isTextColorGroup) {
                                  onApplySuggestion('text-color', color.hex)
                                } else {
                                  onApplySuggestion('color', color.hex)
                                }
                              }}
                            >
                              <span 
                                className="color-option-swatch" 
                                style={{ backgroundColor: color.hex }}
                              />
                              {color.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="no-suggestions-message">
              <p>✓ All suggestions applied</p>
              <p className="no-suggestions-subtitle">This element looks great!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="no-selection-message">
          <p>👆 Select an element to see suggestions</p>
        </div>
      )}

      {suggestions.suggestions && suggestions.suggestions.length > 0 && (
        <div className="suggestions-tips">
          <h3 className="tips-title">💡 General Tips</h3>
          <div className="tips-cards">
            {suggestions.suggestions.map((tip, index) => (
              <div key={index} className="tip-card">
                <span className="tip-bullet">•</span>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SuggestionsSidebar

