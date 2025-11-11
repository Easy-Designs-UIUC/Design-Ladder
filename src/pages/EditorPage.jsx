import React, { useState, useContext, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { getSuggestions } from '../data/suggestions'
import LeftToolbar from '../components/LeftToolbar'
import Canvas from '../components/Canvas'
import SuggestionsSidebar from '../components/SuggestionsSidebar'
import './EditorPage.css'

const DEFAULT_CANVAS_ELEMENTS = [
  { id: 'default-title', type: 'text', content: 'TITLE', style: 'title', x: 100, y: 100, font: 'Arial', fontSize: 48 },
  { id: 'default-subtitle', type: 'text', content: 'SUBTITLE', style: 'subtitle', x: 100, y: 180, font: 'Arial', fontSize: 32 }
]

// Simple flattening transformation - just extracts nested position/style to top level
// Templates should provide all properties explicitly
const normalizeTemplateElements = (elements = []) =>
  elements.map((element) => {
    // If already flat (has x, y directly), use as-is
    if (element.x !== undefined && element.y !== undefined) {
      return { ...element }
    }

    // Flatten nested structure
    const position = element.position || {}
    const style = element.style || {}

    if (element.type === 'text') {
      return {
        id: element.id,
        type: 'text',
        content: element.content,
        style: element.styleName || element.style,
        x: position.x,
        y: position.y,
        font: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.fill,
        textAlign: style.textAlign,
        backgroundColor: style.backgroundColor,
        maxWidth: style.maxWidth
      }
    }

    // Element type - use icon directly from template
    return {
      id: element.id,
      type: 'element',
      elementType: element.elementType || element.style,
      icon: element.icon,
      x: position.x,
      y: position.y
    }
  })

const buildTemplateState = (template) => {
  if (template?.layout?.elements?.length) {
    return {
      elements: normalizeTemplateElements(template.layout.elements),
      background: template.layout.background || null
    }
  }

  return {
    elements: DEFAULT_CANVAS_ELEMENTS.map(el => ({ ...el })),
    background: null
  }
}

function EditorPage() {
  const navigate = useNavigate()
  const { appState, setAppState } = useContext(AppContext)
  const initialTemplateState = buildTemplateState(appState.selectedTemplate)
  const [canvasElements, setCanvasElements] = useState(initialTemplateState.elements)
  const [selectedElement, setSelectedElement] = useState(null)
  const [history, setHistory] = useState([initialTemplateState.elements.map(el => ({ ...el }))])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [canvasBackground, setCanvasBackground] = useState(initialTemplateState.background)

  const suggestions = getSuggestions(appState.posterType, appState.topics, appState.colors)

  const addToHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newElements.map(el => ({ ...el })))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  useEffect(() => {
    const { elements, background } = buildTemplateState(appState.selectedTemplate)
    setCanvasElements(elements)
    setHistory([elements.map(el => ({ ...el }))])
    setHistoryIndex(0)
    setSelectedElement(null)
    setCanvasBackground(background)
  }, [appState.selectedTemplate])

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setCanvasElements([...history[newIndex]])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setCanvasElements([...history[newIndex]])
    }
  }

  const handleAddElement = (element) => {
    const newElement = {
      ...element,
      id: Date.now(),
      x: 200,
      y: 200
    }
    const newElements = [...canvasElements, newElement]
    setCanvasElements(newElements)
    addToHistory(newElements)
  }

  const handleUpdateElement = (id, updates) => {
    const newElements = canvasElements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    )
    setCanvasElements(newElements)
    addToHistory(newElements)
  }

  const handleDeleteElement = (id) => {
    const newElements = canvasElements.filter(el => el.id !== id)
    setCanvasElements(newElements)
    addToHistory(newElements)
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const handleSave = () => {
    const today = new Date()
    const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`
    const newProject = {
      id: Date.now(),
      name: `Project ${appState.projects.length + 1}`,
      date: dateStr,
      elements: canvasElements
    }
    setAppState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
    setShowSaveConfirm(true)
    setTimeout(() => setShowSaveConfirm(false), 2000)
  }

  const handleDownload = (format) => {
    alert(`Downloading as ${format}...`)
    setShowDownloadMenu(false)
  }

  return (
    <div className="editor-page">
      <div className="editor-container">
        <LeftToolbar
          onAddElement={handleAddElement}
          onUpdateElement={handleUpdateElement}
          selectedElement={selectedElement}
          projects={appState.projects}
          onBackgroundChange={setCanvasBackground}
        />
        
        <div className="editor-center">
          <div className="editor-toolbar">
            <button
              className="undo-redo-btn"
              onClick={handleUndo}
              disabled={historyIndex === 0}
            >
              UNDO
            </button>
            <button
              className="undo-redo-btn"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
            >
              REDO
            </button>
          </div>
          
          <Canvas
            elements={canvasElements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            template={appState.selectedTemplate}
            background={canvasBackground}
          />
        </div>

        <SuggestionsSidebar
          suggestions={suggestions}
          onApplySuggestion={(type, value) => {
            if (selectedElement) {
              if (type === 'font') {
                handleUpdateElement(selectedElement, { font: value })
              } else if (type === 'color') {
                handleUpdateElement(selectedElement, { backgroundColor: value })
              }
            }
          }}
        />
      </div>

      <div className="editor-bottom">
        <button className="save-btn" onClick={handleSave}>
          SAVE
        </button>
        <div className="download-container">
          <button className="download-btn" onClick={() => setShowDownloadMenu(!showDownloadMenu)}>
            DOWNLOAD
          </button>
          {showDownloadMenu && (
            <div className="download-menu">
              <button onClick={() => handleDownload('PDF')}>PDF</button>
              <button onClick={() => handleDownload('PNG')}>PNG</button>
              <button onClick={() => handleDownload('JPEG')}>JPEG</button>
              <button onClick={() => handleDownload('TIFF')}>TIFF</button>
              <button onClick={() => handleDownload('AI')}>AI</button>
            </div>
          )}
        </div>
      </div>

      {showSaveConfirm && (
        <div className="save-confirm">
          SAVED!
        </div>
      )}
    </div>
  )
}

export default EditorPage

