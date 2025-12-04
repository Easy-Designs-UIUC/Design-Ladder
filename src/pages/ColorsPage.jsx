import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { getColorHex } from '../utils/colorUtils'
import { checkContrastWCAG, generateContrastOptions } from '../utils/wcagUtils'
import './ColorsPage.css'

function ColorsPage() {
  const navigate = useNavigate()
  const { appState, setAppState } = useContext(AppContext)
  const [selectedColors, setSelectedColors] = useState(appState.colors || [])
  const [expandedColor, setExpandedColor] = useState(null)

  const colors = [
    'Blue',
    'Orange',
    'Red',
    'Yellow',
    'Purple',
    'Red-Orange',
    'Yellow-Green',
    'Blue-Purple'
  ]

  const colorExplain = 'Choose up to three colors to guide the template palette. We will suggest readable font colors against your chosen background colors using WCAG contrast rules.'

  const colorInfo = {
    'Blue': 'Cool, professional tone. Works well for academic, tech, and formal posters.',
    'Orange': 'Warm, energetic, inviting. Great for events, fundraisers, and calls-to-action.',
    'Red': 'Bold, urgent, high-impact. Use for emergencies, announcements, and attention-grabbing headers.',
    'Yellow': 'Bright, optimistic, cheerful. Best for social events and positive messaging.',
    'Purple': 'Elegant, creative, sophisticated. Ideal for premium events and artistic projects.',
    'Red-Orange': 'Dynamic and warm. Balances energy with approachability — good for community events.',
    'Yellow-Green': 'Fresh, growth-oriented, natural. Works for environmental and sustainability topics.',
    'Blue-Purple': 'Modern, sophisticated, creative. Suits tech and innovation-focused projects.'
  }

  const handleColorToggle = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color))
    } else if (selectedColors.length < 3) {
      setSelectedColors([...selectedColors, color])
    }
  }

  const handleNext = () => {
    setAppState(prev => ({ ...prev, colors: selectedColors }))
    navigate('/templates')
  }

  return (
    <div className="colors-page">
      <div className="app-header">
        <h1 className="app-logo">DESIGN LADDER</h1>
      </div>
      <div className="colors-container">
  <h2 className="colors-title">COLOR SCHEME?</h2>
  <h3 className="colors-subtitle">Pick up to 3 <span className="muted-small">(Optional)</span></h3>
  <p className="colors-explain">{colorExplain}</p>

        <div className="colors-list">
          {colors.map((color) => {
            const hex = getColorHex(color)
            // compute contrast for default text color (white)
            const contrast = checkContrastWCAG('#ffffff', hex, 18, false)
            const suggestions = generateContrastOptions('#ffffff', hex, 18, false)
            return (
              <label key={color} className="color-item">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                  disabled={!selectedColors.includes(color) && selectedColors.length >= 3}
                />
                <span
                  className="color-swatch"
                  style={{ backgroundColor: hex }}
                />
                <span className="color-name">{color}</span>
                <span className="info-icon" data-tooltip={colorInfo[color]}>ⓘ</span>
                <div className="contrast-info" aria-hidden>
                  <button 
                    className="contrast-toggle"
                    onClick={() => setExpandedColor(expandedColor === color ? null : color)}
                    type="button"
                  >
                    <div className="contrast-sample" style={{ backgroundColor: hex, color: '#ffffff' }}>Aa</div>
                    <div className="contrast-stats">{contrast.ratio}:1</div>
                  </button>
                  {expandedColor === color && (
                    <div className="contrast-details-expanded">
                      <div className="contrast-rationale">{contrast.rationale}</div>
                      {suggestions && suggestions.length > 0 && (
                        <div className="suggestions-list">
                          <span className="suggest-label">Suggestions:</span>
                          {suggestions.map((s, i) => (
                            <div key={i} className="suggest-item">
                              <span className="suggest-name">{s.name}</span>
                              <span className="suggest-ratio">{s.ratio}:1</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </div>
      
      <div className="colors-buttons">
        <button className="back-btn" onClick={() => navigate('/topic')}>
          BACK
        </button>
        <button className="next-btn" onClick={handleNext}>
          NEXT
        </button>
      </div>
    </div>
  )
}

export default ColorsPage

