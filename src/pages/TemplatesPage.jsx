import React, { useState, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { templates } from '../data/templates'
import './TemplatesPage.css'

function TemplatesPage() {
  const navigate = useNavigate()
  const { appState, setAppState } = useContext(AppContext)
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    appState.selectedTemplate?.id || null
  )
  const [hoveredTemplate, setHoveredTemplate] = useState(null)

  const { posterType, topics = [], colors = [] } = appState

  const templatesWithScores = useMemo(() => {
    const normalizedTopics = topics.map(topic => topic.toUpperCase())
    const normalizedColors = colors.map(color => color.toLowerCase())

    return templates.map(template => {
      const matchesPosterType = posterType
        ? template.posterTypes.includes(posterType)
        : false
      const topicMatches = template.topics.filter(topic =>
        normalizedTopics.includes(topic)
      )
      const colorMatches = template.colorPalette.filter(color =>
        normalizedColors.includes(color.toLowerCase())
      )

      let score = 0
      const reasons = []

      if (matchesPosterType) {
        score += 4
        reasons.push(`Matches poster type: ${posterType}`)
      }

      if (topicMatches.length > 0) {
        score += topicMatches.length * 2
        reasons.push(`Topic overlap: ${topicMatches.join(', ')}`)
      }

      if (colorMatches.length > 0) {
        score += colorMatches.length
        reasons.push(`Palette overlap: ${colorMatches.join(', ')}`)
      }

      return {
        ...template,
        score,
        reasons
      }
    })
  }, [posterType, topics, colors])

  const recommendedTemplates = useMemo(() => {
    const sorted = [...templatesWithScores].sort((a, b) => {
      if (b.score === a.score) {
        return a.name.localeCompare(b.name)
      }
      return b.score - a.score
    })

    const positiveMatches = sorted.filter(template => template.score > 0)
    const fallbackList = positiveMatches.length > 0 ? positiveMatches : sorted

    return fallbackList.slice(0, Math.min(3, fallbackList.length))
  }, [templatesWithScores])

  const recommendedIds = useMemo(
    () => new Set(recommendedTemplates.map(template => template.id)),
    [recommendedTemplates]
  )

  const otherTemplates = useMemo(
    () =>
      templatesWithScores.filter(template => !recommendedIds.has(template.id)),
    [templatesWithScores, recommendedIds]
  )

  const handleTemplateClick = templateId => {
    setSelectedTemplateId(prevId => (prevId === templateId ? null : templateId))
  }

  const handleNext = () => {
    if (selectedTemplateId) {
      const template = templatesWithScores.find(
        item => item.id === selectedTemplateId
      )

      if (template) {
        const { score, reasons, ...templateData } = template
        setAppState(prev => ({
          ...prev,
          selectedTemplate: {
            ...templateData,
            matchMeta: { score, reasons }
          }
        }))
        navigate('/editor')
      }
    }
    if (!selectedTemplateId) {
      setAppState(prev => ({
        ...prev,
        selectedTemplate: null
      }))
    }
  }

  const renderTemplateCard = (template, isRecommended = false) => (
    <div
      key={template.id}
      className={`template-item ${
        selectedTemplateId === template.id ? 'selected' : ''
      } ${isRecommended ? 'recommended' : ''}`}
      onClick={() => handleTemplateClick(template.id)}
      onMouseEnter={() => setHoveredTemplate(template.id)}
      onMouseLeave={() => setHoveredTemplate(null)}
    >
      {isRecommended && <span className="template-badge">Recommended</span>}
      {selectedTemplateId === template.id && (
        <span className="template-selected">Selected</span>
      )}
      <img
        src={template.thumbnail}
        alt={template.name}
        className="template-thumbnail"
      />
      <div className="template-meta">
        <h3 className="template-name">{template.name}</h3>
        <p className="template-description">{template.description}</p>
        <div className="template-tags">
          {template.styleTags.slice(0, 3).map(tag => (
            <span key={tag} className="template-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      {hoveredTemplate === template.id && (
        <div className="template-overlay">
          <div className="overlay-content">
            <p>
              <strong>CREATED BY:</strong> {template.createdBy}
            </p>
            <p>
              <strong>DATE:</strong> {template.date}
            </p>
            <p>
              <strong>STYLE:</strong> {template.styleTags.join(', ')}
            </p>
            <p>
              <strong>PALETTE:</strong> {template.colorPalette.join(', ')}
            </p>
            <p>
              <strong>TOPICS:</strong> {template.topics.join(', ')}
            </p>
            <p>
              <strong>USE COUNT:</strong> {template.useCount}
            </p>
            <p>
              <strong>LIKES:</strong> {template.likes}
            </p>
            {template.reasons.length > 0 && (
              <div className="template-reasons">
                <p className="reasons-label">Matched because:</p>
                {template.reasons.map((reason, index) => (
                  <p key={`${template.id}-reason-${index}`} className="reason-line">
                    • {reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

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
            disabled={!selectedTemplateId}
          >
            NEXT
          </button>
        </div>

        <h1 className="templates-title">CHOOSE A TEMPLATE</h1>

        {recommendedTemplates.length > 0 && (
          <div className="templates-section">
            <h2 className="section-title">Recommended for you</h2>
            <div className="templates-grid recommended-grid">
              {recommendedTemplates.map(template => renderTemplateCard(template, true))}
            </div>
          </div>
        )}

        <div className="templates-section">
          <h2 className="section-title">Browse all templates</h2>
          <div className="templates-grid">
            {otherTemplates.map(template => renderTemplateCard(template))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage

