import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Eye, Edit, Trash2, Move, PenTool, X } from 'lucide-react'

// Types
interface Point {
  x: number
  y: number
}

interface Seat {
  id: string
  x: number
  y: number
  row: number
  number: number
  status: 'available' | 'selected' | 'occupied'
  element?: HTMLElement
}

interface Section {
  id: string
  name: string
  points: Point[]
  color: string
  rows: number
  seatsPerRow: number
  bounds?: { minX: number; minY: number; maxX: number; maxY: number }
}

interface SeatMapData {
  sections: Section[]
  stage: { x: number; y: number; width: number; height: number }
}

export default function SeatMapEditor() {
  const svgRef = useRef<SVGSVGElement>(null)
  const seat3DRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [editMode, setEditMode] = useState<'move' | 'draw'>('move')
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [mapData, setMapData] = useState<SeatMapData>({
    sections: [],
    stage: { x: 350, y: 50, width: 300, height: 80 }
  })
  const [is3DView, setIs3DView] = useState(false)
  const [, setCurrentSectionView] = useState<Section | null>(null)
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set())
  const [sectionConfig, setSectionConfig] = useState({ rows: 5, seatsPerRow: 8 })

  // Load GSAP dynamically
  useEffect(() => {
    const loadGSAP = () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
        script.async = true
        script.onload = () => {
          console.log('GSAP loaded successfully')
        }
        document.head.appendChild(script)
      }
    }
    loadGSAP()
  }, [])

  // Initialize D3 SVG
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('class', 'main-group')

    // Add zoom behavior in preview mode
    if (mode === 'preview') {
      const zoom = d3
        .zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
      svg.call(zoom as any)
    }

    // Add click handler for drawing mode
    if (mode === 'edit' && editMode === 'draw' && isDrawing) {
      svg.on('click', handleSvgClick)
    } else {
      svg.on('click', null)
    }

    renderMap(g)
  }, [mapData, mode, editMode, isDrawing, drawingPoints])

  // Handle SVG click for drawing
  const handleSvgClick = (event: any) => {
    if (!isDrawing || editMode !== 'draw') return

    const [x, y] = d3.pointer(event)
    const newPoints = [...drawingPoints, { x, y }]
    setDrawingPoints(newPoints)

    // Check if polygon is closed
    if (newPoints.length > 2) {
      const first = newPoints[0]
      const distance = Math.sqrt(Math.pow(x - first.x, 2) + Math.pow(y - first.y, 2))

      if (distance < 20) {
        createSectionFromPoints(newPoints.slice(0, -1))
        setDrawingPoints([])
        setIsDrawing(false)
      }
    }
  }

  // Create section from drawn points
  const createSectionFromPoints = (points: Point[]) => {
    const bounds = calculateBounds(points)
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `Section ${mapData.sections.length + 1}`,
      points: points,
      color: colors[mapData.sections.length % colors.length],
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      bounds
    }

    setMapData({
      ...mapData,
      sections: [...mapData.sections, newSection]
    })
  }

  // Calculate bounds
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

  // Check if point is inside polygon
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

  // Generate seats within polygon
  const generateSeatsInPolygon = (section: Section): Seat[] => {
    if (!section.bounds) return []

    const seats: Seat[] = []
    const { minX, minY, maxX, maxY } = section.bounds
    const width = maxX - minX
    const height = maxY - minY

    const seatWidth = width / section.seatsPerRow
    const seatHeight = height / section.rows

    for (let row = 0; row < section.rows; row++) {
      for (let col = 0; col < section.seatsPerRow; col++) {
        const x = minX + col * seatWidth + seatWidth / 2
        const y = minY + row * seatHeight + seatHeight / 2

        if (isPointInPolygon({ x, y }, section.points)) {
          seats.push({
            id: `${section.id}-R${row + 1}-S${col + 1}`,
            x,
            y,
            row: row + 1,
            number: col + 1,
            status: occupiedSeats.has(`${section.id}-R${row + 1}-S${col + 1}`) ? 'occupied' : 'available'
          })
        }
      }
    }

    return seats
  }

  // Render map
  const renderMap = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    g.selectAll('*').remove()

    // Add gradient
    const defs = g.append('defs')
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'stage-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')

    gradient.append('stop').attr('offset', '0%').style('stop-color', '#667eea')

    gradient.append('stop').attr('offset', '100%').style('stop-color', '#764ba2')

    // Render stage
    const stage = g.append('g').attr('class', 'stage')
    stage
      .append('rect')
      .attr('x', mapData.stage.x)
      .attr('y', mapData.stage.y)
      .attr('width', mapData.stage.width)
      .attr('height', mapData.stage.height)
      .attr('fill', 'url(#stage-gradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 10)

    stage
      .append('text')
      .attr('x', mapData.stage.x + mapData.stage.width / 2)
      .attr('y', mapData.stage.y + mapData.stage.height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text('STAGE')

    // Render sections
    mapData.sections.forEach((section) => {
      const sectionGroup = g.append('g').attr('class', `section section-${section.id}`)

      // Draw polygon
      const polygonPoints = section.points.map((p) => `${p.x},${p.y}`).join(' ')
      const polygon = sectionGroup
        .append('polygon')
        .attr('points', polygonPoints)
        .attr('fill', section.color)
        .attr('fill-opacity', 0.3)
        .attr('stroke', section.color)
        .attr('stroke-width', 2)
        .attr('cursor', mode === 'preview' ? 'pointer' : 'move')

      // Add label
      if (section.bounds) {
        sectionGroup
          .append('text')
          .attr('x', section.bounds.minX + (section.bounds.maxX - section.bounds.minX) / 2)
          .attr('y', section.bounds.minY - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', section.color)
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(section.name)
      }

      // Render seats in preview mode
      if (mode === 'preview') {
        const seats = generateSeatsInPolygon(section)
        seats.forEach((seat) => {
          const isOccupied = occupiedSeats.has(seat.id)
          sectionGroup
            .append('circle')
            .attr('cx', seat.x)
            .attr('cy', seat.y)
            .attr('r', 8)
            .attr('fill', isOccupied ? '#ef4444' : '#22c55e')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('cursor', 'pointer')
            .attr('class', `seat seat-${seat.id}`)
            .on('mouseover', function () {
              d3.select(this).attr('r', 10)
            })
            .on('mouseout', function () {
              d3.select(this).attr('r', 8)
            })
        })

        // Click handler for 3D view
        polygon.on('click', () => {
          openCinema3DView(section)
        })
      }

      // Add drag in edit mode
      if (mode === 'edit' && editMode === 'move') {
        const drag = d3.drag().on('drag', (event) => {
          const dx = event.dx
          const dy = event.dy
          const newSections = mapData.sections.map((s) => {
            if (s.id === section.id) {
              const newPoints = s.points.map((p) => ({
                x: p.x + dx,
                y: p.y + dy
              }))
              const newBounds = s.bounds
                ? {
                    minX: s.bounds.minX + dx,
                    maxX: s.bounds.maxX + dx,
                    minY: s.bounds.minY + dy,
                    maxY: s.bounds.maxY + dy
                  }
                : undefined
              return { ...s, points: newPoints, bounds: newBounds }
            }
            return s
          })
          setMapData({ ...mapData, sections: newSections })
        })

        sectionGroup.call(drag as any)
      }
    })

    // Render drawing preview
    if (isDrawing && drawingPoints.length > 0) {
      const drawGroup = g.append('g').attr('class', 'drawing-preview')

      for (let i = 0; i < drawingPoints.length - 1; i++) {
        drawGroup
          .append('line')
          .attr('x1', drawingPoints[i].x)
          .attr('y1', drawingPoints[i].y)
          .attr('x2', drawingPoints[i + 1].x)
          .attr('y2', drawingPoints[i + 1].y)
          .attr('stroke', '#00ff00')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
      }

      drawingPoints.forEach((point, index) => {
        drawGroup
          .append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', index === 0 ? 8 : 5)
          .attr('fill', index === 0 ? '#ff0000' : '#00ff00')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
      })
    }
  }

  // Open Cinema 3D View
  const openCinema3DView = (section: Section) => {
    setCurrentSectionView(section)
    setIs3DView(true)

    // Wait for state update then create 3D view
    setTimeout(() => {
      createCinema3DSeats(section)
    }, 100)
  }

  // Create Cinema 3D Seats
  const createCinema3DSeats = (section: Section) => {
    if (!seat3DRef.current || !window.gsap) return

    const container = seat3DRef.current
    container.innerHTML = '' // Clear previous content

    // Create cinema container
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

    // Create screen
    const screen = document.createElement('div')
    screen.style.cssText = `
      width: 600px;
      height: 100px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      margin-bottom: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
    `
    screen.textContent = 'SCREEN'
    cinemaContainer.appendChild(screen)

    // Create seats container
    const seatsContainer = document.createElement('div')
    seatsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    `

    // Create aisle
    const centerAisle = document.createElement('div')
    centerAisle.style.cssText = `
      position: absolute;
      left: 50%;
      top: 180px;
      width: 60px;
      height: 400px;
      background: rgba(255,255,255,0.05);
      border-left: 1px solid rgba(255,255,255,0.1);
      border-right: 1px solid rgba(255,255,255,0.1);
      transform: translateX(-50%);
      pointer-events: none;
    `
    cinemaContainer.appendChild(centerAisle)

    // Create seats
    for (let row = 0; row < section.rows; row++) {
      const rowContainer = document.createElement('div')
      rowContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
      `

      // Left side seats
      const leftSeats = document.createElement('div')
      leftSeats.style.cssText = 'display: flex; gap: 10px;'

      // Right side seats
      const rightSeats = document.createElement('div')
      rightSeats.style.cssText = 'display: flex; gap: 10px;'

      const halfSeats = Math.floor(section.seatsPerRow / 2)

      // Create left side
      for (let col = 0; col < halfSeats; col++) {
        const seatElement = createSeatElement(section, row, col)
        leftSeats.appendChild(seatElement)
      }

      // Create right side
      for (let col = halfSeats; col < section.seatsPerRow; col++) {
        const seatElement = createSeatElement(section, row, col)
        rightSeats.appendChild(seatElement)
      }

      rowContainer.appendChild(leftSeats)
      const spacer = document.createElement('div')
      spacer.style.width = '60px' // Aisle width
      rowContainer.appendChild(spacer)
      rowContainer.appendChild(rightSeats)

      seatsContainer.appendChild(rowContainer)
    }

    cinemaContainer.appendChild(seatsContainer)
    cinemaWrapper.appendChild(cinemaContainer)
    container.appendChild(cinemaWrapper)

    // Animate seats appearance
    const allSeats = container.querySelectorAll('.cinema-seat')
    window.gsap.fromTo(
      allSeats,
      {
        opacity: 0,
        scale: 0,
        rotationY: -180
      },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: 'back.out(1.5)'
      }
    )
  }

  // Create individual seat element
  const createSeatElement = (section: Section, row: number, col: number): HTMLElement => {
    const seatId = `${section.id}-R${row + 1}-S${col + 1}`
    const isOccupied = occupiedSeats.has(seatId)

    const seatWrapper = document.createElement('div')
    seatWrapper.style.cssText = `
      position: relative;
      cursor: pointer;
    `
    seatWrapper.dataset.seatId = seatId
    seatWrapper.dataset.row = String(row)
    seatWrapper.dataset.col = String(col)

    const seat = document.createElement('div')
    seat.className = 'cinema-seat'
    seat.style.cssText = `
      width: 60px;
      height: 70px;
      background: ${
        isOccupied
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      };
      border-radius: 10px 10px 20px 20px;
      position: relative;
      transform-style: preserve-3d;
      transition: all 0.3s ease;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    `

    // Seat back
    const seatBack = document.createElement('div')
    seatBack.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 55px;
      height: 40px;
      background: ${
        isOccupied
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
      };
      border-radius: 10px 10px 5px 5px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `

    // Seat number
    const seatNumber = document.createElement('div')
    seatNumber.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
      pointer-events: none;
      z-index: 10;
    `
    seatNumber.textContent = `${row + 1}-${col + 1}`

    seat.appendChild(seatBack)
    seat.appendChild(seatNumber)
    seatWrapper.appendChild(seat)

    // Add character if occupied
    if (isOccupied) {
      const character = createCharacterOnSeat()
      seatWrapper.appendChild(character)
    }

    // Click handler
    seatWrapper.addEventListener('click', (e) => {
      e.stopPropagation()
      handleSeatClick(seatWrapper, seatId, row, col)
    })

    // Hover effect
    seatWrapper.addEventListener('mouseenter', () => {
      if (window.gsap) {
        window.gsap.to(seat, {
          scale: 1.1,
          y: -5,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    })

    seatWrapper.addEventListener('mouseleave', () => {
      if (window.gsap) {
        window.gsap.to(seat, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    })

    return seatWrapper
  }

  // Create character on seat
  const createCharacterOnSeat = (): HTMLElement => {
    const character = document.createElement('div')
    character.className = 'seated-character'
    character.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 50px;
      pointer-events: none;
      z-index: 5;
    `

    character.innerHTML = `
      <svg width="40" height="50" viewBox="0 0 40 50">
        <ellipse cx="20" cy="12" rx="10" ry="12" fill="#fdbcb4"/>
        <rect x="12" y="20" width="16" height="20" fill="#3b82f6" rx="2"/>
        <rect x="14" y="40" width="5" height="8" fill="#1f2937"/>
        <rect x="21" y="40" width="5" height="8" fill="#1f2937"/>
        <circle cx="16" cy="10" r="1.5" fill="#000"/>
        <circle cx="24" cy="10" r="1.5" fill="#000"/>
      </svg>
    `

    return character
  }

  // Handle seat click
  const handleSeatClick = (seatElement: HTMLElement, seatId: string, row: number, col: number) => {
    if (!window.gsap) return

    const isOccupied = occupiedSeats.has(seatId)
    const seat = seatElement.querySelector('.cinema-seat') as HTMLElement

    if (isOccupied) {
      // Character leaves seat
      const character = seatElement.querySelector('.seated-character')
      if (character) {
        // Animate character standing up and leaving
        const tl = window.gsap.timeline()

        // Stand up
        tl.to(character, {
          y: -20,
          scale: 1.2,
          duration: 0.3,
          ease: 'power2.out'
        })
          // Walk away
          .to(character, {
            x: col < 4 ? -200 : 200, // Exit to nearest side
            opacity: 0,
            duration: 0.8,
            ease: 'power2.in'
          })
          // Update seat color
          .call(() => {
            if (seat) {
              seat.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              const seatBack = seat.querySelector('div')
              if (seatBack) {
                seatBack.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              }
            }
            character.remove()
          })

        // Update state
        const newOccupied = new Set(occupiedSeats)
        newOccupied.delete(seatId)
        setOccupiedSeats(newOccupied)
      }
    } else {
      // Character enters and sits
      animateCharacterToSeat(seatElement, seatId, row, col)
    }
  }

  // Animate character walking to seat and sitting
  const animateCharacterToSeat = (seatElement: HTMLElement, seatId: string, row: number, col: number) => {
    console.log(row)

    if (!window.gsap || !seat3DRef.current) return

    // Create walking character
    const character = document.createElement('div')
    character.className = 'walking-character'
    character.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: ${col < 4 ? '-100px' : 'calc(100% + 100px)'};
      width: 40px;
      height: 60px;
      z-index: 100;
    `

    character.innerHTML = `
      <svg width="40" height="60" viewBox="0 0 40 60">
        <ellipse cx="20" cy="15" rx="12" ry="15" fill="#fdbcb4"/>
        <rect x="10" y="25" width="20" height="25" fill="#3b82f6" rx="2"/>
        <rect class="leg-left" x="12" y="50" width="6" height="10" fill="#1f2937"/>
        <rect class="leg-right" x="22" y="50" width="6" height="10" fill="#1f2937"/>
        <circle cx="15" cy="12" r="2" fill="#000"/>
        <circle cx="25" cy="12" r="2" fill="#000"/>
      </svg>
    `

    // Add character to seat wrapper
    seatElement.appendChild(character)

    // Animate walking to seat
    const tl = window.gsap.timeline()

    // Walk to seat
    tl.to(character, {
      left: '50%',
      x: '-50%',
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: function () {
        // Animate walking legs
        const progress = this.progress()
        const walkCycle = Math.sin(progress * Math.PI * 8) * 10
        const leftLeg = character.querySelector('.leg-left') as SVGElement
        const rightLeg = character.querySelector('.leg-right') as SVGElement
        if (leftLeg && rightLeg) {
          leftLeg.style.transform = `rotate(${walkCycle}deg)`
          rightLeg.style.transform = `rotate(${-walkCycle}deg)`
        }
      }
    })
      // Turn and sit down
      .to(character, {
        y: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.out'
      })
      // Transform to seated position
      .call(() => {
        character.remove()

        // Add seated character
        const seatedChar = createCharacterOnSeat()
        seatElement.appendChild(seatedChar)

        // Update seat color
        const seat = seatElement.querySelector('.cinema-seat') as HTMLElement
        if (seat) {
          seat.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          const seatBack = seat.querySelector('div')
          if (seatBack) {
            seatBack.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          }
        }

        // Animate seated character appearing
        window.gsap.fromTo(
          seatedChar,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }
        )
      })

    // Update state
    const newOccupied = new Set(occupiedSeats)
    newOccupied.add(seatId)
    setOccupiedSeats(newOccupied)
  }

  // Close 3D View
  const close3DView = () => {
    setIs3DView(false)
    setCurrentSectionView(null)
    if (seat3DRef.current) {
      seat3DRef.current.innerHTML = ''
    }
  }

  // Delete section
  const deleteSection = (sectionId: string) => {
    setMapData({
      ...mapData,
      sections: mapData.sections.filter((s) => s.id !== sectionId)
    })
  }

  // Export functions
  const exportToJSON = () => {
    const dataStr = JSON.stringify(mapData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `seatmap-${Date.now()}.json`)
    linkElement.click()
  }

  const exportToSVG = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgRef.current)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = svgUrl
    downloadLink.download = `seatmap-${Date.now()}.svg`
    downloadLink.click()
  }

  return (
    <div className='w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4'>
      <div className='max-w-7xl mx-auto h-full flex flex-col gap-4'>
        {/* Header */}
        <Card className='bg-slate-800/60 backdrop-blur-xl border-purple-500/30 shadow-2xl'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent'>
                🎬 Cinema Seat Map Designer
              </CardTitle>
              <div className='flex gap-2'>
                <Button
                  onClick={() => setMode('edit')}
                  variant={mode === 'edit' ? 'default' : 'outline'}
                  size='sm'
                  className={mode === 'edit' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                >
                  <Edit className='w-4 h-4 mr-1' />
                  Design
                </Button>
                <Button
                  onClick={() => setMode('preview')}
                  variant={mode === 'preview' ? 'default' : 'outline'}
                  size='sm'
                  className={mode === 'preview' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : ''}
                >
                  <Eye className='w-4 h-4 mr-1' />
                  Preview
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className='flex-1 flex gap-4'>
          {/* Sidebar */}
          <Card className='w-80 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 shadow-2xl'>
            <CardContent className='p-4 space-y-4'>
              {mode === 'edit' && (
                <>
                  {/* Drawing Tools */}
                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <PenTool className='w-4 h-4' />
                      Drawing Tools
                    </h3>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        onClick={() => setEditMode('move')}
                        variant={editMode === 'move' ? 'default' : 'outline'}
                        size='sm'
                        className={editMode === 'move' ? 'bg-blue-600' : ''}
                      >
                        <Move className='w-4 h-4 mr-1' />
                        Move
                      </Button>
                      <Button
                        onClick={() => setEditMode('draw')}
                        variant={editMode === 'draw' ? 'default' : 'outline'}
                        size='sm'
                        className={editMode === 'draw' ? 'bg-green-600' : ''}
                      >
                        <PenTool className='w-4 h-4 mr-1' />
                        Draw
                      </Button>
                    </div>

                    {editMode === 'draw' && (
                      <>
                        <div className='space-y-2'>
                          <label className='text-xs text-gray-400'>Rows</label>
                          <input
                            type='number'
                            value={sectionConfig.rows}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, rows: parseInt(e.target.value) || 5 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='20'
                          />
                        </div>
                        <div className='space-y-2'>
                          <label className='text-xs text-gray-400'>Seats per Row</label>
                          <input
                            type='number'
                            value={sectionConfig.seatsPerRow}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, seatsPerRow: parseInt(e.target.value) || 8 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='20'
                          />
                        </div>
                        <Button
                          onClick={() => setIsDrawing(!isDrawing)}
                          className={`w-full ${
                            isDrawing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                          size='sm'
                        >
                          {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
                        </Button>
                        {isDrawing && (
                          <Alert className='bg-green-600/20 border-green-600/50'>
                            <AlertDescription className='text-xs'>
                              Click to add points. Click near first point to close shape.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>

                  {/* Section List */}
                  <div className='space-y-2'>
                    <h3 className='text-sm font-semibold text-purple-300'>Sections</h3>
                    <div className='space-y-1 max-h-40 overflow-y-auto'>
                      {mapData.sections.map((section) => (
                        <div key={section.id} className='flex items-center justify-between p-2 bg-slate-700/50 rounded'>
                          <div className='flex items-center gap-2'>
                            <div className='w-3 h-3 rounded' style={{ backgroundColor: section.color }} />
                            <span className='text-sm'>{section.name}</span>
                          </div>
                          <Button
                            onClick={() => deleteSection(section.id)}
                            size='sm'
                            variant='ghost'
                            className='hover:bg-red-600/20'
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === 'preview' && (
                <Alert className='bg-purple-600/20 border-purple-600/50'>
                  <AlertDescription className='text-sm'>
                    🎬 Click any section to enter 3D Cinema View!
                    <br />
                    <br />
                    In 3D View:
                    <br />
                    • Click empty seat → Character walks in
                    <br />• Click occupied seat → Character leaves
                  </AlertDescription>
                </Alert>
              )}

              {/* Export */}
              <div className='space-y-2 pt-4 border-t border-purple-500/30'>
                <h3 className='text-sm font-semibold text-purple-300'>Export</h3>
                <Button
                  onClick={exportToJSON}
                  className='w-full bg-gradient-to-r from-green-600 to-emerald-600'
                  size='sm'
                >
                  <Download className='w-4 h-4 mr-1' />
                  Export JSON
                </Button>
                <Button onClick={exportToSVG} className='w-full bg-gradient-to-r from-blue-600 to-cyan-600' size='sm'>
                  <Download className='w-4 h-4 mr-1' />
                  Export SVG
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className='flex-1 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 relative overflow-hidden shadow-2xl'>
            <CardContent className='p-0 h-full'>
              {/* SVG Canvas */}
              {!is3DView ? (
                <svg ref={svgRef} className='w-full h-full cursor-crosshair' viewBox='0 0 1000 600' />
              ) : (
                <>
                  {/* 3D View Container */}
                  <div className='w-full h-full bg-gradient-to-b from-slate-900 to-purple-900/50 relative'>
                    <Button
                      onClick={close3DView}
                      className='absolute top-4 left-4 z-50 bg-slate-700/90 backdrop-blur hover:bg-slate-600'
                    >
                      <X className='w-4 h-4 mr-2' />
                      Back to Map
                    </Button>

                    <div
                      ref={seat3DRef}
                      className='w-full h-full overflow-auto'
                      style={{
                        perspective: '1500px',
                        transformStyle: 'preserve-3d'
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className='bg-slate-800/60 backdrop-blur-xl border-purple-500/30'>
          <CardContent className='p-3'>
            <div className='flex items-center justify-between text-sm text-gray-400'>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded'></div>
                  Available
                </span>
                <span className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-red-500 rounded'></div>
                  Occupied
                </span>
              </div>
              <div>Total Seats: {mapData.sections.reduce((acc, s) => acc + s.rows * s.seatsPerRow, 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
