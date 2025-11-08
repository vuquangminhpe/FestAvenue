import type { Seat, Section } from '@/types/seat.types'
import { calculateBounds, isPointInPolygon } from './geometry'

/**
 * Generate seats for a section based on its bounds and configuration
 */
export const generateSeatsForSection = (
  section: Section,
  seatStatuses: Map<string, 'available' | 'occupied' | 'locked'>
): Seat[] => {
  // If section has no seats (standing zone), return empty
  if (section.hasSeats === false) {
    return []
  }

  const seats: Seat[] = []

  if (section.bounds || section.points.length > 0) {
    const bounds = section.bounds || calculateBounds(section.points)
    const { minX, minY, maxX, maxY } = bounds
    const width = maxX - minX
    const height = maxY - minY

    // Use custom seat count if provided
    if (section.customSeatCount && section.customSeatCount > 0) {
      // Calculate optimal rows/cols for custom count
      const totalSeats = section.customSeatCount
      const aspectRatio = width / height
      const rows = Math.ceil(Math.sqrt(totalSeats / aspectRatio))
      const seatsPerRow = Math.ceil(totalSeats / rows)

      const seatSpacingX = width / seatsPerRow
      const seatSpacingY = height / rows

      let seatCount = 0
      for (let row = 0; row < rows && seatCount < totalSeats; row++) {
        for (let col = 0; col < seatsPerRow && seatCount < totalSeats; col++) {
          const x = minX + col * seatSpacingX + seatSpacingX / 2
          const y = minY + row * seatSpacingY + seatSpacingY / 2

          if (!section.points.length || isPointInPolygon({ x, y }, section.points)) {
            const seatId = `${section.id}-R${row + 1}-S${col + 1}`
            const status = seatStatuses.get(seatId) || 'available'
            const seatPrice = section.price || 0
            seats.push({
              id: seatId,
              x,
              y,
              row: row + 1,
              number: col + 1,
              section: section.id,
              status: status,
              price: seatPrice,
              ticketId: section.ticketId
            })
            seatCount++
          }
        }
      }
    } else {
      // Use rows and seatsPerRow (default behavior)
      const seatSpacingX = width / section.seatsPerRow
      const seatSpacingY = height / section.rows

      for (let row = 0; row < section.rows; row++) {
        for (let col = 0; col < section.seatsPerRow; col++) {
          const x = minX + col * seatSpacingX + seatSpacingX / 2
          const y = minY + row * seatSpacingY + seatSpacingY / 2

          if (!section.points.length || isPointInPolygon({ x, y }, section.points)) {
            const seatId = `${section.id}-R${row + 1}-S${col + 1}`
            const status = seatStatuses.get(seatId) || 'available'
            const seatPrice = section.price || 0
            seats.push({
              id: seatId,
              x,
              y,
              row: row + 1,
              number: col + 1,
              section: section.id,
              status: status,
              price: seatPrice,
              ticketId: section.ticketId
            })
          }
        }
      }
    }
  }

  return seats
}
