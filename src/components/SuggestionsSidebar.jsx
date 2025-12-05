import React, { useState, useMemo } from 'react'
import { getColorHex } from '../utils/colorUtils'
import { getSuggestionKey } from '../utils/suggestionKeyUtils'
import './SuggestionsSidebar.css'

// Normalize font for comparison
const normalizeFont = (font) => {
  if (!font || typeof font !== 'string') return ''
  try {
    const firstFont = font.split(',')[0].trim()
    return firstFont.replace(/['"]/g, '').toLowerCase().replace(/[\s-]/g, '')
  } catch {
    return ''
  }
}

function SuggestionsSidebar({ 
  suggestions = {}, 
  onApplySuggestion, 
  selectedElement, 
  canvasElements = [], 
  onSelectElement, 
  ignoredSuggestions = new Set(), 
  onIgnoreSuggestion, 
  onUnignoreSuggestion 
}) {
  const [activeTab, setActiveTab] = useState('active')
  
  // Get all suggestions (not filtered by selected element)
  const allSuggestions = useMemo(() => {
    return suggestions?.elementSuggestions || []
  }, [suggestions?.elementSuggestions])
  
  // Filter suggestions based on ignored state
  const activeSuggestions = useMemo(() => {
    return allSuggestions.filter((suggestion) => {
      const key = getSuggestionKey(suggestion, 0) // index not used anymore
      return !ignoredSuggestions.has(key)
    })
  }, [allSuggestions, ignoredSuggestions])

  const ignoredSuggestionsList = useMemo(() => {
    return allSuggestions.filter((suggestion) => {
      const key = getSuggestionKey(suggestion, 0) // index not used anymore
      return ignoredSuggestions.has(key)
    })
  }, [allSuggestions, ignoredSuggestions])
  
  // Group suggestions by element ID for better organization
  // We need to track the original index from allSuggestions for consistent key generation
  const groupSuggestionsByElement = (suggestionsList, allSuggestionsList) => {
    const grouped = {}
    suggestionsList.forEach((suggestion, filteredIndex) => {
      // Find the original index in allSuggestions
      const originalIndex = allSuggestionsList.findIndex((s, idx) => {
        // Match by elementId and type to find the same suggestion
        return s.elementId === suggestion.elementId && 
               s.type === suggestion.type &&
               // Also match by message to be more specific
               s.message === suggestion.message
      })
      const indexToUse = originalIndex >= 0 ? originalIndex : filteredIndex
      
      if (!grouped[suggestion.elementId]) {
        grouped[suggestion.elementId] = []
      }
      grouped[suggestion.elementId].push({ ...suggestion, originalIndex: indexToUse })
    })
    return grouped
  }
  
  const activeSuggestionsByElement = useMemo(() => {
    return groupSuggestionsByElement(activeSuggestions, allSuggestions)
  }, [activeSuggestions, allSuggestions])

  const ignoredSuggestionsByElement = useMemo(() => {
    return groupSuggestionsByElement(ignoredSuggestionsList, allSuggestions)
  }, [ignoredSuggestionsList, allSuggestions])
  
  // Get element info for display
  const getElementInfo = (elementId) => {
    if (!elementId) return null
    const element = (canvasElements || []).find(el => el?.id === elementId)
    if (!element) {
      // Element might be missing from canvas (e.g., a missing template element)
      // Try to extract a readable name from the ID if it's a timestamp
      let label = String(elementId)
      if (/^\d+$/.test(elementId) && elementId.length > 10) {
        // It's a timestamp - show a generic label
        label = 'Element'
      }
      return { type: 'unknown', label: label, style: 'missing' }
    }
    
    if (element.type === 'text') {
      const content = element.content || 'Text element'
      const truncated = content.length > 30 ? content.substring(0, 30) + '...' : content
      return { type: element.type, label: truncated, style: element.style || 'body' }
    } else {
      // For elements, show icon if available, then elementType, then fallback
      const icon = element.icon || ''
      const elementType = element.elementType || element.style || 'Element'
      const label = icon ? `${icon} ${elementType}` : elementType
      return { type: element.type, label: label, icon: icon, elementType: elementType }
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
              className={`score-bar ${(suggestions?.designScore || 0) >= 80 ? 'score-good' : (suggestions?.designScore || 0) >= 50 ? 'score-ok' : 'score-low'}`}
              style={{ width: `${Math.max(0, Math.min(100, suggestions?.designScore || 0))}%` }}
            >
              {Math.round(suggestions?.designScore || 0)}%
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
                        // Generate stable key that doesn't depend on array position
                        const suggestionKey = getSuggestionKey(suggestion, 0) // index not used anymore
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
                                        if (onIgnoreSuggestion) {
                                          onIgnoreSuggestion(suggestionKey)
                                        }
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
                                        // Always select the element first, then apply if already selected
                                        if (selectedElement !== elementId) {
                                          onSelectElement && onSelectElement(elementId)
                                          // Apply after a short delay to ensure element is selected
                                          setTimeout(() => {
                                            onApplySuggestion('font', font)
                                          }, 100)
                                        } else {
                                          onApplySuggestion('font', font)
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
                                    {suggestion.isOverlapping ? (
                                      <>
                                        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                          ⚠️ Overlapping: {Math.abs(suggestion.spacing)}px overlap
                                        </p>
                                        <p>Recommended: {suggestion.minRequired}px minimum spacing</p>
                                        <p className="spacing-hint">Drag elements apart to prevent overlap and improve readability</p>
                                      </>
                                    ) : (
                                      <>
                                        <p>Current spacing: {suggestion.spacing}px</p>
                                        <p>Recommended: {suggestion.minRequired}px minimum</p>
                                        <p className="spacing-hint">Drag elements further apart to improve spacing</p>
                                      </>
                                    )}
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

