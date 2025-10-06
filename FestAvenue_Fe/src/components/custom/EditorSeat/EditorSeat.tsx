import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Download,
  Edit,
  Trash2,
  Move,
  PenTool,
  X,
  Square,
  Circle,
  Triangle,
  Star,
  Moon,
  Hexagon,
  Palette,
  MousePointer,
  Sparkles,
  Loader2,
  Scissors,
  GitBranch
} from 'lucide-react'
import type {
  DetectedText,
  EditTool,
  ExtractionResult,
  Point,
  SeatMapData,
  Section,
  ShapeType
} from '@/types/seat.types'
import EmailLockModal from './EmailLockModal'

// Import từ các modules đã tách
import { SeatInteractionManager } from './classes/SeatInteractionManager'
import { calculateBounds, lineIntersection, getPolygonColor } from './utils/geometry'
import { generateShapePath } from './utils/shapes'
import { generateSeatsForSection } from './utils/seats'

// Main Component
export default function AdvancedSeatMapDesigner() {
  const svgRef = useRef<SVGSVGElement>(null)
  const seat3DRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const seatManagerRef = useRef(new SeatInteractionManager())

  const [mode] = useState<'edit'>('edit')
  const [editTool, setEditTool] = useState<EditTool>('select')
  const [selectedShape, setSelectedShape] = useState<ShapeType>('polygon')
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [labelText, setLabelText] = useState('')
  const [editingSeatPrice, setEditingSeatPrice] = useState<string | null>(null)
  const [seatPrice, setSeatPrice] = useState('')
  const [mapData, setMapData] = useState<SeatMapData>({
    sections: [],
    stage: { x: 350, y: 50, width: 300, height: 80 },
    aisles: []
  })
  const [is3DView, setIs3DView] = useState(false)
  const [seatStatuses, setSeatStatuses] = useState<Map<string, 'available' | 'occupied' | 'locked'>>(new Map())
  const [layoutParams, setLayoutParams] = useState({
    rows: 15,
    seatsPerRow: 20,
    vipRows: 3,
    balcony: true,
    boxSeats: true,
    tables: 12,
    seatsPerTable: 10,
    columns: 3,
    guestCount: 150,
    ceremonySide: true,
    upperDeck: true,
    headTableSeats: 8,
    cols: 16,
    layers: 3,
    aisles: 2,
    symmetry: true,
    density: 'medium' as 'high' | 'medium' | 'low'
  })
  const [sectionConfig, setSectionConfig] = useState({
    rows: 8,
    seatsPerRow: 12,
    name: 'New Section'
  })
  const [colorPicker, setColorPicker] = useState({
    fill: '#3498db',
    stroke: '#2980b9',
    useGradient: false,
    gradientFrom: '#667eea',
    gradientTo: '#764ba2'
  })
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
  const [isImageImportMode, setIsImageImportMode] = useState(false)
  const [splitLine, setSplitLine] = useState<{ start: Point; end: Point } | null>(null)
  const [isSplitting] = useState(false)
  const [splitFirstPoint, setSplitFirstPoint] = useState<Point | null>(null)
  const [editingPoints, setEditingPoints] = useState<{ sectionId: string; points: Point[] } | null>(null)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null)
  const [emailLockModal, setEmailLockModal] = useState<{
    seatId: string
    seatLabel: string
    currentEmail?: string
  } | null>(null)
  const [seatEmails, setSeatEmails] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const loadGSAP = () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
        script.async = true
        document.head.appendChild(script)
      }
    }
    loadGSAP()
  }, [])

  // Sync seatManagerRef with seatStatuses
  useEffect(() => {
    seatStatuses.forEach((status, seatId) => {
      seatManagerRef.current.setSeatStatus(seatId, status)
    })
  }, [seatStatuses])

  // API Mutation for image polygon extraction
  const extractPolygonsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('https://minhvtt-pylogyn-detect.hf.space/extract-seats/', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return response.json() as Promise<ExtractionResult>
    },
    onSuccess: (data) => {
      convertPolygonsToSections(data)
      setIsImageImportMode(true)
    },
    onError: (error: Error) => {
      console.error('Polygon extraction failed:', error)
      alert(`Failed to extract polygons: ${error.message}`)
    }
  })

  // Helper function to find detected text for a polygon
  const findTextForPolygon = (bounds: any, detectedTexts: DetectedText[]): DetectedText | null => {
    if (!detectedTexts || detectedTexts.length === 0) return null

    // Find text whose bbox center is inside or near the polygon bounds
    for (const textData of detectedTexts) {
      const [x1, y1, x2, y2] = textData.bbox
      const textCenterX = (x1 + x2) / 2
      const textCenterY = (y1 + y2) / 2

      // Check if text center is within polygon bounds (with some margin)
      const margin = 20
      if (
        textCenterX >= bounds.minX - margin &&
        textCenterX <= bounds.maxX + margin &&
        textCenterY >= bounds.minY - margin &&
        textCenterY <= bounds.maxY + margin
      ) {
        return textData
      }
    }
    return null
  }

  // Convert API polygons to EditorSeat sections
  const convertPolygonsToSections = (data: ExtractionResult) => {
    const newSections: Section[] = data.polygons.map((polygonPoints, index) => {
      const points: Point[] = polygonPoints.map(([x, y]) => ({ x, y }))
      const bounds = calculateBounds(points)
      const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
      const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2

      // Try to find detected text for this polygon
      const detectedText = findTextForPolygon(bounds, data.detected_text)
      const sectionName = detectedText?.text || data.labels?.[index] || `Seat ${index + 1}`

      const section: Section = {
        id: `imported-section-${Date.now()}-${index}`,
        name: sectionName,
        displayName: sectionName.toUpperCase(),
        points: points,
        color: getPolygonColor(index, data.polygons.length),
        strokeColor: getPolygonColor(index, data.polygons.length),
        rows: sectionConfig.rows,
        seatsPerRow: sectionConfig.seatsPerRow,
        bounds: bounds,
        shape: 'polygon',
        labelPosition: { x: centerX, y: centerY },
        price: 10
      }

      section.seats = generateSeatsForSection(section, seatStatuses)
      return section
    })

    setMapData({
      sections: newSections,
      stage: { x: 0, y: 0, width: 0, height: 0 }, // Hide stage in image import mode
      aisles: []
    })
  }

  // Handle image file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    extractPolygonsMutation.mutate(file)
  }

  // Split section function
  const splitSection = (section: Section, lineStart: Point, lineEnd: Point) => {
    if (!section.points || section.points.length < 3) return

    // Find intersection points between split line and polygon edges
    const intersections: { point: Point; edgeIndex: number }[] = []

    for (let i = 0; i < section.points.length; i++) {
      const p1 = section.points[i]
      const p2 = section.points[(i + 1) % section.points.length]

      const intersection = lineIntersection(lineStart, lineEnd, p1, p2)
      if (intersection) {
        intersections.push({ point: intersection, edgeIndex: i })
      }
    }

    // Need exactly 2 intersection points to split
    if (intersections.length !== 2) {
      alert(`Split line must intersect the section at exactly 2 points. Found ${intersections.length} intersections.`)
      return
    }

    // Sort intersections by edge index
    intersections.sort((a, b) => a.edgeIndex - b.edgeIndex)

    // Create two new polygons
    const [int1, int2] = intersections
    const polygon1Points: Point[] = []
    const polygon2Points: Point[] = []

    // First polygon: vertices from edge 0 to int1, then int1, int2, and back to start if needed
    for (let i = 0; i <= int1.edgeIndex; i++) {
      polygon1Points.push({ ...section.points[i] })
    }
    polygon1Points.push({ ...int1.point })
    polygon1Points.push({ ...int2.point })
    for (let i = int2.edgeIndex + 1; i < section.points.length; i++) {
      polygon1Points.push({ ...section.points[i] })
    }

    // Second polygon: int1, vertices from int1 to int2, then int2 back to int1
    polygon2Points.push({ ...int1.point })
    for (let i = int1.edgeIndex + 1; i <= int2.edgeIndex; i++) {
      polygon2Points.push({ ...section.points[i] })
    }
    polygon2Points.push({ ...int2.point })

    // Validate polygons have at least 3 points
    if (polygon1Points.length < 3 || polygon2Points.length < 3) {
      alert('Error: Invalid polygon created after split. Please try a different split line.')
      return
    }

    // Create two new sections
    const bounds1 = calculateBounds(polygon1Points)
    const bounds2 = calculateBounds(polygon2Points)

    const section1: Section = {
      ...section,
      id: `${section.id}-split-1-${Date.now()}`,
      name: `${section.name}_A`,
      displayName: `${section.displayName}_A`,
      points: polygon1Points,
      bounds: bounds1,
      labelPosition: {
        x: bounds1.minX + (bounds1.maxX - bounds1.minX) / 2,
        y: bounds1.minY + (bounds1.maxY - bounds1.minY) / 2
      }
    }

    const section2: Section = {
      ...section,
      id: `${section.id}-split-2-${Date.now()}`,
      name: `${section.name}_B`,
      displayName: `${section.displayName}_B`,
      points: polygon2Points,
      bounds: bounds2,
      labelPosition: {
        x: bounds2.minX + (bounds2.maxX - bounds2.minX) / 2,
        y: bounds2.minY + (bounds2.maxY - bounds2.minY) / 2
      }
    }

    section1.seats = generateSeatsForSection(section1, seatStatuses)
    section2.seats = generateSeatsForSection(section2, seatStatuses)

    // Replace original section with two new sections
    setMapData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== section.id).concat([section1, section2])
    }))

    alert(`Successfully split ${section.name} into ${section1.name} and ${section2.name}!`)
  }

  const startEditingPoints = (section: Section) => {
    if (!section.points) return
    setEditingPoints({ sectionId: section.id, points: [...section.points] })
    setEditTool('edit-points')
  }

  const updatePointPosition = (pointIndex: number, newPosition: Point) => {
    if (!editingPoints) return

    const newPoints = [...editingPoints.points]
    newPoints[pointIndex] = newPosition

    setEditingPoints({ ...editingPoints, points: newPoints })
  }

  const applyEditedPoints = () => {
    if (!editingPoints) return

    setMapData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === editingPoints.sectionId) {
          const bounds = calculateBounds(editingPoints.points)
          const updatedSection = {
            ...section,
            points: editingPoints.points,
            bounds: bounds,
            labelPosition: {
              x: bounds.minX + (bounds.maxX - bounds.minX) / 2,
              y: bounds.minY + (bounds.maxY - bounds.minY) / 2
            }
          }
          updatedSection.seats = generateSeatsForSection(updatedSection, seatStatuses)
          return updatedSection
        }
        return section
      })
    }))

    setEditingPoints(null)
    setSelectedPointIndex(null)
    setEditTool('select')
  }

  const createShapeSection = (center: Point) => {
    const path = generateShapePath(selectedShape, center, 100)
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: sectionConfig.name || `${selectedShape} ${mapData.sections.length + 1}`,
      displayName: sectionConfig.name?.toUpperCase() || `${selectedShape.toUpperCase()} ${mapData.sections.length + 1}`,
      points: [],
      path,
      color: colorPicker.useGradient ? '#3498db' : colorPicker.fill,
      strokeColor: colorPicker.stroke,
      gradient: colorPicker.useGradient ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo } : undefined,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      shape: selectedShape === 'polygon' ? 'custom' : selectedShape,
      labelPosition: center,
      price: 10 // Default price
    }

    newSection.seats = generateSeatsForSection(newSection, seatStatuses)

    setMapData({
      ...mapData,
      sections: [...mapData.sections, newSection]
    })
  }

  const createSectionFromPoints = (points: Point[]) => {
    const bounds = calculateBounds(points)
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2

    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: sectionConfig.name || `Section ${mapData.sections.length + 1}`,
      displayName: sectionConfig.name?.toUpperCase() || `SECTION ${mapData.sections.length + 1}`,
      points: points,
      color: colorPicker.useGradient ? '#3498db' : colorPicker.fill,
      strokeColor: colorPicker.stroke,
      gradient: colorPicker.useGradient ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo } : undefined,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      bounds,
      shape: 'polygon',
      labelPosition: { x: centerX, y: centerY },
      price: 10 // Default price
    }

    newSection.seats = generateSeatsForSection(newSection, seatStatuses)
    setMapData({
      ...mapData,
      sections: [...mapData.sections, newSection]
    })
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('class', 'main-group')

    if (mode === 'edit') {
      if (editTool === 'draw' && isDrawing) {
        svg.on('click', handleSvgClick)
      } else if (editTool === 'shape') {
        svg.on('click', (event) => {
          const [x, y] = d3.pointer(event)
          createShapeSection({ x, y })
        })
      } else if (editTool === 'split' && selectedSection) {
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
    selectedPointIndex
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
        .text('STAGE')
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
      const sectionGroup = g
        .append('g')
        .attr('class', `section section-${section.id}`)
        .style('opacity', section.layer ? 1 - section.layer * 0.1 : 1)
        .style('cursor', editTool === 'move' ? 'move' : 'pointer')

      let sectionElement
      if (section.path) {
        sectionElement = sectionGroup
          .append('path')
          .attr('d', section.path)
          .attr('fill', section.gradient ? `url(#section-gradient-${index})` : section.color)
          .attr('fill-opacity', 0.3)
          .attr('stroke', section.strokeColor || section.color)
          .attr('stroke-width', selectedSection?.id === section.id ? 3 : 2)
      } else if (section.points.length > 0) {
        const polygonPoints = section.points.map((p) => `${p.x},${p.y}`).join(' ')
        sectionElement = sectionGroup
          .append('polygon')
          .attr('points', polygonPoints)
          .attr('fill', section.gradient ? `url(#section-gradient-${index})` : section.color)
          .attr('fill-opacity', 0.3)
          .attr('stroke', section.strokeColor || section.color)
          .attr('stroke-width', selectedSection?.id === section.id ? 3 : 2)
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

        // Background for better readability
        labelGroup
          .append('rect')
          .attr('x', labelX - 60)
          .attr('y', labelY - 12)
          .attr('width', 120)
          .attr('height', 24)
          .attr('fill', 'rgba(0,0,0,0.7)')
          .attr('rx', 4)
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
          .text('Double-click or right-click to edit section name')

        labelGroup
          .append('text')
          .attr('x', labelX)
          .attr('y', labelY + 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(section.displayName || section.name)
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
          .text('Double-click or right-click to edit section name')
          .style('pointer-events', 'none')
      }

      // Render seats for this section in edit mode
      if (mode === 'edit' && section.seats && section.seats.length > 0) {
        section.seats.forEach((seat) => {
          const status = seatStatuses.get(seat.id) || seat.status

          const seatGroup = sectionGroup
            .append('g')
            .attr('class', `seat-group seat-${seat.id}`)
            .style('cursor', 'pointer')

          // Invisible hitbox for better click area
          seatGroup
            .append('circle')
            .attr('cx', seat.x)
            .attr('cy', seat.y)
            .attr('r', 12)
            .attr('fill', 'transparent')
            .attr('pointer-events', 'all')

          // Visible seat circle
          seatGroup
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

          // Lock icon for locked seats
          if (status === 'locked') {
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
                label: status === 'locked' ? '🔓 Unlock Seat' : '🔒 Lock Seat',
                action: () => handleSeatLockToggle(seat.id, status, seatLabel)
              },
              {
                label: '💵 Edit Price',
                action: () => {
                  setEditingSeatPrice(seat.id)
                  setSeatPrice(String(seat.price || section.price || 0))
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
              d3.select(this).select('circle:nth-child(2)').attr('r', 7)

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
                .attr('fill', 'rgba(0,0,0,0.9)')
                .attr('rx', 4)

              lines.forEach((line, i) => {
                tooltip
                  .append('text')
                  .attr('x', seat.x)
                  .attr('y', seat.y - 30 + i * 12)
                  .attr('text-anchor', 'middle')
                  .attr('fill', 'white')
                  .attr('font-size', '11px')
                  .text(line)
              })
            })
            .on('mouseout', function () {
              d3.select(this).select('circle:nth-child(2)').attr('r', 5)
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

            const onMouseMove = (moveEvent: MouseEvent) => {
              const svg = svgRef.current
              if (!svg) return

              const pt = svg.createSVGPoint()
              pt.x = moveEvent.clientX
              pt.y = moveEvent.clientY
              const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse())

              updatePointPosition(index, { x: svgP.x, y: svgP.y })
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

  const handleSeatLockToggle = (seatId: string, currentStatus: string, seatLabel: string) => {
    if (currentStatus === 'locked') {
      // Unlock seat
      setSeatStatuses((prev) => new Map(prev).set(seatId, 'available'))
      seatManagerRef.current.setSeatStatus(seatId, 'available')
      setSeatEmails((prev) => {
        const newMap = new Map(prev)
        newMap.delete(seatId)
        return newMap
      })
    } else {
      // Open modal to enter email and lock seat
      setEmailLockModal({
        seatId,
        seatLabel,
        currentEmail: seatEmails.get(seatId)
      })
    }
  }

  const handleEmailLockConfirm = (seatId: string, email: string) => {
    setSeatStatuses((prev) => new Map(prev).set(seatId, 'locked'))
    seatManagerRef.current.setSeatStatus(seatId, 'locked')
    setSeatEmails((prev) => new Map(prev).set(seatId, email))
    setEmailLockModal(null)
  }

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

  const create3DSeatElement = (section: Section, row: number, col: number): HTMLElement => {
    const seatId = `${section.id}-R${row + 1}-S${col + 1}`
    const status = seatStatuses.get(seatId) || 'available' // Use React state instead of seatManagerRef
    const isLocked = status === 'locked'
    const isOccupied = status === 'occupied'

    const seatWrapper = document.createElement('div')
    seatWrapper.style.cssText = `
      position: relative;
      cursor: ${isLocked ? 'not-allowed' : 'pointer'};
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

    const seatBack = document.createElement('div')
    seatBack.className = 'seat-back'
    seatBack.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 35px;
      background: ${
        isLocked
          ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
          : isOccupied
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
      };
      border-radius: 10px 10px 5px 5px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `

    const seatNumber = document.createElement('div')
    seatNumber.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 10px;
      font-weight: bold;
      pointer-events: none;
      z-index: 10;
    `
    seatNumber.textContent = isLocked ? '🔒' : `${row + 1}-${col + 1}`

    seat.appendChild(seatBack)
    seat.appendChild(seatNumber)
    seatWrapper.appendChild(seat)

    if (isOccupied && !isLocked) {
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
      character.innerHTML = seatManagerRef.current['getCharacterSVG'](true)
      seatWrapper.appendChild(character)
    }

    if (!isLocked) {
      seatWrapper.addEventListener('click', (e) => {
        e.stopPropagation()

        seatManagerRef.current.toggleSeat(seatWrapper, seatId, (id, newStatus) => {
          setSeatStatuses((prev) => {
            const newMap = new Map(prev)
            newMap.set(id, newStatus)
            return newMap
          })
        })
      })
    }

    if (!isLocked) {
      seatWrapper.addEventListener('mouseenter', () => {
        if (window.gsap) {
          window.gsap.to(seat, {
            scale: 1.08,
            y: -3,
            duration: 0.2,
            ease: 'power2.out'
          })
        }
      })

      seatWrapper.addEventListener('mouseleave', () => {
        if (window.gsap) {
          window.gsap.to(seat, {
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.out'
          })
        }
      })
    }

    return seatWrapper
  }

  const close3DView = () => {
    setIs3DView(false)
    setSelectedSection(null)
    if (seat3DRef.current) {
      seat3DRef.current.innerHTML = ''
    }
  }

  const updateSectionLabel = () => {
    if (!editingLabel) return

    setMapData({
      ...mapData,
      sections: mapData.sections.map((s) =>
        s.id === editingLabel ? { ...s, displayName: labelText, name: labelText } : s
      )
    })
    setEditingLabel(null)
    setLabelText('')
  }

  const updateSeatPrice = () => {
    if (!editingSeatPrice) return

    const price = parseFloat(seatPrice) || 0
    const updatedSections = mapData.sections.map((section) => ({
      ...section,
      seats: section.seats?.map((seat) => (seat.id === editingSeatPrice ? { ...seat, price } : seat))
    }))

    setMapData({ ...mapData, sections: updatedSections })
    setEditingSeatPrice(null)
    setSeatPrice('')
  }

  const deleteSection = (sectionId: string) => {
    setMapData({
      ...mapData,
      sections: mapData.sections.filter((s) => s.id !== sectionId)
    })
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null)
    }
  }

  const exportToJSON = () => {
    const data = {
      ...mapData,
      seatStatuses: Array.from(seatStatuses.entries())
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `seating-layout-${Date.now()}.json`)
    linkElement.click()
  }

  return (
    <div className='w-full h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900 p-4'>
      <div className='max-w-7xl mx-auto h-full flex flex-col gap-4'>
        <Card className='bg-white/90 backdrop-blur-xl border-blue-200 shadow-2xl'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-300 bg-clip-text text-transparent'>
                🎬 Advanced Cinema Seat Map Designer
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        <div className='flex-1 flex gap-4'>
          <Card className='w-80 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 shadow-2xl overflow-y-auto'>
            <CardContent className='p-4 space-y-4'>
              {mode === 'edit' && (
                <>
                  <Alert className='bg-purple-600/20 border-purple-500/50'>
                    <AlertDescription className='text-xs'>
                      💡 <strong>Quick Tips:</strong>
                      <br />
                      • Double-click or right-click section labels to rename
                      <br />
                      • Or use Label tool + click section
                      <br />• Draw/Shape tools create new sections
                    </AlertDescription>
                  </Alert>

                  {/* Image Import Section */}
                  <div className='space-y-2 pb-3 border-b border-purple-500/30'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Sparkles className='w-4 h-4' />
                      AI Seat Detection
                    </h3>
                    <p className='text-xs text-slate-400'>Upload an image and let AI automatically detect seats</p>
                    <input
                      ref={imageInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='hidden'
                    />
                    <Button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={extractPolygonsMutation.isPending}
                      className='w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                      size='sm'
                    >
                      {extractPolygonsMutation.isPending ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          AI Detecting Seats...
                        </>
                      ) : (
                        <>
                          <Sparkles className='w-4 h-4 mr-2' />
                          AI Detect Seats from Image
                        </>
                      )}
                    </Button>
                    {isImageImportMode && (
                      <Alert className='bg-cyan-600/20 border-cyan-500/50'>
                        <AlertDescription className='text-xs'>
                          ✅ AI detected {mapData.sections.length} seat sections! You can now edit them.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Edit className='w-4 h-4' />
                      Edit Tools
                    </h3>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        onClick={() => setEditTool('select')}
                        variant={editTool === 'select' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'select' ? 'bg-purple-600' : ''}
                      >
                        <MousePointer className='w-3 h-3 mr-1' />
                        Select
                      </Button>
                      <Button
                        onClick={() => setEditTool('move')}
                        variant={editTool === 'move' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'move' ? 'bg-blue-600' : ''}
                      >
                        <Move className='w-3 h-3 mr-1' />
                        Move
                      </Button>
                      <Button
                        onClick={() => setEditTool('draw')}
                        variant={editTool === 'draw' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'draw' ? 'bg-green-600' : ''}
                      >
                        <PenTool className='w-3 h-3 mr-1' />
                        Draw
                      </Button>
                      <Button
                        onClick={() => setEditTool('shape')}
                        variant={editTool === 'shape' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'shape' ? 'bg-orange-600' : ''}
                      >
                        <Hexagon className='w-3 h-3 mr-1' />
                        Shape
                      </Button>
                      <Button
                        onClick={() => setEditTool('label')}
                        variant={editTool === 'label' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'label' ? 'bg-red-600' : ''}
                      >
                        <Edit className='w-3 h-3 mr-1' />
                        Label
                      </Button>
                      <Button
                        onClick={() => {
                          setEditTool('split')
                          if (!selectedSection) {
                            alert('Please select a section first to split')
                          }
                        }}
                        variant={editTool === 'split' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'split' ? 'bg-yellow-600' : ''}
                        disabled={!selectedSection}
                      >
                        <Scissors className='w-3 h-3 mr-1' />
                        Split
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedSection) {
                            startEditingPoints(selectedSection)
                          } else {
                            alert('Please select a section first to edit points')
                          }
                        }}
                        variant={editTool === 'edit-points' ? 'default' : 'outline'}
                        size='sm'
                        className={editTool === 'edit-points' ? 'bg-teal-600' : ''}
                        disabled={!selectedSection}
                      >
                        <GitBranch className='w-3 h-3 mr-1' />
                        Edit Points
                      </Button>
                    </div>
                  </div>

                  {editTool === 'split' && selectedSection && (
                    <Alert className='bg-yellow-600/20 border-yellow-600/50'>
                      <AlertDescription className='text-xs'>
                        ✂️ <strong>Split Mode - {selectedSection.displayName}</strong>
                        <br />
                        {!splitFirstPoint ? (
                          <>
                            📍 Click on the section to set the <strong>first point</strong> of the split line.
                          </>
                        ) : (
                          <>
                            📍 Click to set the <strong>second point</strong> and split the section.
                          </>
                        )}
                        <br />
                        {splitFirstPoint && (
                          <>
                            <span className='text-green-300'>✓ First point set! Move mouse to preview.</span>
                            <br />
                            <Button
                              onClick={() => {
                                setSplitFirstPoint(null)
                                setSplitLine(null)
                              }}
                              size='sm'
                              variant='outline'
                              className='mt-2 w-full'
                            >
                              Reset Points
                            </Button>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {editTool === 'edit-points' && editingPoints && (
                    <Alert className='bg-teal-600/20 border-teal-600/50'>
                      <AlertDescription className='text-xs'>
                        🔧 <strong>Edit Points Mode</strong>
                        <br />
                        Drag control points to reshape the polygon.
                        <br />
                        <Button onClick={applyEditedPoints} size='sm' className='mt-2 w-full bg-teal-600'>
                          Apply Changes
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingPoints(null)
                            setSelectedPointIndex(null)
                            setEditTool('select')
                          }}
                          size='sm'
                          variant='outline'
                          className='mt-1 w-full'
                        >
                          Cancel
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {editTool === 'label' && (
                    <Alert className='bg-red-600/20 border-red-600/50'>
                      <AlertDescription className='text-xs'>
                        🏷️ <strong>Label Mode</strong>
                        <br />
                        Click any section to edit its name.
                        <br />
                        OR double-click/right-click section labels directly.
                      </AlertDescription>
                    </Alert>
                  )}

                  {editTool === 'shape' && (
                    <div className='space-y-3'>
                      <h3 className='text-sm font-semibold text-purple-300'>Shape Type</h3>
                      <div className='grid grid-cols-3 gap-2'>
                        {['rectangle', 'circle', 'star', 'crescent', 'arc', 'polygon'].map((shape) => (
                          <Button
                            key={shape}
                            onClick={() => setSelectedShape(shape as ShapeType)}
                            variant={selectedShape === shape ? 'default' : 'outline'}
                            size='sm'
                          >
                            {shape === 'rectangle' && <Square className='w-4 h-4' />}
                            {shape === 'circle' && <Circle className='w-4 h-4' />}
                            {shape === 'star' && <Star className='w-4 h-4' />}
                            {shape === 'crescent' && <Moon className='w-4 h-4' />}
                            {shape === 'arc' && <Triangle className='w-4 h-4' />}
                            {shape === 'polygon' && <Hexagon className='w-4 h-4' />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(editTool === 'draw' || editTool === 'shape' || selectedSection) && (
                    <div className='space-y-3'>
                      <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                        <Palette className='w-4 h-4' />
                        Colors
                      </h3>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <label className='text-xs text-gray-400'>Use Gradient</label>
                          <input
                            type='checkbox'
                            checked={colorPicker.useGradient}
                            onChange={(e) => setColorPicker({ ...colorPicker, useGradient: e.target.checked })}
                            className='rounded'
                          />
                        </div>
                        {!colorPicker.useGradient ? (
                          <>
                            <div>
                              <label className='text-xs text-gray-400'>Fill Color</label>
                              <input
                                type='color'
                                value={colorPicker.fill}
                                onChange={(e) => setColorPicker({ ...colorPicker, fill: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                            <div>
                              <label className='text-xs text-gray-400'>Stroke Color</label>
                              <input
                                type='color'
                                value={colorPicker.stroke}
                                onChange={(e) => setColorPicker({ ...colorPicker, stroke: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className='text-xs text-gray-400'>Gradient From</label>
                              <input
                                type='color'
                                value={colorPicker.gradientFrom}
                                onChange={(e) => setColorPicker({ ...colorPicker, gradientFrom: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                            <div>
                              <label className='text-xs text-gray-400'>Gradient To</label>
                              <input
                                type='color'
                                value={colorPicker.gradientTo}
                                onChange={(e) => setColorPicker({ ...colorPicker, gradientTo: e.target.value })}
                                className='w-full h-8 rounded cursor-pointer'
                              />
                            </div>
                          </>
                        )}
                        {selectedSection && (
                          <Button
                            onClick={() => {
                              const updatedSections = mapData.sections.map((s) => {
                                if (s.id === selectedSection.id) {
                                  return {
                                    ...s,
                                    color: colorPicker.useGradient ? s.color : colorPicker.fill,
                                    strokeColor: colorPicker.stroke,
                                    gradient: colorPicker.useGradient
                                      ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo }
                                      : undefined
                                  }
                                }
                                return s
                              })
                              setMapData({ ...mapData, sections: updatedSections })
                            }}
                            className='w-full bg-purple-600 hover:bg-purple-700'
                            size='sm'
                          >
                            Apply to Selected
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {(editTool === 'draw' || editTool === 'shape') && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-semibold text-purple-300'>Section Config</h3>
                      <div className='space-y-2'>
                        <div>
                          <label className='text-xs text-gray-400'>Rows</label>
                          <input
                            type='number'
                            value={sectionConfig.rows}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, rows: parseInt(e.target.value) || 8 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='30'
                          />
                        </div>
                        <div>
                          <label className='text-xs text-gray-400'>Seats per Row</label>
                          <input
                            type='number'
                            value={sectionConfig.seatsPerRow}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, seatsPerRow: parseInt(e.target.value) || 12 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='30'
                          />
                        </div>
                      </div>
                      {editTool === 'draw' && (
                        <Button
                          onClick={() => setIsDrawing(!isDrawing)}
                          className={`w-full ${
                            isDrawing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                          size='sm'
                        >
                          {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
                        </Button>
                      )}
                    </div>
                  )}

                  {isDrawing && (
                    <Alert className='bg-green-600/20 border-green-600/50'>
                      <AlertDescription className='text-xs'>
                        Click to add points. Click near first point to close shape.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Sparkles className='w-4 h-4' />
                      Smart Layout Generator
                    </h3>

                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='text-xs text-gray-400'>Rows</label>
                        <input
                          type='number'
                          value={layoutParams.rows}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              rows: parseInt(e.target.value) || 12
                            })
                          }
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                          min='5'
                          max='30'
                        />
                      </div>
                      <div>
                        <label className='text-xs text-gray-400'>Seats/Row</label>
                        <input
                          type='number'
                          value={layoutParams.cols}
                          onChange={(e) =>
                            setLayoutParams({
                              ...layoutParams,
                              cols: parseInt(e.target.value) || 16
                            })
                          }
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                          min='8'
                          max='40'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-sm font-semibold text-purple-300'>Sections</h3>
                    <div className='space-y-1 max-h-60 overflow-y-auto'>
                      {mapData.sections.map((section) => (
                        <div
                          key={section.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            selectedSection?.id === section.id
                              ? 'bg-purple-700/50 border border-purple-500'
                              : 'bg-slate-700/50 hover:bg-slate-700/70'
                          }`}
                          onClick={() => setSelectedSection(section)}
                        >
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-3 h-3 rounded'
                              style={{
                                background: section.gradient
                                  ? `linear-gradient(90deg, ${section.gradient.from}, ${section.gradient.to})`
                                  : section.color
                              }}
                            />
                            <span className='text-sm'>{section.name}</span>
                            <span className='text-xs text-gray-400'>
                              ({section.rows}x{section.seatsPerRow})
                            </span>
                            {section.price && (
                              <span className='text-xs text-green-400 font-semibold'>${section.price}</span>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSection(section.id)
                            }}
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

              <div className='space-y-2 pt-4 border-t border-purple-500/30'>
                <h3 className='text-sm font-semibold text-purple-300'>Statistics</h3>
                <div className='text-xs space-y-1 text-gray-400'>
                  <div>Sections: {mapData.sections.length}</div>
                  <div>
                    Total Seats:{' '}
                    {mapData.sections.reduce((acc, s) => acc + (s.seats?.length || s.rows * s.seatsPerRow), 0)}
                  </div>
                  <div>Occupied: {Array.from(seatStatuses.values()).filter((s) => s === 'occupied').length}</div>
                  <div>Locked: {Array.from(seatStatuses.values()).filter((s) => s === 'locked').length}</div>
                  <div className='flex items-center gap-3 mt-2'>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-green-500 rounded'></div>
                      Available
                    </span>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-red-500 rounded'></div>
                      Occupied
                    </span>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-gray-500 rounded'></div>
                      Locked
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-2 pt-4 border-t border-purple-500/30'>
                <Button
                  onClick={exportToJSON}
                  className='w-full bg-gradient-to-r from-green-600 to-emerald-600'
                  size='sm'
                >
                  <Download className='w-4 h-4 mr-1' />
                  Export Layout
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='flex-1 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 relative overflow-hidden shadow-2xl'>
            <CardContent className='p-0 h-full'>
              {!is3DView ? (
                <svg
                  ref={svgRef}
                  className='w-full h-full'
                  viewBox='0 0 1000 600'
                  style={{
                    cursor:
                      editTool === 'shape' ? 'crosshair' : editTool === 'move' && selectedSection ? 'move' : 'default'
                  }}
                />
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Label Edit Modal */}
        {editingLabel && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-slate-800 border border-purple-500/30 rounded-lg p-6 min-w-[300px]'>
              <h3 className='text-lg font-semibold text-white mb-4'>Edit Section Label</h3>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='label-input' className='text-sm text-gray-300'>
                    Section Name
                  </Label>
                  <Input
                    id='label-input'
                    value={labelText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabelText(e.target.value)}
                    placeholder='Enter section name'
                    className='mt-1 bg-slate-700 border-slate-600 text-white'
                    autoFocus
                  />
                </div>
                <div className='flex gap-2 justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setEditingLabel(null)
                      setLabelText('')
                    }}
                    size='sm'
                  >
                    Cancel
                  </Button>
                  <Button onClick={updateSectionLabel} size='sm' className='bg-purple-600 hover:bg-purple-700'>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seat Price Edit Modal */}
        {editingSeatPrice && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white border border-blue-300 rounded-lg p-6 min-w-[300px]'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Chỉnh Giá Ghế</h3>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='price-input' className='text-sm text-gray-700'>
                    Giá Ghế ($)
                  </Label>
                  <Input
                    id='price-input'
                    type='number'
                    value={seatPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeatPrice(e.target.value)}
                    placeholder='0.00'
                    className='mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    step='0.01'
                    min='0'
                    autoFocus
                  />
                </div>
                <div className='flex gap-2 justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setEditingSeatPrice(null)
                      setSeatPrice('')
                    }}
                    size='sm'
                    className='border-gray-300 text-gray-700'
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={updateSeatPrice}
                    size='sm'
                    className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400'
                  >
                    Cập Nhật
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Lock Modal */}
        {emailLockModal && (
          <EmailLockModal
            seatId={emailLockModal.seatId}
            seatLabel={emailLockModal.seatLabel}
            currentEmail={emailLockModal.currentEmail}
            onConfirm={(email) => handleEmailLockConfirm(emailLockModal.seatId, email)}
            onCancel={() => setEmailLockModal(null)}
          />
        )}
      </div>
    </div>
  )
}
