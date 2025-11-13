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
          backgroundColor: background || 'white'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map((element) => {
          const fontSize = element.fontSize || 24
          const fontWeight = element.fontWeight || 400
          // Calculate appropriate line-height based on font size to prevent overlap
          let lineHeight = 'normal'
          if (fontSize >= 60 && fontWeight >= 700) {
            lineHeight = '0.95'
          } else if (fontSize >= 48) {
            lineHeight = '1.0'
          } else if (fontSize >= 32) {
            lineHeight = '1.1'
          } else {
            lineHeight = '1.2'
          }
          
          return (
          <div
            key={element.id}
            className={`canvas-element ${selectedElement === element.id ? 'selected' : ''} ${dragging === element.id ? 'dragging' : ''}`}
            style={{
              left: `${element.x || 0}px`,
              top: `${element.y || 0}px`,
              fontFamily: element.font || 'Arial',
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              backgroundColor: element.backgroundColor || 'transparent',
              color: element.color || '#000',
              textAlign: element.textAlign || 'left',
              maxWidth: element.maxWidth ? `${element.maxWidth}px` : 'none',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              boxSizing: 'border-box',
              lineHeight: lineHeight,
              margin: 0
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
        )
        })}
      </div>
    </div>
  )
})

export default Canvas

