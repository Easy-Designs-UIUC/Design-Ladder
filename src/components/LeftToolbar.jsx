import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getColorHex, COLOR_MAP } from '../utils/colorUtils'
import './LeftToolbar.css'

function LeftToolbar({ onAddElement, onUpdateElement, selectedElement, projects, activeProjectId, onBackgroundChange, handleSave, handleDownload, onSelectProject, suggestions, template }) {
  const navigate = useNavigate()
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [expandedSubmenu, setExpandedSubmenu] = useState(null)
  const [showProjects, setShowProjects] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const textStyles = ['Title', 'Subtitle', 'Heading', 'Body']
  
  // Use template fonts + add common alternative fonts for user choice
  const fonts = useMemo(() => {
    const templateFonts = suggestions?.allSuggestedFonts && suggestions.allSuggestedFonts.length > 0
      ? suggestions.allSuggestedFonts
      : suggestions?.fonts && suggestions.fonts.length > 0
      ? suggestions.fonts
      : ['Arial']
    
    // Add some common fonts as alternatives (these will trigger suggestions if used)
    const commonAlternatives = [
      'Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana', 
      'Cambria', 'Ubuntu', 'Comic Sans MS', 'Courier New', 'Palatino'
    ]
    
    // Combine template fonts with alternatives (remove duplicates)
    const allFonts = [...new Set([...templateFonts, ...commonAlternatives])]
    return allFonts
  }, [suggestions])

  // Get all available colors from COLOR_MAP
  const allColors = useMemo(() => {
    return Object.keys(COLOR_MAP).filter(name => name !== 'transparent')
  }, [])
  
  // Use template-based colors if available, otherwise use template background or defaults
  const backgroundColors = useMemo(() => {
    if (suggestions?.colors && suggestions.colors.length > 0) {
      return suggestions.colors.map(color => ({
        id: color.toLowerCase().replace(/\s+/g, '-'),
        name: color,
        color: getColorHex(color)
      }))
    }
    // Fallback: use template background if available
    if (template?.layout?.background) {
      return [{
        id: 'template-bg',
        name: 'Template Background',
        color: template.layout.background
      }]
    }
    // Default backgrounds
    return [
      { id: 'white', name: 'White', color: '#ffffff' },
      { id: 'light-gray', name: 'Light Gray', color: '#f0f0f0' },
      { id: 'gray', name: 'Gray', color: '#e8e8e8' },
      { id: 'dark-gray', name: 'Dark Gray', color: '#d0d0d0' }
    ]
  }, [suggestions, template])
  
  const elements = [
    { id: 'flower', name: 'Flower', icon: '🌸' },
    { id: 'graph', name: 'Graph', icon: '📊' },
    { id: 'heart', name: 'Heart', icon: '❤️' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'arrow', name: 'Arrow', icon: '➡️' },
    { id: 'circle', name: 'Circle', icon: '⭕' }
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

  const handleTextColorClick = (colorHex) => {
    if (selectedElement) {
      console.log('Changing text color to:', colorHex)
      onUpdateElement(selectedElement, { color: colorHex })
    }
  }

  const handleElementBackgroundClick = (colorHex) => {
    if (selectedElement) {
      console.log('Changing element background to:', colorHex)
      onUpdateElement(selectedElement, { backgroundColor: colorHex })
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

                <button
                  className="submenu-toggle"
                  onClick={() => setExpandedSubmenu(expandedSubmenu === 'textColor' ? null : 'textColor')}
                >
                  Text Color {expandedSubmenu === 'textColor' ? '−' : '+'}
                </button>
                {expandedSubmenu === 'textColor' && (
                  <div className="submenu-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {allColors.map((colorName) => {
                      const colorHex = getColorHex(colorName)
                      return (
                        <button
                          key={colorName}
                          className="submenu-item color-button"
                          onClick={() => handleTextColorClick(colorHex)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span
                            className="color-preview"
                            style={{
                              display: 'inline-block',
                              width: '20px',
                              height: '20px',
                              backgroundColor: colorHex,
                              border: '1px solid #ccc',
                              borderRadius: '3px'
                            }}
                          />
                          {colorName}
                        </button>
                      )
                    })}
                  </div>
                )}

                <button
                  className="submenu-toggle"
                  onClick={() => setExpandedSubmenu(expandedSubmenu === 'elementBg' ? null : 'elementBg')}
                >
                  Element Background {expandedSubmenu === 'elementBg' ? '−' : '+'}
                </button>
                {expandedSubmenu === 'elementBg' && (
                  <div className="submenu-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {allColors.map((colorName) => {
                      const colorHex = getColorHex(colorName)
                      return (
                        <button
                          key={colorName}
                          className="submenu-item color-button"
                          onClick={() => handleElementBackgroundClick(colorHex)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span
                            className="color-preview"
                            style={{
                              display: 'inline-block',
                              width: '20px',
                              height: '20px',
                              backgroundColor: colorHex,
                              border: '1px solid #ccc',
                              borderRadius: '3px'
                            }}
                          />
                          {colorName}
                        </button>
                      )
                    })}
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
                {backgroundColors.length > 0 ? (
                  backgroundColors.map((bg) => (
                    <button
                      key={bg.id}
                      className="background-item"
                      onClick={() => handleBackgroundClick(bg)}
                      style={{ backgroundColor: bg.color }}
                      title={bg.name}
                    />
                  ))
                ) : (
                  <div className="no-items">No background colors available</div>
                )}
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

