import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import ColorsPage from './pages/ColorsPage'
import TemplatesPage from './pages/TemplatesPage'
import EditorPage from './pages/EditorPage'
import { AppContext } from './context/AppContext'

const DEFAULT_STATE = {
    posterType: null,
    topics: [],
    colors: [],
    selectedTemplate: null,
    activeProjectId: null,
    projects: [
      { id: 1, name: 'Project 1', date: '07/02/2023' },
      { id: 2, name: 'Project 2', date: '09/25/2024' }
    ]
}

const STORAGE_KEY = 'designLadderAppState'

const PERSISTED_KEYS = ['projects', 'activeProjectId']

const cloneProjects = (projects = []) => projects.map(project => ({
  ...project,
  elements: project.elements ? project.elements.map(element => ({ ...element })) : undefined
}))

const getInitialState = () => {
  const fallbackState = {
    ...DEFAULT_STATE,
    projects: cloneProjects(DEFAULT_STATE.projects)
  }

  if (typeof window === 'undefined') {
    return fallbackState
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const persistedState = PERSISTED_KEYS.reduce((acc, key) => {
        if (parsed[key] !== undefined) {
          acc[key] = parsed[key]
        }
        return acc
      }, {})

      const mergedProjects = Array.isArray(persistedState.projects)
        ? cloneProjects(persistedState.projects)
        : fallbackState.projects

      return {
        ...fallbackState,
        ...persistedState,
        projects: mergedProjects
      }
    }
  } catch (error) {
    console.warn('Failed to load saved state, falling back to defaults.', error)
  }

  return fallbackState
}

function App() {
  const [appState, setAppState] = useState(getInitialState)
  const persistedState = useMemo(() => {
    const stateToPersist = {}
    PERSISTED_KEYS.forEach((key) => {
      if (key === 'projects') {
        stateToPersist[key] = cloneProjects(appState[key])
      } else {
        stateToPersist[key] = appState[key]
      }
    })
    return stateToPersist
  }, [appState])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState))
    } catch (error) {
      console.warn('Failed to persist app state.', error)
    }
  }, [persistedState])

  return (
    <AppContext.Provider value={{ appState, setAppState }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic" element={<TopicPage />} />
        <Route path="/colors" element={<ColorsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </AppContext.Provider>
  )
}

export default App

