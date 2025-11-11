import puppeteer from 'puppeteer'
import { readFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load templates by mocking image imports and dynamically importing the module
async function loadTemplates() {
  const templatesPath = join(__dirname, '../src/data/templates.js')
  const content = readFileSync(templatesPath, 'utf-8')
  
  // Mock image imports with placeholder data URI
  const mockThumbnail = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const modifiedContent = content
    .replace(/import (\w+) from ['"][^'"]+\.png['"]/g, `const $1 = '${mockThumbnail}'`)
  
  // Create temporary file with mocked imports and import it
  const tempFile = join(__dirname, 'temp-templates.mjs')
  const fs = await import('fs')
  const contentWithoutExport = modifiedContent.replace(/export const templates =/, 'const templates =')
  fs.writeFileSync(tempFile, contentWithoutExport + '\nexport { templates }')
  
  try {
    const { templates } = await import(`file://${tempFile}`)
    fs.unlinkSync(tempFile)
    return templates
  } catch (error) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
    throw error
  }
}

// Normalize template elements: flatten nested position/style objects to match Canvas format
const normalizeTemplateElements = (elements = []) =>
  elements.map((element) => {
    // Already flat format
    if (element.x !== undefined && element.y !== undefined) {
      return { ...element }
    }

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

    // Element type (emoji icons)
    return {
      id: element.id,
      type: 'element',
      elementType: element.elementType || element.style,
      icon: element.icon,
      x: position.x,
      y: position.y
    }
  })

// Generate HTML for a template canvas
const generateCanvasHTML = (template) => {
  const layout = template.layout || {}
  const elements = normalizeTemplateElements(layout.elements || [])
  const background = layout.background || 'white'
  const canvasSize = layout.canvasSize || { width: 800, height: 1000 }

  const elementsHTML = elements.map((element) => {
    const fontSize = element.fontSize || 24
    const fontWeight = element.fontWeight || 400
    
    // Use tighter line-height for large fonts to prevent overlap in thumbnails
    let lineHeight = 'normal'
    if (fontSize >= 60 && fontWeight >= 700) {
      lineHeight = '0.95'
    } else if (fontSize >= 48) {
      lineHeight = '1.0'
    } else if (fontSize >= 32) {
      lineHeight = '1.1'
    }
    
    const styles = [
      `position: absolute`,
      `left: ${element.x}px`,
      `top: ${element.y}px`,
      `font-family: ${element.font || 'Arial'}`,
      `font-size: ${fontSize}px`,
      `color: ${element.color || '#000'}`,
      `background-color: ${element.backgroundColor || 'transparent'}`,
      element.fontWeight ? `font-weight: ${element.fontWeight}` : '',
      element.textAlign ? `text-align: ${element.textAlign}` : '',
      element.maxWidth ? `max-width: ${element.maxWidth}px` : '',
      `padding: 0.5rem`,
      `min-width: 100px`,
      `white-space: pre-wrap`,
      lineHeight !== 'normal' ? `line-height: ${lineHeight}` : '',
      `margin: 0`,
      `border: 2px dashed transparent`,
      `box-sizing: border-box`
    ].filter(Boolean).join('; ')

    if (element.type === 'text') {
      return `<div style="${styles}">${element.content || ''}</div>`
    } else {
      return `<div style="${styles}; font-size: 3rem; padding: 0.5rem;">${element.icon || '⭐'}</div>`
    }
  }).join('\n')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Mukta:wght@400;500;600;700&family=Baloo+2:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap');
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #e9ecef;
      padding: 2rem;
      font-family: Arial, sans-serif;
    }
    .canvas {
      width: ${canvasSize.width}px;
      height: ${canvasSize.height}px;
      background: ${background};
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="canvas">
    ${elementsHTML}
  </div>
</body>
</html>
  `.trim()
}

async function generateThumbnails() {
  console.log('Starting thumbnail generation...')
  
  const outputDir = join(__dirname, '../src/assets/templates')
  mkdirSync(outputDir, { recursive: true })

  const templates = await loadTemplates()
  
  if (!templates || templates.length === 0) {
    throw new Error('No templates loaded')
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    for (const template of templates) {
      if (!template.layout) {
        console.log(`Skipping ${template.id} - no layout defined`)
        continue
      }

      console.log(`Generating thumbnail for ${template.id}...`)

      const html = generateCanvasHTML(template)
      const page = await browser.newPage()
      
      // Set viewport to match canvas size
      const canvasSize = template.layout.canvasSize || { width: 800, height: 1000 }
      await page.setViewport({
        width: canvasSize.width + 200, // Add padding
        height: canvasSize.height + 200,
        deviceScaleFactor: 2 // Higher resolution
      })

      await page.setContent(html, { waitUntil: 'networkidle0' })
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for font rendering

      const screenshotOptions = {
        path: join(outputDir, `${template.id}.png`),
        type: 'png',
        clip: {
          x: 100,
          y: 100,
          width: canvasSize.width,
          height: canvasSize.height
        }
      }

      await page.screenshot(screenshotOptions)
      await page.close()

      console.log(`✓ Generated ${template.id}.png`)
    }
  } finally {
    await browser.close()
  }

  console.log('✓ All thumbnails generated successfully!')
}

generateThumbnails().catch(console.error)
