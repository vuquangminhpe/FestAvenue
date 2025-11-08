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

  // 2. Stadium Style - Wide arc
  {
    id: 'stadium',
    name: '🏟️ Stadium',
    icon: '🏟️',
    description: 'Khu vực hình oval rộng',
    gradient: { from: '#f093fb', to: '#f5576c' },
    color: '#f093fb',
    strokeColor: '#e082ea',
    generateSection: ({ centerX = 500, centerY = 300, rows = 10, seatsPerRow = 20, name = 'Stadium' }) => {
      const points = createArcPoints(centerX, centerY, 120, 220, 30, 150, 40)
      const bounds = calculateBounds(points)
      return {
        name,
        displayName: name.toUpperCase(),
        points,
        color: '#f093fb',
        strokeColor: '#e082ea',
        gradient: { from: '#f093fb', to: '#f5576c' },
        rows,
        seatsPerRow,
        bounds,
        shape: 'arc',
        labelPosition: { x: centerX, y: centerY - 30 }
      }
    }
  },

  // 3. Arena Style - Rectangular premium section
  {
    id: 'arena',
    name: '🏛️ Arena',
    icon: '🏛️',
    description: 'Khu vực chữ nhật cao cấp',
    gradient: { from: '#4facfe', to: '#00f2fe' },
    color: '#4facfe',
    strokeColor: '#3d9bed',
    generateSection: ({ centerX = 500, centerY = 300, rows = 6, seatsPerRow = 10, name = 'Arena' }) => {
      const width = seatsPerRow * 20
      const height = rows * 25
      const points: Point[] = [
        { x: centerX - width / 2, y: centerY - height / 2 },
        { x: centerX + width / 2, y: centerY - height / 2 },
        { x: centerX + width / 2, y: centerY + height / 2 },
        { x: centerX - width / 2, y: centerY + height / 2 }
      ]
      const bounds = calculateBounds(points)
      return {
        name,
        displayName: name.toUpperCase(),
        points,
        color: '#4facfe',
        strokeColor: '#3d9bed',
        gradient: { from: '#4facfe', to: '#00f2fe' },
        rows,
        seatsPerRow,
        bounds,
        shape: 'rectangle',
        labelPosition: { x: centerX, y: centerY }
      }
    }
  },

  // 4. Conference Style - Grid layout
  {
    id: 'conference',
    name: '📊 Conference',
    icon: '📊',
    description: 'Lưới ghế ngay ngắn',
    gradient: { from: '#43e97b', to: '#38f9d7' },
    color: '#43e97b',
    strokeColor: '#3cd670',
    generateSection: ({ centerX = 500, centerY = 300, rows = 8, seatsPerRow = 15, name = 'Conference' }) => {
      const width = seatsPerRow * 18
      const height = rows * 22
      const points: Point[] = [
        { x: centerX - width / 2, y: centerY - height / 2 },
        { x: centerX + width / 2, y: centerY - height / 2 },
        { x: centerX + width / 2, y: centerY + height / 2 },
        { x: centerX - width / 2, y: centerY + height / 2 }
      ]
      const bounds = calculateBounds(points)
      return {
        name,
        displayName: name.toUpperCase(),
        points,
        color: '#43e97b',
        strokeColor: '#3cd670',
        gradient: { from: '#43e97b', to: '#38f9d7' },
        rows,
        seatsPerRow,
        bounds,
        shape: 'grid',
        labelPosition: { x: centerX, y: centerY }
      }
    }
  },

  // 5. Circular Arena - Full circle section
  {
    id: 'circular',
    name: '⭕ Circular',
    icon: '⭕',
    description: 'Vòng tròn 360 độ',
    gradient: { from: '#fa709a', to: '#fee140' },
    color: '#fa709a',
    strokeColor: '#e96089',
    generateSection: ({ centerX = 500, centerY = 300, rows = 6, seatsPerRow = 15, name = 'Circular' }) => {
      const points = createArcPoints(centerX, centerY, 80, 150, 0, 180, 50)
      const bounds = calculateBounds(points)
      return {
        name,
        displayName: name.toUpperCase(),
        points,
        color: '#fa709a',
        strokeColor: '#e96089',
        gradient: { from: '#fa709a', to: '#fee140' },
        rows,
        seatsPerRow,
        bounds,
        shape: 'arc',
        labelPosition: { x: centerX, y: centerY - 15 }
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
