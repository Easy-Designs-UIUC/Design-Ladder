import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { templates } from '../data/templates'
import './TemplatesPage.css'

function TemplatesPage() {
  const navigate = useNavigate()
  const { setAppState } = useContext(AppContext)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [hoveredTemplate, setHoveredTemplate] = useState(null)

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template.id)
  }

  const handleNext = () => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      setAppState(prev => ({ ...prev, selectedTemplate: template }))
      navigate('/editor')
    }
  }

  return (
    <div className="templates-page">
      <div className="templates-container">
        <div className="templates-header">
          <button className="back-btn" onClick={() => navigate('/colors')}>
            BACK
          </button>
          <button 
            className="next-btn"
            onClick={handleNext}
            disabled={!selectedTemplate}
          >
            NEXT
          </button>
        </div>

        <h1 className="templates-title">CHOOSE A TEMPLATE</h1>

        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-item ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateClick(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <img
                src={template.thumbnail}
                alt={template.name}
                className="template-thumbnail"
              />
              {hoveredTemplate === template.id && (
                <div className="template-overlay">
                  <div className="overlay-content">
                    <p><strong>CREATED BY:</strong> {template.createdBy}</p>
                    <p><strong>DATE:</strong> {template.date}</p>
                    <p><strong>KEYWORDS:</strong> {template.keywords}</p>
                    <p><strong>USE COUNT:</strong> {template.useCount}</p>
                    <p><strong>LIKES:</strong> {template.likes}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage

