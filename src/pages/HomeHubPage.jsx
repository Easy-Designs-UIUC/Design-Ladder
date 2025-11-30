import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import './HomeHubPage.css'

function HomeHubPage() {
    const navigate = useNavigate()
    const { appState, setAppState } = useContext(AppContext)

    const handleCreateNew = () => {
        // Reset active project and go to quiz as usual
        setAppState(prev => ({
            ...prev,
            posterType: null,
            topics: [],
            colors: [],
            selectedTemplate: null,
            activeProjectId: null
        }))
        navigate('/topic')
    }

    const handleExisting = () => {
        navigate('/projects')
    }

    return (
        <div className="hub-page">
            <div className="hub-header">
                <h1 className="hub-logo">DESIGN LADDER</h1>
            </div>

            <div className="hub-container">
                <h2 className="hub-title">WELCOME BACK</h2>

                <div className="hub-buttons">
                    <button className="hub-btn create-btn" onClick={handleCreateNew}>
                        Create New Poster
                    </button>

                    <button className="hub-btn existing-btn" onClick={handleExisting}>
                        Edit Existing Posters
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HomeHubPage
