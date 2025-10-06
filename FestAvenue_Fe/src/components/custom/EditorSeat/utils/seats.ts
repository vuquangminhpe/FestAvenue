import type { Seat, Section } from '@/types/seat.types'
import { calculateBounds, isPointInPolygon } from './geometry'

/**
 * Generate seats for a section based on its bounds and configuration
 */
export const generateSeatsForSection = (
  section: Section,
  seatStatuses: Map<string, 'available' | 'occupied' | 'locked'>
): Seat[] => {
  const seats: Seat[] = []

  if (section.bounds || section.points.length > 0) {
    const bounds = section.bounds || calculateBounds(section.points)
    const { minX, minY, maxX, maxY } = bounds
    const width = maxX - minX
    const height = maxY - minY

    const seatSpacingX = width / section.seatsPerRow
    const seatSpacingY = height / section.rows

    for (let row = 0; row < section.rows; row++) {
      for (let col = 0; col < section.seatsPerRow; col++) {
        const x = minX + col * seatSpacingX + seatSpacingX / 2
        const y = minY + row * seatSpacingY + seatSpacingY / 2

        if (!section.points.length || isPointInPolygon({ x, y }, section.points)) {
          const seatId = `${section.id}-R${row + 1}-S${col + 1}`
          const status = seatStatuses.get(seatId) || 'available'
          const seatPrice = section.price || 10
          seats.push({
            id: seatId,
            x,
            y,
            row: row + 1,
            number: col + 1,
            section: section.id,
            status: status,
            category: section.category === 'vip' ? 'vip' : 'standard',
            price: seatPrice
          })
        }
      }
    }
  }

  return seats
}
