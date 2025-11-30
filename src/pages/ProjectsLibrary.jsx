import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import './ProjectsLibrary.css'

function ProjectsLibrary() {
    const { appState, setAppState } = useContext(AppContext)
    const navigate = useNavigate()

    const handleOpen = (projectId) => {
        setAppState(prev => ({
            ...prev,
            activeProjectId: projectId,
            selectedTemplate: prev.projects.find(p => p.id === projectId)?.template || null
        }))
        navigate('/editor')
    }

    const handleBack = () => {
        navigate('/') // goes back to hub / home
    }

return (
    <div className="projects-page">
        <div className="projects-header">
            <button className="back-btn" onClick={handleBack}>
                BACK
            </button>
            <h1 className="projects-logo">DESIGN LADDER</h1>
        </div>

        <div className="projects-container">
            <h2 className="projects-title">YOUR POSTERS</h2>

            <div className="projects-grid">
                {appState.projects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleOpen(project.id)}>
                    <div className="project-thumbnail">
                        {project.thumbnail ? (
                            <img
                            src={project.thumbnail}
                            alt={`Preview of ${project.name}`}
                            className="project-thumb-image" />
                        ) : (
                            <div className="project-thumb-inner">
                            {/* Fallback abstract preview when no thumbnail yet */}
                            <div className="thumb-bar thumb-bar-1" />
                            <div className="thumb-bar thumb-bar-2" />
                            <div className="thumb-bar thumb-bar-3" />
                            </div>
                        )}
                    </div>
                    <div className="project-meta">
                        <h3 className="project-name">{project.name}</h3>
                        {project.date && (
                            <span className="project-date">{project.date}</span>
                        )}
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
)
}

export default ProjectsLibrary
