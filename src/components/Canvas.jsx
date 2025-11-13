import React, { useState } from 'react'
import './Canvas.css'

const Canvas = React.forwardRef(function Canvas(
  { elements, selectedElement, onSelectElement, onUpdateElement, onDeleteElement, template, background },
  forwardedRef
) {
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleElementClick = (e, elementId) => {
    e.stopPropagation()
    onSelectElement(elementId)
  }

  const handleCanvasClick = () => {
    onSelectElement(null)
  }

  const handleElementDoubleClick = (element) => {
    const newContent = prompt('Enter new content:', element.content)
    if (newContent !== null) {
      onUpdateElement(element.id, { content: newContent })
    }
  }

  const handleMouseDown = (e, element) => {
    e.stopPropagation()
    setDragging(element.id)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    onSelectElement(element.id)
  }

  const handleMouseMove = (e) => {
    if (dragging !== null) {
      const canvas = e.currentTarget
      const canvasRect = canvas.getBoundingClientRect()
      const newX = e.clientX - canvasRect.left - dragOffset.x
      const newY = e.clientY - canvasRect.top - dragOffset.y
      onUpdateElement(dragging, { x: Math.max(0, newX), y: Math.max(0, newY) })
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  return (
    <div className="canvas-container" onClick={handleCanvasClick}>
      <div
        ref={forwardedRef}
        className="canvas"
        style={{
          backgroundImage: template ? `url(${template.thumbnail})` : 'none',
          backgroundColor: background || 'white'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className={`canvas-element ${selectedElement === element.id ? 'selected' : ''} ${dragging === element.id ? 'dragging' : ''}`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              fontFamily: element.font || 'Arial',
              fontSize: `${element.fontSize || 24}px`,
              backgroundColor: element.backgroundColor || 'transparent',
              color: element.color || '#000'
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onDoubleClick={() => handleElementDoubleClick(element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {element.type === 'text' ? (
              element.content
            ) : (
              <span className="element-icon">{element.icon}</span>
            )}
            {selectedElement === element.id && (
              <button
                className="delete-element-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteElement(element.id)
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

export default Canvas

