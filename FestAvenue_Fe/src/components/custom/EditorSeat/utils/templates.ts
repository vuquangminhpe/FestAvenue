import type { Section, Point } from '@/types/seat.types'

export interface SectionTemplate {
  id: string
  name: string
  icon: string
  description: string
  gradient: { from: string; to: string }
  color: string
  strokeColor: string
  generateSection: (config: {
    centerX?: number
    centerY?: number
    rows?: number
    seatsPerRow?: number
    name?: string
  }) => Omit<Section, 'id' | 'seats'>
}

// Helper function to create arc points
const createArcPoints = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  segments: number = 20
): Point[] => {
  const points: Point[] = []

  // Outer arc (clockwise)
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments)
    const rad = (angle * Math.PI) / 180
    points.push({
      x: centerX + Math.cos(rad) * outerRadius,
      y: centerY + Math.sin(rad) * outerRadius
    })
  }

  // Inner arc (counter-clockwise)
  for (let i = segments; i >= 0; i--) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments)
    const rad = (angle * Math.PI) / 180
    points.push({
      x: centerX + Math.cos(rad) * innerRadius,
      y: centerY + Math.sin(rad) * innerRadius
    })
  }

  return points
}

// Helper function to calculate bounds
const calculateBounds = (points: Point[]) => {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  }
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  // 1. Theater Style - Curved section
  {
    id: 'theater',
    name: 'Theater',
    icon: '',
    description: 'Khu vực cong quanh sân khấu',
    gradient: { from: '#667eea', to: '#764ba2' },
    color: '#667eea',
    strokeColor: '#5568d3',
    generateSection: ({ centerX = 500, centerY = 300, rows = 8, seatsPerRow = 12, name = 'Theater' }) => {
      const points = createArcPoints(centerX, centerY, 100, 200, 45, 135, 30)
      const bounds = calculateBounds(points)
      return {
        name,
        displayName: name.toUpperCase(),
        points,
        color: '#667eea',
        strokeColor: '#5568d3',
        gradient: { from: '#667eea', to: '#764ba2' },
        rows,
        seatsPerRow,
        bounds,
        shape: 'arc',
        labelPosition: { x: centerX, y: centerY - 20 }
      }
    }
  },

  // 6. Concert Style - Deep curved section
  {
    id: 'concert',
    name: 'Concert',
    icon: '',
    description: 'Khu vực cong sâu cho concert',
    gradient: { from: '#30cfd0', to: '#330867' },
    color: '#30cfd0',
    strokeColor: '#2bb8b9',
    generateSection: ({ centerX = 500, centerY = 300, rows = 12, seatsPerRow = 18, name = 'Concert' }) => {
      const points = createArcPoints(centerX, centerY, 100, 230, 40, 140, 35)
      const bounds = calculateBounds(points)
      return {
        name,
        displayName: name.toUpperCase(),
        points,
        color: '#30cfd0',
        strokeColor: '#2bb8b9',
        gradient: { from: '#30cfd0', to: '#330867' },
        rows,
        seatsPerRow,
        bounds,
        shape: 'arc',
        labelPosition: { x: centerX, y: centerY - 40 }
      }
    }
  }
]

// Helper function to get template by id
export const getTemplateById = (id: string): SectionTemplate | undefined => {
  return SECTION_TEMPLATES.find((t) => t.id === id)
}

// Helper to generate section from template
export const generateSectionFromTemplate = (
  templateId: string,
  config: {
    centerX?: number
    centerY?: number
    rows?: number
    seatsPerRow?: number
    name?: string
  }
): Omit<Section, 'id' | 'seats'> | null => {
  const template = getTemplateById(templateId)
  if (!template) return null
  return template.generateSection(config)
}
