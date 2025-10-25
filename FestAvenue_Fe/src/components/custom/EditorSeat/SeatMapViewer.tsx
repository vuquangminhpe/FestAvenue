import { useState, useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DollarSign, X, Eye } from 'lucide-react'
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
}

export default function SeatMapViewer({
  mapData,
  initialSeatStatuses = new Map(),
  onSeatStatusChange,
  onTotalPriceChange,
  readonly = false,
  showControls = true
}: SeatMapViewerProps) {
  const deriveInitialSeatStatuses = useCallback(
    () => buildInitialSeatStatusMap(mapData, initialSeatStatuses),
    [mapData, initialSeatStatuses]
  )
  const [seatStatuses, setSeatStatuses] =
    useState<Map<string, 'available' | 'occupied' | 'locked'>>(deriveInitialSeatStatuses)
  const [totalPrice, setTotalPrice] = useState(0)
  const [is3DView, setIs3DView] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const seat3DRef = useRef<HTMLDivElement>(null)
  const seatManagerRef = useRef(new SeatInteractionManager())

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

  // Handle seat toggle
  const handleQuickSeatToggle = (seatId: string, currentStatus: string) => {
    if (currentStatus === 'locked' || readonly) return

    const newStatus = currentStatus === 'occupied' ? 'available' : 'occupied'
    setSeatStatuses((prev) => new Map(prev).set(seatId, newStatus))
    seatManagerRef.current.setSeatStatus(seatId, newStatus)
    onSeatStatusChange?.(seatId, newStatus)
  }

  // Open 3D view
  const openCinema3DView = (section: Section) => {
    setSelectedSection(section)
    setIs3DView(true)
    setTimeout(() => createCinema3DSeats(section), 100)
  }

  // Create 3D seats
  const createCinema3DSeats = (section: Section) => {
    if (!seat3DRef.current || !window.gsap) return

    const container = seat3DRef.current
    container.innerHTML = ''

    const cinemaWrapper = document.createElement('div')
    cinemaWrapper.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1500px;
    `

    const cinemaContainer = document.createElement('div')
    cinemaContainer.style.cssText = `
      transform-style: preserve-3d;
      transform: rotateX(20deg);
      padding: 50px;
    `

    const screen = document.createElement('div')
    screen.style.cssText = `
      width: 600px;
      height: 100px;
      background: linear-gradient(90deg, #22d3ee 0%, #93c5fd 100%);
      border-radius: 10px;
      margin-bottom: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 20px 60px rgba(34, 211, 238, 0.4);
      pointer-events: none;
      position: relative;
      z-index: 1;
    `
    screen.textContent = (section.displayName || section.name).toUpperCase()
    cinemaContainer.appendChild(screen)

    const seatsContainer = document.createElement('div')
    seatsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
      position: relative;
      z-index: 10;
    `

    for (let row = 0; row < section.rows; row++) {
      const rowContainer = document.createElement('div')
      rowContainer.style.cssText = `display: flex; gap: 10px; justify-content: center;`

      for (let col = 0; col < section.seatsPerRow; col++) {
        rowContainer.appendChild(create3DSeatElement(section, row, col))
      }

      seatsContainer.appendChild(rowContainer)
    }

    cinemaContainer.appendChild(seatsContainer)
    cinemaWrapper.appendChild(cinemaContainer)
    container.appendChild(cinemaWrapper)

    const allSeats = container.querySelectorAll('.cinema-seat')
    window.gsap.fromTo(
      allSeats,
      { opacity: 0, scale: 0, rotationY: -180 },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        stagger: 0.015,
        ease: 'back.out(1.2)'
      }
    )
  }

  // Create 3D seat element
  const create3DSeatElement = (section: Section, row: number, col: number): HTMLElement => {
    const seatId = `${section.id}-R${row + 1}-S${col + 1}`
    const status = seatStatuses.get(seatId) || 'available'
    const isLocked = status === 'locked'
    const isOccupied = status === 'occupied'

    const seatWrapper = document.createElement('div')
    seatWrapper.style.cssText = `
      position: relative;
      cursor: ${isLocked || readonly ? 'not-allowed' : 'pointer'};
      z-index: 100;
      pointer-events: auto;
    `
    seatWrapper.dataset.seatId = seatId
    seatWrapper.dataset.row = String(row)
    seatWrapper.dataset.col = String(col)

    const seat = document.createElement('div')
    seat.className = 'cinema-seat'
    seat.style.cssText = `
      width: 55px;
      height: 65px;
      background: ${
        isLocked
          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          : isOccupied
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      };
      border-radius: 10px 10px 20px 20px;
      position: relative;
      transform-style: preserve-3d;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      ${isLocked ? 'opacity: 0.6;' : ''}
    `

    // Seat back
    const seatBack = document.createElement('div')
    seatBack.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 25px;
      background: inherit;
      border-radius: 10px 10px 0 0;
      border-bottom: 2px solid rgba(0,0,0,0.2);
    `
    seat.appendChild(seatBack)

    // Seat number
    const seatNumber = document.createElement('div')
    seatNumber.style.cssText = `
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 10px;
      font-weight: bold;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    `
    seatNumber.textContent = `${row + 1}-${col + 1}`
    seat.appendChild(seatNumber)

    // Lock icon
    if (isLocked) {
      const lockIcon = document.createElement('div')
      lockIcon.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 18px;
      `
      lockIcon.textContent = '🔒'
      seat.appendChild(lockIcon)
    }

    seatWrapper.appendChild(seat)

    // Click handler
    if (!isLocked && !readonly) {
      seatWrapper.addEventListener('click', (e) => {
        e.stopPropagation()
        seatManagerRef.current.toggleSeat(seatWrapper, seatId, (id, newStatus) => {
          setSeatStatuses((prev) => {
            const newMap = new Map(prev)
            newMap.set(id, newStatus)
            return newMap
          })
          onSeatStatusChange?.(id, newStatus)
        })
      })
    }

    // Hover effects
    if (!isLocked && !readonly) {
      seatWrapper.addEventListener('mouseenter', () => {
        window.gsap?.to(seat, { scale: 1.1, duration: 0.2 })
      })
      seatWrapper.addEventListener('mouseleave', () => {
        window.gsap?.to(seat, { scale: 1, duration: 0.2 })
      })
    }

    return seatWrapper
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

    // Render stage
    if (mapData.stage) {
      g.append('rect')
        .attr('x', mapData.stage.x)
        .attr('y', mapData.stage.y)
        .attr('width', mapData.stage.width)
        .attr('height', mapData.stage.height)
        .attr('fill', '#fbbf24')
        .attr('stroke', '#f59e0b')
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

        const sectionElement = sectionGroup
          .append('path')
          .datum([...section.points, section.points[0]])
          .attr('d', line)
          .attr('fill', section.color || '#3b82f6')
          .attr('fill-opacity', 0.2)
          .attr('stroke', section.color || '#3b82f6')
          .attr('stroke-width', 2)
          .style('cursor', readonly ? 'default' : 'pointer')

        // Section label
        const bounds = section.bounds || calculateBounds(section.points)
        const centerX = (bounds.minX + bounds.maxX) / 2
        const centerY = (bounds.minY + bounds.maxY) / 2

        sectionGroup
          .append('text')
          .attr('x', centerX)
          .attr('y', centerY - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', section.color || '#3b82f6')
          .attr('font-size', '20px')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(section.displayName || section.name)

        // Click section to open 3D view
        if (!readonly) {
          sectionElement.on('click', () => openCinema3DView(section))
        }
      }

      // Render seats
      const seats = section.seats || (section.rows > 0 ? generateSeatsForSection(section) : [])

      seats.forEach((seat) => {
        const status = seatStatuses.get(seat.id) || seat.status

        const hitboxGroup = sectionGroup
          .append('g')
          .attr('class', `seat-group seat-${seat.id}`)
          .style('cursor', status === 'locked' || readonly ? 'not-allowed' : 'pointer')

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
          .attr(
            'fill',
            status === 'locked'
              ? '#6b7280'
              : status === 'occupied'
              ? '#ef4444'
              : seat.category === 'vip'
              ? '#ffd700'
              : '#22c55e'
          )
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('pointer-events', 'none')

        // Lock icon
        if (status === 'locked') {
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
        if (!readonly) {
          hitboxGroup.on('click', (event) => {
            event.stopPropagation()
            handleQuickSeatToggle(seat.id, status)
          })
        }

        // Hover effects
        hitboxGroup
          .on('mouseover', function () {
            if (status !== 'locked') {
              d3.select(this).select('circle').attr('r', 7)

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
            }
          })
          .on('mouseout', function () {
            if (status !== 'locked') {
              d3.select(this).select('circle').attr('r', 5)
            }
            g.selectAll('.tooltip').remove()
          })
      })
    })
  }, [mapData, seatStatuses, generateSeatsForSection, readonly])

  return (
    <div className='w-full h-full'>
      {/* 3D View Modal */}
      {is3DView && selectedSection && (
        <div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center'>
          <div className='bg-gray-900 rounded-lg w-[90vw] h-[90vh] p-6 relative'>
            <Button
              onClick={() => setIs3DView(false)}
              variant='ghost'
              size='sm'
              className='absolute top-4 right-4 text-white hover:bg-white/20'
            >
              <X className='w-5 h-5' />
            </Button>

            <h2 className='text-2xl font-bold text-white mb-4 text-center'>
              {selectedSection.displayName || selectedSection.name} - 3D View
            </h2>

            <div ref={seat3DRef} className='w-full h-[calc(100%-4rem)] overflow-auto' />
          </div>
        </div>
      )}

      {/* Main View */}
      <Card className='w-full h-full bg-gray-900 border-gray-800'>
        <CardHeader>
          <CardTitle className='text-white flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <Eye className='w-6 h-6' />
              Seat Map Viewer {readonly && '(Read Only)'}
            </span>
            {showControls && <span className='text-green-400 text-xl'>Total: ${totalPrice.toFixed(2)}</span>}
          </CardTitle>
        </CardHeader>

        <CardContent className='h-[calc(100%-5rem)]'>
          <div className='flex gap-4 h-full'>
            {/* Map */}
            <div className='flex-1 bg-gray-950 rounded-lg overflow-hidden'>
              <svg ref={svgRef} width='100%' height='100%' className='bg-gray-950' />
            </div>

            {/* Side Panel */}
            {showControls && (
              <div className='w-80 space-y-4 overflow-y-auto'>
                <Alert className='bg-green-600/20 border-green-600/50'>
                  <AlertDescription className='text-sm text-white'>
                    🎬 <strong>Preview Mode</strong>
                    <br />
                    <br />
                    {!readonly && (
                      <>
                        • Click any seat to book/unbook
                        <br />
                      </>
                    )}
                    • Green = Available
                    <br />
                    • Red = Occupied
                    <br />
                    • Gray 🔒 = Locked
                    <br />
                    {!readonly && (
                      <>
                        • Click section for 3D view
                        <br />
                      </>
                    )}
                    <br />
                    Use scroll to zoom
                  </AlertDescription>
                </Alert>

                <div className='bg-green-600/20 border border-green-600/50 rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <DollarSign className='w-5 h-5 text-green-400' />
                      <span className='text-lg font-semibold text-green-400'>Total:</span>
                    </div>
                    <span className='text-2xl font-bold text-green-400'>${totalPrice.toFixed(2)}</span>
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
