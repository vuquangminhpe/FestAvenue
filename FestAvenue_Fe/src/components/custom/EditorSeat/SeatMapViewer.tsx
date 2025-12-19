import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DollarSign, Eye, EyeOff } from 'lucide-react'
import type { Seat, SeatMapData, Section, Point } from '@/types/seat.types'
import { getSkin } from './SkinRegistry'

const buildStarPath = (cx: number, cy: number, spikes = 5, outerRadius = 8, innerRadius = 4) => {
  let path = ''
  const step = Math.PI / spikes
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = cx + Math.cos(i * step - Math.PI / 2) * radius
    const y = cy + Math.sin(i * step - Math.PI / 2) * radius
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return `${path} Z`
}

const buildHexPath = (cx: number, cy: number, radius = 8) => {
  let path = ''
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return `${path} Z`
}

const transformLabelText = (value: string, mode?: 'uppercase' | 'capitalize' | 'none') => {
  if (!mode || mode === 'none') return value
  if (mode === 'uppercase') return value.toUpperCase()
  if (mode === 'capitalize') {
    return value.replace(/\b\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  }
  return value
}

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '')

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
  selectedSeats?: Set<string>
  highlightedTicketId?: string | null
}

export default function SeatMapViewer({
  mapData,
  initialSeatStatuses = new Map(),
  onSeatStatusChange,
  onTotalPriceChange,
  readonly = false,
  showControls = true,
  ticketsForSeats = [],
  userEmail,
  selectedSeats = new Set(),
  highlightedTicketId = null
}: SeatMapViewerProps) {
  const deriveInitialSeatStatuses = useCallback(
    () => buildInitialSeatStatusMap(mapData, initialSeatStatuses),
    [mapData, initialSeatStatuses]
  )
  const [seatStatuses, setSeatStatuses] =
    useState<Map<string, 'available' | 'occupied' | 'locked'>>(deriveInitialSeatStatuses)
  const [totalPrice, setTotalPrice] = useState(0)
  const [showSectionNames, setShowSectionNames] = useState(true)
  const [seatCountdowns, setSeatCountdowns] = useState<Map<string, string>>(new Map())

  const svgRef = useRef<SVGSVGElement>(null)
  const seatManagerRef = useRef(new SeatInteractionManager())
  const zoomBehaviorRef = useRef<any>(null)
  const currentTransformRef = useRef<any>(null) // Store current zoom/pan transform
  const isInitialRenderRef = useRef(true) // Track if it's first render

  // Memoize ticketsForSeats to prevent unnecessary re-renders
  const stableTicketsForSeats = useMemo(() => ticketsForSeats, [JSON.stringify(ticketsForSeats)])

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

  // Update countdown timers every second
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = new Map<string, string>()

      stableTicketsForSeats.forEach((ticket) => {
        if (!ticket?.paymentInitiatedTime || !ticket.isSeatLock || ticket.isPayment) return

        const initiatedTime = new Date(ticket.paymentInitiatedTime).getTime()
        const currentTime = Date.now()
        const elapsed = currentTime - initiatedTime
        const fifteenMinutes = 15 * 60 * 1000
        const remaining = fifteenMinutes - elapsed

        if (remaining > 0) {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          newCountdowns.set(ticket.seatIndex, `${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
      })

      setSeatCountdowns(newCountdowns)
    }

    // Initial update
    updateCountdowns()

    // Update every second
    const interval = setInterval(updateCountdowns, 1000)

    return () => clearInterval(interval)
  }, [stableTicketsForSeats])

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
  const getSeatInfo = useCallback(
    (seatId: string) => {
      return stableTicketsForSeats.find((t) => t.seatIndex === seatId)
    },
    [stableTicketsForSeats]
  )

  // Get countdown for a specific seat from state
  const getSeatCountdown = useCallback(
    (seatId: string): string | null => {
      return seatCountdowns.get(seatId) || null
    },
    [seatCountdowns]
  )

  // Get seat color based on status and ownership
  const getSeatColor = useCallback(
    (seatId: string, _status: string) => {
      const seat = getSeatFromMapData(seatId)
      const seatInfo = stableTicketsForSeats.find((t) => t.seatIndex === seatId)

      // PRIORITY 1: Nếu ghế chưa có ticketId → màu cam (đang được chủ sự kiện xử lí)
      if (!seat?.ticketId) {
        return '#f97316' // orange-500
      }

      // PRIORITY 2: Ghế đang được chọn (chưa lock) → màu vàng/cam nhạt để phân biệt
      if (selectedSeats.has(seatId) && !seatInfo?.isLocked) {
        return '#fb923c' // orange-400 (ghế đang chọn tạm thời)
      }

      // Nếu đã payment và là của user → màu tím (ghế đã mua của bạn)
      if (seatInfo?.isPayment && seatInfo?.email === userEmail) {
        return '#a855f7' // purple-500
      }

      // Nếu đã payment và không phải user → màu xám (đã bán cho người khác)
      if (seatInfo?.isPayment && seatInfo?.email && seatInfo?.email !== userEmail) {
        return '#9ca3af' // gray-400
      }

      // Nếu có email của user và đang lock (chưa payment) → màu xanh dương
      if (seatInfo?.email === userEmail && seatInfo?.isSeatLock && !seatInfo?.isPayment) {
        return '#3b82f6' // blue-500
      }

      // Nếu có email khác và đang lock → màu đỏ
      if (seatInfo?.email && seatInfo?.email !== userEmail && seatInfo?.isSeatLock) {
        return '#ef4444' // red-500
      }

      // Default: ghế trống (xanh lá)
      return '#22c55e' // green-500
    },
    [stableTicketsForSeats, userEmail, mapData, selectedSeats]
  )

  // Check if seat is clickable
  const isSeatClickable = useCallback(
    (seatId: string) => {
      const seat = getSeatFromMapData(seatId)
      const seatInfo = stableTicketsForSeats.find((t) => t.seatIndex === seatId)

      // PRIORITY 1: Nếu ghế chưa có ticketId → không click được (đang được chủ sự kiện xử lí)
      if (!seat?.ticketId) return false

      // Nếu đã payment → không click được
      if (seatInfo?.isPayment) return false

      // Nếu email khác đang lock → không click được
      if (seatInfo?.email && seatInfo?.email !== userEmail && seatInfo?.isSeatLock) {
        return false
      }

      return true
    },
    [stableTicketsForSeats, userEmail, mapData]
  )

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
    const seatGroup = svg.select(`.seat-${safeId(seatId)}`)

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
    svg.transition().duration(750).call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale))

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

  // Update only seat colors and countdowns without full re-render
  const updateSeatsOnly = useCallback(
    (svg: any) => {
      const mainG = svg.select('.main-group')

      mapData.sections.forEach((section) => {
        const seats = section.seats || (section.rows > 0 ? generateSeatsForSection(section) : [])
        const appliedSkin = section.appearance?.templateId ? getSkin(section.appearance.templateId) : null
        const seatSkin = appliedSkin?.seat
        const seatHoverScale = seatSkin?.hoverScale ?? 1.2

        seats.forEach((seat) => {
          const status = seatStatuses.get(seat.id) || seat.status
          const seatInfo = getSeatInfo(seat.id)
          const seatColor = getSeatColor(seat.id, status)
          const countdown = getSeatCountdown(seat.id)
          const isClickable = isSeatClickable(seat.id)

          const seatGroup = svg.select(`.seat-${safeId(seat.id)}`)
          if (seatGroup.empty()) return

          // Update seat color
          const seatVisual = seatGroup.select('.seat-visual')
          if (!seatVisual.empty()) {
            seatVisual.attr('fill', seatColor)
          }

          // Update cursor style based on clickability
          seatGroup.style('cursor', isClickable && !readonly ? 'pointer' : 'not-allowed')

          // Remove ALL old event handlers first
          seatGroup.on('click', null)
          seatGroup.on('mouseover', null)
          seatGroup.on('mouseout', null)

          // Re-attach event handlers ONLY if clickable
          if (!readonly && isClickable) {
            // Click handler
            seatGroup.on('click', (event: any) => {
              event.stopPropagation()
              handleQuickSeatToggle(seat.id, status, seatInfo?.seatPrice || seat.price)
            })

            // Hover effects
            seatGroup
              .on('mouseover', function (this: SVGGElement) {
                const group = d3.select(this)
                const hoverScale = Number(group.attr('data-hover-scale')) || seatHoverScale
                const originX = Number(group.attr('data-origin-x')) || seat.x
                const originY = Number(group.attr('data-origin-y')) || seat.y
                const baseTransformAttr = group.attr('data-base-transform') || ''
                const transformSequence = `${
                  baseTransformAttr ? `${baseTransformAttr} ` : ''
                }translate(${originX}, ${originY}) scale(${hoverScale}) translate(${-originX}, ${-originY})`
                group.attr('transform', transformSequence)

                const tooltip = mainG.append('g').attr('class', 'tooltip')
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
              .on('mouseout', function (this: SVGGElement) {
                const group = d3.select(this)
                const baseTransformAttr = group.attr('data-base-transform') || ''
                if (baseTransformAttr) {
                  group.attr('transform', baseTransformAttr)
                } else {
                  group.attr('transform', null)
                }
                mainG.selectAll('.tooltip').remove()
              })
          }

          // Update or add countdown
          if (countdown && seatInfo?.isSeatLock) {
            const timerColor = seatInfo.email === userEmail ? '#3b82f6' : '#ef4444'

            // Check if countdown elements exist
            let timerCircle = seatGroup.select('circle.timer-circle')
            let timerText = seatGroup.select('text.timer-text')

            if (timerCircle.empty()) {
              // Create countdown elements
              timerCircle = seatGroup
                .append('circle')
                .attr('class', 'timer-circle')
                .attr('cx', seat.x)
                .attr('cy', seat.y - 12)
                .attr('r', 10)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1)
                .attr('pointer-events', 'none')
            }

            if (timerText.empty()) {
              timerText = seatGroup
                .append('text')
                .attr('class', 'timer-text')
                .attr('x', seat.x)
                .attr('y', seat.y - 10)
                .attr('text-anchor', 'middle')
                .attr('font-size', '8px')
                .attr('fill', 'white')
                .attr('font-weight', 'bold')
                .attr('pointer-events', 'none')
            }

            // Update values
            timerCircle.attr('fill', timerColor)
            timerText.text(countdown)
          } else {
            // Remove countdown if not needed
            seatGroup.select('circle.timer-circle').remove()
            seatGroup.select('text.timer-text').remove()
          }

          // Update or add lock icon for paid seats
          const existingLockIcon = seatGroup.select('text.lock-icon')
          if (seatInfo?.isPayment) {
            if (existingLockIcon.empty()) {
              // Create lock icon
              seatGroup
                .append('text')
                .attr('class', 'lock-icon')
                .attr('x', seat.x)
                .attr('y', seat.y + 1)
                .attr('text-anchor', 'middle')
                .attr('font-size', '8px')
                .attr('fill', 'white')
                .attr('pointer-events', 'none')
                .text('🔒')
            }
          } else {
            // Remove lock icon if seat is no longer paid
            existingLockIcon.remove()
          }

          // Update or add highlight ring for filtered ticket (only for unlocked seats)
          const existingHighlight = seatGroup.select('circle.highlight-ring')
          const isLocked = seatInfo?.isSeatLock || seatInfo?.isPayment
          const isHighlighted = highlightedTicketId && seat.ticketId === highlightedTicketId && !isLocked

          if (isHighlighted) {
            if (existingHighlight.empty()) {
              // Create highlight ring with pulsing animation
              seatGroup
                .insert('circle', ':first-child')
                .attr('class', 'highlight-ring')
                .attr('cx', seat.x)
                .attr('cy', seat.y)
                .attr('r', 12)
                .attr('fill', 'none')
                .attr('stroke', '#06b6d4')
                .attr('stroke-width', 3)
                .attr('pointer-events', 'none')
                .style('animation', 'pulse-ring 1.5s ease-in-out infinite')
            }
          } else {
            existingHighlight.remove()
          }
        })
      })
    },
    [
      mapData,
      seatStatuses,
      getSeatInfo,
      getSeatColor,
      getSeatCountdown,
      generateSeatsForSection,
      userEmail,
      selectedSeats,
      isSeatClickable,
      readonly,
      handleQuickSeatToggle,
      highlightedTicketId
    ]
  )

  // Render map
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    // Only clear and rebuild if it's the initial render
    if (isInitialRenderRef.current) {
      svg.selectAll('*').remove()
      isInitialRenderRef.current = false
    } else {
      // On subsequent renders, just update seat colors and countdowns without rebuilding
      updateSeatsOnly(svg)
      return
    }

    const g = svg.append('g').attr('class', 'main-group')
    const defs = g.append('defs')

    // Add CSS animation for highlight ring
    defs
      .append('style')
      .text(`
        @keyframes pulse-ring {
          0% { stroke-opacity: 1; r: 10; }
          50% { stroke-opacity: 0.5; r: 14; }
          100% { stroke-opacity: 1; r: 10; }
        }
        .highlight-ring {
          animation: pulse-ring 1.5s ease-in-out infinite;
        }
      `)

    // Enable zoom and save transform state
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        currentTransformRef.current = event.transform
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)
    zoomBehaviorRef.current = zoom

    // Restore previous transform if exists
    if (currentTransformRef.current) {
      svg.call(zoom.transform as any, currentTransformRef.current)
    }

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
    mapData.sections.forEach((section, index) => {
      const sectionGroup = g.append('g').attr('class', `section-${section.id}`)
      const appliedSkin = section.appearance?.templateId ? getSkin(section.appearance.templateId) : null
      const sectionSafeId = safeId(section.id)

      let fillOpacity = appliedSkin?.zone.opacity ?? 0.2
      let strokeColor = appliedSkin?.zone.strokeColor || section.color || '#06b6d4'
      let strokeWidth = appliedSkin?.zone.strokeWidth || 2
      let fillValue = section.color || '#06b6d4'
      let filterId: string | null = null

      if (section.gradient) {
        const gradientId = `viewer-section-gradient-${index}`
        const gradient = defs
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '100%')
        gradient.append('stop').attr('offset', '0%').style('stop-color', section.gradient.from)
        gradient.append('stop').attr('offset', '100%').style('stop-color', section.gradient.to)
        fillValue = `url(#${gradientId})`
      }

      if (appliedSkin) {
        if (appliedSkin.zone.fillType === 'solid') {
          fillValue = appliedSkin.zone.fillColor || fillValue
        } else if (appliedSkin.zone.fillType === 'linear-gradient' && appliedSkin.zone.gradientStops?.length) {
          const gradientId = `viewer-skin-linear-${sectionSafeId}`
          const gradient = defs
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%')
            .attr('gradientTransform', `rotate(${appliedSkin.zone.gradientRotation ?? 45})`)
          appliedSkin.zone.gradientStops.forEach((stop: { offset: string; color: string }) => {
            gradient.append('stop').attr('offset', stop.offset).style('stop-color', stop.color)
          })
          fillValue = `url(#${gradientId})`
        } else if (appliedSkin.zone.fillType === 'radial-gradient' && appliedSkin.zone.gradientStops?.length) {
          const gradientId = `viewer-skin-radial-${sectionSafeId}`
          const gradient = defs.append('radialGradient').attr('id', gradientId)
          appliedSkin.zone.gradientStops.forEach((stop: { offset: string; color: string }) => {
            gradient.append('stop').attr('offset', stop.offset).style('stop-color', stop.color)
          })
          fillValue = `url(#${gradientId})`
        }

        if (appliedSkin.zone.shadow) {
          const shadowId = `viewer-shadow-${sectionSafeId}`
          const filter = defs
            .append('filter')
            .attr('id', shadowId)
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%')
          filter
            .append('feDropShadow')
            .attr('dx', appliedSkin.zone.shadow.offsetX)
            .attr('dy', appliedSkin.zone.shadow.offsetY)
            .attr('stdDeviation', appliedSkin.zone.shadow.blur)
            .attr('flood-color', appliedSkin.zone.shadow.color)
          filterId = shadowId
        }
      }

      if (section.points.length > 0) {
        const line = d3
          .line<Point>()
          .x((d) => d.x)
          .y((d) => d.y)

        const boundary = sectionGroup
          .append('path')
          .datum([...section.points, section.points[0]])
          .attr('d', line)
          .attr('fill', fillValue)
          .attr('fill-opacity', fillOpacity)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth)
          .style('cursor', 'default')

        if (appliedSkin?.zone.strokeDasharray) {
          boundary.attr('stroke-dasharray', appliedSkin.zone.strokeDasharray)
        }
        if (appliedSkin?.zone.borderRadius) {
          boundary.attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round')
        }

        if (filterId) {
          boundary.style('filter', `url(#${filterId})`)
        }

        // Section label (toggle visibility)
        if (showSectionNames) {
          const bounds = section.bounds || calculateBounds(section.points)
          const centerX = (bounds.minX + bounds.maxX) / 2
          const centerY = (bounds.minY + bounds.maxY) / 2
          const labelSkin = appliedSkin?.label
          const rawLabel = section.displayName || section.name
          const labelText = transformLabelText(rawLabel, labelSkin?.textTransform)
          const labelPadding = labelSkin?.background?.padding ?? 6
          const labelFontSize = labelSkin?.fontSize ?? 16
          const estimatedWidth = Math.max(80, labelText.length * (labelFontSize * 0.6) + labelPadding * 2)
          const labelHeight = labelFontSize + labelPadding * 2

          const labelGroup = sectionGroup.append('g').attr('class', 'section-label')

          labelGroup
            .append('rect')
            .attr('x', centerX - estimatedWidth / 2)
            .attr('y', centerY - labelHeight)
            .attr('width', estimatedWidth)
            .attr('height', labelHeight)
            .attr('fill', labelSkin?.background?.color || 'rgba(0,0,0,0.65)')
            .attr('rx', labelSkin?.background?.borderRadius ?? 4)
            .attr('pointer-events', 'none')

          const labelTextElement = labelGroup
            .append('text')
            .attr('x', centerX)
            .attr('y', centerY - labelPadding)
            .attr('text-anchor', 'middle')
            .attr('fill', labelSkin?.color || '#fff')
            .attr('font-size', labelFontSize)
            .attr('font-family', labelSkin?.fontFamily || 'inherit')
            .attr('font-weight', labelSkin?.fontWeight || 600)
            .attr('pointer-events', 'none')
            .text(labelText)

          if (labelSkin?.letterSpacing !== undefined) {
            labelTextElement.style('letter-spacing', `${labelSkin.letterSpacing}px`)
          }
        }
      }

      // Render seats
      const seats = section.seats || (section.rows > 0 ? generateSeatsForSection(section) : [])

      seats.forEach((seat) => {
        const status = seatStatuses.get(seat.id) || seat.status
        const seatInfo = getSeatInfo(seat.id)
        const isClickable = isSeatClickable(seat.id)
        const seatColor = getSeatColor(seat.id, status)
        const seatSkin = appliedSkin?.seat
        const seatSize = seatSkin ? 5 * seatSkin.size : 5
        const seatHoverScale = seatSkin?.hoverScale ?? 1.2
        const seatStroke = seatSkin?.strokeColor || '#fff'
        const seatStrokeWidth = seatSkin?.strokeWidth || 1
        const seatBorderRadius = seatSkin?.borderRadius ?? seatSize * 0.3

        const hitboxGroup = sectionGroup
          .append('g')
          .attr('class', `seat-group seat-${safeId(seat.id)}`)
          .attr('data-seat-id', seat.id)
          .style('cursor', isClickable && !readonly ? 'pointer' : 'not-allowed')
          .attr('data-origin-x', seat.x)
          .attr('data-origin-y', seat.y)
          .attr('data-hover-scale', seatHoverScale.toString())

        // Invisible hitbox
        hitboxGroup
          .append('circle')
          .attr('cx', seat.x)
          .attr('cy', seat.y)
          .attr('r', 12)
          .attr('fill', 'transparent')
          .attr('pointer-events', 'all')

        // Visible seat
        let visibleSeat: d3.Selection<any, unknown, null, undefined>
        switch (seatSkin?.shape) {
          case 'rect':
            visibleSeat = hitboxGroup
              .append('rect')
              .attr('x', seat.x - seatSize)
              .attr('y', seat.y - seatSize * 0.7)
              .attr('width', seatSize * 2)
              .attr('height', seatSize * 1.4)
              .attr('rx', seatBorderRadius)
            break
          case 'pill': {
            const pillWidth = seatSize * 2.6
            const pillHeight = seatSize * 1.1
            visibleSeat = hitboxGroup
              .append('rect')
              .attr('x', seat.x - pillWidth / 2)
              .attr('y', seat.y - pillHeight / 2)
              .attr('width', pillWidth)
              .attr('height', pillHeight)
              .attr('rx', seatSkin?.borderRadius ?? pillHeight / 2)
            break
          }
          case 'diamond':
            visibleSeat = hitboxGroup
              .append('path')
              .attr(
                'd',
                `M ${seat.x} ${seat.y - seatSize} L ${seat.x + seatSize} ${seat.y} L ${seat.x} ${seat.y + seatSize} L ${
                  seat.x - seatSize
                } ${seat.y} Z`
              )
            break
          case 'star':
            visibleSeat = hitboxGroup.append('path').attr('d', buildStarPath(seat.x, seat.y, 5, seatSize, seatSize / 2))
            break
          case 'hex':
            visibleSeat = hitboxGroup.append('path').attr('d', buildHexPath(seat.x, seat.y, seatSize))
            break
          case 'custom':
            if (seatSkin?.path) {
              visibleSeat = hitboxGroup
                .append('path')
                .attr('d', seatSkin.path)
                .attr('transform', `translate(${seat.x}, ${seat.y}) scale(${seatSize / 10})`)
            } else {
              visibleSeat = hitboxGroup.append('circle').attr('cx', seat.x).attr('cy', seat.y).attr('r', seatSize)
            }
            break
          case 'circle':
          default:
            visibleSeat = hitboxGroup.append('circle').attr('cx', seat.x).attr('cy', seat.y).attr('r', seatSize)
            break
        }

        visibleSeat
          .classed('seat-visual', true)
          .attr('data-seat-shape', seatSkin?.shape || 'circle')
          .attr('fill', seatColor)
          .attr('stroke', seatStroke)
          .attr('stroke-width', seatStrokeWidth)
          .attr('pointer-events', 'none')
          .attr('vector-effect', 'non-scaling-stroke')

        const baseTransform = hitboxGroup.attr('transform') ?? ''
        hitboxGroup.attr('data-base-transform', baseTransform)

        if (seatSkin?.shadow) {
          visibleSeat.style('filter', `drop-shadow(0 0 ${seatSkin.shadow.blur}px ${seatSkin.shadow.color})`)
        }

        // Countdown timer circle (for locked seats of current user or others)
        const countdown = getSeatCountdown(seat.id)
        if (countdown && seatInfo?.isSeatLock) {
          const timerColor = seatInfo.email === userEmail ? '#3b82f6' : '#ef4444' // blue for user, red for others

          // Timer circle background
          hitboxGroup
            .append('circle')
            .attr('class', 'timer-circle')
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
            .attr('class', 'timer-text')
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
            .attr('class', 'lock-icon')
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
              const group = d3.select(this as SVGGElement)
              const hoverScale = Number(group.attr('data-hover-scale')) || seatHoverScale
              const originX = Number(group.attr('data-origin-x')) || seat.x
              const originY = Number(group.attr('data-origin-y')) || seat.y
              const baseTransformAttr = group.attr('data-base-transform') || ''
              const transformSequence = `${
                baseTransformAttr ? `${baseTransformAttr} ` : ''
              }translate(${originX}, ${originY}) scale(${hoverScale}) translate(${-originX}, ${-originY})`
              group.attr('transform', transformSequence)

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
              const group = d3.select(this as SVGGElement)
              const baseTransformAttr = group.attr('data-base-transform') || ''
              if (baseTransformAttr) {
                group.attr('transform', baseTransformAttr)
              } else {
                group.attr('transform', null)
              }
              g.selectAll('.tooltip').remove()
            })
        }
      })
    })

    // No need for interval here - countdown state is updated separately
  }, [
    mapData,
    readonly,
    showSectionNames,
    updateSeatsOnly
    // Intentionally omitting: seatStatuses, stableTicketsForSeats, seatCountdowns
    // These will trigger updateSeatsOnly instead of full rebuild
  ])

  // Update seats when seat-related data changes (without full rebuild)
  useEffect(() => {
    if (!svgRef.current || isInitialRenderRef.current) return

    const svg = d3.select(svgRef.current)
    updateSeatsOnly(svg)
  }, [seatStatuses, stableTicketsForSeats, seatCountdowns, selectedSeats, updateSeatsOnly, highlightedTicketId])

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
