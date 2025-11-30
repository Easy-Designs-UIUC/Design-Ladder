import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getColorHex, COLOR_MAP } from '../utils/colorUtils'
import './LeftToolbar.css'

function LeftToolbar({ 
  onAddElement, 
  onUpdateElement, 
  selectedElement, 
  selectedElementData,
  projects, 
  activeProjectId, 
  onBackgroundChange, 
  handleSave, 
  handleDownload, 
  onSelectProject, 
  suggestions, 
  template, 
  canvasElements = [],
  hasUnsavedChanges = false
}) {
  const navigate = useNavigate()
  const [expandedMenu, setExpandedMenu] = useState(null)
  const [expandedSubmenu, setExpandedSubmenu] = useState(null)
  const [showProjects, setShowProjects] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const textStyles = ['Title', 'Subtitle', 'Heading', 'Body']

  // Use selectedElementData if available (from master), otherwise derive from canvasElements
  const elementData = selectedElementData || (selectedElement ? canvasElements.find(el => el.id === selectedElement) : null)
  const isTextSelected = elementData?.type === 'text'
  const isElementSelected = elementData?.type === 'element'

  const confirmNavigateAway = (navigateFn) => {
    if (!hasUnsavedChanges) {
      navigateFn()
      return
    }

    const ok = window.confirm(
      'You have unsaved changes. If you leave the editor now, your latest edits will be lost. Continue?'
    )
    if (ok) {
      navigateFn()
    }
  }

  
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
    { id: 'flower', name: 'Flower', icon: '🌸', elementType: 'flower' },
    { id: 'graph', name: 'Graph', icon: '📊', elementType: 'chart' },
    { id: 'photo', name: 'Photo', icon: '📷', elementType: 'photo' },
    { id: 'lightbulb', name: 'Lightbulb', icon: '💡', elementType: 'lightbulb' },
    { id: 'heart', name: 'Heart', icon: '❤️', elementType: 'heart' },
    { id: 'star', name: 'Star', icon: '⭐', elementType: 'star' },
    { id: 'arrow', name: 'Arrow', icon: '➡️', elementType: 'arrow' },
    { id: 'circle', name: 'Circle', icon: '⭕', elementType: 'circle' }
  ]

  const handleElementClick = (element) => {
    onAddElement({
      type: 'element',
      elementType: element.elementType || element.id,
      icon: element.icon,
      name: element.name
    })
  }

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

    const styleProps = styleMap[style]
    if (!styleProps) return
    
    if (isTextSelected && selectedElement) {
      onUpdateElement(selectedElement, {
        style: styleProps.style,
        fontSize: styleProps.fontSize
      })
    } else {
      onAddElement({
        type: 'text',
        content: style.toUpperCase(),
        ...styleMap[style],
        font: 'Arial'
      })
    }
  }

  const handleFontClick = (font) => {
    if (isTextSelected && selectedElement) {
      onUpdateElement(selectedElement, { font })
    }
  }

  const handleTextColorClick = (colorHex) => {
    if (isTextSelected && selectedElement) {
      console.log('Changing text color to:', colorHex)
      onUpdateElement(selectedElement, { color: colorHex })
    }
  }

  const handleElementBackgroundClick = (colorHex) => {
    if (isTextSelected && selectedElement) {
      console.log('Changing element background to:', colorHex)
      onUpdateElement(selectedElement, { backgroundColor: colorHex })
    }
  }

  const handleBackgroundClick = (bg) => {
    onBackgroundChange(bg.color)
  }

  const handleDownloadOption = (format) => {
    setShowDownloadMenu(false)
    handleDownload(format)
  }

  // Check if selected element is text type (for UI improvements)
  const isTextElement = isTextSelected
  const hasSelectedElement = !!selectedElement

  return (
    <div className="left-toolbar">
      {/* Navigation Section - Separated */}
      <div className="toolbar-nav-section">
        <div className="toolbar-nav">
          <button className="nav-btn" onClick={() => confirmNavigateAway(() => navigate('/'))} title="Return to home page">
            🏠 Home
          </button>
          <button 
            className="nav-btn"
            onClick={() => setShowProjects(!showProjects)}
            title="View saved projects"
          >
            📁 Projects
          </button>
        </div>

        {showProjects && (
          <div className="projects-list">
            <button
              className="projects-open-library-btn"
              onClick={() => {
                confirmNavigateAway(() => {
                  setShowProjects(false)
                  navigate('/projects')
                })
              }}
            >
              Open Projects Library
            </button>
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
      </div>

      <div className="left-toolbar-scrollable">
        {/* Quick Help Section */}
        {!hasSelectedElement && (
          <div className="quick-help-section">
            <div className="help-header">
              <span className="help-icon">💡</span>
              <span className="help-title">Quick Start</span>
            </div>
            <div className="help-content">
              <p className="help-text">• Click <strong>Text</strong> or <strong>Elements</strong> to add content</p>
              <p className="help-text">• Click any element on canvas to edit its style</p>
              <p className="help-text">• Use <strong>Background</strong> to change canvas color</p>
            </div>
          </div>
        )}

        <div className="toolbar-menus">
          {/* Add Elements Section */}
          <div className="control-section add-elements-section">
            <h3 className="section-title">➕ Add Elements</h3>
            {/* Text Styles - Add Element */}
            <div className="menu-section">
              <button
                className={`menu-toggle ${isElementSelected ? 'disabled' : ''}`}
                onClick={() => !isElementSelected && toggleMenu('text')}
                disabled={isElementSelected}
                title="Add text elements to your poster"
              >
                📝 Text {expandedMenu === 'text' ? '−' : '+'}
              </button>
              {expandedMenu === 'text' && (
                <div className={`menu-content text-menu-content ${isElementSelected ? 'text-menu-disabled' : ''}`}>
                  <button
                    className="submenu-toggle"
                    onClick={() => setExpandedSubmenu(expandedSubmenu === 'styles' ? null : 'styles')}
                    title="Choose a text style to add"
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
                          title={`Add ${style} text element`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Elements - Add Element */}
            <div className="menu-section">
              <button
                className="menu-toggle"
                onClick={() => toggleMenu('elements')}
                title="Add icons and visual elements"
              >
                🎨 Elements {expandedMenu === 'elements' ? '−' : '+'}
              </button>
              {expandedMenu === 'elements' && (
                <div className="menu-content elements-grid">
                  {elements.map((element) => (
                    <button
                      key={element.id}
                      className="element-item"
                      onClick={() => handleElementClick(element)}
                      title={`Add ${element.name} element`}
                    >
                      {element.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Background - Add Element */}
            <div className="menu-section">
              <button
                className="menu-toggle"
                onClick={() => toggleMenu('background')}
                title="Change the canvas background color"
              >
                🎨 Background {expandedMenu === 'background' ? '−' : '+'}
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
                        title={`Set background to ${bg.name}`}
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

        {/* Edit Style Section - Only shown when element is selected */}
        {hasSelectedElement && (
          <div className="control-section edit-style-section">
            <h3 className="section-title">
              ✏️ Edit Selected Element
              {!isTextElement && <span className="edit-hint">(Text controls only)</span>}
            </h3>
            
            <div className="toolbar-menus">
              {/* Font - Edit Style */}
              <div className="menu-section">
                <button
                  className={`menu-toggle ${!isTextElement ? 'disabled' : ''}`}
                  onClick={() => isTextElement && toggleMenu('font')}
                  disabled={!isTextElement}
                  title={isTextElement ? "Change the font family" : "Select a text element to edit font"}
                >
                  🔤 Font {expandedMenu === 'font' ? '−' : '+'}
                </button>
                {expandedMenu === 'font' && isTextElement && (
                  <div className="menu-content">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        className="submenu-item font-option"
                        onClick={() => handleFontClick(font)}
                        style={{ fontFamily: font }}
                        title={`Change font to ${font}`}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Color - Edit Style */}
              <div className="menu-section">
                <button
                  className={`menu-toggle ${!isTextElement ? 'disabled' : ''}`}
                  onClick={() => isTextElement && setExpandedSubmenu(expandedSubmenu === 'textColor' ? null : 'textColor')}
                  disabled={!isTextElement}
                  title={isTextElement ? "Change the text color" : "Select a text element to edit color"}
                >
                  🎨 Text Color {expandedSubmenu === 'textColor' ? '−' : '+'}
                </button>
                {expandedSubmenu === 'textColor' && isTextElement && (
                  <div className="menu-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                          title={`Change text color to ${colorName}`}
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

              {/* Element Background - Edit Style */}
              <div className="menu-section">
                <button
                  className={`menu-toggle ${!isTextElement ? 'disabled' : ''}`}
                  onClick={() => isTextElement && setExpandedSubmenu(expandedSubmenu === 'elementBg' ? null : 'elementBg')}
                  disabled={!isTextElement}
                  title={isTextElement ? "Change the element background color" : "Select a text element to edit background"}
                >
                  🎨 Element Background {expandedSubmenu === 'elementBg' ? '−' : '+'}
                </button>
                {expandedSubmenu === 'elementBg' && isTextElement && (
                  <div className="menu-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                          title={`Change background to ${colorName}`}
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
            </div>
          </div>
        )}
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
