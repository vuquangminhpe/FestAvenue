import type { Point } from '@/types/seat.types'

/**
 * Calculate bounding box for a set of points
 */
export const calculateBounds = (points: Point[]) => {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  }
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y
    const xj = polygon[j].x,
      yj = polygon[j].y
    const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Find intersection point between two line segments
 */
export const lineIntersection = (p1: Point, p2: Point, p3: Point, p4: Point): Point | null => {
  const x1 = p1.x,
    y1 = p1.y
  const x2 = p2.x,
    y2 = p2.y
  const x3 = p3.x,
    y3 = p3.y
  const x4 = p4.x,
    y4 = p4.y

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (Math.abs(denom) < 1e-10) return null

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    }
  }

  return null
}

/**
 * Generate HSL color for polygon based on index
 */
export const getPolygonColor = (index: number, total: number): string => {
  const hue = (index * 360) / total
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Parse hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '')

  // Handle 3-character hex
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((c) => c + c)
          .join('')
      : cleanHex

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * Convert RGB to HSL
 */
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Check if a color is silver, gray, or metallic (indicating standing zone / no seats)
 * Silver/gray colors typically have:
 * - Low saturation (< 15-20%)
 * - Medium to high lightness (40-85%)
 * - RGB values that are close to each other
 */
export const isSilverOrGrayColor = (color: string): boolean => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    if (!rgb) return false

    const { r, g, b } = rgb
    const hsl = rgbToHsl(r, g, b)

    // Check if color is gray/silver:
    // 1. Low saturation (less than 20%)
    // 2. Lightness between 40% and 85% (typical silver/gray range)
    // 3. RGB values are close to each other (difference < 30)
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b))

    const isLowSaturation = hsl.s < 20
    const isGrayLightness = hsl.l >= 35 && hsl.l <= 85
    const isRgbClose = maxDiff < 40

    return isLowSaturation && isGrayLightness && isRgbClose
  }

  // Handle rgb() format
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])

    const hsl = rgbToHsl(r, g, b)
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b))

    return hsl.s < 20 && hsl.l >= 35 && hsl.l <= 85 && maxDiff < 40
  }

  // Handle hsl() format
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/)
  if (hslMatch) {
    const s = parseInt(hslMatch[2])
    const l = parseInt(hslMatch[3])

    return s < 20 && l >= 35 && l <= 85
  }

  // Named colors that are silver/gray
  const silverGrayNames = [
    'silver',
    'gray',
    'grey',
    'darkgray',
    'darkgrey',
    'lightgray',
    'lightgrey',
    'dimgray',
    'dimgrey',
    'slategray',
    'slategrey',
    'lightslategray',
    'lightslategrey',
    'gainsboro'
  ]

  return silverGrayNames.includes(color.toLowerCase())
}
