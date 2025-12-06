import { useRef, useEffect, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { calculateBounds } from '../utils/geometry'

import { getSkin } from '../SkinRegistry'
import type { EditTool, Point, PointConstraint, SeatMapData, Section, ShapeType } from '@/types/seat.types'
import type { TicketsCharForSeatsType } from '@/types/serviceTicketManagement.types'
import { projectPointToConstraint } from '../utils/shapeTransforms'

// Helper functions
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

interface SeatMapCanvasProps {
  mode: 'edit'
  mapData: SeatMapData
  setMapData: React.Dispatch<React.SetStateAction<SeatMapData>>
  editTool: EditTool
  setEditTool: React.Dispatch<React.SetStateAction<EditTool>>
  selectedSection: Section | null
  setSelectedSection: React.Dispatch<React.SetStateAction<Section | null>>
  seatStatuses: Map<string, 'available' | 'occupied' | 'locked'>
  setSeatStatuses: React.Dispatch<React.SetStateAction<Map<string, 'available' | 'occupied' | 'locked'>>>
  colorPicker: {
    fill: string
    stroke: string
    useGradient: boolean
    gradientFrom: string
    gradientTo: string
  }
  isImageImportMode: boolean
  splitLine: { start: Point; end: Point } | null
  setSplitLine: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
  isSplitting: boolean
  splitFirstPoint: Point | null
  setSplitFirstPoint: React.Dispatch<React.SetStateAction<Point | null>>
  editingPoints: { sectionId: string; points: Point[] } | null
  setEditingPoints: React.Dispatch<React.SetStateAction<{ sectionId: string; points: Point[] } | null>>
  selectedPointIndex: number | null
  setSelectedPointIndex: React.Dispatch<React.SetStateAction<number | null>>
  pointConstraint: PointConstraint | null
  setPointConstraint: React.Dispatch<React.SetStateAction<PointConstraint | null>>
  drawingPoints: Point[]
  setDrawingPoints: React.Dispatch<React.SetStateAction<Point[]>>
  isDrawing: boolean
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
  draggedSection: string | null
  setDraggedSection: React.Dispatch<React.SetStateAction<string | null>>
  dragOffset: Point
  setDragOffset: React.Dispatch<React.SetStateAction<Point>>
  editingLabel: string | null
  setEditingLabel: React.Dispatch<React.SetStateAction<string | null>>
  setLabelText: React.Dispatch<React.SetStateAction<string>>
  setEditingSeatTicket: React.Dispatch<React.SetStateAction<string | null>>
  setSelectedTicketId: React.Dispatch<React.SetStateAction<string>>
  seatManagerRef: React.MutableRefObject<any>
  splitSection: (section: Section, lineStart: Point, lineEnd: Point) => void
  createShapeSection: (center: Point) => void
  createSectionFromPoints: (points: Point[]) => void
  updatePointPosition: (pointIndex: number, newPosition: Point) => void
  handleSeatLockToggle: (seatId: string, currentStatus: string, seatLabel: string) => void
  pointConstraintRef: React.MutableRefObject<PointConstraint | null>
  editingPointsRef: React.MutableRefObject<{ sectionId: string; points: Point[] } | null>
  selectedShape: ShapeType
  // Ticket booking status
  ticketsForSeats?: TicketsCharForSeatsType[]
  canModifySection?: (sectionId: string) => boolean
}

export default function SeatMapCanvas({
  mode,
  mapData,
  setMapData,
  editTool,
  selectedSection,
  setSelectedSection,
  seatStatuses,
  colorPicker,
  isImageImportMode,
  splitLine,
  setSplitLine,
  isSplitting,
  splitFirstPoint,
  setSplitFirstPoint,
  editingPoints,
  selectedPointIndex,
  setSelectedPointIndex,

  drawingPoints,
  setDrawingPoints,
  isDrawing,
  setIsDrawing,
  draggedSection,
  setDraggedSection,
  dragOffset,
  setDragOffset,
  editingLabel,
  setEditingLabel,
  setLabelText,
  setEditingSeatTicket,
  setSelectedTicketId,
  splitSection,
  createShapeSection,
  createSectionFromPoints,
  updatePointPosition,
  handleSeatLockToggle,
  pointConstraintRef,
  editingPointsRef,
  selectedShape,
  ticketsForSeats = [],
  canModifySection
}: SeatMapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Create a map for fast lookup of seat booking info
  const seatBookingMap = useMemo(() => {
    const map = new Map<string, TicketsCharForSeatsType>()
    ticketsForSeats.forEach((ticket) => {
      map.set(ticket.seatIndex, ticket)
    })
    return map
  }, [ticketsForSeats])

  // Get seat color based on booking status
  // Colors:
  // - Dark yellow/Orange (#f59e0b): Seat without ticketId (not assigned yet by event owner)
  // - Red (#ef4444): Seat is being held (isSeatLock=true && isPayment=false)
  // - Silver/Gray (#9ca3af): Seat has been purchased (isPayment=true)
  // - Green (#22c55e): Available seat
  const getSeatColor = useCallback(
    (seat: any, section: Section) => {
      console.log(section)

      // Check if seat has ticketId (assigned by event owner)
      if (!seat.ticketId) {
        return '#f59e0b' // Dark yellow/Orange - not assigned yet
      }

      // Check booking info from ticketsForSeats
      const bookingInfo = seatBookingMap.get(seat.id)

      if (bookingInfo) {
        // Seat has been purchased
        if (bookingInfo.isPayment) {
          return '#9ca3af' // Silver/Gray - purchased
        }
        // Seat is being held (locked but not paid)
        if (bookingInfo.isSeatLock) {
          return '#ef4444' // Red - being held
        }
      }

      // Check local seat status as fallback
      const localStatus = seatStatuses.get(seat.id)
      if (localStatus === 'locked') {
        return '#6b7280' // Gray for locally locked
      }
      if (localStatus === 'occupied') {
        return '#ef4444' // Red for locally occupied
      }

      return '#22c55e' // Green - available
    },
    [seatBookingMap, seatStatuses]
  )

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('class', 'main-group')

    // Enable zoom and pan
    const zoom = d3
      .zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom as any)

    if (mode === 'edit') {
      if (editTool === 'draw' && isDrawing) {
        svg.on('click', handleSvgClick)
      } else if (editTool === 'shape') {
        svg.on('click', (event) => {
          const [x, y] = d3.pointer(event, g.node())
          createShapeSection({ x, y })
        })
      } else if (editTool === 'split' && selectedSection) {
        // Check if section can be modified before allowing split
        const sectionCanBeSplit = canModifySection ? canModifySection(selectedSection.id) : true
        if (!sectionCanBeSplit) {
          // Section has booked seats, don't allow split - clear handlers
          svg.on('click', null)
          svg.on('mousemove', null)
          svg.on('mousedown', null)
          svg.on('mouseup', null)
        } else {
          // Two-click mode: first click for start point, second click for end point
          svg.on('click', (event) => {
            const [x, y] = d3.pointer(event, g.node())

            if (!splitFirstPoint) {
              setSplitFirstPoint({ x, y })
              setSplitLine({ start: { x, y }, end: { x, y } })
            } else {
              const finalLine = { start: splitFirstPoint, end: { x, y } }
              setSplitLine(finalLine)

              if (selectedSection) {
                splitSection(selectedSection, finalLine.start, finalLine.end)
                setSplitLine(null)
                setSplitFirstPoint(null)
              }
            }
          })

          svg.on('mousemove', (event) => {
            if (splitFirstPoint) {
              const [x, y] = d3.pointer(event, g.node())
              setSplitLine({ start: splitFirstPoint, end: { x, y } })
            }
          })

          svg.on('mousedown', null)
          svg.on('mouseup', null)
        }
      } else {
        svg.on('click', null)
        svg.on('mousedown', null)
        svg.on('mousemove', null)
        svg.on('mouseup', null)
      }
    }

    renderMap(g)
  }, [
    mapData,
    mode,
    editTool,
    isDrawing,
    drawingPoints,
    selectedSection,
    seatStatuses,
    colorPicker,
    draggedSection,
    editingLabel,
    isImageImportMode,
    splitLine,
    isSplitting,
    splitFirstPoint,
    editingPoints,
    selectedPointIndex,
    selectedShape,
    ticketsForSeats,
    getSeatColor,
    seatBookingMap,
    canModifySection
  ])

  const handleSvgClick = (event: any) => {
    if (!isDrawing || editTool !== 'draw') return

    const [x, y] = d3.pointer(event)
    const newPoints = [...drawingPoints, { x, y }]
    setDrawingPoints(newPoints)

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

  const handleSectionMouseDown = (event: MouseEvent, sectionId: string) => {
    if (editTool !== 'move') return
    event.stopPropagation()

    // Check if section can be modified (no booked/purchased seats)
    if (canModifySection && !canModifySection(sectionId)) {
      return // Cannot move section with booked seats
    }

    const svg = svgRef.current
    if (!svg) return

    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())

    const section = mapData.sections.find((s) => s.id === sectionId)
    if (!section) return

    const bounds = section.bounds || (section.points.length > 0 ? calculateBounds(section.points) : null)
    if (!bounds) return

    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2

    setDragOffset({
      x: svgP.x - centerX,
      y: svgP.y - centerY
    })
    setDraggedSection(sectionId)
    setSelectedSection(section)
  }

  const handleSvgMouseMove = (event: MouseEvent) => {
    if (!draggedSection || editTool !== 'move') return

    const svg = svgRef.current
    if (!svg) return

    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())

    const newX = svgP.x - dragOffset.x
    const newY = svgP.y - dragOffset.y

    setMapData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === draggedSection) {
          const bounds = section.bounds || (section.points.length > 0 ? calculateBounds(section.points) : null)
          if (!bounds) return section

          const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
          const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2
          const dx = newX - centerX
          const dy = newY - centerY

          return {
            ...section,
            points: section.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            bounds: section.bounds
              ? {
                  minX: section.bounds.minX + dx,
                  maxX: section.bounds.maxX + dx,
                  minY: section.bounds.minY + dy,
                  maxY: section.bounds.maxY + dy
                }
              : undefined,
            seats: section.seats?.map((seat) => ({
              ...seat,
              x: seat.x + dx,
              y: seat.y + dy
            })),
            labelPosition: section.labelPosition
              ? {
                  x: section.labelPosition.x + dx,
                  y: section.labelPosition.y + dy
                }
              : undefined,
            position: section.position
              ? {
                  x: section.position.x + dx,
                  y: section.position.y + dy
                }
              : undefined
          }
        }
        return section
      })
    }))
  }

  const handleSvgMouseUp = () => {
    setDraggedSection(null)
  }

  useEffect(() => {
    if (mode === 'edit' && editTool === 'move') {
      document.addEventListener('mousemove', handleSvgMouseMove)
      document.addEventListener('mouseup', handleSvgMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleSvgMouseMove)
        document.removeEventListener('mouseup', handleSvgMouseUp)
      }
    }
  }, [mode, editTool, draggedSection, dragOffset])

  const renderMap = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    g.selectAll('*').remove()

    const defs = g.append('defs')

    const stageGradient = defs
      .append('linearGradient')
      .attr('id', 'stage-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
    stageGradient.append('stop').attr('offset', '0%').style('stop-color', '#667eea')
    stageGradient.append('stop').attr('offset', '100%').style('stop-color', '#764ba2')

    mapData.sections.forEach((section, i) => {
      if (section.gradient) {
        const grad = defs
          .append('linearGradient')
          .attr('id', `section-gradient-${i}`)
          .attr('x1', '0%')
          .attr('y1', '0%')
          .attr('x2', '100%')
          .attr('y2', '100%')
        grad.append('stop').attr('offset', '0%').style('stop-color', section.gradient.from)
        grad.append('stop').attr('offset', '100%').style('stop-color', section.gradient.to)
      }
    })

    // Only render stage if not in image import mode
    if (!isImageImportMode && mapData.stage.width > 0) {
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
        .text('SÂN KHẤU')
    }

    if (mapData.aisles) {
      const aisles = g.append('g').attr('class', 'aisles')
      mapData.aisles.forEach((aisle) => {
        aisles
          .append('rect')
          .attr('x', aisle.start.x - aisle.width / 2)
          .attr('y', aisle.start.y)
          .attr('width', aisle.width)
          .attr('height', aisle.end.y - aisle.start.y)
          .attr('fill', 'rgba(255,255,255,0.05)')
          .attr('stroke', 'rgba(255,255,255,0.2)')
          .attr('stroke-dasharray', '5,5')
      })
    }

    mapData.sections.forEach((section, index) => {
      // Check if section can be modified
      const sectionCanBeModified = canModifySection ? canModifySection(section.id) : true

      const sectionGroup = g
        .append('g')
        .attr('class', `section section-${section.id}`)
        .style('opacity', section.layer ? 1 - section.layer * 0.1 : 1)
        .style('cursor', sectionCanBeModified ? (editTool === 'move' ? 'move' : 'pointer') : 'not-allowed')

      const appliedSkin = section.appearance?.templateId ? getSkin(section.appearance.templateId) : null
      const sectionSafeId = safeId(section.id)
      let fillOpacity = appliedSkin?.zone.opacity ?? 0.3
      // Show red border for locked sections (has booked seats)
      let strokeColor = !sectionCanBeModified
        ? '#ef4444' // Red border for locked sections
        : section.hasSeats === false
        ? '#A0A0A0'
        : section.strokeColor || section.color
      let strokeWidth = selectedSection?.id === section.id ? 3 : !sectionCanBeModified ? 3 : 2
      let fillValue =
        section.hasSeats === false ? '#C0C0C0' : section.gradient ? `url(#section-gradient-${index})` : section.color
      let filterId: string | null = null

      if (appliedSkin) {
        // Preserve red border for locked sections even with skin
        if (sectionCanBeModified) {
          strokeColor = appliedSkin.zone.strokeColor
        }
        strokeWidth = !sectionCanBeModified ? 3 : appliedSkin.zone.strokeWidth
        fillOpacity = appliedSkin.zone.opacity ?? 0.85

        if (appliedSkin.zone.fillType === 'solid') {
          fillValue = appliedSkin.zone.fillColor || fillValue
        } else if (appliedSkin.zone.fillType === 'linear-gradient' && appliedSkin.zone.gradientStops?.length) {
          const gradientId = `skin-linear-${sectionSafeId}`
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
          const gradientId = `skin-radial-${sectionSafeId}`
          const gradient = defs.append('radialGradient').attr('id', gradientId)
          appliedSkin.zone.gradientStops.forEach((stop: { offset: string; color: string }) => {
            gradient.append('stop').attr('offset', stop.offset).style('stop-color', stop.color)
          })
          fillValue = `url(#${gradientId})`
        }

        if (appliedSkin.zone.shadow) {
          const shadowId = `skin-shadow-${sectionSafeId}`
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

      let sectionElement: d3.Selection<any, unknown, null, undefined> | null = null
      if (section.path) {
        sectionElement = sectionGroup.append('path').attr('d', section.path)
      } else if (section.points.length > 0) {
        const polygonPoints = section.points.map((p) => `${p.x},${p.y}`).join(' ')
        sectionElement = sectionGroup.append('polygon').attr('points', polygonPoints)
      }

      if (sectionElement) {
        sectionElement
          .attr('fill', fillValue)
          .attr('fill-opacity', fillOpacity)
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth)
        if (appliedSkin?.zone.strokeDasharray) {
          sectionElement.attr('stroke-dasharray', appliedSkin.zone.strokeDasharray)
        }
        if (appliedSkin?.zone.borderRadius) {
          sectionElement.attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round')
        }
        if (filterId) {
          sectionElement.style('filter', `url(#${filterId})`)
        }
      }

      if (mode === 'edit') {
        if (editTool === 'select' && sectionElement) {
          sectionElement.on('click', (event) => {
            event.stopPropagation()
            setSelectedSection(section)
          })
        } else if (editTool === 'move' && sectionElement) {
          sectionElement.on('mousedown', (event) => handleSectionMouseDown(event, section.id))
        } else if (editTool === 'label' && sectionElement) {
          sectionElement.on('click', (event) => {
            event.stopPropagation()
            setEditingLabel(section.id)
            setLabelText(section.displayName || section.name)
          })
        }
      }

      // Render section label
      if (section.labelPosition || section.bounds || section.points.length > 0) {
        let labelX, labelY

        if (section.labelPosition) {
          labelX = section.labelPosition.x
          labelY = section.labelPosition.y
        } else if (section.position) {
          labelX = section.position.x
          labelY = section.position.y
        } else if (section.bounds) {
          labelX = section.bounds.minX + (section.bounds.maxX - section.bounds.minX) / 2
          labelY = section.bounds.minY + (section.bounds.maxY - section.bounds.minY) / 2
        } else {
          const bounds = calculateBounds(section.points)
          labelX = bounds.minX + (bounds.maxX - bounds.minX) / 2
          labelY = bounds.minY + (bounds.maxY - bounds.minY) / 2
        }

        const labelGroup = sectionGroup.append('g').attr('class', 'section-label')
        const labelSkin = appliedSkin?.label
        const rawLabelText = section.displayName || section.name
        const labelTextContent = transformLabelText(rawLabelText, labelSkin?.textTransform)
        const labelPadding = labelSkin?.background?.padding ?? 6
        const labelFontSize = labelSkin?.fontSize ?? 12
        const estimatedWidth = Math.max(80, labelTextContent.length * (labelFontSize * 0.6) + labelPadding * 2)
        const labelHeight = labelFontSize + labelPadding * 2

        // Background for better readability
        labelGroup
          .append('rect')
          .attr('x', labelX - estimatedWidth / 2)
          .attr('y', labelY - labelHeight / 2)
          .attr('width', estimatedWidth)
          .attr('height', labelHeight)
          .attr('fill', labelSkin?.background?.color || 'rgba(0,0,0,0.7)')
          .attr('rx', labelSkin?.background?.borderRadius ?? 4)
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')
          .on('dblclick', (event) => {
            event.stopPropagation()
            event.preventDefault()
            setEditingLabel(section.id)
            setLabelText(section.displayName || section.name)
          })
          .on('contextmenu', (event) => {
            event.preventDefault()
            event.stopPropagation()
            setEditingLabel(section.id)
            setLabelText(section.displayName || section.name)
          })
          .append('title')
          .text('Nhấp đúp hoặc chuột phải để sửa tên khu vực')

        const labelTextElement = labelGroup
          .append('text')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', labelSkin?.color || '#fff')
          .attr('font-size', labelFontSize)
          .attr('font-weight', labelSkin?.fontWeight || 'bold')
          .attr('font-family', labelSkin?.fontFamily || 'inherit')
          .text(labelTextContent)
          .style('cursor', 'pointer')
          .style('pointer-events', 'all')
          .on('dblclick', (event) => {
            event.stopPropagation()
            event.preventDefault()
            setEditingLabel(section.id)
            setLabelText(section.displayName || section.name)
          })
          .on('contextmenu', (event) => {
            event.preventDefault()
            event.stopPropagation()
            setEditingLabel(section.id)
            setLabelText(section.displayName || section.name)
          })
          .append('title')
          .text('Nhấp đúp hoặc chuột phải để sửa tên khu vực')
          .style('pointer-events', 'none')

        if (labelSkin?.letterSpacing !== undefined) {
          labelTextElement.style('letter-spacing', `${labelSkin.letterSpacing}px`)
        }

        // Add lock indicator for locked sections (has booked seats)
        if (!sectionCanBeModified) {
          labelGroup
            .append('text')
            .attr('x', labelX + estimatedWidth / 2 - 5)
            .attr('y', labelY - labelHeight / 2 - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('fill', '#ef4444')
            .attr('pointer-events', 'none')
            .text('🔒')
            .append('title')
            .text('Khu vực này có ghế đã được đặt/mua, không thể chỉnh sửa')
        }
      }

      // Render seats for this section in edit mode
      if (mode === 'edit' && section.seats && section.seats.length > 0) {
        section.seats.forEach((seat) => {
          const status = seatStatuses.get(seat.id) || seat.status
          const seatSkin = appliedSkin?.seat
          const seatSize = seatSkin ? 5 * seatSkin.size : 5
          const seatHoverScale = seatSkin?.hoverScale ?? 1.2
          // Use new color logic based on booking status
          const seatFill = getSeatColor(seat, section)
          const seatStroke = seatSkin?.strokeColor || '#fff'
          const seatStrokeWidth = seatSkin?.strokeWidth || 1
          const seatBorderRadius = seatSkin?.borderRadius ?? seatSize * 0.3

          // Get booking info for seat icon
          const bookingInfo = seatBookingMap.get(seat.id)

          const seatGroup = sectionGroup
            .append('g')
            .attr('class', `seat-group seat-${seat.id}`)
            .style('cursor', 'pointer')
            .attr('data-origin-x', seat.x)
            .attr('data-origin-y', seat.y)
            .attr('data-hover-scale', seatHoverScale.toString())

          // Invisible hitbox for better click area
          seatGroup
            .append('circle')
            .attr('cx', seat.x)
            .attr('cy', seat.y)
            .attr('r', 12)
            .attr('fill', 'transparent')
            .attr('pointer-events', 'all')

          // Visible seat circle
          let visibleSeat: d3.Selection<any, unknown, null, undefined>
          switch (seatSkin?.shape) {
            case 'rect':
              visibleSeat = seatGroup
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
              visibleSeat = seatGroup
                .append('rect')
                .attr('x', seat.x - pillWidth / 2)
                .attr('y', seat.y - pillHeight / 2)
                .attr('width', pillWidth)
                .attr('height', pillHeight)
                .attr('rx', seatSkin?.borderRadius ?? pillHeight / 2)
              break
            }
            case 'diamond':
              visibleSeat = seatGroup
                .append('path')
                .attr(
                  'd',
                  `M ${seat.x} ${seat.y - seatSize} L ${seat.x + seatSize} ${seat.y} L ${seat.x} ${
                    seat.y + seatSize
                  } L ${seat.x - seatSize} ${seat.y} Z`
                )
              break
            case 'star':
              visibleSeat = seatGroup.append('path').attr('d', buildStarPath(seat.x, seat.y, 5, seatSize, seatSize / 2))
              break
            case 'hex':
              visibleSeat = seatGroup.append('path').attr('d', buildHexPath(seat.x, seat.y, seatSize))
              break
            case 'custom':
              if (seatSkin?.path) {
                visibleSeat = seatGroup
                  .append('path')
                  .attr('d', seatSkin.path)
                  .attr('transform', `translate(${seat.x}, ${seat.y}) scale(${seatSize / 10})`)
              } else {
                visibleSeat = seatGroup.append('circle').attr('cx', seat.x).attr('cy', seat.y).attr('r', seatSize)
              }
              break
            case 'circle':
            default:
              visibleSeat = seatGroup.append('circle').attr('cx', seat.x).attr('cy', seat.y).attr('r', seatSize)
              break
          }

          visibleSeat
            .classed('seat-visual', true)
            .attr('data-seat-shape', seatSkin?.shape || 'circle')
            .attr('fill', seatFill)
            .attr('stroke', seatStroke)
            .attr('stroke-width', seatStrokeWidth)
            .attr('pointer-events', 'none')
            .attr('vector-effect', 'non-scaling-stroke')

          const baseTransform = seatGroup.attr('transform') ?? ''
          seatGroup.attr('data-base-transform', baseTransform)

          if (seatSkin?.shadow) {
            visibleSeat.style('filter', `drop-shadow(0 0 ${seatSkin.shadow.blur}px ${seatSkin.shadow.color})`)
          }

          // Icons for different seat states
          if (bookingInfo?.isPayment) {
            // Lock icon for purchased seats
            seatGroup
              .append('text')
              .attr('x', seat.x)
              .attr('y', seat.y + 1)
              .attr('text-anchor', 'middle')
              .attr('font-size', '8px')
              .attr('fill', 'white')
              .attr('pointer-events', 'none')
              .text('🔒')
          } else if (bookingInfo?.isSeatLock) {
            // Timer icon for held seats
            seatGroup
              .append('text')
              .attr('x', seat.x)
              .attr('y', seat.y + 1)
              .attr('text-anchor', 'middle')
              .attr('font-size', '8px')
              .attr('fill', 'white')
              .attr('pointer-events', 'none')
              .text('⏳')
          } else if (!seat.ticketId) {
            // Warning icon for seats not assigned yet
            seatGroup
              .append('text')
              .attr('x', seat.x)
              .attr('y', seat.y + 1)
              .attr('text-anchor', 'middle')
              .attr('font-size', '8px')
              .attr('fill', 'white')
              .attr('pointer-events', 'none')
              .text('⚠️')
          } else if (status === 'locked') {
            seatGroup
              .append('text')
              .attr('x', seat.x)
              .attr('y', seat.y + 1)
              .attr('text-anchor', 'middle')
              .attr('font-size', '8px')
              .attr('fill', 'white')
              .attr('pointer-events', 'none')
              .text('🔒')
          }

          // Context menu on right-click for Lock and Edit Price
          seatGroup.on('contextmenu', (event) => {
            event.preventDefault()
            event.stopPropagation()

            // Create context menu
            const menu = document.createElement('div')
            menu.style.cssText = `
              position: fixed;
              left: ${event.clientX}px;
              top: ${event.clientY}px;
              background: #1f2937;
              border: 1px solid #374151;
              border-radius: 8px;
              padding: 8px;
              z-index: 10000;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
              min-width: 180px;
            `

            const seatLabel = `${section.displayName || section.name} R${seat.row}S${seat.number}`

            const menuItems = [
              {
                label: status === 'locked' ? '🔓 Mở Khóa Ghế' : '🔒 Khóa Ghế',
                action: () => handleSeatLockToggle(seat.id, status, seatLabel)
              },
              {
                label: '🎫 Gán Vé',
                action: () => {
                  setEditingSeatTicket(seat.id)
                  setSelectedTicketId(seat.ticketId || section.ticketId || '')
                }
              }
            ]

            menuItems.forEach((item, idx) => {
              const menuItem = document.createElement('div')
              menuItem.style.cssText = `
                padding: 8px 12px;
                color: white;
                cursor: pointer;
                border-radius: 4px;
                font-size: 14px;
                ${idx > 0 ? 'margin-top: 4px;' : ''}
              `
              menuItem.textContent = item.label
              menuItem.onmouseenter = () => {
                menuItem.style.background = '#374151'
              }
              menuItem.onmouseleave = () => {
                menuItem.style.background = 'transparent'
              }
              menuItem.onclick = () => {
                item.action()
                menu.remove()
              }
              menu.appendChild(menuItem)
            })

            // Add seat info header
            const header = document.createElement('div')
            header.style.cssText = `
              padding: 8px 12px;
              color: #9ca3af;
              font-size: 12px;
              border-bottom: 1px solid #374151;
              margin-bottom: 4px;
              font-weight: bold;
            `
            header.textContent = seatLabel
            menu.insertBefore(header, menu.firstChild)

            document.body.appendChild(menu)

            // Close menu on click outside
            const closeMenu = (e: MouseEvent) => {
              if (!menu.contains(e.target as Node)) {
                menu.remove()
                document.removeEventListener('click', closeMenu)
              }
            }
            setTimeout(() => document.addEventListener('click', closeMenu), 0)
          })

          // Hover effects
          seatGroup
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

              const tooltip = g.append('g').attr('class', 'seat-tooltip')
              const tooltipText = `${section.displayName || section.name} R${seat.row}S${seat.number}\n$${
                seat.price || section.price || 0
              }`
              const lines = tooltipText.split('\n')

              tooltip
                .append('rect')
                .attr('x', seat.x - 50)
                .attr('y', seat.y - 40)
                .attr('width', 100)
                .attr('height', 30)
                .attr('fill', '#FFFF')
                .attr('rx', 4)

              lines.forEach((line, i) => {
                tooltip
                  .append('text')
                  .attr('x', seat.x)
                  .attr('y', seat.y - 30 + i * 12)
                  .attr('text-anchor', 'middle')
                  .attr('fill', '#000000')
                  .attr('font-size', '11px')
                  .text(line)
              })
            })
            .on('mouseout', function () {
              const group = d3.select(this as SVGGElement)
              const baseTransformAttr = group.attr('data-base-transform') || ''
              if (baseTransformAttr) {
                group.attr('transform', baseTransformAttr)
              } else {
                group.attr('transform', null)
              }
              g.selectAll('.seat-tooltip').remove()
            })
        })
      }
    })

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

    // Render split line when in split mode
    if (splitLine) {
      const splitGroup = g.append('g').attr('class', 'split-line')

      splitGroup
        .append('line')
        .attr('x1', splitLine.start.x)
        .attr('y1', splitLine.start.y)
        .attr('x2', splitLine.end.x)
        .attr('y2', splitLine.end.y)
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '10,5')

      splitGroup
        .append('circle')
        .attr('cx', splitLine.start.x)
        .attr('cy', splitLine.start.y)
        .attr('r', 6)
        .attr('fill', '#ff0000')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)

      splitGroup
        .append('circle')
        .attr('cx', splitLine.end.x)
        .attr('cy', splitLine.end.y)
        .attr('r', 6)
        .attr('fill', '#ff0000')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
    }

    // Render edit points when in edit-points mode
    if (editingPoints && editTool === 'edit-points') {
      const editPointsGroup = g.append('g').attr('class', 'edit-points')

      // Draw the polygon being edited
      const polygonPoints = editingPoints.points.map((p) => `${p.x},${p.y}`).join(' ')
      editPointsGroup
        .append('polygon')
        .attr('points', polygonPoints)
        .attr('fill', 'rgba(100, 150, 255, 0.2)')
        .attr('stroke', '#4488ff')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')

      // Draw control points
      editingPoints.points.forEach((point, index) => {
        const pointGroup = editPointsGroup.append('g').attr('class', `edit-point-${index}`)

        pointGroup
          .append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', selectedPointIndex === index ? 10 : 7)
          .attr('fill', selectedPointIndex === index ? '#ffaa00' : '#4488ff')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('cursor', 'move')
          .on('mousedown', (event) => {
            event.stopPropagation()
            setSelectedPointIndex(index)

            const snapshot = editingPointsRef.current
            const dragBounds = snapshot ? calculateBounds(snapshot.points) : null
            const dragCenter = dragBounds
              ? {
                  x: (dragBounds.minX + dragBounds.maxX) / 2,
                  y: (dragBounds.minY + dragBounds.maxY) / 2
                }
              : null
            const averageRadius =
              snapshot && dragCenter && snapshot.points.length > 0
                ? snapshot.points.reduce((sum, pt) => sum + Math.hypot(pt.x - dragCenter.x, pt.y - dragCenter.y), 0) /
                  snapshot.points.length
                : null

            const onMouseMove = (moveEvent: MouseEvent) => {
              const svg = svgRef.current
              if (!svg) return

              const pt = svg.createSVGPoint()
              pt.x = moveEvent.clientX
              pt.y = moveEvent.clientY
              const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())

              let nextPoint: Point = { x: svgP.x, y: svgP.y }
              const constraint = pointConstraintRef.current

              if (constraint) {
                nextPoint = projectPointToConstraint(nextPoint, constraint)
              } else if (moveEvent.altKey && dragCenter && averageRadius) {
                const angle = Math.atan2(nextPoint.y - dragCenter.y, nextPoint.x - dragCenter.x) || 0
                nextPoint = {
                  x: dragCenter.x + averageRadius * Math.cos(angle),
                  y: dragCenter.y + averageRadius * Math.sin(angle)
                }
              } else if (moveEvent.shiftKey) {
                const latest = editingPointsRef.current
                if (latest && latest.points.length > 1) {
                  const prevIndex = (index - 1 + latest.points.length) % latest.points.length
                  const nextIndex = (index + 1) % latest.points.length
                  const anchor =
                    prevIndex !== index && latest.points[prevIndex]
                      ? latest.points[prevIndex]
                      : latest.points[nextIndex]

                  if (anchor) {
                    const deltaX = Math.abs(nextPoint.x - anchor.x)
                    const deltaY = Math.abs(nextPoint.y - anchor.y)
                    if (deltaX > deltaY) {
                      nextPoint = { x: nextPoint.x, y: anchor.y }
                    } else {
                      nextPoint = { x: anchor.x, y: nextPoint.y }
                    }
                  }
                }
              }

              updatePointPosition(index, nextPoint)
            }

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove)
              document.removeEventListener('mouseup', onMouseUp)
            }

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
          })

        // Point label
        pointGroup
          .append('text')
          .attr('x', point.x)
          .attr('y', point.y - 12)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
          .text(index + 1)
      })
    }
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <svg
        ref={svgRef}
        className='flex-1 w-full'
        viewBox='0 0 1000 600'
        style={{
          cursor: editTool === 'shape' ? 'crosshair' : editTool === 'move' && selectedSection ? 'move' : 'default'
        }}
      />
      {/* Color legend for seats */}
      <div className='flex items-center justify-center gap-6 py-2 bg-slate-800/80 border-t border-slate-600'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-green-500' />
          <span className='text-sm text-white'>Ghế trống</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-amber-500' />
          <span className='text-sm text-white'>Chưa gán vé ⚠️</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-red-500' />
          <span className='text-sm text-white'>Đang giữ ⏳</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-gray-400' />
          <span className='text-sm text-white'>Đã mua 🔒</span>
        </div>
      </div>
    </div>
  )
}
