import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const { setAppState } = useContext(AppContext)
  const [selectedType, setSelectedType] = useState(null)

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
      setAppState(prev => ({ ...prev, posterType: selectedType }))
      navigate('/topic')
    }
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <h1 className="home-title">WHAT ARE YOU DESIGNING TODAY?</h1>
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

