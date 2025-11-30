# Design Ladder

An educational tool that guides novices in creating posters by providing smart suggestions. This is a single-page React application that walks users through a setup process and then provides a full-featured editor.

## Features

- **Multi-page Setup Flow:**
  - Home page with poster type selection (Research/Academic, Social Event, Organizational)
  - Topic selection with custom input support
  - Color scheme selection
  - Template selection with detailed information overlays

- **Interactive Editor:**
  - Three-column layout with toolbar, canvas, and suggestions sidebar
  - Text editing with multiple styles and fonts
  - Element library with draggable icons
  - Background pattern selection
  - Undo/Redo functionality
  - Save projects
  - Export options (PDF, PNG, JPEG, TIFF, AI)

- **Smart Suggestions:**
  - Dynamic suggestions based on poster type and selected topics
  - Alternative font suggestions
  - Alternative background color suggestions
  - Design score indicator
  - Contextual tips

## Implementation Strategy (If Novel)

The novel aspects of this implementation are the **design score** and the **contextual suggestion system**:

**Design Score**: A real-time quality metric calculated from three components:
- 50% Completeness: All template elements (by ID) must be present
- 25% Font Matching: Percentage of elements using template-suggested fonts
- 25% Color Matching: Percentage of elements using template-suggested colors

**Contextual Suggestions**: Grammarly-style suggestion cards that dynamically appear/disappear:
- Font cards only appear when the selected element's font doesn't match template suggestions
- Color cards only appear when text or background colors don't match template suggestions
- Cards automatically disappear when any correct option is applied
- Cards reappear if the user changes back to an incorrect option
- This provides focused, actionable feedback without overwhelming the interface

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Canvas.jsx      # Main canvas area
│   ├── LeftToolbar.jsx # Left sidebar with tools
│   └── SuggestionsSidebar.jsx # Right sidebar with suggestions
├── context/            # React context for state management
│   └── AppContext.jsx
├── data/               # Hardcoded data
│   ├── templates.js    # Template definitions
│   └── suggestions.js  # Suggestion logic
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── TopicPage.jsx
│   ├── ColorsPage.jsx
│   ├── TemplatesPage.jsx
│   └── EditorPage.jsx
├── App.jsx             # Main app component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Usage

1. **Start**: Select a poster type on the home page
2. **Topics**: Choose up to 3 topics (or add custom ones)
3. **Colors**: Select up to 3 color schemes
4. **Template**: Choose a template from the grid
5. **Edit**: Use the editor to customize your poster:
   - Add text elements with different styles
   - Add decorative elements
   - Change fonts and colors
   - Apply suggestions from the sidebar
   - Drag elements to reposition them
6. **Save**: Save your work as a project
7. **Download**: Export in various formats

## Technologies Used

- React 18
- React Router DOM 6
- Vite (build tool)
- CSS3

## Notes

- All data is hardcoded (no database)
- Templates use placeholder images
- Export functionality shows alerts (can be extended with actual export libraries)
- Projects are stored in React state (not persisted)
