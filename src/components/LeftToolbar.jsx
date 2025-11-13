import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './LeftToolbar.css'

function LeftToolbar({ onAddElement, onUpdateElement, selectedElement, projects, activeProjectId, onBackgroundChange, handleSave, handleDownload, onSelectProject }) {
  const navigate = useNavigate()
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [expandedSubmenu, setExpandedSubmenu] = useState(null)
  const [showProjects, setShowProjects] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const textStyles = ['Title', 'Subtitle', 'Heading', 'Body']
  const fonts = ['TimesNewRoman', 'Cambria', 'Arial', 'Helvetica', 'Georgia', 'Ubuntu']
  
  const elements = [
    { id: 'flower', name: 'Flower', icon: '🌸' },
    { id: 'graph', name: 'Graph', icon: '📊' },
    { id: 'heart', name: 'Heart', icon: '❤️' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'arrow', name: 'Arrow', icon: '➡️' },
    { id: 'circle', name: 'Circle', icon: '⭕' }
  ]

  const backgrounds = [
    { id: 'pattern1', name: 'Pattern 1', color: '#f0f0f0' },
    { id: 'pattern2', name: 'Pattern 2', color: '#e8e8e8' },
    { id: 'pattern3', name: 'Pattern 3', color: '#d0d0d0' },
    { id: 'pattern4', name: 'Pattern 4', color: '#c0c0c0' },
    { id: 'pattern5', name: 'Pattern 5', color: '#b0b0b0' },
    { id: 'pattern6', name: 'Pattern 6', color: '#a0a0a0' }
  ]

  const toggleMenu = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu)
    setExpandedSubmenu(null)
  }

  const handleTextStyleClick = (style) => {
    const styleMap = {
      'Title': { style: 'title', fontSize: 48 },
      'Subtitle': { style: 'subtitle', fontSize: 32 },
      'Heading': { style: 'heading', fontSize: 36 },
      'Body': { style: 'body', fontSize: 16 }
    }
    onAddElement({
      type: 'text',
      content: style.toUpperCase(),
      ...styleMap[style],
      font: 'Arial'
    })
  }

  const handleFontClick = (font) => {
    if (selectedElement) {
      onUpdateElement(selectedElement, { font })
    }
  }

  const handleElementClick = (element) => {
    onAddElement({
      type: 'element',
      elementType: element.id,
      icon: element.icon,
      name: element.name
    })
  }

  const handleBackgroundClick = (bg) => {
    onBackgroundChange(bg.color)
  }

  const handleDownloadOption = (format) => {
    setShowDownloadMenu(false)
    handleDownload(format)
  }

  return (
    <div className="left-toolbar">
      <div className="toolbar-nav">
        <button className="nav-btn" onClick={() => navigate('/')}>
          Home
        </button>
        <button 
          className="nav-btn"
          onClick={() => setShowProjects(!showProjects)}
        >
          Projects
        </button>
      </div>

      {showProjects && (
        <div className="projects-list">
          <h3 className="projects-title">Saved Projects</h3>
          {projects.map((project) => (
            <button
              key={project.id}
              className={`project-item ${activeProjectId === project.id ? 'active' : ''}`}
              onClick={() => {
                onSelectProject(project.id)
                setShowProjects(false)
              }}
            >
              <span className="project-name">{project.name}</span>
              <span className="project-date">{project.date}</span>
            </button>
          ))}
        </div>
      )}

      <div className="left-toolbar-scrollable">
        <div className="toolbar-menus">
          <div className="menu-section">
            <button
              className="menu-toggle"
              onClick={() => toggleMenu('text')}
            >
              Text {expandedMenu === 'text' ? '−' : '+'}
            </button>
            {expandedMenu === 'text' && (
              <div className="menu-content">
                <button
                  className="submenu-toggle"
                  onClick={() => setExpandedSubmenu(expandedSubmenu === 'styles' ? null : 'styles')}
                >
                  Styles {expandedSubmenu === 'styles' ? '−' : '+'}
                </button>
                {expandedSubmenu === 'styles' && (
                  <div className="submenu-content">
                    {textStyles.map((style) => (
                      <button
                        key={style}
                        className="submenu-item"
                        onClick={() => handleTextStyleClick(style)}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                )}
                
                <button
                  className="submenu-toggle"
                  onClick={() => setExpandedSubmenu(expandedSubmenu === 'font' ? null : 'font')}
                >
                  Font {expandedSubmenu === 'font' ? '−' : '+'}
                </button>
                {expandedSubmenu === 'font' && (
                  <div className="submenu-content">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        className="submenu-item"
                        onClick={() => handleFontClick(font)}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="menu-section">
            <button
              className="menu-toggle"
              onClick={() => toggleMenu('elements')}
            >
              Elements {expandedMenu === 'elements' ? '−' : '+'}
            </button>
            {expandedMenu === 'elements' && (
              <div className="menu-content elements-grid">
                {elements.map((element) => (
                  <button
                    key={element.id}
                    className="element-item"
                    onClick={() => handleElementClick(element)}
                    title={element.name}
                  >
                    {element.icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="menu-section">
            <button
              className="menu-toggle"
              onClick={() => toggleMenu('background')}
            >
              Background {expandedMenu === 'background' ? '−' : '+'}
            </button>
            {expandedMenu === 'background' && (
              <div className="menu-content backgrounds-grid">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    className="background-item"
                    onClick={() => handleBackgroundClick(bg)}
                    style={{ backgroundColor: bg.color }}
                    title={bg.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="left-savebar">
        <button className="save-btn" onClick={handleSave}>
          SAVE
        </button>
        <div className="download-container">
          <button className="download-btn" onClick={() => setShowDownloadMenu(!showDownloadMenu)}>
            DOWNLOAD
          </button>
          {showDownloadMenu && (
            <div className="download-menu">
              <button onClick={() => handleDownloadOption('PDF')}>PDF</button>
              <button onClick={() => handleDownloadOption('PNG')}>PNG</button>
              <button onClick={() => handleDownloadOption('JPEG')}>JPEG</button>
              <button onClick={() => handleDownloadOption('TIFF')}>TIFF</button>
              <button onClick={() => handleDownloadOption('AI')}>AI</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeftToolbar

