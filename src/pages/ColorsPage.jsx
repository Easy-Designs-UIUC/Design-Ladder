import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import './ColorsPage.css'

function ColorsPage() {
  const navigate = useNavigate()
  const { appState, setAppState } = useContext(AppContext)
  const [selectedColors, setSelectedColors] = useState(appState.colors || [])

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
        <h3 className="colors-subtitle">Pick up to 3</h3>

        <div className="colors-list">
          {colors.map((color) => (
            <label key={color} className="color-item">
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => handleColorToggle(color)}
                disabled={!selectedColors.includes(color) && selectedColors.length >= 3}
              />
              <span className="color-name">{color}</span>
            </label>
          ))}
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

