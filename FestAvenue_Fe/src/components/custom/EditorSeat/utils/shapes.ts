import * as d3 from 'd3'
import type { Point, ShapeType } from '@/types/seat.types'

/**
 * Generate SVG path for different shapes
 */
export const generateShapePath = (shapeType: ShapeType, center: Point, size: number): string => {
  const path = d3.path()

  switch (shapeType) {
    case 'rectangle': {
      const halfSize = size / 2
      path.moveTo(center.x - halfSize, center.y - halfSize)
      path.lineTo(center.x + halfSize, center.y - halfSize)
      path.lineTo(center.x + halfSize, center.y + halfSize)
      path.lineTo(center.x - halfSize, center.y + halfSize)
      path.closePath()
      break
    }
    case 'circle': {
      path.arc(center.x, center.y, size / 2, 0, 2 * Math.PI)
      break
    }
    case 'star': {
      const points = 5
      const outerRadius = size / 2
      const innerRadius = outerRadius * 0.4
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / points - Math.PI / 2
        const x = center.x + radius * Math.cos(angle)
        const y = center.y + radius * Math.sin(angle)
        if (i === 0) path.moveTo(x, y)
        else path.lineTo(x, y)
      }
      path.closePath()
      break
    }
    case 'crescent': {
      const radius = size / 2
      path.arc(center.x, center.y, radius, -Math.PI / 3, Math.PI / 3)
      path.arc(center.x + radius * 0.4, center.y, radius * 0.7, Math.PI / 2, -Math.PI / 2, true)
      path.closePath()
      break
    }
    case 'arc': {
      const radius = size / 2
      path.arc(center.x, center.y, radius, -Math.PI / 4, (5 * Math.PI) / 4)
      const innerRadius = radius * 0.6
      path.arc(center.x, center.y, innerRadius, (5 * Math.PI) / 4, -Math.PI / 4, true)
      path.closePath()
      break
    }
  }

  return path.toString()
}
