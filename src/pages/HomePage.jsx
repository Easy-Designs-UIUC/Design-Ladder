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
        <h2 className="home-title">WHAT ARE YOU DESIGNING TODAY?</h2>

        <div className="poster-types">
          {posterTypes.map((type) => (
            <button
              key={type}
              className={`poster-type-btn ${selectedType === type ? 'selected' : ''}`}
              onClick={() => handleTypeSelect(type)}
            >
              {type}
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

