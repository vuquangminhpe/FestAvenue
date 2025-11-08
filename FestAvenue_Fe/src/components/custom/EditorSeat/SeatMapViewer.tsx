import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DollarSign, Eye, EyeOff } from 'lucide-react'
import type { Seat, SeatMapData, Section, Point } from '@/types/seat.types'

class SeatInteractionManager {
  private animationQueue: Map<string, any> = new Map()
  private seatStates: Map<string, 'available' | 'occupied' | 'locked'> = new Map()

  toggleSeat(
    seatElement: HTMLElement,
    seatId: string,
    onStatusChange: (seatId: string, newStatus: 'available' | 'occupied') => void
  ): boolean {
    const currentStatus = this.seatStates.get(seatId) || 'available'

    if (currentStatus === 'locked') {
      this.showLockedFeedback(seatElement)
      return false
    }

    if (this.animationQueue.has(seatId)) {
      return false
    }

    this.animationQueue.set(seatId, true)

    if (currentStatus === 'occupied') {
      this.animateCharacterLeaving(seatElement, seatId, () => {
        this.seatStates.set(seatId, 'available')
        onStatusChange(seatId, 'available')
        this.animationQueue.delete(seatId)
      })
    } else {
      this.animateCharacterEntering(seatElement, seatId, () => {
        this.seatStates.set(seatId, 'occupied')
        onStatusChange(seatId, 'occupied')
        this.animationQueue.delete(seatId)
      })
    }

    return true
  }

  setSeatStatus(seatId: string, status: 'available' | 'occupied' | 'locked') {
    this.seatStates.set(seatId, status)
  }

  getSeatStatus(seatId: string): 'available' | 'occupied' | 'locked' {
    return this.seatStates.get(seatId) || 'available'
  }

  private animateCharacterLeaving(seatElement: HTMLElement, _seatId: string, onComplete: () => void) {
    if (!window.gsap) {
      onComplete()
      return
    }

    const character = seatElement.querySelector('.seated-character')
    if (!character) {
      onComplete()
      return
    }

    window.gsap.to(character, {
      opacity: 0,
      scale: 0.3,
      y: -30,
      duration: 0.4,
      ease: 'back.in(1.5)',
      onComplete: () => {
        character.remove()
        onComplete()
      }
    })
  }

