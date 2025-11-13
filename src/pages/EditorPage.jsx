
import React, { useState, useContext, useCallback, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
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
  const { appState, setAppState } = useContext(AppContext)
  const initialTemplateState = buildTemplateState(appState.selectedTemplate)
  const [canvasElements, setCanvasElements] = useState(initialTemplateState.elements)
  const [selectedElement, setSelectedElement] = useState(null)
  const [history, setHistory] = useState([initialTemplateState.elements.map(el => ({ ...el }))])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [canvasBackground, setCanvasBackground] = useState(initialTemplateState.background)
  const canvasRef = useRef(null)
  const lastLoadedProjectId = useRef(null)
  const hasClearedQuizSelections = useRef(false)


  const suggestions = getSuggestions(appState.posterType, appState.topics, appState.colors)

  // Clear quiz selections when first reaching the editor page
  useEffect(() => {
    if (!hasClearedQuizSelections.current) {
      // Only clear if there are quiz selections present
      if (appState.posterType || appState.topics?.length > 0 || appState.colors?.length > 0 || appState.selectedTemplate) {
        setAppState(prev => ({
          ...prev,
          posterType: null,
          topics: [],
          colors: [],
          selectedTemplate: null
        }))
        hasClearedQuizSelections.current = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

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

  useEffect(() => {
    const { activeProjectId, projects } = appState

    if (!activeProjectId) {
      lastLoadedProjectId.current = null
      return
    }

    if (lastLoadedProjectId.current === activeProjectId) {
      return
    }

    const activeProject = projects.find((project) => project.id === activeProjectId)
    if (!activeProject) {
      lastLoadedProjectId.current = null
      return
    }

    const elementsToLoad = activeProject.elements
      ? cloneElements(activeProject.elements)
      : cloneElements(DEFAULT_CANVAS_ELEMENTS)

    setCanvasElements(elementsToLoad)
    setHistory([cloneElements(elementsToLoad)])
    setHistoryIndex(0)
    setCanvasBackground(activeProject.background || null)
    setSelectedElement(null)
    lastLoadedProjectId.current = activeProjectId
  }, [appState.activeProjectId, appState.projects])

  const handleProjectSelect = useCallback((projectId) => {
    if (projectId === appState.activeProjectId) {
      return
    }

    setAppState(prev => ({
      ...prev,
      activeProjectId: projectId
    }))
  }, [appState.activeProjectId, setAppState])

  const handleSave = useCallback(() => {
    const today = new Date()
    const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`
    const projectId = appState.activeProjectId

    if (!projectId) {
      const defaultName = `Project ${appState.projects.length + 1}`
      const userInput = prompt('Enter a name for your project:', defaultName)

      if (userInput === null) {
        return
      }

      const projectName = userInput.trim() || defaultName
      const newProjectId = Date.now()

      setAppState(prev => ({
        ...prev,
        activeProjectId: newProjectId,
        projects: [
          ...prev.projects,
          {
            id: newProjectId,
            name: projectName,
            date: dateStr,
            elements: cloneElements(canvasElements),
            background: canvasBackground
          }
        ]
      }))
      lastLoadedProjectId.current = newProjectId
    } else {
      setAppState(prev => ({
        ...prev,
        projects: prev.projects.map(project =>
          project.id === projectId
            ? {
                ...project,
                date: dateStr,
                elements: cloneElements(canvasElements),
                background: canvasBackground
              }
            : project
        )
      }))
    }

    setShowSaveConfirm(true)
    setTimeout(() => setShowSaveConfirm(false), 2000)
  }, [appState.activeProjectId, appState.projects.length, canvasBackground, canvasElements, setAppState])

  const handleDownload = useCallback(async (format) => {
    if (!canvasRef.current) {
      return
    }

    const unsupportedFormats = ['TIFF', 'AI']
    if (unsupportedFormats.includes(format)) {
      alert(`${format} downloads are not supported yet.`)
      return
    }

    try {
      const canvasElement = canvasRef.current
      const captureCanvas = await html2canvas(canvasElement, {
        backgroundColor: null,
        scale: window.devicePixelRatio || 1
      })

      const timestamp = new Date().toISOString().replace(/[:.-]/g, '')
      const baseFilename = `design_poster_${timestamp}`

      if (format === 'PDF') {
        const imgData = captureCanvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: captureCanvas.width >= captureCanvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [captureCanvas.width, captureCanvas.height]
        })

        pdf.addImage(imgData, 'PNG', 0, 0, captureCanvas.width, captureCanvas.height)
        pdf.save(`${baseFilename}.pdf`)
      } else {
        const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg'
        const extension = format === 'PNG' ? 'png' : 'jpg'
        const dataUrl = captureCanvas.toDataURL(mimeType, 1.0)
        const downloadLink = document.createElement('a')
        downloadLink.href = dataUrl
        downloadLink.download = `${baseFilename}.${extension}`
        downloadLink.click()
      }
    } catch (error) {
      console.error('Failed to download poster', error)
      alert('Sorry, there was a problem preparing the download. Please try again.')
    }
  }, [])

  return (
    <div className="editor-page">
      <div className="editor-container">
        <LeftToolbar
          onAddElement={handleAddElement}
          onUpdateElement={handleUpdateElement}
          selectedElement={selectedElement}
          projects={appState.projects}
          activeProjectId={appState.activeProjectId}
          onBackgroundChange={setCanvasBackground}
          handleSave={handleSave}
          handleDownload={handleDownload}
          onSelectProject={handleProjectSelect}
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
            ref={canvasRef}
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
      {showSaveConfirm && (
        <div className="save-confirm">
          SAVED!
        </div>
      )}
    </div>
  )
}

export default EditorPage

