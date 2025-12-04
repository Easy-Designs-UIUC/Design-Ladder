import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { appState, setAppState } = useContext(AppContext)
  const [selectedType, setSelectedType] = useState(appState.posterType || null)

  const posterTypes = [
    'RESEARCH/ACADEMIC POSTER',
    'SOCIAL EVENT POSTER',
    'ORGANIZATIONAL'
  ]

  const posterTypeInfo = {
    'RESEARCH/ACADEMIC POSTER': 'Designed for academic conferences: focus on readable layouts, clear data sections, and formal typography. Affects recommended templates by prioritizing grids and space for charts.',
    'SOCIAL EVENT POSTER': 'Optimized for events and promotions: bold fonts, eye-catching imagery, and large headlines. Templates emphasize impact and discoverability.',
    'ORGANIZATIONAL': 'For clubs, teams, and org announcements: balanced layouts, clear calls-to-action, and brand-friendly areas. Templates favor logos and consistent branding.'
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
  }

  const handleNext = () => {
    if (selectedType) {
      // Clear active project when starting a new flow
      setAppState(prev => ({ 
        ...prev, 
        posterType: selectedType,
        activeProjectId: null,
        selectedTemplate: null
      }))
      navigate('/topic')
    }
  }

  return (
    <div className="home-page">
      <div className="app-header">
        <h1 className="app-logo">DESIGN LADDER</h1>
      </div>
      <div className="home-container">
  <h2 className="home-title">WHAT ARE YOU DESIGNING TODAY? <span className="required">(Required)</span></h2>
  <p className="home-explain">Choose the poster type that best matches your goal — this influences layout, typography, and template suggestions.</p>

        <div className="poster-types">
          {posterTypes.map((type) => (
            <button
              key={type}
              className={`poster-type-btn ${selectedType === type ? 'selected' : ''}`}
              onClick={() => handleTypeSelect(type)}
            >
              <span className="poster-type-label">{type}</span>
              <span className="info-icon" data-tooltip={posterTypeInfo[type]}>ⓘ</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="home-buttons">
        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!selectedType}
        >
          NEXT
        </button>
      </div>
    </div>
  )
}

export default HomePage

