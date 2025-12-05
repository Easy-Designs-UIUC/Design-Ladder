/**
 * Utility functions for template configuration
 * 
 * TO ADJUST EMOJI POSITION FOR ALL TEMPLATES:
 * Modify the values in EMOJI_POSITION_CONFIG below and all templates will use the new position.
 */

/**
 * Configuration for emoji element positioning across all templates
 * Adjust these values to change emoji placement globally
 */
export const EMOJI_POSITION_CONFIG = {
  marginRight: 20,    // Distance from right edge (pixels)
  marginBottom: 304,  // Distance from bottom edge (pixels) - sets y position to 700
  elementWidth: 76,   // Element width: 60px icon + 16px padding
  elementHeight: 76   // Element height: 60px icon + 16px padding
}

/**
 * Calculate the default position for emoji elements at the bottom right corner of the canvas
 * This ensures the element stays within canvas bounds while maintaining consistent placement
 * 
 * @param {Object} canvasSize - Canvas dimensions { width: number, height: number }
 * @param {Object} options - Optional overrides for config (defaults to EMOJI_POSITION_CONFIG)
 * @returns {Object} Position object { x: number, y: number }
 */
export const getDefaultEmojiPosition = (canvasSize, options = {}) => {
  const config = { ...EMOJI_POSITION_CONFIG, ...options }
  
  const x = canvasSize.width - config.elementWidth - config.marginRight
  const y = canvasSize.height - config.elementHeight - config.marginBottom

  return {
    x: Math.max(0, Math.round(x)),
    y: Math.max(0, Math.round(y))
  }
}

/**
 * Get emoji position for a specific canvas size
 * This is a convenience function that uses the default config
 */
export const getEmojiPosition = (canvasWidth, canvasHeight) => {
  return getDefaultEmojiPosition({ width: canvasWidth, height: canvasHeight })
}

