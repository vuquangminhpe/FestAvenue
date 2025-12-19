import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { PermissionGuard } from '@/components/guards/PermissionGuard'
import {
  Loader2,
  Sparkles,
  Palette,
  MousePointer,
  Move,
  PenTool,
  Hexagon,
  Edit,
  Scissors,
  GitBranch,
  Square,
  Circle,
  Star,
  Moon,
  Triangle,
  AlertCircle,
  Trash2
} from 'lucide-react'
import PointEditorPanel from './PointEditorPanel'
import { SECTION_TEMPLATES } from '../utils/templates'
import { SKIN_REGISTRY, type SeatMapSkin } from '../SkinRegistry'
import type {
  EditTool,
  Point,
  PointConstraint,
  SeatMapData,
  Section,
  ShapeType
} from '@/types/seat.types'

interface PropertiesPanelProps {
  mode: 'edit'
  imageInputRef: React.RefObject<HTMLInputElement | null>
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  extractPolygonsMutation: any
  isImageImportMode: boolean
  mapData: SeatMapData
  setMapData: React.Dispatch<React.SetStateAction<SeatMapData>>
  applyTemplateToNewSection: (templateId: string) => void
  selectedTemplateId: string | null
  selectedSection: Section | null
  setSelectedSection: React.Dispatch<React.SetStateAction<Section | null>>
  handleSectionAppearanceChange: (sectionId: string, templateId: string) => void
  isLoadingTickets: boolean
  tickets: any[]
  globalTicketId: string
  setGlobalTicketId: React.Dispatch<React.SetStateAction<string>>
  handleSetAllSeats: (ticketId: string) => void
  selectedSections: Set<string>
  handleBulkTicketAssignment: (ticketId: string) => void
  setSelectedSections: React.Dispatch<React.SetStateAction<Set<string>>>
  ticketPackageId?: string
  editTool: EditTool
  setEditTool: React.Dispatch<React.SetStateAction<EditTool>>
  startEditingPoints: (section: Section) => void
  splitFirstPoint: Point | null
  setSplitFirstPoint: React.Dispatch<React.SetStateAction<Point | null>>
  setSplitLine: React.Dispatch<React.SetStateAction<{ start: Point; end: Point } | null>>
  editingPoints: { sectionId: string; points: Point[] } | null
  setEditingPoints: React.Dispatch<React.SetStateAction<{ sectionId: string; points: Point[] } | null>>
  replaceEditingPoints: (points: Point[]) => void
  applyEditedPoints: () => void
  cancelPointEditing: () => void
  setPointConstraint: React.Dispatch<React.SetStateAction<PointConstraint | null>>
  selectedPointIndices: Set<number>
  setSelectedPointIndices: React.Dispatch<React.SetStateAction<Set<number>>>
  selectedShape: ShapeType
  setSelectedShape: React.Dispatch<React.SetStateAction<ShapeType>>
  colorPicker: {
    fill: string
    stroke: string
    useGradient: boolean
    gradientFrom: string
    gradientTo: string
  }
  setColorPicker: React.Dispatch<React.SetStateAction<{
    fill: string
    stroke: string
    useGradient: boolean
    gradientFrom: string
    gradientTo: string
  }>>
  sectionConfig: {
    rows: number
    seatsPerRow: number
    name: string
    hasSeats: boolean
    customSeatCount?: number
  }
  setSectionConfig: React.Dispatch<React.SetStateAction<{
    rows: number
    seatsPerRow: number
    name: string
    hasSeats: boolean
    customSeatCount?: number
  }>>
  isDrawing: boolean
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>
  handleToggleSectionSelection: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
  bulkRowNumber: number
  setBulkRowNumber: React.Dispatch<React.SetStateAction<number>>
  bulkRowTicketId: string
  setBulkRowTicketId: React.Dispatch<React.SetStateAction<string>>
  assignTicketToRow: () => void
  generateSeatsForSection: (section: Section, seatStatuses: any) => any
  seatStatuses: any
  // Check if section can be modified (no booked seats)
  canModifySection?: (sectionId: string) => boolean
}

