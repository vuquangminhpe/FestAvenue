import { useState, useRef, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSeatManagement } from '@/pages/User/Auth/TicketManagement/hooks/useSeatManagement'
import { SeatInteractionManager } from '../classes/SeatInteractionManager'
import serviceTicketManagementApi from '@/apis/serviceTicketManagement.api'

import type {
  EditTool,
  Point,
  PointConstraint,
  SeatMapData,
  Section,
  ShapeType
} from '@/types/seat.types'
import type { TicketsCharForSeatsType } from '@/types/serviceTicketManagement.types'

export const useEditorSeatState = (eventCode: string) => {
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

  // Fetch ticketsForSeats data to show seat booking status
  const { data: seatMapData, isLoading: isLoadingSeatMap } = useQuery({
    queryKey: ['seatMap', eventCode],
    queryFn: () => serviceTicketManagementApi.getSeatMapByEventCode(eventCode),
    enabled: !!eventCode && hasExistingStructure,
    staleTime: 10000, // 10 seconds - refresh frequently to get latest status
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  // Extract ticketsForSeats from seatMapData
  const ticketsForSeats: TicketsCharForSeatsType[] = useMemo(() => {
    return seatMapData?.data?.ticketsForSeats || []
  }, [seatMapData])

  // Check if a section has any booked/purchased seats (cannot be modified)
  const getSectionBookingStatus = (sectionId: string) => {
    const sectionSeats = ticketsForSeats.filter((t) => t.seatIndex.startsWith(sectionId))
    const hasBookedSeats = sectionSeats.some((t) => t.isSeatLock || t.isPayment)
    const hasPurchasedSeats = sectionSeats.some((t) => t.isPayment)
    return { hasBookedSeats, hasPurchasedSeats, bookedCount: sectionSeats.filter((t) => t.isSeatLock || t.isPayment).length }
  }

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

  const [sectionConfig, setSectionConfig] = useState<{
    rows: number
    seatsPerRow: number
    name: string
    hasSeats: boolean
    customSeatCount?: number
  }>({
    rows: 3,
    seatsPerRow: 4,
    name: 'New Section',
    hasSeats: true
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

  return {
    seatManagerRef,
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
    isDeletingByEventCode,
    // Ticket booking status data
    ticketsForSeats,
    isLoadingSeatMap,
    getSectionBookingStatus,
    mode,
    editTool,
    setEditTool,
    selectedShape,
    setSelectedShape,
    drawingPoints,
    setDrawingPoints,
    isDrawing,
    setIsDrawing,
    selectedSection,
    setSelectedSection,
    editingLabel,
    setEditingLabel,
    labelText,
    setLabelText,
    editingSeatTicket,
    setEditingSeatTicket,
    selectedTicketId,
    setSelectedTicketId,
    bulkRowNumber,
    setBulkRowNumber,
    bulkRowTicketId,
    setBulkRowTicketId,
    mapData,
    setMapData,
    is3DView,
    setIs3DView,
    seatStatuses,
    setSeatStatuses,
    sectionConfig,
    setSectionConfig,
    colorPicker,
    setColorPicker,
    draggedSection,
    setDraggedSection,
    dragOffset,
    setDragOffset,
    isImageImportMode,
    setIsImageImportMode,
    splitLine,
    setSplitLine,
    isSplitting,
    splitFirstPoint,
    setSplitFirstPoint,
    editingPoints,
    setEditingPoints,
    selectedPointIndex,
    setSelectedPointIndex,
    pointConstraint,
    setPointConstraint,
    pointConstraintRef,
    editingPointsRef,
    emailLockModal,
    setEmailLockModal,
    seatEmails,
    setSeatEmails,
    selectedSections,
    setSelectedSections,
    selectedTemplateId,
    setSelectedTemplateId,
    globalTicketId,
    setGlobalTicketId
  }
}
