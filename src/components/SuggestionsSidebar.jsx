import React, { useState } from 'react'
import './SuggestionsSidebar.css'

function SuggestionsSidebar({ suggestions, onApplySuggestion }) {
  const [expandedSection, setExpandedSection] = useState({
    fonts: true,
    colors: true
  })

  const toggleSection = (section) => {
    setExpandedSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

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

      <div className="suggestions-section">
        <button
          className="suggestion-toggle"
          onClick={() => toggleSection('fonts')}
        >
          Alternative Font Suggestions {expandedSection.fonts ? '−' : '+'}
        </button>
        {expandedSection.fonts && (
          <div className="suggestion-content">
            {suggestions.fonts.map((font) => (
              <button
                key={font}
                className="suggestion-item"
                onClick={() => onApplySuggestion('font', font)}
              >
                {font}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="suggestions-section">
        <button
          className="suggestion-toggle"
          onClick={() => toggleSection('colors')}
        >
          Alternative Background Color Suggestions {expandedSection.colors ? '−' : '+'}
        </button>
        {expandedSection.colors && (
          <div className="suggestion-content">
            {suggestions.colors.map((color) => (
              <button
                key={color}
                className="suggestion-item color-item"
                onClick={() => onApplySuggestion('color', color)}
              >
                {color}
              </button>
            ))}
          </div>
        )}
      </div>

      {suggestions.suggestions && suggestions.suggestions.length > 0 && (
        <div className="suggestions-tips">
          <h3 className="tips-title">Tips</h3>
          <ul className="tips-list">
            {suggestions.suggestions.map((tip, index) => (
              <li key={index} className="tip-item">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SuggestionsSidebar

