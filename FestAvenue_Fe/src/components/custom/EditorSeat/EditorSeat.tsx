import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { PermissionGuard } from '@/components/guards/PermissionGuard'
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
  GitBranch,
  Save,
  AlertCircle
} from 'lucide-react'
import type {
  DetectedText,
  EditTool,
  ExtractionResult,
  Point,
  PointConstraint,
  SeatMapData,
  Section,
  ShapeType
} from '@/types/seat.types'
import EmailLockModal from './EmailLockModal'
import { useSeatManagement } from '@/pages/User/Auth/TicketManagement/hooks/useSeatManagement'

// Import từ các modules đã tách
import { SeatInteractionManager } from './classes/SeatInteractionManager'
import { calculateBounds, lineIntersection, getPolygonColor } from './utils/geometry'
import { generateShapePath } from './utils/shapes'
import { generateSeatsForSection } from './utils/seats'
import { projectPointToConstraint } from './utils/shapeTransforms'
import PointEditorPanel from './components/PointEditorPanel'
import { SECTION_TEMPLATES, generateSectionFromTemplate } from './utils/templates'

// Props interface
interface AdvancedSeatMapDesignerProps {
  eventId: string
  eventCode: string
  ticketPackageId?: string
}

// Main Component
export default function AdvancedSeatMapDesigner({ eventCode, ticketPackageId }: AdvancedSeatMapDesignerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const seat3DRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const seatManagerRef = useRef(new SeatInteractionManager())

  // Seat Management Hook
  const {
    capacity,
    isLoadingEvent,
    createSeatingChart,
    updateSeatingChart,
    isCreating,
    isUpdating,
    tickets,
    isLoadingTickets,
    existingStructure,
    isLoadingStructure,
    hasExistingStructure,
    deleteSeatingChartByEventCode,
    isDeletingByEventCode
  } = useSeatManagement(eventCode)
  const [mode] = useState<'edit'>('edit')
  const [editTool, setEditTool] = useState<EditTool>('select')
  const [selectedShape, setSelectedShape] = useState<ShapeType>('polygon')
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [labelText, setLabelText] = useState('')
  const [editingSeatTicket, setEditingSeatTicket] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [bulkRowNumber, setBulkRowNumber] = useState<number>(1)
  const [bulkRowTicketId, setBulkRowTicketId] = useState<string>('')
  const [mapData, setMapData] = useState<SeatMapData>({
    sections: [],
    stage: { x: 350, y: 50, width: 300, height: 80 },
    aisles: []
  })
  const [is3DView, setIs3DView] = useState(false)
  const [seatStatuses, setSeatStatuses] = useState<Map<string, 'available' | 'occupied' | 'locked'>>(new Map())

  const [sectionConfig, setSectionConfig] = useState({
    rows: 3,
    seatsPerRow: 4,
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
  const [pointConstraint, setPointConstraint] = useState<PointConstraint | null>(null)
  const pointConstraintRef = useRef<PointConstraint | null>(null)
  const editingPointsRef = useRef<typeof editingPoints>(null)

  useEffect(() => {
    pointConstraintRef.current = pointConstraint
  }, [pointConstraint])

  useEffect(() => {
    editingPointsRef.current = editingPoints
  }, [editingPoints])

  useEffect(() => {
    if (editTool !== 'edit-points') {
      setPointConstraint(null)
    }
  }, [editTool])
  const [emailLockModal, setEmailLockModal] = useState<{
    seatId: string
    seatLabel: string
    currentEmail?: string
  } | null>(null)
  const [seatEmails, setSeatEmails] = useState<Map<string, string>>(new Map())

  // Template and bulk selection states
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [globalTicketId, setGlobalTicketId] = useState<string>('')

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

  // Load existing structure when available
  useEffect(() => {
    // Only load once when structure is available and not loading
    if (existingStructure && !isLoadingStructure) {
      // Load mapData from existing structure
      if (existingStructure.sections && Array.isArray(existingStructure.sections)) {
        // Calculate overall bounds to check if structure is properly positioned
        let overallMinX = Infinity
        let overallMaxX = -Infinity
        let overallMinY = Infinity
        let overallMaxY = -Infinity

        existingStructure.sections.forEach((section: any) => {
          if (section.bounds) {
            overallMinX = Math.min(overallMinX, section.bounds.minX)
            overallMaxX = Math.max(overallMaxX, section.bounds.maxX)
            overallMinY = Math.min(overallMinY, section.bounds.minY)
            overallMaxY = Math.max(overallMaxY, section.bounds.maxY)
          } else if (section.points) {
            section.points.forEach((point: any) => {
              overallMinX = Math.min(overallMinX, point.x)
              overallMaxX = Math.max(overallMaxX, point.x)
              overallMinY = Math.min(overallMinY, point.y)
              overallMaxY = Math.max(overallMaxY, point.y)
            })
          }
        })

        // Transform structure if coordinates are outside viewport (0-1000, 0-600)
        const viewportWidth = 1000
        const viewportHeight = 600
        let transformedSections = existingStructure.sections

        // Check if structure is outside viewport
        const needsTransform =
          overallMinX < 0 || overallMinY < 0 || overallMaxX > viewportWidth || overallMaxY > viewportHeight

        if (needsTransform) {
          // Calculate offset to move structure into viewport
          // Add padding of 50px from edges
          const structureWidth = overallMaxX - overallMinX
          const structureHeight = overallMaxY - overallMinY

          // Calculate center position in viewport
          const targetCenterX = viewportWidth / 2
          const targetCenterY = viewportHeight / 2

          // Calculate current center
          const currentCenterX = overallMinX + structureWidth / 2
          const currentCenterY = overallMinY + structureHeight / 2

          // Calculate offset
          const offsetX = targetCenterX - currentCenterX
          const offsetY = targetCenterY - currentCenterY

          // Transform all sections
          transformedSections = existingStructure.sections.map((section: any) => {
            const transformedPoints = section.points?.map((p: any) => ({
              x: p.x + offsetX,
              y: p.y + offsetY
            }))

            const transformedSeats = section.seats?.map((seat: any) => ({
              ...seat,
              x: seat.x + offsetX,
              y: seat.y + offsetY
            }))

            return {
              ...section,
              points: transformedPoints || section.points,
              seats: transformedSeats || section.seats,
              bounds: section.bounds
                ? {
                    minX: section.bounds.minX + offsetX,
                    maxX: section.bounds.maxX + offsetX,
                    minY: section.bounds.minY + offsetY,
                    maxY: section.bounds.maxY + offsetY
                  }
                : undefined,
              labelPosition: section.labelPosition
                ? {
                    x: section.labelPosition.x + offsetX,
                    y: section.labelPosition.y + offsetY
                  }
                : undefined,
              position: section.position
                ? {
                    x: section.position.x + offsetX,
                    y: section.position.y + offsetY
                  }
                : undefined
            }
          })
        }

        const newMapData = {
          sections: transformedSections,
          stage: existingStructure.stage || { x: 350, y: 50, width: 300, height: 80 },
          aisles: existingStructure.aisles || []
        }

        setMapData(newMapData)
      }

      // Load seatStatuses if available
      if (existingStructure && existingStructure.seatStatuses && Array.isArray(existingStructure.seatStatuses)) {
        const statusMap = new Map(existingStructure.seatStatuses)
        setSeatStatuses(statusMap as any)
      }
    }
  }, [existingStructure, isLoadingStructure])

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
        price: 0
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
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ')
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
      alert(`Đường chia phải cắt khu vực tại đúng 2 điểm. Tìm thấy ${intersections.length} điểm cắt.`)
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
      alert('Lỗi: Tạo đa giác không hợp lệ sau khi chia. Vui lòng thử một đường chia khác.')
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

    alert(`Đã chia thành công ${section.name} thành ${section1.name} và ${section2.name}!`)
  }

  const startEditingPoints = (section: Section) => {
    if (!section.points) return
    setPointConstraint(null)
    setSelectedPointIndex(null)
    setEditingPoints({ sectionId: section.id, points: [...section.points] })
    setEditTool('edit-points')
  }

  const updatePointPosition = (pointIndex: number, newPosition: Point) => {
    setEditingPoints((prev) => {
      if (!prev) return prev
      const newPoints = [...prev.points]
      newPoints[pointIndex] = newPosition
      return { ...prev, points: newPoints }
    })
  }

  const replaceEditingPoints = (points: Point[]) => {
    setEditingPoints((prev) => (prev ? { ...prev, points } : prev))
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
    setPointConstraint(null)
  }

  const cancelPointEditing = () => {
    setEditingPoints(null)
    setSelectedPointIndex(null)
    setEditTool('select')
    setPointConstraint(null)
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
      price: 0
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
      price: 0
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
          .text('Nhấp đúp hoặc chuột phải để sửa tên khu vực')

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
          .text('Nhấp đúp hoặc chuột phải để sửa tên khu vực')
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
            .attr('fill', status === 'locked' ? '#6b7280' : status === 'occupied' ? '#ef4444' : '#22c55e')
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

  const handleSeatLockToggle = (seatId: string, currentStatus: string, seatLabel: string) => {
    if (currentStatus === 'locked') {
      // Unlock seat and clear email
      setSeatStatuses((prev) => new Map(prev).set(seatId, 'available'))
      seatManagerRef.current.setSeatStatus(seatId, 'available')
      setSeatEmails((prev) => {
        const newMap = new Map(prev)
        newMap.delete(seatId)
        return newMap
      })

      // Update seat object in mapData to remove email and set status to available
      const updatedSections = mapData.sections.map((section) => ({
        ...section,
        seats: section.seats?.map((seat) =>
          seat.id === seatId ? { ...seat, email: undefined, status: 'available' as const } : seat
        )
      }))
      setMapData({ ...mapData, sections: updatedSections })
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

    // Update seat object in mapData to include email and set status to locked
    const updatedSections = mapData.sections.map((section) => ({
      ...section,
      seats: section.seats?.map((seat) => (seat.id === seatId ? { ...seat, email, status: 'locked' as const } : seat))
    }))
    setMapData({ ...mapData, sections: updatedSections })

    setEmailLockModal(null)
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

  const updateSeatTicket = () => {
    if (!editingSeatTicket || !selectedTicketId) return

    // Find the selected ticket to get its price
    const selectedTicket = tickets.find((t) => t.id === selectedTicketId)
    const ticketPrice = selectedTicket?.price || 0

    const updatedSections = mapData.sections.map((section) => ({
      ...section,
      seats: section.seats?.map((seat) =>
        seat.id === editingSeatTicket ? { ...seat, ticketId: selectedTicketId, price: ticketPrice } : seat
      )
    }))

    setMapData({ ...mapData, sections: updatedSections })
    setEditingSeatTicket(null)
    setSelectedTicketId('')
  }

  const assignTicketToRow = () => {
    if (!selectedSection || !bulkRowTicketId || !bulkRowNumber) return

    // Find the selected ticket to get its price
    const selectedTicket = tickets.find((t) => t.id === bulkRowTicketId)
    const ticketPrice = selectedTicket?.price || 0

    const updatedSections = mapData.sections.map((section) => {
      if (section.id === selectedSection.id) {
        return {
          ...section,
          seats: section.seats?.map((seat) =>
            seat.row === bulkRowNumber ? { ...seat, ticketId: bulkRowTicketId, price: ticketPrice } : seat
          )
        }
      }
      return section
    })

    setMapData({ ...mapData, sections: updatedSections })
    setBulkRowTicketId('')
  }

  // Template application function
  const applyTemplateToNewSection = (templateId: string) => {
    const templateConfig = {
      centerX: 500,
      centerY: 300,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      name: sectionConfig.name || templateId
    }

    const sectionData = generateSectionFromTemplate(templateId, templateConfig)
    if (!sectionData) {
      alert('Template không tồn tại!')
      return
    }

    const newSection: Section = {
      ...sectionData,
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Generate seats for the section
    newSection.seats = generateSeatsForSection(newSection, seatStatuses)

    setMapData({
      ...mapData,
      sections: [...mapData.sections, newSection]
    })

    setSelectedSection(newSection)
    setSelectedTemplateId(null)
  }

  // Bulk ticket assignment for selected sections
  const handleBulkTicketAssignment = (ticketId: string) => {
    if (selectedSections.size === 0 || !ticketId) return

    const selectedTicket = tickets.find((t) => t.id === ticketId)
    const ticketPrice = selectedTicket?.price || 0

    const updatedSections = mapData.sections.map((section) => {
      if (selectedSections.has(section.id)) {
        return {
          ...section,
          ticketId,
          price: ticketPrice,
          seats: section.seats?.map((seat) => ({
            ...seat,
            ticketId,
            price: ticketPrice
          }))
        }
      }
      return section
    })

    setMapData({ ...mapData, sections: updatedSections })
    setSelectedSections(new Set())
  }

  // Set all seats to a specific ticket
  const handleSetAllSeats = (ticketId: string) => {
    if (!ticketId) return

    const selectedTicket = tickets.find((t) => t.id === ticketId)
    const ticketPrice = selectedTicket?.price || 0

    const updatedSections = mapData.sections.map((section) => ({
      ...section,
      ticketId,
      price: ticketPrice,
      seats: section.seats?.map((seat) => ({
        ...seat,
        ticketId,
        price: ticketPrice
      }))
    }))

    setMapData({ ...mapData, sections: updatedSections })
    setGlobalTicketId('')
  }

  // Toggle section selection
  const handleToggleSectionSelection = (sectionId: string) => {
    setSelectedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
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

  // Save seating chart to API with capacity validation
  const handleSaveSeatingChart = () => {
    const seatingData = {
      ...mapData,
      seatStatuses: Array.from(seatStatuses.entries())
    }

    // Build ticketsForSeats array from all seats with assigned tickets
    const ticketsForSeats: Array<{
      ticketId: string
      seatIndex: string
      email?: string
    }> = []

    mapData.sections.forEach((section) => {
      section.seats?.forEach((seat) => {
        // Get ticket ID from seat or section
        const ticketId = seat.ticketId || section.ticketId

        if (ticketId) {
          ticketsForSeats.push({
            ticketId,
            seatIndex: seat.id,
            email: seat.email || undefined
          })
        }
      })
    })

    // Prepare data for API
    const bodyData = {
      eventCode,
      seatingChartStructure: JSON.stringify(seatingData),
      ticketsForSeats
    }

    // Use update if structure exists, otherwise create new
    if (hasExistingStructure) {
      updateSeatingChart(bodyData)
    } else {
      createSeatingChart(bodyData)
    }
  }

  const handleDeleteSeatMap = () => {
    if (!hasExistingStructure) return
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sơ đồ ghế hiện tại?')
    if (!confirmed) return

    deleteSeatingChartByEventCode(eventCode, {
      onSuccess: () => {
        setMapData({
          sections: [],
          stage: { x: 350, y: 50, width: 300, height: 80 },
          aisles: []
        })
        setSeatStatuses(new Map<string, 'available' | 'occupied' | 'locked'>())
        setSelectedSection(null)
        setIs3DView(false)
        setEmailLockModal(null)
        setSeatEmails(new Map<string, string>())
      }
    })
  }

  return (
    <div className='w-full h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 text-gray-900 p-4'>
      <div className='max-w-7xl mx-auto h-full flex flex-col gap-4'>
        <div className='flex-1 flex gap-4'>
          <Card className='w-80 h-full flex flex-col bg-slate-800/60 backdrop-blur-xl border-purple-500/30 shadow-2xl'>
            <CardContent className='flex-1 overflow-y-auto max-h-[800px] p-4 space-y-4'>
              {mode === 'edit' && (
                <>
                  <Alert className='bg-purple-600/20 border-purple-500/50'>
                    <AlertDescription className='text-xs text-black'>
                      • Nhấp đúp hoặc chuột phải vào nhãn khu vực để đổi tên
                      <br />
                      • Hoặc dùng công cụ Nhãn + nhấp vào khu vực
                      <br />• Công cụ Vẽ/Hình dạng tạo khu vực mới
                    </AlertDescription>
                  </Alert>

                  {/* Image Import Section */}
                  <div className='space-y-2 pb-3 border-b border-purple-500/30'>
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
                          AI Đang Phát Hiện...
                        </>
                      ) : (
                        <>
                          <Sparkles className='w-4 h-4 mr-2' />
                          Phát Hiện Ghế Bằng AI
                        </>
                      )}
                    </Button>
                    {isImageImportMode && (
                      <Alert className='bg-cyan-600/20 border-cyan-500/50'>
                        <AlertDescription className='text-xs text-black'>
                          AI đã phát hiện {mapData.sections.length} khu vực ghế! Bạn có thể chỉnh sửa ngay.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Template Gallery Section */}
                  <div className='space-y-3 pb-3 border-b border-purple-500/30'>
                    <div className='grid grid-cols-2 gap-2'>
                      {SECTION_TEMPLATES.map((template) => (
                        <Button
                          key={template.id}
                          onClick={() => applyTemplateToNewSection(template.id)}
                          className='h-auto py-3 px-2 flex flex-col items-center gap-1 border-2 transition-all'
                          style={{
                            background: `linear-gradient(135deg, ${template.gradient.from}, ${template.gradient.to})`,
                            borderColor: selectedTemplateId === template.id ? '#fff' : 'transparent'
                          }}
                          size='sm'
                        >
                          <span className='text-2xl'>{template.icon}</span>
                          <span className='text-xs font-semibold text-white'>{template.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Global Ticket Management */}
                  <div className='space-y-3 pb-3 border-b border-purple-500/30'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      🎫 Quản Lý Vé Nhanh
                    </h3>
                    <div className='space-y-2'>
                      {isLoadingTickets ? (
                        <div className='text-xs text-gray-400'>Đang tải...</div>
                      ) : tickets.length === 0 ? (
                        <Alert className='bg-yellow-600/20 border-yellow-600/50'>
                          <AlertDescription className='text-xs text-yellow-200'>
                            Chưa có loại vé. Tạo vé trong tab "Cấu hình vé".
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          {/* Set All Seats */}
                          <div className='space-y-2'>
                            <label className='text-xs text-gray-400 block'>Gán vé cho tất cả ghế</label>
                            <Select value={globalTicketId} onValueChange={setGlobalTicketId}>
                              <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                                <SelectValue placeholder='Chọn loại vé...' />
                              </SelectTrigger>
                              <SelectContent>
                                {tickets.map((ticket) => (
                                  <SelectItem key={ticket.id} value={ticket.id}>
                                    {ticket.name} -{' '}
                                    {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={() => handleSetAllSeats(globalTicketId)}
                              disabled={!globalTicketId}
                              className='w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50'
                              size='sm'
                            >
                              📍 Set Tất Cả Ghế
                            </Button>
                          </div>

                          {/* Bulk Assignment for Selected Sections */}
                          {selectedSections.size > 0 && (
                            <div className='space-y-2 pt-2 border-t border-purple-500/30'>
                              <Alert className='bg-blue-600/20 border-blue-500/50'>
                                <AlertDescription className='text-xs text-blue-200'>
                                  ✓ Đã chọn {selectedSections.size} section
                                </AlertDescription>
                              </Alert>
                              <Select
                                onValueChange={(ticketId) => {
                                  handleBulkTicketAssignment(ticketId)
                                }}
                              >
                                <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                                  <SelectValue placeholder='Gán vé cho sections đã chọn...' />
                                </SelectTrigger>
                                <SelectContent>
                                  {tickets.map((ticket) => (
                                    <SelectItem key={ticket.id} value={ticket.id}>
                                      {ticket.name} -{' '}
                                      {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => setSelectedSections(new Set())}
                                variant='outline'
                                className='w-full'
                                size='sm'
                              >
                                Bỏ chọn tất cả
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Edit className='w-4 h-4' />
                      Công Cụ Chỉnh Sửa
                    </h3>
                    <PermissionGuard requires={ticketPackageId}>
                      <div className='grid grid-cols-2 gap-2'>
                        <Button
                          onClick={() => setEditTool('select')}
                          variant={editTool === 'select' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'select' ? 'bg-purple-600' : ''}
                        >
                          <MousePointer className='w-3 h-3 mr-1' />
                          Chọn
                        </Button>
                        <Button
                          onClick={() => setEditTool('move')}
                          variant={editTool === 'move' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'move' ? 'bg-blue-600' : ''}
                        >
                          <Move className='w-3 h-3 mr-1' />
                          Di Chuyển
                        </Button>
                        <Button
                          onClick={() => setEditTool('draw')}
                          variant={editTool === 'draw' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'draw' ? 'bg-green-600' : ''}
                        >
                          <PenTool className='w-3 h-3 mr-1' />
                          Vẽ
                        </Button>
                        <Button
                          onClick={() => setEditTool('shape')}
                          variant={editTool === 'shape' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'shape' ? 'bg-orange-600' : ''}
                        >
                          <Hexagon className='w-3 h-3 mr-1' />
                          Hình Dạng
                        </Button>
                        <Button
                          onClick={() => setEditTool('label')}
                          variant={editTool === 'label' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'label' ? 'bg-red-600' : ''}
                        >
                          <Edit className='w-3 h-3 mr-1' />
                          Nhãn
                        </Button>
                        <Button
                          onClick={() => {
                            setEditTool('split')
                            if (!selectedSection) {
                              alert('Vui lòng chọn một khu vực trước để chia')
                            }
                          }}
                          variant={editTool === 'split' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'split' ? 'bg-yellow-600' : ''}
                          disabled={!selectedSection}
                        >
                          <Scissors className='w-3 h-3 mr-1' />
                          Chia Cắt
                        </Button>
                        <Button
                          onClick={() => {
                            if (selectedSection) {
                              startEditingPoints(selectedSection)
                            } else {
                              alert('Vui lòng chọn một khu vực trước để sửa điểm')
                            }
                          }}
                          variant={editTool === 'edit-points' ? 'default' : 'outline'}
                          size='sm'
                          className={editTool === 'edit-points' ? 'bg-teal-600' : ''}
                          disabled={!selectedSection}
                        >
                          <GitBranch className='w-3 h-3 mr-1' />
                          Sửa Điểm
                        </Button>
                      </div>
                    </PermissionGuard>
                  </div>

                  {editTool === 'split' && selectedSection && (
                    <Alert className='bg-yellow-600/20 border-yellow-600/50'>
                      <AlertDescription className='text-xs text-black'>
                        ✂️ <strong>Chế Độ Chia Cắt - {selectedSection.displayName}</strong>
                        <br />
                        {!splitFirstPoint ? (
                          <>
                            📍 Nhấp vào khu vực để đặt <strong>điểm đầu</strong> của đường chia.
                          </>
                        ) : (
                          <>
                            📍 Nhấp để đặt <strong>điểm thứ hai</strong> và chia cắt khu vực.
                          </>
                        )}
                        <br />
                        {splitFirstPoint && (
                          <>
                            <span className='text-green-600'> Đã đặt điểm đầu! Di chuyển chuột để xem trước.</span>
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
                              Đặt Lại Điểm
                            </Button>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {editTool === 'edit-points' && editingPoints && (
                    <PointEditorPanel
                      editingPoints={editingPoints}
                      selectedSection={selectedSection}
                      onUpdatePoints={replaceEditingPoints}
                      onApplyChanges={applyEditedPoints}
                      onCancel={cancelPointEditing}
                      onConstraintChange={setPointConstraint}
                    />
                  )}

                  {editTool === 'label' && (
                    <Alert className='bg-red-600/20 border-red-600/50'>
                      <AlertDescription className='text-xs text-black'>
                        <strong>Chế Độ Nhãn</strong>
                        <br />
                        Nhấp vào bất kỳ khu vực nào để sửa tên.
                        <br />
                        HOẶC nhấp đúp/chuột phải trực tiếp vào nhãn khu vực.
                      </AlertDescription>
                    </Alert>
                  )}

                  {editTool === 'shape' && (
                    <div className='space-y-3'>
                      <h3 className='text-sm font-semibold text-purple-300'>Loại Hình Dạng</h3>
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
                        Màu Sắc
                      </h3>
                      <div className='space-y-2'>
                        {/* Color Inputs in Single Row */}
                        <div className='flex gap-2 items-end'>
                          {!colorPicker.useGradient ? (
                            <>
                              <div className='flex-1'>
                                <label className='text-xs text-gray-400 block mb-1'>Màu Tô</label>
                                <input
                                  type='color'
                                  value={colorPicker.fill}
                                  onChange={(e) => setColorPicker({ ...colorPicker, fill: e.target.value })}
                                  className='w-full h-9 rounded cursor-pointer'
                                />
                              </div>
                              <div className='flex-1'>
                                <label className='text-xs text-gray-400 block mb-1'>Màu Viền</label>
                                <input
                                  type='color'
                                  value={colorPicker.stroke}
                                  onChange={(e) => setColorPicker({ ...colorPicker, stroke: e.target.value })}
                                  className='w-full h-9 rounded cursor-pointer'
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className='flex-1'>
                                <label className='text-xs text-gray-400 block mb-1'>Gradient Từ</label>
                                <input
                                  type='color'
                                  value={colorPicker.gradientFrom}
                                  onChange={(e) => setColorPicker({ ...colorPicker, gradientFrom: e.target.value })}
                                  className='w-full h-9 rounded cursor-pointer'
                                />
                              </div>
                              <div className='flex-1'>
                                <label className='text-xs text-gray-400 block mb-1'>Gradient Đến</label>
                                <input
                                  type='color'
                                  value={colorPicker.gradientTo}
                                  onChange={(e) => setColorPicker({ ...colorPicker, gradientTo: e.target.value })}
                                  className='w-full h-9 rounded cursor-pointer'
                                />
                              </div>
                            </>
                          )}
                          <Button
                            onClick={() => setColorPicker({ ...colorPicker, useGradient: !colorPicker.useGradient })}
                            variant={colorPicker.useGradient ? 'default' : 'outline'}
                            size='sm'
                            className={`h-9 px-3 ${
                              colorPicker.useGradient
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                : 'border-purple-500/50 hover:bg-purple-600/20'
                            }`}
                            title={colorPicker.useGradient ? 'Tắt Gradient' : 'Bật Gradient'}
                          >
                            <Sparkles className='w-4 h-4' />
                          </Button>
                        </div>
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
                            Áp Dụng Cho Mục Đã Chọn
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ticket Assignment for Selected Section */}
                  {selectedSection && (
                    <div className='space-y-3 pt-4 border-t border-purple-500/30'>
                      <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                        🎫 Gán Vé Cho Khu Vực
                      </h3>
                      <div className='space-y-2'>
                        {isLoadingTickets ? (
                          <div className='text-xs text-gray-400'>Đang tải...</div>
                        ) : tickets.length === 0 ? (
                          <Alert className='bg-yellow-600/20 border-yellow-600/50'>
                            <AlertDescription className='text-xs text-yellow-200'>
                              Chưa có loại vé. Tạo vé trong tab "Cấu hình vé".
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <Select
                              value={selectedSection.ticketId || ''}
                              onValueChange={(ticketId) => {
                                // Find the selected ticket to get its price
                                const selectedTicket = tickets.find((t) => t.id === ticketId)
                                const ticketPrice = selectedTicket?.price || 0

                                const updatedSections = mapData.sections.map((s) =>
                                  s.id === selectedSection.id
                                    ? {
                                        ...s,
                                        ticketId,
                                        price: ticketPrice,
                                        seats: s.seats?.map((seat) => ({ ...seat, ticketId, price: ticketPrice }))
                                      }
                                    : s
                                )
                                setMapData({ ...mapData, sections: updatedSections })
                                setSelectedSection({ ...selectedSection, ticketId, price: ticketPrice })
                              }}
                            >
                              <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                                <SelectValue placeholder='Chọn loại vé...' />
                              </SelectTrigger>
                              <SelectContent>
                                {tickets.map((ticket) => (
                                  <SelectItem key={ticket.id} value={ticket.id}>
                                    {ticket.name} -{' '}
                                    {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedSection.ticketId &&
                              (() => {
                                const ticket = tickets.find((t) => t.id === selectedSection.ticketId)
                                return ticket ? (
                                  <div className='bg-blue-600/20 border border-blue-500/50 rounded p-2 text-xs'>
                                    <div className='font-semibold text-blue-200'>{ticket.name}</div>
                                    <div className='text-blue-300'>
                                      {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                                    </div>
                                  </div>
                                ) : null
                              })()}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bulk Row Ticket Assignment */}
                  {selectedSection && selectedSection.seats && selectedSection.seats.length > 0 && (
                    <div className='space-y-3 pt-4 border-t border-purple-500/30'>
                      <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                        🎟️ Gán Vé Theo Hàng
                      </h3>
                      <div className='space-y-2'>
                        {isLoadingTickets ? (
                          <div className='text-xs text-gray-400'>Đang tải...</div>
                        ) : tickets.length === 0 ? (
                          <Alert className='bg-yellow-600/20 border-yellow-600/50'>
                            <AlertDescription className='text-xs text-yellow-200'>
                              Chưa có loại vé. Tạo vé trong tab "Cấu hình vé".
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <div>
                              <label className='text-xs text-gray-400 mb-1 block'>Chọn hàng</label>
                              <Select
                                value={bulkRowNumber.toString()}
                                onValueChange={(value) => setBulkRowNumber(parseInt(value))}
                              >
                                <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                                  <SelectValue placeholder='Chọn hàng...' />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: selectedSection.rows }, (_, i) => i + 1).map((rowNum) => (
                                    <SelectItem key={rowNum} value={rowNum.toString()}>
                                      Hàng {rowNum}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className='text-xs text-gray-400 mb-1 block'>Chọn loại vé</label>
                              <Select value={bulkRowTicketId} onValueChange={setBulkRowTicketId}>
                                <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                                  <SelectValue placeholder='Chọn loại vé...' />
                                </SelectTrigger>
                                <SelectContent>
                                  {tickets.map((ticket) => (
                                    <SelectItem key={ticket.id} value={ticket.id}>
                                      {ticket.name} -{' '}
                                      {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                              onClick={assignTicketToRow}
                              disabled={!bulkRowTicketId}
                              className='w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50'
                              size='sm'
                            >
                              Gán Vé Cho Hàng {bulkRowNumber}
                            </Button>

                            {bulkRowTicketId &&
                              (() => {
                                const ticket = tickets.find((t) => t.id === bulkRowTicketId)
                                return ticket ? (
                                  <div className='bg-orange-600/20 border border-orange-500/50 rounded p-2 text-xs'>
                                    <div className='font-semibold text-orange-200'>{ticket.name}</div>
                                    <div className='text-orange-300'>
                                      {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                                    </div>
                                  </div>
                                ) : null
                              })()}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {(editTool === 'draw' || editTool === 'shape') && (
                    <div className='space-y-2'>
                      <div className='flex gap-2'>
                        <div className='flex-1'>
                          <label className='text-xs text-gray-400 block mb-1'>Số Hàng</label>
                          <input
                            type='number'
                            value={sectionConfig.rows}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, rows: parseInt(e.target.value) || 2 })
                            }
                            className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                            min='1'
                            max='30'
                          />
                        </div>
                        <div className='flex-1'>
                          <label className='text-xs text-gray-400 block mb-1'>Ghế Mỗi Hàng</label>
                          <input
                            type='number'
                            value={sectionConfig.seatsPerRow}
                            onChange={(e) =>
                              setSectionConfig({ ...sectionConfig, seatsPerRow: parseInt(e.target.value) || 3 })
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
                          {isDrawing ? 'Hủy Vẽ' : 'Bắt Đầu Vẽ'}
                        </Button>
                      )}
                    </div>
                  )}

                  {isDrawing && (
                    <Alert className='bg-green-600/20 border-green-600/50'>
                      <AlertDescription className='text-xs text-black'>
                        Nhấp để thêm điểm. Nhấp gần điểm đầu tiên để đóng hình.
                      </AlertDescription>
                    </Alert>
                  )}
                  {/* 
                  <div className='space-y-3'>
                    <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                      <Sparkles className='w-4 h-4' />
                      Tạo Bố Cục Thông Minh
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
                        <label className='text-xs text-gray-400'>Ghế/Hàng</label>
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
                  </div> */}

                  <div className='space-y-2'>
                    <h3 className='text-sm font-semibold text-purple-300'>Các Khu Vực</h3>
                    <div className='space-y-1 max-h-60 overflow-y-auto'>
                      {mapData.sections.map((section) => (
                        <div
                          key={section.id}
                          className={`flex items-center justify-between p-2 rounded transition-colors ${
                            selectedSection?.id === section.id
                              ? 'bg-purple-700/50 border border-purple-500'
                              : 'bg-slate-700/50 hover:bg-slate-700/70'
                          }`}
                        >
                          <div
                            className='flex items-center gap-2 flex-1 cursor-pointer'
                            onClick={() => setSelectedSection(section)}
                          >
                            <Checkbox
                              checked={selectedSections.has(section.id)}
                              onCheckedChange={() => {
                                handleToggleSectionSelection(section.id)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className='border-purple-400 data-[state=checked]:bg-purple-600'
                            />
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
                            {section.ticketId &&
                              (() => {
                                const ticket = tickets.find((t) => t.id === section.ticketId)
                                return ticket ? (
                                  <span className='text-xs text-green-400 font-semibold'>{ticket.name}</span>
                                ) : null
                              })()}
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

              {/* <div className='space-y-2 pt-4 border-t border-purple-500/30'>
                <h3 className='text-sm font-semibold text-purple-300'>Thống Kê</h3>
                <div className='text-xs space-y-1 text-gray-400'>
                  <div>Khu vực: {mapData.sections.length}</div>
                  <div>
                    Tổng ghế:{' '}
                    {mapData.sections.reduce((acc, s) => acc + (s.seats?.length || s.rows * s.seatsPerRow), 0)}
                  </div>
                  <div>Đã đặt: {Array.from(seatStatuses.values()).filter((s) => s === 'occupied').length}</div>
                  <div>Đã khóa: {Array.from(seatStatuses.values()).filter((s) => s === 'locked').length}</div>
                  <div className='flex items-center gap-3 mt-2'>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-green-500 rounded'></div>
                      Còn trống
                    </span>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-red-500 rounded'></div>
                      Đã đặt
                    </span>
                    <span className='flex items-center gap-1'>
                      <div className='w-3 h-3 bg-gray-500 rounded'></div>
                      Đã khóa
                    </span>
                  </div>
                </div>
              </div> */}
            </CardContent>
          </Card>

          <Card className='flex-1 bg-slate-800/60 backdrop-blur-xl border-purple-500/30 relative overflow-hidden shadow-2xl'>
            {/* Floating Action Toolbar */}
            <div className='absolute top-4 right-4 z-50 flex flex-col gap-2 animate-in slide-in-from-right duration-500'>
              {/* Primary Actions */}
              <div className='flex flex-col gap-2 bg-slate-900/95 backdrop-blur-xl p-3 rounded-xl border border-purple-500/30 shadow-2xl'>
                <PermissionGuard requires={ticketPackageId}>
                  {/* Save Button */}
                  <Button
                    onClick={handleSaveSeatingChart}
                    disabled={isCreating || isUpdating || isLoadingEvent || mapData.sections.length === 0}
                    className='bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                    size='sm'
                  >
                    {isCreating || isUpdating ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                        {hasExistingStructure ? 'Đang cập nhật...' : 'Đang lưu...'}
                      </>
                    ) : (
                      <>
                        <Save className='w-4 h-4 mr-1' />
                        {hasExistingStructure ? 'Cập nhật sơ đồ' : 'Lưu sơ đồ'}
                      </>
                    )}
                  </Button>

                  {hasExistingStructure && (
                    <Button
                      onClick={handleDeleteSeatMap}
                      disabled={isDeletingByEventCode}
                      className='bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                      size='sm'
                    >
                      {isDeletingByEventCode ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-1 animate-spin' />
                          Đang xóa...
                        </>
                      ) : (
                        <>
                          <Trash2 className='w-4 h-4 mr-1' />
                          Xóa sơ đồ ghế
                        </>
                      )}
                    </Button>
                  )}
                </PermissionGuard>

                {/* Export Button */}
                <Button
                  onClick={exportToJSON}
                  disabled={mapData.sections.length === 0}
                  className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                  size='sm'
                >
                  <Download className='w-4 h-4 mr-1' />
                  Xuất JSON
                </Button>

                {/* Capacity Display */}
                {!isLoadingEvent && capacity > 0 && (
                  <div className='px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold text-center'>
                    <div className='text-[10px] opacity-90 uppercase tracking-wider mb-1'>Sức chứa sự kiện</div>
                    <div className='text-lg font-bold'>{capacity.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Capacity Info Badge */}
              {(() => {
                let totalSeats = 0
                mapData.sections.forEach((section) => {
                  if (section.seats) {
                    totalSeats += section.seats.length
                  }
                })

                return totalSeats > 0 ? (
                  <div
                    className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-500 text-xs font-semibold animate-in fade-in zoom-in ${
                      totalSeats > capacity
                        ? 'bg-gradient-to-br from-red-600/95 to-red-700/95 text-white border border-red-400/50 shadow-red-500/30'
                        : 'bg-gradient-to-br from-blue-600/95 to-blue-700/95 text-white border border-blue-400/50 shadow-blue-500/30'
                    }`}
                  >
                    <div className='flex flex-col items-center gap-1'>
                      <span className='text-[10px] opacity-90 uppercase tracking-wider'>Tổng ghế</span>
                      <span className='text-2xl font-bold'>{totalSeats}</span>
                      <div className='h-px w-full bg-white/20 my-1'></div>
                      <span className='text-xs opacity-90'>Sức chứa: {capacity}</span>
                      {totalSeats > capacity && (
                        <div className='mt-1 px-2 py-1 bg-white/20 rounded text-[10px] text-red-100 animate-pulse font-bold'>
                          ⚠️ Vượt {totalSeats - capacity} ghế
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              })()}

              {/* Section Count Badge */}
              {mapData.sections.length > 0 && (
                <div className='px-4 py-2 rounded-xl bg-purple-600/90 backdrop-blur-xl border border-purple-400/50 shadow-lg text-white text-xs font-semibold animate-in fade-in duration-500'>
                  <div className='flex flex-col items-center gap-1'>
                    <span className='text-[10px] opacity-90 uppercase tracking-wider'>Khu vực</span>
                    <span className='text-xl font-bold'>{mapData.sections.length}</span>
                  </div>
                </div>
              )}
            </div>

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
                    Quay Lại Sơ Đồ
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
              <h3 className='text-lg font-semibold text-white mb-4'>Sửa Nhãn Khu Vực</h3>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='label-input' className='text-sm text-gray-300'>
                    Tên Khu Vực
                  </Label>
                  <Input
                    id='label-input'
                    value={labelText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabelText(e.target.value)}
                    placeholder='Nhập tên khu vực'
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
                    Hủy
                  </Button>
                  <Button onClick={updateSectionLabel} size='sm' className='bg-purple-600 hover:bg-purple-700'>
                    Cập Nhật
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seat Ticket Assignment Modal */}
        {editingSeatTicket && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
            <div className='bg-white border border-blue-300 rounded-lg p-6 min-w-[400px]'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Gán Loại Vé Cho Ghế</h3>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='ticket-select' className='text-sm text-gray-700 mb-2 block'>
                    Chọn Loại Vé
                  </Label>
                  {isLoadingTickets ? (
                    <div className='text-sm text-gray-500'>Đang tải danh sách vé...</div>
                  ) : tickets.length === 0 ? (
                    <Alert className='bg-yellow-50 border-yellow-200'>
                      <AlertCircle className='w-4 h-4 text-yellow-600' />
                      <AlertDescription className='text-sm text-yellow-800'>
                        Chưa có loại vé nào. Vui lòng tạo loại vé trước trong tab "Cấu hình vé".
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                      <SelectTrigger id='ticket-select' className='border-gray-300'>
                        <SelectValue placeholder='Chọn loại vé...' />
                      </SelectTrigger>
                      <SelectContent>
                        {tickets.map((ticket) => (
                          <SelectItem key={ticket.id} value={ticket.id}>
                            <div className='flex items-center justify-between w-full gap-4'>
                              <span className='font-medium'>{ticket.name}</span>
                              <span className='text-sm text-gray-600'>
                                {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Selected Ticket Info */}
                {selectedTicketId &&
                  (() => {
                    const selectedTicket = tickets.find((t) => t.id === selectedTicketId)
                    return selectedTicket ? (
                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1'>
                        <div className='text-sm font-semibold text-blue-900'>{selectedTicket.name}</div>
                        <div className='text-xs text-blue-700'>{selectedTicket.description}</div>
                        <div className='text-sm font-bold text-blue-600'>
                          {selectedTicket.isFree ? 'Miễn phí' : `${selectedTicket.price.toLocaleString()} VNĐ`}
                        </div>
                      </div>
                    ) : null
                  })()}

                <div className='flex gap-2 justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setEditingSeatTicket(null)
                      setSelectedTicketId('')
                    }}
                    size='sm'
                    className='border-gray-300 text-gray-700'
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={updateSeatTicket}
                    size='sm'
                    disabled={!selectedTicketId}
                    className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 disabled:opacity-50'
                  >
                    Gán Vé
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
