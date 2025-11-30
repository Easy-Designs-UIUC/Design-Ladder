import React, { useState, useMemo } from 'react'
import { getColorHex } from '../utils/colorUtils'
import './SuggestionsSidebar.css'

// Normalize font for comparison
const normalizeFont = (font) => {
  if (!font) return ''
  const firstFont = font.split(',')[0].trim()
  return firstFont.replace(/['"]/g, '').toLowerCase().replace(/[\s-]/g, '')
}

// Generate unique key for a suggestion
const getSuggestionKey = (suggestion, index) => {
  return `${suggestion.elementId}-${suggestion.type}-${index}`
}

function SuggestionsSidebar({ suggestions, onApplySuggestion, selectedElement, canvasElements, onSelectElement, ignoredSuggestions, onIgnoreSuggestion, onUnignoreSuggestion }) {
  const [activeTab, setActiveTab] = useState('active')
  
  // Get all suggestions (not filtered by selected element)
  const allSuggestions = useMemo(() => {
    return suggestions.elementSuggestions || []
  }, [suggestions.elementSuggestions])
  
  // Filter suggestions based on ignored state
  const activeSuggestions = useMemo(() => {
    return allSuggestions.filter((suggestion, index) => {
      const key = getSuggestionKey(suggestion, index)
      return !ignoredSuggestions.has(key)
    })
  }, [allSuggestions, ignoredSuggestions])
  
  const ignoredSuggestionsList = useMemo(() => {
    return allSuggestions.filter((suggestion, index) => {
      const key = getSuggestionKey(suggestion, index)
      return ignoredSuggestions.has(key)
    })
  }, [allSuggestions, ignoredSuggestions])
  
  // Group suggestions by element ID for better organization
  const groupSuggestionsByElement = (suggestionsList) => {
    const grouped = {}
    suggestionsList.forEach((suggestion, index) => {
      if (!grouped[suggestion.elementId]) {
        grouped[suggestion.elementId] = []
      }
      grouped[suggestion.elementId].push({ ...suggestion, originalIndex: index })
    })
    return grouped
  }
  
  const activeSuggestionsByElement = useMemo(() => {
    return groupSuggestionsByElement(activeSuggestions)
  }, [activeSuggestions])
  
  const ignoredSuggestionsByElement = useMemo(() => {
    return groupSuggestionsByElement(ignoredSuggestionsList)
  }, [ignoredSuggestionsList])
  
  // Get element info for display
  const getElementInfo = (elementId) => {
    const element = canvasElements.find(el => el.id === elementId)
    if (!element) return null
    
    if (element.type === 'text') {
      const content = element.content || 'Text element'
      const truncated = content.length > 30 ? content.substring(0, 30) + '...' : content
      return { type: element.type, label: truncated, style: element.style }
    } else {
      return { type: element.type, label: element.elementType || 'Element' }
    }
  }
  
  const currentSuggestions = activeTab === 'active' ? activeSuggestionsByElement : ignoredSuggestionsByElement
  const currentSuggestionsList = activeTab === 'active' ? activeSuggestions : ignoredSuggestionsList

  return (
    <div className="suggestions-sidebar">
      <div className="suggestions-sidebar-scrollable">
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

        <div className="suggestions-container">
          <div className="suggestions-tabs">
            <button
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active ({activeSuggestions.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'ignored' ? 'active' : ''}`}
              onClick={() => setActiveTab('ignored')}
            >
              Ignored ({ignoredSuggestionsList.length})
            </button>
          </div>
          
          {currentSuggestionsList.length > 0 ? (
            <div className="grammarly-cards">
              {Object.entries(currentSuggestions).map(([elementId, elementSuggestions]) => {
                const elementInfo = getElementInfo(elementId)
                const isSelected = selectedElement === elementId
                
                return (
                  <div key={elementId} className="element-suggestions-group">
                    <div 
                      className={`element-header ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectElement && onSelectElement(elementId)}
                    >
                      <div className="element-header-content">
                        <span className="element-type-indicator">
                          {elementInfo?.type === 'text' ? 'T' : 'E'}
                        </span>
                        <span className="element-label">
                          {elementInfo?.label || elementId}
                        </span>
                        {elementInfo?.style && (
                          <span className="element-style-badge">{elementInfo.style}</span>
                        )}
                      </div>
                      <span className="element-suggestion-count">
                        {elementSuggestions.length} {elementSuggestions.length === 1 ? 'issue' : 'issues'}
                      </span>
                    </div>
                    
                    <div className="element-suggestions-list">
                      {elementSuggestions.map((suggestion, index) => {
                        const suggestionKey = getSuggestionKey(suggestion, suggestion.originalIndex !== undefined ? suggestion.originalIndex : index)
                        const isIgnored = ignoredSuggestions.has(suggestionKey)
                        
                        // Determine card type
                        const isFontGroup = suggestion.type === 'font-group'
                        const isTextColorGroup = suggestion.type === 'text-color-group'
                        const isBgColorGroup = suggestion.type === 'background-color-group'
                        const isContrastGroup = suggestion.type === 'contrast-group'
                        const isColorSchemeGroup = suggestion.type === 'color-scheme-group'
                        const isColorSchemeBgGroup = suggestion.type === 'color-scheme-bg-group'
                        const isSpacingGroup = suggestion.type === 'spacing-group'
                        const isMissingElement = suggestion.type === 'missing-element'
                        const isColorGroup = isTextColorGroup || isBgColorGroup || isContrastGroup || isColorSchemeGroup || isColorSchemeBgGroup
                        
                        return (
                          <div 
                            key={`${elementId}-${index}`} 
                            className={`grammarly-card ${isSelected ? 'highlighted' : ''} ${isIgnored ? 'ignored' : ''}`}
                            onClick={() => onSelectElement && onSelectElement(elementId)}
                          >
                            <div className="card-icon">
                              {isFontGroup ? 'F' : isColorGroup ? 'C' : isSpacingGroup ? 'S' : isMissingElement ? '+' : 'I'}
                            </div>
                            <div className="card-content">
                              <div className="card-header">
                                <div className="card-message">{suggestion.message}</div>
                                <div className="card-actions">
                                  {suggestion.designPrinciple && (
                                    <span className="design-principle-badge">{suggestion.designPrinciple}</span>
                                  )}
                                  {activeTab === 'active' ? (
                                    <button
                                      className="ignore-btn"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onIgnoreSuggestion && onIgnoreSuggestion(suggestionKey)
                                      }}
                                      title="Ignore this suggestion"
                                    >
                                      Ignore
                                    </button>
                                  ) : (
                                    <button
                                      className="unignore-btn"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onUnignoreSuggestion && onUnignoreSuggestion(suggestionKey)
                                      }}
                                      title="Restore this suggestion"
                                    >
                                      Restore
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {suggestion.nextStep && (
                                <div className="card-next-step">
                                  <span className="next-step-label">Next step:</span> {suggestion.nextStep}
                                </div>
                              )}
                              
                              {isFontGroup && (
                                <div className="card-options">
                                  {suggestion.options.map((font) => (
                                    <button
                                      key={font}
                                      className="option-btn font-option"
                                      style={{ fontFamily: font }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (selectedElement === elementId) {
                                          onApplySuggestion('font', font)
                                        } else {
                                          onSelectElement && onSelectElement(elementId)
                                        }
                                      }}
                                    >
                                      {font}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {(isTextColorGroup || isBgColorGroup || isContrastGroup || isColorSchemeGroup || isColorSchemeBgGroup) && (
                                <div className="card-options color-options">
                                  {suggestion.options.map((color) => (
                                    <button
                                      key={color.name || color.hex}
                                      className="option-btn color-option"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (selectedElement === elementId) {
                                          if (isTextColorGroup || isContrastGroup || isColorSchemeGroup) {
                                            onApplySuggestion('text-color', color.hex)
                                          } else {
                                            onApplySuggestion('color', color.hex)
                                          }
                                        } else {
                                          onSelectElement && onSelectElement(elementId)
                                        }
                                      }}
                                    >
                                      <span 
                                        className="color-option-swatch" 
                                        style={{ backgroundColor: color.hex }}
                                      />
                                      {color.name || color.hex}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {isSpacingGroup && (
                                <div className="card-options">
                                  <div className="spacing-info">
                                    <p>Current spacing: {suggestion.spacing}px</p>
                                    <p>Recommended: {suggestion.minRequired}px minimum</p>
                                    <p className="spacing-hint">Drag elements further apart to improve spacing</p>
                                  </div>
                                </div>
                              )}
                              
                              {isMissingElement && (
                                <div className="card-options">
                                  <div className="missing-element-info">
                                    <p className="missing-element-hint">Add this element from the toolbar to complete your design</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="no-suggestions-message">
              <p>No suggestions</p>
              <p className="no-suggestions-subtitle">Your design looks great!</p>
            </div>
          )}
        </div>

        {suggestions.suggestions && suggestions.suggestions.length > 0 && (
          <div className="suggestions-tips">
            <h3 className="tips-title">General Tips</h3>
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
    </div>
  )
}

export default SuggestionsSidebar

