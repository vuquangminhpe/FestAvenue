import type { Point, PointConstraint, SemiCircleOrientation } from '@/types/seat.types'
import { calculateBounds } from './geometry'

interface ShapeTransformResult {
  points: Point[]
  constraint: PointConstraint
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

const buildCircleConstraint = (center: Point, radius: number): PointConstraint => ({
  type: 'circle',
  center,
  radius
})

const buildEllipseConstraint = (center: Point, radiusX: number, radiusY: number, rotation = 0): PointConstraint => ({
  type: 'ellipse',
  center,
  radiusX,
  radiusY,
  rotation
})

const buildSemiCircleConstraint = (
  center: Point,
  radius: number,
  orientation: SemiCircleOrientation
): PointConstraint => ({
  type: 'semi-circle',
  center,
  radius,
  orientation
})

const buildArcConstraint = (center: Point, radius: number, startAngle: number, endAngle: number): PointConstraint => ({
  type: 'arc',
  center,
  radius,
  startAngle,
  endAngle
})

const normalizeAngle = (angle: number) => {
  let normalized = angle
  while (normalized < 0) normalized += Math.PI * 2
  while (normalized >= Math.PI * 2) normalized -= Math.PI * 2
  return normalized
}

const clampAngle = (angle: number, start: number, end: number) => {
  const nStart = normalizeAngle(start)
  let nEnd = normalizeAngle(end)
  const nAngle = normalizeAngle(angle)

  if (nEnd <= nStart) {
    nEnd += Math.PI * 2
  }

  let target = nAngle
  if (target < nStart) target += Math.PI * 2

  if (target < nStart) return nStart
  if (target > nEnd) return nEnd
  return target
}

export const createCircleTransform = (points: Point[], count: number): ShapeTransformResult => {
  const bounds = calculateBounds(points)
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  }
  const radius = Math.max(8, Math.min((bounds.maxX - bounds.minX) / 2, (bounds.maxY - bounds.minY) / 2))
  const safeCount = Math.max(6, count)

  const newPoints: Point[] = []
  for (let i = 0; i < safeCount; i++) {
    const angle = (2 * Math.PI * i) / safeCount
    newPoints.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    })
  }

  return {
    points: newPoints,
    constraint: buildCircleConstraint(center, radius)
  }
}

export const createEllipseTransform = (points: Point[], count: number, ratio = 1): ShapeTransformResult => {
  const bounds = calculateBounds(points)
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  }

  const width = Math.max(bounds.maxX - bounds.minX, 16)
  const height = Math.max(bounds.maxY - bounds.minY, 16)

  const radiusX = width / 2
  const radiusY = (height / 2) * ratio
  const safeCount = Math.max(6, count)

  const newPoints: Point[] = []
  for (let i = 0; i < safeCount; i++) {
    const angle = (2 * Math.PI * i) / safeCount
    newPoints.push({
      x: center.x + radiusX * Math.cos(angle),
      y: center.y + radiusY * Math.sin(angle)
    })
  }

  return {
    points: newPoints,
    constraint: buildEllipseConstraint(center, radiusX, radiusY)
  }
}

const semiCircleAngles: Record<SemiCircleOrientation, { start: number; end: number }> = {
  top: { start: Math.PI, end: Math.PI * 2 },
  bottom: { start: 0, end: Math.PI },
  left: { start: Math.PI / 2, end: (3 * Math.PI) / 2 },
  right: { start: -Math.PI / 2, end: Math.PI / 2 }
}

export const createSemiCircleTransform = (
  points: Point[],
  count: number,
  orientation: SemiCircleOrientation
): ShapeTransformResult => {
  const bounds = calculateBounds(points)
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  }

  const width = Math.max(bounds.maxX - bounds.minX, 16)
  const height = Math.max(bounds.maxY - bounds.minY, 16)

  const horizontal = orientation === 'top' || orientation === 'bottom'
  const radius = horizontal ? width / 2 : height / 2
  const { start, end } = semiCircleAngles[orientation]

  const safeCount = Math.max(4, count)
  const arcLength = end - start
  const step = arcLength / (safeCount - 1)
  const newPoints: Point[] = []

  for (let i = 0; i < safeCount; i++) {
    const angle = start + step * i
    newPoints.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    })
  }

  return {
    points: newPoints,
    constraint: buildSemiCircleConstraint(center, radius, orientation)
  }
}

export const createArcTransform = (
  points: Point[],
  count: number,
  startAngleDeg: number,
  sweepAngleDeg: number
): ShapeTransformResult => {
  const bounds = calculateBounds(points)
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  }

  const radius = Math.max(8, Math.min((bounds.maxX - bounds.minX) / 2, (bounds.maxY - bounds.minY) / 2))
  const safeCount = Math.max(3, count)

  const startAngle = toRadians(startAngleDeg)
  const sweepAngle = toRadians(sweepAngleDeg)
  const endAngle = startAngle + sweepAngle

  const step = sweepAngle / (safeCount - 1)
  const newPoints: Point[] = []

  for (let i = 0; i < safeCount; i++) {
    const angle = startAngle + step * i
    newPoints.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    })
  }

  return {
    points: newPoints,
    constraint: buildArcConstraint(center, radius, startAngle, endAngle)
  }
}

export const projectPointToConstraint = (point: Point, constraint: PointConstraint): Point => {
  switch (constraint.type) {
    case 'circle': {
      const dx = point.x - constraint.center.x
      const dy = point.y - constraint.center.y
      const length = Math.hypot(dx, dy) || 1
      return {
        x: constraint.center.x + (dx / length) * constraint.radius,
        y: constraint.center.y + (dy / length) * constraint.radius
      }
    }
    case 'ellipse': {
      const dx = point.x - constraint.center.x
      const dy = point.y - constraint.center.y
      const angle = Math.atan2(dy, dx)
      return {
        x: constraint.center.x + constraint.radiusX * Math.cos(angle),
        y: constraint.center.y + constraint.radiusY * Math.sin(angle)
      }
    }
    case 'semi-circle': {
      const dx = point.x - constraint.center.x
      const dy = point.y - constraint.center.y
      const angle = Math.atan2(dy, dx)
      const { start, end } = semiCircleAngles[constraint.orientation]
      const clampedAngle = clampAngle(angle, start, end)
      return {
        x: constraint.center.x + constraint.radius * Math.cos(clampedAngle),
        y: constraint.center.y + constraint.radius * Math.sin(clampedAngle)
      }
    }
    case 'arc': {
      const dx = point.x - constraint.center.x
      const dy = point.y - constraint.center.y
      const angle = Math.atan2(dy, dx)
      const clampedAngle = clampAngle(angle, constraint.startAngle, constraint.endAngle)
      return {
        x: constraint.center.x + constraint.radius * Math.cos(clampedAngle),
        y: constraint.center.y + constraint.radius * Math.sin(clampedAngle)
      }
    }
    default:
      return point
  }
}

export type { ShapeTransformResult }
