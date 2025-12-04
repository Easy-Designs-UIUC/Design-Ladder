import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import './TopicPage.css'

function TopicPage() {
  const navigate = useNavigate()
  const { appState, setAppState } = useContext(AppContext)
  const [selectedTopics, setSelectedTopics] = useState(appState.topics || [])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customTopic, setCustomTopic] = useState('')

  const topics = ['VOLUNTEERING', 'HACKATHON', 'FUNDRAISER', 'CONFERENCE']
  const topicInfo = {
    'VOLUNTEERING': 'Community-focused posters. Use friendly language and clear calls-to-action to encourage participation.',
    'HACKATHON': 'Technical, timeboxed event posters — highlight date, prizes, and submission details.',
    'FUNDRAISER': 'Emphasize cause, amounts, and how to donate; use emotive imagery and clear CTAs.',
    'CONFERENCE': 'Structured schedules and speaker info — favor readable hierarchies and session blocks.'
  }

  const handleTopicClick = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic))
    } else if (selectedTopics.length < 3) {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const handleCustomClick = () => {
    if (showCustomInput) {
      if (customTopic.trim() && selectedTopics.length < 3) {
        if (!selectedTopics.includes(customTopic.trim().toUpperCase())) {
          setSelectedTopics([...selectedTopics, customTopic.trim().toUpperCase()])
          setCustomTopic('')
        }
      }
      setShowCustomInput(false)
    } else {
      setShowCustomInput(true)
    }
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (customTopic.trim() && selectedTopics.length < 3) {
      if (!selectedTopics.includes(customTopic.trim().toUpperCase())) {
        setSelectedTopics([...selectedTopics, customTopic.trim().toUpperCase()])
        setCustomTopic('')
        setShowCustomInput(false)
      }
    }
  }

  const removeTopic = (topic) => {
    setSelectedTopics(selectedTopics.filter(t => t !== topic))
  }

  const handleNext = () => {
    setAppState(prev => ({ ...prev, topics: selectedTopics }))
    navigate('/colors')
  }

  return (
    <div className="topic-page">
      <div className="app-header">
        <h1 className="app-logo">DESIGN LADDER</h1>
      </div>
      <div className="topic-container">
  <h2 className="topic-title">WHAT IS YOUR PROJECT TOPIC? <span className="required">(Required)</span></h2>
  <h3 className="topic-subtitle">PICK UP TO 3: <span className="muted-small">Selecting 1–3 topics helps the engine recommend templates and content that match your subject and tone.</span></h3>

        <div className="topic-content">
          <div className="topic-selection">
            {topics.map((topic) => (
              <button
                key={topic}
                className={`topic-btn ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                onClick={() => handleTopicClick(topic)}
                disabled={!selectedTopics.includes(topic) && selectedTopics.length >= 3}
              >
                <span className="topic-label">{topic}</span>
                <span className="info-icon" data-tooltip={topicInfo[topic]}>ⓘ</span>
              </button>
            ))}
            <div className="custom-topic-section">
              <button
                className={`topic-btn custom-btn ${showCustomInput ? 'active' : ''}`}
                onClick={handleCustomClick}
              >
                CUSTOM
              </button>
              {showCustomInput && (
                <form onSubmit={handleCustomSubmit} className="custom-input-form">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter custom topic..."
                    className="custom-input"
                    autoFocus
                  />
                  <button type="submit" className="custom-submit-btn">Add</button>
                </form>
              )}
            </div>
          </div>

          <div className="selected-section">
            <h3 className="selected-title">SELECTED</h3>
            <div className="selected-topics">
              {selectedTopics.length === 0 ? (
                <p className="empty-selected">No topics selected</p>
              ) : (
                selectedTopics.map((topic, index) => (
                  <div key={index} className="selected-tag">
                    <span>{topic}</span>
                    <button
                      className="remove-tag-btn"
                      onClick={() => removeTopic(topic)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="topic-buttons">
        <button className="back-btn" onClick={() => navigate('/')}>
          BACK
        </button>
        <button 
          className="next-btn"
          onClick={handleNext}
          disabled={selectedTopics.length === 0}
        >
          NEXT
        </button>
      </div>
    </div>
  )
}

export default TopicPage

