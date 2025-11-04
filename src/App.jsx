import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import ColorsPage from './pages/ColorsPage'
import TemplatesPage from './pages/TemplatesPage'
import EditorPage from './pages/EditorPage'
import { AppContext } from './context/AppContext'

function App() {
  const [appState, setAppState] = useState({
    posterType: null,
    topics: [],
    colors: [],
    selectedTemplate: null,
    projects: [
      { id: 1, name: 'Project 1', date: '07/02/2023' },
      { id: 2, name: 'Project 2', date: '09/25/2024' }
    ]
  })

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