export default function PropertiesPanel({
  mode,
  imageInputRef,
  handleImageUpload,
  extractPolygonsMutation,
  isImageImportMode,
  mapData,
  setMapData,
  applyTemplateToNewSection,
  selectedTemplateId,
  selectedSection,
  setSelectedSection,
  handleSectionAppearanceChange,
  isLoadingTickets,
  tickets,
  globalTicketId,
  setGlobalTicketId,
  handleSetAllSeats,
  selectedSections,
  handleBulkTicketAssignment,
  setSelectedSections,
  editTool,
  setEditTool,
  startEditingPoints,
  splitFirstPoint,
  setSplitFirstPoint,
  setSplitLine,
  editingPoints,
  setEditingPoints,
  replaceEditingPoints,
  applyEditedPoints,
  cancelPointEditing,
  setPointConstraint,
  selectedPointIndices,
  setSelectedPointIndices,
  selectedShape,
  setSelectedShape,
  colorPicker,
  setColorPicker,
  sectionConfig,
  setSectionConfig,
  isDrawing,
  setIsDrawing,
  handleToggleSectionSelection,
  deleteSection,
  bulkRowNumber,
  setBulkRowNumber,
  bulkRowTicketId,
  setBulkRowTicketId,
  assignTicketToRow,
  generateSeatsForSection,
  seatStatuses,
  canModifySection
}: PropertiesPanelProps) {
  // Check if selected section can be modified
  const selectedSectionCanBeModified = selectedSection && canModifySection
    ? canModifySection(selectedSection.id)
    : true
  return (
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
              <PermissionGuard action="Phát Hiện Ghế Bằng AI" hideWithoutPermission>
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
              </PermissionGuard>
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

            {selectedSection && (
              <div className='space-y-2 pb-3 border-b border-purple-500/30'>
                <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                  <Palette className='w-4 h-4' />
                  Zone Styling
                </h3>
                <Select
                  value={selectedSection.appearance?.templateId || '__legacy__'}
                  onValueChange={(value) => handleSectionAppearanceChange(selectedSection.id, value)}
                >
                  <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                    <SelectValue placeholder='Chọn giao diện hiển thị' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__legacy__'>Mặc định (wireframe)</SelectItem>
                    {Object.values(SKIN_REGISTRY).map((skin: SeatMapSkin) => (
                      <SelectItem key={skin.id} value={skin.id}>
                        {skin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
              <PermissionGuard action="Cập nhật sơ đồ" hideWithoutPermission>
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
                      if (!selectedSection) {
                        alert('Vui lòng chọn một khu vực trước để chia')
                        return
                      }
                      if (!selectedSectionCanBeModified) {
                        alert('Không thể chia cắt khu vực này vì có ghế đã được đặt/mua')
                        return
                      }
                      setEditTool('split')
                    }}
                    variant={editTool === 'split' ? 'default' : 'outline'}
                    size='sm'
                    className={editTool === 'split' ? 'bg-yellow-600' : (!selectedSectionCanBeModified && selectedSection ? 'opacity-50' : '')}
                    disabled={!selectedSection || !selectedSectionCanBeModified}
                    title={!selectedSectionCanBeModified ? 'Khu vực có ghế đã đặt/mua không thể chia cắt' : 'Chia cắt khu vực'}
                  >
                    <Scissors className='w-3 h-3 mr-1' />
                    Chia Cắt
                  </Button>
                  <Button
                    onClick={() => {
                      if (!selectedSection) {
                        alert('Vui lòng chọn một khu vực trước để sửa điểm')
                        return
                      }
                      if (!selectedSectionCanBeModified) {
                        alert('Không thể sửa điểm khu vực này vì có ghế đã được đặt/mua')
                        return
                      }
                      startEditingPoints(selectedSection)
                    }}
                    variant={editTool === 'edit-points' ? 'default' : 'outline'}
                    size='sm'
                    className={editTool === 'edit-points' ? 'bg-teal-600' : (!selectedSectionCanBeModified && selectedSection ? 'opacity-50' : '')}
                    disabled={!selectedSection || !selectedSectionCanBeModified}
                    title={!selectedSectionCanBeModified ? 'Khu vực có ghế đã đặt/mua không thể sửa điểm' : 'Sửa điểm khu vực'}
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
                selectedPointIndices={selectedPointIndices}
                onClearSelection={() => setSelectedPointIndices(new Set())}
                onDeleteSelectedPoints={() => {
                  if (!editingPoints || selectedPointIndices.size === 0) return
                  // Filter out selected points, keeping minimum 3 points
                  const newPoints = editingPoints.points.filter((_, i) => !selectedPointIndices.has(i))
                  if (newPoints.length >= 3) {
                    setEditingPoints({ ...editingPoints, points: newPoints })
                    setSelectedPointIndices(new Set())
                  }
                }}
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

            {/* Edit Selected Section Config */}
            {selectedSection && (
              <div className='space-y-3 pt-4 border-t border-purple-500/30'>
                <h3 className='text-sm font-semibold text-purple-300 flex items-center gap-2'>
                  ⚙️ Cấu Hình Section
                  {!selectedSectionCanBeModified && (
                    <span className='text-xs text-red-400'>🔒 Có ghế đã đặt</span>
                  )}
                </h3>

                {/* Warning for locked sections */}
                {!selectedSectionCanBeModified && (
                  <Alert className='bg-red-600/20 border-red-500/50'>
                    <AlertCircle className='w-4 h-4 text-red-400' />
                    <AlertDescription className='text-xs text-red-200'>
                      Khu vực này có ghế đã được đặt/mua. Không thể thay đổi cấu hình ghế.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Has Seats Toggle */}
                <div className={`flex items-center gap-2 p-2 bg-slate-700/50 rounded ${!selectedSectionCanBeModified ? 'opacity-50' : ''}`}>
                  <Checkbox
                    id='selectedHasSeats'
                    checked={selectedSection.hasSeats === false}
                    disabled={!selectedSectionCanBeModified}
                    onCheckedChange={(checked) => {
                      if (!selectedSectionCanBeModified) return
                      const updatedSections = mapData.sections.map((s) =>
                        s.id === selectedSection.id
                          ? {
                              ...s,
                              hasSeats: !checked,
                              seats: checked ? [] : s.seats // Clear seats if no seats
                            }
                          : s
                      )
                      setMapData({ ...mapData, sections: updatedSections })
                      setSelectedSection({ ...selectedSection, hasSeats: !checked })
                    }}
                    className='border-purple-400 data-[state=checked]:bg-purple-600 disabled:cursor-not-allowed'
                  />
                  <label
                    htmlFor='selectedHasSeats'
                    className={`text-xs cursor-pointer flex-1 ${!selectedSectionCanBeModified ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300'}`}
                  >
                    Section không có ghế (Standing zone)
                  </label>
                </div>

                {/* Rows and Seats Per Row Config for Selected Section */}
                {selectedSection.hasSeats !== false && (
                  <div className={!selectedSectionCanBeModified ? 'opacity-50' : ''}>
                    <div className='flex gap-2 mb-2'>
                      <div className='flex-1'>
                        <label className='text-xs text-gray-400 block mb-1'>Số Hàng</label>
                        <input
                          type='number'
                          value={selectedSection.rows}
                          disabled={!selectedSectionCanBeModified}
                          onChange={(e) => {
                            if (!selectedSectionCanBeModified) return
                            const rows = parseInt(e.target.value) || 2
                            const updatedSections = mapData.sections.map((s) =>
                              s.id === selectedSection.id ? { ...s, rows } : s
                            )
                            setMapData({ ...mapData, sections: updatedSections })
                            setSelectedSection({ ...selectedSection, rows })
                          }}
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm disabled:cursor-not-allowed disabled:opacity-60'
                          min='1'
                          max='30'
                        />
                      </div>
                      <div className='flex-1'>
                        <label className='text-xs text-gray-400 block mb-1'>Ghế Mỗi Hàng</label>
                        <input
                          type='number'
                          value={selectedSection.seatsPerRow}
                          disabled={!selectedSectionCanBeModified}
                          onChange={(e) => {
                            if (!selectedSectionCanBeModified) return
                            const seatsPerRow = parseInt(e.target.value) || 3
                            const updatedSections = mapData.sections.map((s) =>
                              s.id === selectedSection.id ? { ...s, seatsPerRow } : s
                            )
                            setMapData({ ...mapData, sections: updatedSections })
                            setSelectedSection({ ...selectedSection, seatsPerRow })
                          }}
                          className='w-full px-2 py-1 bg-slate-700 rounded text-sm disabled:cursor-not-allowed disabled:opacity-60'
                          min='1'
                          max='30'
                        />
                      </div>
                    </div>
                    <p className='text-xs text-gray-500 mb-2'>
                      Tổng: {selectedSection.rows * selectedSection.seatsPerRow} ghế
                    </p>

                    {/* Custom Seat Count */}
                    <label className='text-xs text-gray-400 block mb-1'>Số ghế tùy chỉnh (Tùy chọn)</label>
                    <input
                      type='number'
                      value={selectedSection.customSeatCount || ''}
                      disabled={!selectedSectionCanBeModified}
                      onChange={(e) => {
                        if (!selectedSectionCanBeModified) return
                        const customCount = e.target.value ? parseInt(e.target.value) : undefined
                        const updatedSections = mapData.sections.map((s) =>
                          s.id === selectedSection.id
                            ? {
                                ...s,
                                customSeatCount: customCount
                              }
                            : s
                        )
                        setMapData({ ...mapData, sections: updatedSections })
                        setSelectedSection({ ...selectedSection, customSeatCount: customCount })
                      }}
                      placeholder={`Mặc định: ${selectedSection.rows} × ${selectedSection.seatsPerRow} ghế`}
                      className='w-full px-2 py-1 bg-slate-700 rounded text-sm disabled:cursor-not-allowed disabled:opacity-60'
                      min='1'
                    />
                    {selectedSection.customSeatCount && (
                      <p className='text-xs text-blue-300 mt-1'>
                        ✓ Section này có {selectedSection.customSeatCount} ghế (thay vì {selectedSection.rows * selectedSection.seatsPerRow})
                      </p>
                    )}
                    <Button
                      size='sm'
                      className='w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      disabled={!selectedSectionCanBeModified}
                      onClick={() => {
                        if (!selectedSectionCanBeModified) return
                        const updatedSections = mapData.sections.map((s) => {
                          if (s.id === selectedSection.id) {
                            const newSeats = generateSeatsForSection(s, seatStatuses)
                            return { ...s, seats: newSeats }
                          }
                          return s
                        })
                        setMapData({ ...mapData, sections: updatedSections })
                        const updated = updatedSections.find((s) => s.id === selectedSection.id)
                        if (updated) setSelectedSection(updated)
                      }}
                    >
                      🔄 Tạo lại ghế
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Ticket Assignment for Selected Section */}
            {selectedSection && selectedSection.hasSeats !== false && (
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

                {/* Section không có ghế */}
                <div className='flex items-center gap-2 p-2 bg-slate-700/50 rounded'>
                  <Checkbox
                    id='hasSeats'
                    checked={!sectionConfig.hasSeats}
                    onCheckedChange={(checked) =>
                      setSectionConfig({
                        ...sectionConfig,
                        hasSeats: !checked,
                        customSeatCount: checked ? undefined : sectionConfig.customSeatCount
                      })
                    }
                    className='border-purple-400 data-[state=checked]:bg-purple-600'
                  />
                  <label htmlFor='hasSeats' className='text-xs text-gray-300 cursor-pointer flex-1'>
                    Section không có ghế (Standing zone)
                  </label>
                </div>

                {/* Custom seat count */}
                {sectionConfig.hasSeats && (
                  <div>
                    <label className='text-xs text-gray-400 block mb-1'>
                      Số ghế tùy chỉnh (Tùy chọn - Thay vì Rows × Ghế/Hàng)
                    </label>
                    <input
                      type='number'
                      value={sectionConfig.customSeatCount || ''}
                      onChange={(e) =>
                        setSectionConfig({
                          ...sectionConfig,
                          customSeatCount: e.target.value ? parseInt(e.target.value) : undefined
                        })
                      }
                      placeholder='Để trống để dùng Rows × Ghế/Hàng'
                      className='w-full px-2 py-1 bg-slate-700 rounded text-sm'
                      min='1'
                    />
                    {sectionConfig.customSeatCount && (
                      <p className='text-xs text-blue-300 mt-1'>
                        ✓ Sẽ tạo {sectionConfig.customSeatCount} ghế cho section này
                      </p>
                    )}
                  </div>
                )}

                {/* Warning về ticket assignment */}
                <Alert className='bg-amber-600/20 border-amber-600/50'>
                  <AlertCircle className='w-4 h-4 text-amber-400' />
                  <AlertDescription className='text-xs text-amber-200'>
                    <strong>⚠️ Lưu ý quan trọng:</strong>
                    <br />
                    Bạn cần chọn vé cho tất cả ghế sau khi tạo. Ghế chưa có vé sẽ hiển thị màu cam (Ghế đang được
                    chủ sự kiện xử lí) và khách hàng không thể đặt.
                  </AlertDescription>
                </Alert>
                <div>
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
              </div>
            )}

            {isDrawing && (
              <Alert className='bg-green-600/20 border-green-600/50'>
                <AlertDescription className='text-xs text-black'>
                  Nhấp để thêm điểm. Nhấp gần điểm đầu tiên để đóng hình.
                </AlertDescription>
              </Alert>
            )}

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
      </CardContent>
    </Card>
  )
}
