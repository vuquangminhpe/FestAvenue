import { useRef, useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { calculateBounds, getPolygonColor, lineIntersection } from './utils/geometry'
import { generateShapePath } from './utils/shapes'
import { generateSeatsForSection } from './utils/seats'
import { SECTION_TEMPLATES, generateSectionFromTemplate } from './utils/templates'
import { useEditorSeatState } from './hooks/useEditorSeatState'
import SeatMapCanvas from './components/SeatMapCanvas'
import EditorToolbar from './components/EditorToolbar'
import PropertiesPanel from './components/PropertiesPanel'
import LabelEditModal from './components/LabelEditModal'
import TicketAssignmentModal from './components/TicketAssignmentModal'
import EmailLockModal from './EmailLockModal'
import { SKIN_REGISTRY } from './SkinRegistry'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import type { ExtractionResult, Point, Section } from '@/types/seat.types'

const generateId = () => `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

interface AdvancedSeatMapDesignerProps {
  eventCode: string
  ticketPackageId?: string
}

export default function AdvancedSeatMapDesigner({ eventCode, ticketPackageId }: AdvancedSeatMapDesignerProps) {
  const {
    seatManagerRef,
    capacity,
    isLoadingEvent,
    createSeatingChart,
    updateSeatingChart,
    isCreating,
    isUpdating,
    tickets,
    isLoadingTickets,
    hasExistingStructure,
    deleteSeatingChartByEventCode,
    isDeletingByEventCode,
    // Ticket booking status
    ticketsForSeats,
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
  } = useEditorSeatState(eventCode)

  const imageInputRef = useRef<HTMLInputElement>(null)

  // State for delete confirmation dialog
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)

  // Check if any seats have been purchased (cannot delete seat map)
  const hasPurchasedSeats = useMemo(() => {
    return ticketsForSeats.some((ticket) => ticket.isPayment)
  }, [ticketsForSeats])

  // Count purchased and locked seats for display
  const seatStats = useMemo(() => {
    const purchased = ticketsForSeats.filter((t) => t.isPayment).length
    const locked = ticketsForSeats.filter((t) => t.isSeatLock && !t.isPayment).length
    return { purchased, locked }
  }, [ticketsForSeats])

  // --- Image Import Logic ---
  const extractPolygonsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('https://minhvtt-pylogyn-detect.hf.space/extract_seats', {
        method: 'POST',
        body: formData
      })
      if (!response.ok) throw new Error('Failed to extract polygons')
      return response.json() as Promise<ExtractionResult>
    },
    onSuccess: (data) => {
      const newSections: Section[] = data.polygons.map((poly, index) => {
        const points = poly.map((p) => ({ x: p[0], y: p[1] }))
        const bounds = calculateBounds(points)
        const center = {
          x: (bounds.minX + bounds.maxX) / 2,
          y: (bounds.minY + bounds.maxY) / 2
        }

        // Find label inside polygon
        const label = data.detected_text.find((text) => {
          const tx = (text.bbox[0] + text.bbox[2]) / 2
          const ty = (text.bbox[1] + text.bbox[3]) / 2
          // Simple bounding box check
          return tx >= bounds.minX && tx <= bounds.maxX && ty >= bounds.minY && ty <= bounds.maxY
        })

        const sectionName = label ? label.text : `Section ${index + 1}`
        const color = getPolygonColor(index, data.polygons.length)

        const section: Section = {
          id: `${sectionName}-${index + 1}`,
          name: sectionName,
          color,
          points,
          position: center,
          rows: sectionConfig.rows,
          seatsPerRow: sectionConfig.seatsPerRow,
          price: 0,
          bounds,
          labelPosition: { x: center.x, y: center.y },
          hasSeats: true
        }
        // Generate seats
        section.seats = generateSeatsForSection(section, seatStatuses)
        return section
      })

      setMapData((prev) => ({
        ...prev,
        sections: [...prev.sections, ...newSections]
      }))
      setIsImageImportMode(true)
      toast.success(`Successfully extracted ${newSections.length} sections!`)
    },
    onError: () => {
      toast.error('Failed to extract seat map from image')
    }
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      extractPolygonsMutation.mutate(file)
    }
  }

  // --- Section & Shape Logic ---
  const createShapeSection = (center: Point) => {
    const id = generateId()
    const size = 50

    let points: Point[] = []
    let path: string | undefined

    if (selectedShape === 'rectangle') {
      points = [
        { x: center.x - size, y: center.y - size / 2 },
        { x: center.x + size, y: center.y - size / 2 },
        { x: center.x + size, y: center.y + size / 2 },
        { x: center.x - size, y: center.y + size / 2 }
      ]
    } else if (selectedShape === 'circle') {
      // Approximate circle with polygon for hit testing, but use path for rendering
      const segments = 32
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push({
          x: center.x + size * Math.cos(angle),
          y: center.y + size * Math.sin(angle)
        })
      }
    } else if (selectedShape === 'polygon') {
      const sides = 6
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2
        points.push({
          x: center.x + size * Math.cos(angle),
          y: center.y + size * Math.sin(angle)
        })
      }
    } else {
      // Complex shapes use path generator
      path = generateShapePath(selectedShape, center, size)
      // Generate points for bounds calculation
      points = [
        { x: center.x - size, y: center.y - size },
        { x: center.x + size, y: center.y + size }
      ]
    }

    const newSection: Section = {
      id,
      name: `${sectionConfig.name} ${mapData.sections.length + 1}`,
      color: colorPicker.useGradient ? colorPicker.fill : colorPicker.fill,
      strokeColor: colorPicker.stroke,
      points,
      path,
      position: center,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      price: 0,
      bounds: calculateBounds(points),
      labelPosition: center,
      gradient: colorPicker.useGradient ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo } : undefined,
      hasSeats: sectionConfig.hasSeats,
      customSeatCount: sectionConfig.customSeatCount
    }

    if (sectionConfig.hasSeats) {
      newSection.seats = generateSeatsForSection(newSection, seatStatuses)
    }

    setMapData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
    setEditTool('select')
    toast.success('Section created')
  }

  const createSectionFromPoints = (points: Point[]) => {
    const id = generateId()
    const bounds = calculateBounds(points)
    const center = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2
    }

    const newSection: Section = {
      id,
      name: `${sectionConfig.name} ${mapData.sections.length + 1}`,
      color: colorPicker.useGradient ? colorPicker.fill : colorPicker.fill,
      strokeColor: colorPicker.stroke,
      points,
      position: center,
      rows: sectionConfig.rows,
      seatsPerRow: sectionConfig.seatsPerRow,
      price: 0,
      bounds,
      labelPosition: center,
      gradient: colorPicker.useGradient ? { from: colorPicker.gradientFrom, to: colorPicker.gradientTo } : undefined,
      hasSeats: sectionConfig.hasSeats,
      customSeatCount: sectionConfig.customSeatCount
    }

    if (sectionConfig.hasSeats) {
      newSection.seats = generateSeatsForSection(newSection, seatStatuses)
    }

    setMapData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
    toast.success('Section created from drawing')
  }

  const splitSection = (section: Section, lineStart: Point, lineEnd: Point) => {
    const points = section.points
    if (points.length < 3) {
      toast.error('Section must have at least 3 points to split')
      return
    }

    // Find intersection points along the split line with polygon edges
    const intersections: { point: Point; edgeIndex: number }[] = []

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length]

      const intersection = lineIntersection(p1, p2, lineStart, lineEnd)
      if (intersection) {
        intersections.push({ point: intersection, edgeIndex: i })
      }
    }

    // We need exactly 2 intersection points to split
    if (intersections.length !== 2) {
      toast.error(`Split line must intersect polygon at exactly 2 points (found ${intersections.length})`)
      return
    }

    // Sort intersections by edge index
    intersections.sort((a, b) => a.edgeIndex - b.edgeIndex)

    const int1 = intersections[0]
    const int2 = intersections[1]

    // Build two new polygons
    const polygon1: Point[] = []
    const polygon2: Point[] = []

    // Add first intersection point
    polygon1.push(int1.point)

    // Add points from first intersection to second intersection (going forward)
    for (let i = int1.edgeIndex + 1; i <= int2.edgeIndex; i++) {
      polygon1.push(points[i])
    }

    // Add second intersection point
    polygon1.push(int2.point)

    // Add second intersection point to polygon2
    polygon2.push(int2.point)

    // Add remaining points (from second intersection back to first, wrapping around)
    for (let i = int2.edgeIndex + 1; i < points.length; i++) {
      polygon2.push(points[i])
    }
    for (let i = 0; i <= int1.edgeIndex; i++) {
      polygon2.push(points[i])
    }

    // Add first intersection point to close polygon2
    polygon2.push(int1.point)

    // Validate polygons
    if (polygon1.length < 3 || polygon2.length < 3) {
      toast.error('Split resulted in invalid polygons')
      return
    }

    // Create two new sections
    const bounds1 = calculateBounds(polygon1)
    const bounds2 = calculateBounds(polygon2)

    const center1 = {
      x: (bounds1.minX + bounds1.maxX) / 2,
      y: (bounds1.minY + bounds1.maxY) / 2
    }

    const center2 = {
      x: (bounds2.minX + bounds2.maxX) / 2,
      y: (bounds2.minY + bounds2.maxY) / 2
    }

    const section1: Section = {
      id: generateId(),
      name: `${section.name} (1)`,
      color: section.color,
      strokeColor: section.strokeColor,
      points: polygon1,
      position: center1,
      rows: Math.ceil(section.rows / 2),
      seatsPerRow: section.seatsPerRow,
      price: section.price,
      bounds: bounds1,
      labelPosition: center1,
      gradient: section.gradient,
      hasSeats: section.hasSeats,
      appearance: section.appearance,
      ticketId: section.ticketId
    }

    const section2: Section = {
      id: generateId(),
      name: `${section.name} (2)`,
      color: section.color,
      strokeColor: section.strokeColor,
      points: polygon2,
      position: center2,
      rows: Math.floor(section.rows / 2),
      seatsPerRow: section.seatsPerRow,
      price: section.price,
      bounds: bounds2,
      labelPosition: center2,
      gradient: section.gradient,
      hasSeats: section.hasSeats,
      appearance: section.appearance,
      ticketId: section.ticketId
    }

    // Generate seats for both sections
    if (section.hasSeats) {
      section1.seats = generateSeatsForSection(section1, seatStatuses)
      section2.seats = generateSeatsForSection(section2, seatStatuses)
    }

    // Update mapData: remove old section, add two new sections
    setMapData((prev) => ({
      ...prev,
      sections: [...prev.sections.filter((s) => s.id !== section.id), section1, section2]
    }))

    setSelectedSection(null)
    setSplitLine(null)
    setSplitFirstPoint(null)
    setEditTool('select')

    toast.success(`Đã chia section thành 2 phần: ${section1.seats?.length || 0} và ${section2.seats?.length || 0} ghế`)
  }

  const applyTemplateToNewSection = (templateId: string) => {
    const template = SECTION_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    setSelectedTemplateId(templateId)
    const center = { x: 500, y: 300 } // Center of canvas

    const generatedSection = generateSectionFromTemplate(templateId, {
      centerX: center.x,
      centerY: center.y,
      name: `${template.name} ${mapData.sections.length + 1}`
    })

    if (!generatedSection) return

    const newSection: Section = {
      ...generatedSection,
      id: generateId(),
      seats: []
    }

    newSection.seats = generateSeatsForSection(newSection, seatStatuses)

    setMapData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
    toast.success(`Created ${template.name} section`)
  }

  const handleSectionAppearanceChange = (sectionId: string, templateId: string) => {
    setMapData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.id === sectionId) {
          const skin = SKIN_REGISTRY[templateId]
          return {
            ...section,
            appearance:
              templateId === '__legacy__'
                ? undefined
                : {
                    templateId,
                    customOverride: {}
                  },
            // Update visual properties if skin is applied
            color: skin ? skin.zone.fillColor || section.color : section.color,
            strokeColor: skin ? skin.zone.strokeColor || section.strokeColor : section.strokeColor
          }
        }
        return section
      })
    }))
  }

  // --- Point Editing Logic ---
  const startEditingPoints = (section: Section) => {
    setEditingPoints({
      sectionId: section.id,
      points: [...section.points]
    })
    setEditTool('edit-points')
    setSelectedPointIndex(null)
  }

  const updatePointPosition = (pointIndex: number, newPosition: Point) => {
    if (!editingPoints) return

    const newPoints = [...editingPoints.points]
    newPoints[pointIndex] = newPosition
    setEditingPoints({
      ...editingPoints,
      points: newPoints
    })
  }

  const replaceEditingPoints = (points: Point[]) => {
    if (!editingPoints) return
    setEditingPoints({
      ...editingPoints,
      points
    })
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
            bounds
          }
          // Regenerate seats if needed
          if (updatedSection.hasSeats) {
            updatedSection.seats = generateSeatsForSection(updatedSection, seatStatuses)
          }
          return updatedSection
        }
        return section
      })
    }))
    setEditingPoints(null)
    setEditTool('select')
    toast.success('Section shape updated')
  }

  const cancelPointEditing = () => {
    setEditingPoints(null)
    setEditTool('select')
  }

  // --- Ticket & Seat Management ---
  const handleSetAllSeats = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return

    const updatedSections = mapData.sections.map((section) => ({
      ...section,
      ticketId,
      price: ticket.price,
      seats: section.seats?.map((seat) => ({
        ...seat,
        ticketId,
        price: ticket.price
      }))
    }))

    setMapData({ ...mapData, sections: updatedSections })
    toast.success(`Đã áp dụng vé ${ticket.name} cho toàn bộ sơ đồ`)
  }

  const handleBulkTicketAssignment = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return

    const updatedSections = mapData.sections.map((section) => {
      if (selectedSections.has(section.id)) {
        return {
          ...section,
          ticketId,
          price: ticket.price,
          seats: section.seats?.map((seat) => ({
            ...seat,
            ticketId,
            price: ticket.price
          }))
        }
      }
      return section
    })

    setMapData({ ...mapData, sections: updatedSections })
    toast.success(`Đã áp dụng vé cho ${selectedSections.size} khu vực`)
    setSelectedSections(new Set())
  }

  const assignTicketToRow = () => {
    if (!selectedSection || !bulkRowTicketId) return

    const ticket = tickets.find((t) => t.id === bulkRowTicketId)
    if (!ticket) return

    const updatedSections = mapData.sections.map((s) => {
      if (s.id === selectedSection.id) {
        return {
          ...s,
          seats: s.seats?.map((seat) => {
            if (seat.row === bulkRowNumber) {
              return {
                ...seat,
                ticketId: bulkRowTicketId,
                price: ticket.price
              }
            }
            return seat
          })
        }
      }
      return s
    })

    setMapData({ ...mapData, sections: updatedSections })
    toast.success(`Đã gán vé cho hàng ${bulkRowNumber}`)
  }

  const handleSeatLockToggle = (seatId: string, currentStatus: string, seatLabel: string) => {
    if (currentStatus === 'locked') {
      // Unlock
      const newStatuses = new Map(seatStatuses)
      newStatuses.delete(seatId)
      setSeatStatuses(newStatuses)
      seatManagerRef.current.unlockSeat(seatId)
      toast.success('Đã mở khóa ghế')
    } else {
      // Lock - show email modal
      setEmailLockModal({
        seatId,
        seatLabel,
        currentEmail: seatEmails.get(seatId)
      })
    }
  }

  const handleEmailLockConfirm = (seatId: string, email: string) => {
    const newStatuses = new Map(seatStatuses)
    newStatuses.set(seatId, 'locked')
    setSeatStatuses(newStatuses)

    const newEmails = new Map(seatEmails)
    newEmails.set(seatId, email)
    setSeatEmails(newEmails)

    seatManagerRef.current.lockSeat(seatId, email)
    setEmailLockModal(null)
    toast.success(`Đã khóa ghế cho ${email}`)
  }

  const handleToggleSectionSelection = (sectionId: string) => {
    const newSelection = new Set(selectedSections)
    if (newSelection.has(sectionId)) {
      newSelection.delete(sectionId)
    } else {
      newSelection.add(sectionId)
    }
    setSelectedSections(newSelection)
  }

  const deleteSection = (sectionId: string) => {
    // Check if section has booked/purchased seats
    const bookingStatus = getSectionBookingStatus(sectionId)
    if (bookingStatus.hasBookedSeats) {
      toast.error(`Không thể xóa khu vực này vì có ${bookingStatus.bookedCount} ghế đã được đặt/mua`)
      return
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa khu vực này?')) {
      setMapData((prev) => ({
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId)
      }))
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null)
      }
      toast.success('Đã xóa khu vực')
    }
  }

  // Check if a section can be modified (no booked/purchased seats)
  const canModifySection = (sectionId: string) => {
    const bookingStatus = getSectionBookingStatus(sectionId)
    return !bookingStatus.hasBookedSeats
  }

  // --- Save & Export ---
  const handleSaveSeatingChart = async () => {
    if (!ticketPackageId) {
      toast.error('Missing ticket package ID')
      return
    }

    try {
      // Prepare data for saving
      const structureData = {
        sections: mapData.sections.map((section) => ({
          ...section,
          points: section.points,
          seats: section.seats?.map((seat) => ({
            id: seat.id,
            row: seat.row,
            number: seat.number,
            x: seat.x,
            y: seat.y,
            status: seatStatuses.get(seat.id) || seat.status || 'available',
            ticketId: seat.ticketId,
            price: seat.price
          }))
        })),
        stage: mapData.stage,
        aisles: mapData.aisles,
        seatStatuses: Array.from(seatStatuses.entries())
      }

      // Extract tickets for seats
      const ticketsForSeats: { ticketId: string; seatIndex: string; email?: string }[] = []
      mapData.sections.forEach((section) => {
        section.seats?.forEach((seat) => {
          if (seat.ticketId) {
            ticketsForSeats.push({
              ticketId: seat.ticketId,
              seatIndex: seat.id,
              email: seatEmails.get(seat.id)
            })
          }
        })
      })

      const finalPayload = {
        eventCode,
        seatingChartStructure: JSON.stringify(structureData),
        ticketsForSeats
      }

      if (hasExistingStructure) {
        await updateSeatingChart(finalPayload)
      } else {
        await createSeatingChart(finalPayload)
      }
    } catch (error) {
      console.error('Failed to save seating chart:', error)
      toast.error('Failed to save seating chart')
    }
  }

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setShowDeleteConfirmDialog(true)
  }

  // Confirm delete seat map
  const handleConfirmDeleteSeatMap = async () => {
    try {
      await deleteSeatingChartByEventCode(eventCode)
      setMapData({
        sections: [],
        stage: { x: 350, y: 50, width: 300, height: 80 },
        aisles: []
      })
      setSeatStatuses(new Map())
      setShowDeleteConfirmDialog(false)
      toast.success('Đã xóa sơ đồ ghế thành công')
    } catch (error) {
      console.error('Failed to delete seat map:', error)
    }
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(mapData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `seat-map-${eventCode}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className='flex w-full h-[calc(100vh-100px)] gap-4 p-4'>
      {/* Left Sidebar - Properties & Tools */}
      <PropertiesPanel
        mode={mode}
        imageInputRef={imageInputRef}
        handleImageUpload={handleImageUpload}
        extractPolygonsMutation={extractPolygonsMutation}
        isImageImportMode={isImageImportMode}
        mapData={mapData}
        setMapData={setMapData}
        applyTemplateToNewSection={applyTemplateToNewSection}
        selectedTemplateId={selectedTemplateId}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        handleSectionAppearanceChange={handleSectionAppearanceChange}
        isLoadingTickets={isLoadingTickets}
        tickets={tickets}
        globalTicketId={globalTicketId}
        setGlobalTicketId={setGlobalTicketId}
        handleSetAllSeats={handleSetAllSeats}
        selectedSections={selectedSections}
        handleBulkTicketAssignment={handleBulkTicketAssignment}
        setSelectedSections={setSelectedSections}
        ticketPackageId={ticketPackageId}
        editTool={editTool}
        setEditTool={setEditTool}
        startEditingPoints={startEditingPoints}
        splitFirstPoint={splitFirstPoint}
        setSplitFirstPoint={setSplitFirstPoint}
        setSplitLine={setSplitLine}
        editingPoints={editingPoints}
        replaceEditingPoints={replaceEditingPoints}
        applyEditedPoints={applyEditedPoints}
        cancelPointEditing={cancelPointEditing}
        setPointConstraint={setPointConstraint}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        colorPicker={colorPicker}
        setColorPicker={setColorPicker}
        sectionConfig={sectionConfig}
        setSectionConfig={setSectionConfig}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        handleToggleSectionSelection={handleToggleSectionSelection}
        deleteSection={deleteSection}
        bulkRowNumber={bulkRowNumber}
        setBulkRowNumber={setBulkRowNumber}
        bulkRowTicketId={bulkRowTicketId}
        setBulkRowTicketId={setBulkRowTicketId}
        assignTicketToRow={assignTicketToRow}
        generateSeatsForSection={generateSeatsForSection}
        seatStatuses={seatStatuses}
        canModifySection={canModifySection}
      />

      {/* Main Canvas Area */}
      <div className='flex-1 relative h-full'>
        <div className='absolute inset-0 bg-slate-800/60 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl'>
          {/* Floating Toolbar */}
          <EditorToolbar
            ticketPackageId={ticketPackageId}
            handleSaveSeatingChart={handleSaveSeatingChart}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isLoadingEvent={isLoadingEvent}
            hasExistingStructure={hasExistingStructure}
            handleDeleteSeatMap={handleOpenDeleteDialog}
            isDeletingByEventCode={isDeletingByEventCode}
            exportToJSON={exportToJSON}
            mapData={mapData}
            capacity={capacity}
          />

          {/* Canvas */}
          <SeatMapCanvas
            mode={mode}
            mapData={mapData}
            setMapData={setMapData}
            editTool={editTool}
            setEditTool={setEditTool}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            seatStatuses={seatStatuses}
            setSeatStatuses={setSeatStatuses}
            colorPicker={colorPicker}
            isImageImportMode={isImageImportMode}
            splitLine={splitLine}
            setSplitLine={setSplitLine}
            isSplitting={isSplitting}
            splitFirstPoint={splitFirstPoint}
            setSplitFirstPoint={setSplitFirstPoint}
            editingPoints={editingPoints}
            setEditingPoints={setEditingPoints}
            selectedPointIndex={selectedPointIndex}
            setSelectedPointIndex={setSelectedPointIndex}
            pointConstraint={pointConstraint}
            setPointConstraint={setPointConstraint}
            drawingPoints={drawingPoints}
            setDrawingPoints={setDrawingPoints}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            draggedSection={draggedSection}
            setDraggedSection={setDraggedSection}
            dragOffset={dragOffset}
            setDragOffset={setDragOffset}
            editingLabel={editingLabel}
            setEditingLabel={setEditingLabel}
            setLabelText={setLabelText}
            setEditingSeatTicket={setEditingSeatTicket}
            setSelectedTicketId={setSelectedTicketId}
            seatManagerRef={seatManagerRef}
            splitSection={splitSection}
            createShapeSection={createShapeSection}
            createSectionFromPoints={createSectionFromPoints}
            updatePointPosition={updatePointPosition}
            handleSeatLockToggle={handleSeatLockToggle}
            pointConstraintRef={pointConstraintRef}
            editingPointsRef={editingPointsRef}
            selectedShape={selectedShape}
            ticketsForSeats={ticketsForSeats}
            canModifySection={canModifySection}
          />
        </div>
      </div>

      {/* Modals */}
      <LabelEditModal
        isOpen={!!editingLabel}
        onClose={() => setEditingLabel(null)}
        labelText={labelText}
        setLabelText={setLabelText}
        onSave={() => {
          if (!editingLabel) return
          const updatedSections = mapData.sections.map((s) =>
            s.id === editingLabel ? { ...s, displayName: labelText } : s
          )
          setMapData({ ...mapData, sections: updatedSections })
          setEditingLabel(null)
          toast.success('Đã cập nhật tên khu vực')
        }}
      />

      <TicketAssignmentModal
        isOpen={!!editingSeatTicket}
        onClose={() => setEditingSeatTicket(null)}
        selectedTicketId={selectedTicketId}
        setSelectedTicketId={setSelectedTicketId}
        tickets={tickets}
        onSave={() => {
          if (!editingSeatTicket || !selectedTicketId) return
          const ticket = tickets.find((t) => t.id === selectedTicketId)
          if (!ticket) return

          const updatedSections = mapData.sections.map((section) => ({
            ...section,
            seats: section.seats?.map((seat) => {
              if (seat.id === editingSeatTicket) {
                return {
                  ...seat,
                  ticketId: selectedTicketId,
                  price: ticket.price
                }
              }
              return seat
            })
          }))
          setMapData({ ...mapData, sections: updatedSections })
          setEditingSeatTicket(null)
          toast.success('Đã gán vé cho ghế')
        }}
      />

      {emailLockModal && (
        <EmailLockModal
          seatId={emailLockModal.seatId}
          seatLabel={emailLockModal.seatLabel}
          currentEmail={emailLockModal.currentEmail}
          onConfirm={(email) => handleEmailLockConfirm(emailLockModal.seatId, email)}
          onCancel={() => setEmailLockModal(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='w-5 h-5' />
              Xác nhận xóa sơ đồ ghế
            </DialogTitle>
            <DialogDescription className='text-left'>
              {hasPurchasedSeats ? (
                <div className='space-y-3'>
                  <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-red-700 font-medium'>Không thể xóa sơ đồ ghế!</p>
                    <p className='text-red-600 text-sm mt-1'>
                      Đã có người dùng mua vé, bạn không thể xóa các ghế ngồi.
                    </p>
                  </div>
                  <div className='text-sm text-gray-600'>
                    <p>Thống kê vé:</p>
                    <ul className='list-disc list-inside mt-1 ml-2'>
                      <li className='text-gray-500'>
                        Đã mua: <span className='font-medium text-gray-700'>{seatStats.purchased} ghế</span>
                      </li>
                      {seatStats.locked > 0 && (
                        <li className='text-gray-500'>
                          Đang giữ: <span className='font-medium text-gray-700'>{seatStats.locked} ghế</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  <p>Bạn có chắc chắn muốn xóa toàn bộ sơ đồ ghế?</p>
                  <div className='p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                    <p className='text-amber-700 text-sm font-medium'>⚠️ Hành động này không thể hoàn tác!</p>
                    <p className='text-amber-600 text-sm mt-1'>Tất cả các khu vực và ghế ngồi sẽ bị xóa vĩnh viễn.</p>
                  </div>
                  {seatStats.locked > 0 && (
                    <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                      <p className='text-blue-700 text-sm'>
                        Lưu ý: Có {seatStats.locked} ghế đang được giữ, sẽ được giải phóng khi xóa.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => setShowDeleteConfirmDialog(false)}>
              Hủy
            </Button>
            {!hasPurchasedSeats && (
              <Button
                variant='destructive'
                onClick={handleConfirmDeleteSeatMap}
                disabled={isDeletingByEventCode}
                className='bg-red-600 hover:bg-red-700'
              >
                {isDeletingByEventCode ? (
                  <>Đang xóa...</>
                ) : (
                  <>
                    <Trash2 className='w-4 h-4 mr-2' />
                    Xóa sơ đồ ghế
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
