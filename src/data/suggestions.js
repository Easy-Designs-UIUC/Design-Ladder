export const getSuggestions = (posterType, topics, colors) => {
  const baseFonts = ['Cambria', 'Ubuntu', 'TimesNewRoman', 'Arial', 'Helvetica', 'Georgia']
  const baseColors = ['Pink', 'Purple', 'Blue', 'Yellow', 'Green', 'Orange']

  let fontSuggestions = [...baseFonts]
  let colorSuggestions = [...baseColors]
  let designScore = 65
  let suggestions = []

  if (posterType === 'RESEARCH/ACADEMIC POSTER') {
    fontSuggestions = ['Cambria', 'TimesNewRoman', 'Georgia', 'Palatino', 'Garamond']
    colorSuggestions = ['Blue', 'Navy', 'Dark Gray', 'Burgundy', 'Forest Green']
    suggestions.push('Focus on readability and clear hierarchy')
    suggestions.push('Use serif fonts for academic content')
    designScore = 70
  } else if (posterType === 'SOCIAL EVENT POSTER') {
    fontSuggestions = ['Ubuntu', 'Arial', 'Helvetica', 'Roboto', 'Open Sans']
    colorSuggestions = ['Pink', 'Purple', 'Blue', 'Yellow', 'Orange', 'Red']
    suggestions.push('Use bold colors and clear fonts')
    suggestions.push('Make event details prominent')
    designScore = 75
  } else if (posterType === 'ORGANIZATIONAL') {
    fontSuggestions = ['Arial', 'Helvetica', 'Roboto', 'Lato', 'Montserrat']
    colorSuggestions = colors.length > 0 ? colors : ['Blue', 'Navy', 'Gray', 'Green']
    suggestions.push('Maintain professional appearance')
    suggestions.push('Use organizational colors')
    designScore = 68
  }

  // Adjust based on selected topics
  if (topics.includes('HACKATHON')) {
    fontSuggestions = ['Ubuntu', 'Roboto', 'Arial', 'Open Sans', 'Fira Code']
    colorSuggestions = ['Blue', 'Purple', 'Green', 'Orange', 'Teal']
    suggestions.push('Tech-focused design with modern fonts')
    designScore += 5
  }

  if (topics.includes('FUNDRAISER')) {
    colorSuggestions = ['Red', 'Pink', 'Purple', 'Blue', 'Yellow']
    suggestions.push('Use warm, inviting colors')
    designScore += 3
  }

  return {
    fonts: fontSuggestions.slice(0, 5),
    colors: colorSuggestions.slice(0, 6),
    designScore: Math.min(designScore, 100),
    suggestions
  }
}

