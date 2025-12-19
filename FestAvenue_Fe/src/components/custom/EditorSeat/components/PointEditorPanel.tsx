import { useEffect, useMemo, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import PointTransformControls from './PointTransformControls'
import type { Point, PointConstraint, Section, SemiCircleOrientation } from '@/types/seat.types'
import {
  createArcTransform,
  createCircleTransform,
  createEllipseTransform,
  createSemiCircleTransform
} from '../utils/shapeTransforms'

interface PointEditorPanelProps {
  editingPoints: { sectionId: string; points: Point[] } | null
  selectedSection: Section | null
  onUpdatePoints: (points: Point[]) => void
  onApplyChanges: () => void
  onCancel: () => void
  onConstraintChange: (constraint: PointConstraint | null) => void
  selectedPointIndices?: Set<number>
  onClearSelection?: () => void
  onDeleteSelectedPoints?: () => void
}

const MIN_POINT_COUNT = 6

export default function PointEditorPanel({
  editingPoints,
  selectedSection,
  onUpdatePoints,
  onApplyChanges,
  onCancel,
  onConstraintChange,
  selectedPointIndices,
  onClearSelection,
  onDeleteSelectedPoints
}: PointEditorPanelProps) {
  const [pointCount, setPointCount] = useState<number>(editingPoints?.points.length ?? MIN_POINT_COUNT)
  const [semiOrientation, setSemiOrientation] = useState<SemiCircleOrientation>('top')
  const [ellipseRatio, setEllipseRatio] = useState<number>(1)
  const [arcSweep, setArcSweep] = useState<number>(180)
  const [arcRotation, setArcRotation] = useState<number>(0)

  useEffect(() => {
    if (!editingPoints) return
    setPointCount(Math.max(editingPoints.points.length, MIN_POINT_COUNT))
  }, [editingPoints])

  const pointSummary = useMemo(() => {
    if (!editingPoints) return 'Chưa có đa giác được chọn.'
    return `Hiện có ${editingPoints.points.length} điểm. Có thể điều chỉnh để phù hợp các hình khối cong.`
  }, [editingPoints])

  if (!editingPoints || editingPoints.points.length === 0) {
    return null
  }

  const applyTransform = (factory: () => { points: Point[]; constraint: PointConstraint }) => {
    const { points, constraint } = factory()
    onUpdatePoints(points)
    onConstraintChange(constraint)
    setPointCount(points.length)
  }

  const handleCircle = () => {
    applyTransform(() => createCircleTransform(editingPoints.points, pointCount))
  }

  const handleEllipse = () => {
    applyTransform(() => createEllipseTransform(editingPoints.points, pointCount, ellipseRatio))
  }

  const handleSemiCircle = () => {
    applyTransform(() => createSemiCircleTransform(editingPoints.points, pointCount, semiOrientation))
  }

  const handleArc = () => {
    applyTransform(() => createArcTransform(editingPoints.points, pointCount, arcRotation, arcSweep))
  }

  const clearConstraint = () => onConstraintChange(null)

  const selectedCount = selectedPointIndices?.size || 0
  const canDelete = selectedCount > 0 && editingPoints && editingPoints.points.length - selectedCount >= 3

  return (
    <Alert className='bg-teal-600/20 border-teal-600/50 space-y-3'>
      <AlertDescription className='text-xs text-black space-y-3'>
        <div>
          <strong>Chế Độ Sửa Điểm</strong>
          <p className='mt-1 text-xs text-gray-800'>{pointSummary}</p>
          {selectedSection && (
            <p className='text-xs text-gray-700 mt-1'>
              Đang chỉnh: {selectedSection.displayName || selectedSection.name}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className='bg-white/30 rounded p-2 text-[11px] text-gray-700 space-y-1'>
          <p>• <strong>Ctrl+Click</strong>: Chọn nhiều điểm</p>
          <p>• <strong>Double-click cạnh</strong>: Thêm điểm mới</p>
          <p>• <strong>Kéo điểm</strong>: Di chuyển điểm</p>
          <p>• <strong>Shift+Kéo</strong>: Giữ thẳng hàng</p>
        </div>

        {/* Multi-select actions */}
        {selectedCount > 0 && (
          <div className='bg-red-100 border border-red-300 rounded p-2 space-y-2'>
            <p className='text-xs text-red-700 font-semibold'>
              Đã chọn {selectedCount} điểm
            </p>
            <div className='flex gap-2'>
              {canDelete && onDeleteSelectedPoints && (
                <Button
                  size='sm'
                  variant='destructive'
                  className='flex-1 text-xs'
                  onClick={onDeleteSelectedPoints}
                >
                  🗑️ Xóa điểm
                </Button>
              )}
              {onClearSelection && (
                <Button
                  size='sm'
                  variant='outline'
                  className='flex-1 text-xs'
                  onClick={onClearSelection}
                >
                  Bỏ chọn
                </Button>
              )}
            </div>
            {!canDelete && selectedCount > 0 && (
              <p className='text-[10px] text-red-500'>
                Cần ít nhất 3 điểm để tạo hình
              </p>
            )}
          </div>
        )}

        <PointTransformControls
          pointCount={pointCount}
          onPointCountChange={(value) => setPointCount(Math.round(value))}
          ellipseRatio={ellipseRatio}
          onEllipseRatioChange={(value) => setEllipseRatio(Number(value.toFixed(2)))}
          semiOrientation={semiOrientation}
          onSemiOrientationChange={setSemiOrientation}
          arcSweep={arcSweep}
          onArcSweepChange={(value) => setArcSweep(Math.round(value))}
          arcRotation={arcRotation}
          onArcRotationChange={(value) => setArcRotation(Math.round(value))}
          onCircle={handleCircle}
          onEllipse={handleEllipse}
          onSemiCircle={handleSemiCircle}
          onArc={handleArc}
        />

        <div className='grid grid-cols-2 gap-2 pt-1'>
          <Button size='sm' className='bg-teal-600 hover:bg-teal-700' onClick={onApplyChanges}>
            Áp Dụng
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='border-teal-500 text-teal-700'
            onClick={() => {
              clearConstraint()
              onCancel()
            }}
          >
            Hủy
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='col-span-2 text-[11px] rounded-xl p-1 text-gray-600 hover:text-gray-900 hover:bg-white/40'
            onClick={clearConstraint}
          >
            Thả tự do
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