  private animateCharacterEntering(seatElement: HTMLElement, _seatId: string, onComplete: () => void) {
    if (!window.gsap) {
      onComplete()
      return
    }

    const character = document.createElement('div')
    character.className = 'seated-character'
    character.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 20px;
      pointer-events: none;
      z-index: 10;
    `
    character.textContent = '👤'

    seatElement.appendChild(character)

    window.gsap.fromTo(
      character,
      { opacity: 0, scale: 0, y: -30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        onComplete
      }
    )
  }

  private showLockedFeedback(seatElement: HTMLElement) {
    if (!window.gsap) return

    window.gsap
      .timeline()
      .to(seatElement, { x: -5, duration: 0.1 })
      .to(seatElement, { x: 5, duration: 0.1 })
      .to(seatElement, { x: -5, duration: 0.1 })
      .to(seatElement, { x: 0, duration: 0.1 })
  }
}

const buildInitialSeatStatusMap = (
  mapData: SeatMapData,
  externalStatuses: Map<string, 'available' | 'occupied' | 'locked'>
) => {
  const merged = new Map(externalStatuses)

  mapData.sections.forEach((section) => {
    section.seats?.forEach((seat) => {
      if (!merged.has(seat.id) && seat.status) {
        merged.set(seat.id, seat.status)
      }
    })
  })

  return merged
}

// Helper functions
const calculateBounds = (points: Point[]) => {
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

const isPointInPolygon = (point: Point, polygon: Point[]): boolean => {
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

// Props interface
interface SeatMapViewerProps {
  mapData: SeatMapData
  initialSeatStatuses?: Map<string, 'available' | 'occupied' | 'locked'>
  onSeatStatusChange?: (seatId: string, status: 'available' | 'occupied') => void
  onTotalPriceChange?: (total: number) => void
  readonly?: boolean
  showControls?: boolean
  ticketsForSeats?: any[]
  userEmail?: string
}

export default function SeatMapViewer({
  mapData,
  initialSeatStatuses = new Map(),
  onSeatStatusChange,
  onTotalPriceChange,
  readonly = false,
  showControls = true,
  ticketsForSeats = [],
  userEmail
}: SeatMapViewerProps) {
  // Debug props
  console.log('SeatMapViewer received:', {
    ticketsForSeatsCount: ticketsForSeats.length,
    ticketsForSeats,
    userEmail
  })

  const deriveInitialSeatStatuses = useCallback(
    () => buildInitialSeatStatusMap(mapData, initialSeatStatuses),
    [mapData, initialSeatStatuses]
  )
  const [seatStatuses, setSeatStatuses] =
    useState<Map<string, 'available' | 'occupied' | 'locked'>>(deriveInitialSeatStatuses)
  const [totalPrice, setTotalPrice] = useState(0)
  const [showSectionNames, setShowSectionNames] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)
  const seatManagerRef = useRef(new SeatInteractionManager())
  const zoomBehaviorRef = useRef<any>(null)

  useEffect(() => {
    const mergedStatuses = deriveInitialSeatStatuses()
    setSeatStatuses((prev) => {
      let hasChange = false
      const updated = new Map(prev)

      mergedStatuses.forEach((status, seatId) => {
        if (!updated.has(seatId)) {
          updated.set(seatId, status)
          hasChange = true
        }
      })

      return hasChange ? updated : prev
    })
  }, [deriveInitialSeatStatuses])

  // Load GSAP
  useEffect(() => {
    const loadGSAP = () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
        script.async = true
        document.body.appendChild(script)
      }
    }
    loadGSAP()
  }, [])

  // Sync seat manager with statuses
  useEffect(() => {
    seatStatuses.forEach((status, seatId) => {
      seatManagerRef.current.setSeatStatus(seatId, status)
    })
  }, [seatStatuses])

  // Generate seats for a section
  const generateSeatsForSection = useCallback(
    (section: Section): Seat[] => {
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
    },
    [seatStatuses]
  )

  // Calculate total price
  useEffect(() => {
    let total = 0

    mapData.sections.forEach((section) => {
      const sectionPrice = section.price || 0
      const seats = section.seats || (section.rows > 0 ? generateSeatsForSection(section) : [])

      seats?.forEach((seat) => {
        const seatStatus = seatStatuses.get(seat.id) || seat.status
        if (seatStatus === 'occupied') {
          const seatPrice = seat.price || sectionPrice
          total += seatPrice
        }
      })
    })

    setTotalPrice(total)
    onTotalPriceChange?.(total)
  }, [seatStatuses, mapData, generateSeatsForSection, onTotalPriceChange])

  // Get seat from mapData
  const getSeatFromMapData = (seatId: string): Seat | undefined => {
    for (const section of mapData.sections) {
      const seat = section.seats?.find((s) => s.id === seatId)
      if (seat) return seat
    }
    return undefined
  }

  // Get seat info from ticketsForSeats
  const getSeatInfo = (seatId: string) => {
    return ticketsForSeats.find((t) => t.seatIndex === seatId)
  }

  // Get countdown for a specific seat (15 minutes from paymentInitiatedTime)
  const getSeatCountdown = (seatId: string): string | null => {
    const seatInfo = getSeatInfo(seatId)
    if (!seatInfo?.paymentInitiatedTime || !seatInfo.isSeatLock || seatInfo.isPayment) return null

    const initiatedTime = new Date(seatInfo.paymentInitiatedTime).getTime()
    const currentTime = Date.now()
    const elapsed = currentTime - initiatedTime
    const fifteenMinutes = 15 * 60 * 1000 // 15 minutes in ms
    const remaining = fifteenMinutes - elapsed

    if (remaining <= 0) return null

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get seat color based on status and ownership
  const getSeatColor = (seatId: string, status: string) => {
    const seat = getSeatFromMapData(seatId)
    const seatInfo = getSeatInfo(seatId)

    // PRIORITY 1: Nếu ghế chưa có ticketId → màu cam (đang được chủ sự kiện xử lí)
    if (!seat?.ticketId) {
      console.log(`${seatId} → ORANGE (no ticketId - being processed by organizer)`)
      return '#f97316' // orange-500
    }

    // Debug
    if (seatInfo) {
      console.log(`Seat ${seatId}:`, {
        email: seatInfo.email,
        userEmail,
        isSeatLock: seatInfo.isSeatLock,
        isPayment: seatInfo.isPayment,
        match: seatInfo.email === userEmail
      })
    }

    // Nếu đã payment và là của user → màu tím (ghế đã mua của bạn)
    if (seatInfo?.isPayment && seatInfo?.email === userEmail) {
      console.log(`${seatId} → PURPLE (you paid)`)
      return '#a855f7' // purple-500
    }

    // Nếu đã payment và không phải user → màu xám (đã bán cho người khác)
    if (seatInfo?.isPayment && seatInfo?.email && seatInfo?.email !== userEmail) {
      console.log(`${seatId} → GRAY (other paid)`)
      return '#9ca3af' // gray-400
    }

    // Nếu có email của user và đang lock (chưa payment) → màu xanh dương
    if (seatInfo?.email === userEmail && seatInfo?.isSeatLock && !seatInfo?.isPayment) {
      console.log(`${seatId} → BLUE (user locked)`)
      return '#3b82f6' // blue-500
    }

    // Nếu có email khác và đang lock → màu đỏ
    if (seatInfo?.email && seatInfo?.email !== userEmail && seatInfo?.isSeatLock) {
      console.log(`${seatId} → RED (other locked)`)
      return '#ef4444' // red-500
    }

    // Default colors
    if (status === 'locked') return '#6b7280' // gray-500
    if (status === 'occupied') return '#ef4444' // red-500
    return '#22c55e' // green-500
  }

  // Check if seat is clickable
  const isSeatClickable = (seatId: string) => {
    const seat = getSeatFromMapData(seatId)
    const seatInfo = getSeatInfo(seatId)

    // PRIORITY 1: Nếu ghế chưa có ticketId → không click được (đang được chủ sự kiện xử lí)
    if (!seat?.ticketId) return false

    // Nếu đã payment → không click được
    if (seatInfo?.isPayment) return false

    // Nếu email khác đang lock → không click được
    if (seatInfo?.email && seatInfo?.email !== userEmail && seatInfo?.isSeatLock) {
      return false
    }

    return true
  }

  // Handle seat toggle
  const handleQuickSeatToggle = (seatId: string, currentStatus: string, seatPrice?: number) => {
    if (!isSeatClickable(seatId)) return

    if (currentStatus === 'locked' || readonly) return

    const newStatus = currentStatus === 'occupied' ? 'available' : 'occupied'
    setSeatStatuses((prev) => new Map(prev).set(seatId, newStatus))
    seatManagerRef.current.setSeatStatus(seatId, newStatus)
    onSeatStatusChange?.(seatId, newStatus)

    // Zoom vào ghế
    zoomToSeat(seatId, seatPrice)
  }

  // Zoom to seat
  const zoomToSeat = (seatId: string, seatPrice?: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return

    const svg = d3.select(svgRef.current)
    const seatGroup = svg.select(`.seat-${seatId}`)

    if (seatGroup.empty()) return

    // Get seat position
    const seatElement = seatGroup.node() as SVGGElement
    const bbox = seatElement.getBBox()

    // Calculate transform to center and zoom
    const svgRect = svgRef.current.getBoundingClientRect()
    const scale = 3
    const x = svgRect.width / 2 - bbox.x * scale - (bbox.width * scale) / 2
    const y = svgRect.height / 2 - bbox.y * scale - (bbox.height * scale) / 2

    // Apply zoom
    svg
      .transition()
      .duration(750)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale))

    // Show price tooltip
    if (seatPrice) {
      const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(seatPrice)

      // Create tooltip
      const tooltip = svg.select('g').append('g').attr('class', 'price-tooltip')

      tooltip
        .append('rect')
        .attr('x', bbox.x - 50)
        .attr('y', bbox.y - 50)
        .attr('width', 100)
        .attr('height', 30)
        .attr('fill', 'rgba(6, 182, 212, 0.95)')
        .attr('rx', 5)

      tooltip
        .append('text')
        .attr('x', bbox.x)
        .attr('y', bbox.y - 30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(formattedPrice)

      // Remove tooltip after 3 seconds
      setTimeout(() => {
        tooltip.transition().duration(500).style('opacity', 0).remove()
      }, 3000)
    }
  }

  // Render map
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g')

    // Enable zoom
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)
    zoomBehaviorRef.current = zoom

    // Render stage
    if (mapData.stage) {
      g.append('rect')
        .attr('x', mapData.stage.x)
        .attr('y', mapData.stage.y)
        .attr('width', mapData.stage.width)
        .attr('height', mapData.stage.height)
        .attr('fill', '#06b6d4')
        .attr('stroke', '#0891b2')
        .attr('stroke-width', 2)
        .attr('rx', 5)

      g.append('text')
        .attr('x', mapData.stage.x + mapData.stage.width / 2)
        .attr('y', mapData.stage.y + mapData.stage.height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .text('STAGE')
    }

    // Render sections
    mapData.sections.forEach((section) => {
      const sectionGroup = g.append('g').attr('class', `section-${section.id}`)

      // Draw section boundary
      if (section.points.length > 0) {
        const line = d3
          .line<Point>()
          .x((d) => d.x)
          .y((d) => d.y)

        sectionGroup
          .append('path')
          .datum([...section.points, section.points[0]])
          .attr('d', line)
          .attr('fill', section.color || '#06b6d4')
          .attr('fill-opacity', 0.2)
          .attr('stroke', section.color || '#06b6d4')
          .attr('stroke-width', 2)
          .style('cursor', 'default')

        // Section label (toggle visibility)
        if (showSectionNames) {
          const bounds = section.bounds || calculateBounds(section.points)
          const centerX = (bounds.minX + bounds.maxX) / 2
          const centerY = (bounds.minY + bounds.maxY) / 2

          sectionGroup
            .append('text')
            .attr('x', centerX)
            .attr('y', centerY - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', section.color || '#06b6d4')
            .attr('font-size', '20px')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
            .text(section.displayName || section.name)
        }
      }

      // Render seats
      const seats = section.seats || (section.rows > 0 ? generateSeatsForSection(section) : [])

      seats.forEach((seat) => {
        const status = seatStatuses.get(seat.id) || seat.status
        const seatInfo = getSeatInfo(seat.id)
        const isClickable = isSeatClickable(seat.id)
        const seatColor = getSeatColor(seat.id, status)

        const hitboxGroup = sectionGroup
          .append('g')
          .attr('class', `seat-group seat-${seat.id}`)
          .style('cursor', isClickable && !readonly ? 'pointer' : 'not-allowed')

        // Invisible hitbox
        hitboxGroup
          .append('circle')
          .attr('cx', seat.x)
          .attr('cy', seat.y)
          .attr('r', 12)
          .attr('fill', 'transparent')
          .attr('pointer-events', 'all')

        // Visible seat
        hitboxGroup
          .append('circle')
          .attr('cx', seat.x)
          .attr('cy', seat.y)
          .attr('r', 5)
          .attr('fill', seatColor)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('pointer-events', 'none')

        // Countdown timer circle (for locked seats of current user or others)
        const countdown = getSeatCountdown(seat.id)
        if (countdown && seatInfo?.isSeatLock) {
          const timerColor = seatInfo.email === userEmail ? '#3b82f6' : '#ef4444' // blue for user, red for others

          // Timer circle background
          hitboxGroup
            .append('circle')
            .attr('cx', seat.x)
            .attr('cy', seat.y - 12)
            .attr('r', 10)
            .attr('fill', timerColor)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('pointer-events', 'none')

          // Timer text
          hitboxGroup
            .append('text')
            .attr('x', seat.x)
            .attr('y', seat.y - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .attr('pointer-events', 'none')
            .text(countdown)
        }

        // Lock icon for paid seats
        if (seatInfo?.isPayment) {
          hitboxGroup
            .append('text')
            .attr('x', seat.x)
            .attr('y', seat.y + 1)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('fill', 'white')
            .attr('pointer-events', 'none')
            .text('🔒')
        }

        // Click handler
        if (!readonly && isClickable) {
          hitboxGroup.on('click', (event) => {
            event.stopPropagation()
            handleQuickSeatToggle(seat.id, status, seatInfo?.seatPrice || seat.price)
          })
        }

        // Hover effects
        if (isClickable && !readonly) {
          hitboxGroup
            .on('mouseover', function () {
              d3.select(this).select('circle:nth-child(2)').attr('r', 7)

              const tooltip = g.append('g').attr('class', 'tooltip')
              tooltip
                .append('rect')
                .attr('x', seat.x - 35)
                .attr('y', seat.y - 30)
                .attr('width', 70)
                .attr('height', 20)
                .attr('fill', 'rgba(0,0,0,0.9)')
                .attr('rx', 3)

              tooltip
                .append('text')
                .attr('x', seat.x)
                .attr('y', seat.y - 15)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', '11px')
                .text(`${section.name} R${seat.row}S${seat.number}`)
            })
            .on('mouseout', function () {
              d3.select(this).select('circle:nth-child(2)').attr('r', 5)
              g.selectAll('.tooltip').remove()
            })
        }
      })
    })

    // Update countdown timers every second
    const interval = setInterval(() => {
      svg.selectAll('.seat-group').each(function () {
        const group = d3.select(this)
        const seatId = group.attr('class').split('seat-')[1]
        if (!seatId) return

        const countdown = getSeatCountdown(seatId)
        if (countdown) {
          group.select('text').text(countdown)
        } else {
          group.selectAll('circle:nth-child(3)').remove()
          group.selectAll('text').remove()
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [
    mapData,
    seatStatuses,
    generateSeatsForSection,
    readonly,
    ticketsForSeats,
    userEmail,
    showSectionNames,
    getSeatCountdown,
    getSeatInfo,
    getSeatColor,
    isSeatClickable
  ])

  return (
    <div className='w-full h-full'>
      {/* Main View */}
      <Card className='w-full h-full bg-white border-cyan-200 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-cyan-50 to-blue-50'>
          <CardTitle className='text-gray-800 flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Eye className='w-6 h-6 text-cyan-600' />
              <span className='bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
                Sơ đồ chỗ ngồi {readonly && '(Chỉ xem)'}
              </span>
            </span>
            <div className='flex items-center gap-3'>
              {/* Toggle Section Names */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowSectionNames(!showSectionNames)}
                className='text-cyan-600 border-cyan-300 hover:bg-cyan-50'
              >
                {showSectionNames ? (
                  <>
                    <EyeOff className='w-4 h-4 mr-2' />
                    Ẩn tên khu vực
                  </>
                ) : (
                  <>
                    <Eye className='w-4 h-4 mr-2' />
                    Hiện tên khu vực
                  </>
                )}
              </Button>
              {showControls && (
                <span className='text-cyan-600 text-xl font-bold'>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className='h-[calc(100%-6rem)] p-6'>
          <div className='flex gap-4 h-full w-full'>
            {/* Map */}
            <div className='flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200 min-h-[700px]'>
              <svg ref={svgRef} width='100%' height='100%' className='bg-gradient-to-br from-gray-50 to-gray-100' />
            </div>

            {/* Side Panel */}
            {showControls && (
              <div className='w-80 space-y-4 overflow-y-auto'>
                <Alert className='bg-cyan-50 border-cyan-200'>
                  <AlertDescription className='text-sm text-gray-700'>
                    🎬 <strong>Chú thích màu ghế</strong>
                    <br />
                    <br />
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-full bg-green-500'></div>
                        <span>Ghế trống</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-full bg-blue-500'></div>
                        <span>Ghế của bạn (chờ thanh toán) + Timer</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-full bg-purple-500'></div>
                        <span>Ghế bạn đã mua ✓</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-full bg-red-500'></div>
                        <span>Ghế người khác giữ + Timer</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded-full bg-gray-400'></div>
                        <span>Ghế đã bán 🔒</span>
                      </div>
                    </div>
                    <br />
                    {!readonly && (
                      <>
                        • Click ghế để chọn + zoom + xem giá
                        <br />
                      </>
                    )}
                    • Cuộn để phóng to/thu nhỏ
                  </AlertDescription>
                </Alert>

                <div className='bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4 shadow-sm'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='w-5 h-5 text-cyan-600' />
                      <span className='text-lg font-semibold text-cyan-600'>Tổng:</span>
                    </div>
                    <span className='text-2xl font-bold text-cyan-600'>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
