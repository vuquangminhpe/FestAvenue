import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SemiCircleOrientation } from '@/types/seat.types'

interface PointTransformControlsProps {
  pointCount: number
  onPointCountChange: (value: number) => void
  ellipseRatio: number
  onEllipseRatioChange: (value: number) => void
  semiOrientation: SemiCircleOrientation
  onSemiOrientationChange: (orientation: SemiCircleOrientation) => void
  arcSweep: number
  onArcSweepChange: (value: number) => void
  arcRotation: number
  onArcRotationChange: (value: number) => void
  onCircle: () => void
  onEllipse: () => void
  onSemiCircle: () => void
  onArc: () => void
}

export default function PointTransformControls({
  pointCount,
  onPointCountChange,
  ellipseRatio,
  onEllipseRatioChange,
  semiOrientation,
  onSemiOrientationChange,
  arcSweep,
  onArcSweepChange,
  arcRotation,
  onArcRotationChange,
  onCircle,
  onEllipse,
  onSemiCircle,
  onArc
}: PointTransformControlsProps) {
  return (
    <div className='grid grid-cols-1 gap-3'>
      <div className='bg-white/40 rounded-lg p-3 space-y-2'>
        <Label className='text-xs text-gray-700'>Số điểm trên hình</Label>
        <Input
          type='number'
          min={3}
          max={128}
          value={pointCount}
          onChange={(event) => onPointCountChange(Math.min(128, Math.max(3, Number(event.target.value))))}
          className='bg-white/60 h-8 text-xs'
        />
        <p className='text-[11px] text-gray-600'>Tăng số điểm để hình cong mượt hơn.</p>
      </div>

      <div className='bg-white/40 rounded-lg p-3 space-y-2'>
        <Label className='text-xs text-gray-700'>Bo tròn / hình tròn</Label>
        <Button size='sm' className='w-full bg-teal-600 hover:bg-teal-700' onClick={onCircle}>
          Biến thành hình tròn
        </Button>
      </div>

      <div className='bg-white/40 rounded-lg p-3 space-y-2'>
        <Label className='text-xs text-gray-700'>Hình elip (oval)</Label>
        <div className='flex items-center gap-2'>
          <Input
            type='number'
            min={0.3}
            step={0.1}
            max={2}
            value={ellipseRatio}
            onChange={(event) => onEllipseRatioChange(Number(event.target.value) || 1)}
            className='bg-white/60 h-8 text-xs'
          />
          <span className='text-[11px] text-gray-600'>Tỉ lệ bán kính dọc</span>
        </div>
        <Button size='sm' variant='outline' className='w-full' onClick={onEllipse}>
          Biến thành hình elip
        </Button>
      </div>

      <div className='bg-white/40 rounded-lg p-3 space-y-2'>
        <Label className='text-xs text-gray-700'>Hình bán nguyệt</Label>
        <Select
          value={semiOrientation}
          onValueChange={(value) => onSemiOrientationChange(value as SemiCircleOrientation)}
        >
          <SelectTrigger className='h-8 bg-white/60 text-xs'>
            <SelectValue placeholder='Chọn hướng' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='top'>Nửa trên</SelectItem>
            <SelectItem value='bottom'>Nửa dưới</SelectItem>
            <SelectItem value='left'>Bên trái</SelectItem>
            <SelectItem value='right'>Bên phải</SelectItem>
          </SelectContent>
        </Select>
        <Button size='sm' variant='outline' className='w-full' onClick={onSemiCircle}>
          Biến thành bán nguyệt
        </Button>
      </div>

      <div className='bg-white/40 rounded-lg p-3 space-y-2'>
        <Label className='text-xs text-gray-700'>Cung tròn tùy chỉnh</Label>
        <div className='grid grid-cols-2 gap-2'>
          <div className='space-y-1'>
            <Label className='text-[11px] text-gray-600'>Góc bắt đầu (°)</Label>
            <Input
              type='number'
              value={arcRotation}
              onChange={(event) => onArcRotationChange(Number(event.target.value) || 0)}
              className='bg-white/60 h-8 text-xs'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-[11px] text-gray-600'>Độ mở (°)</Label>
            <Input
              type='number'
              min={30}
              max={360}
              value={arcSweep}
              onChange={(event) => onArcSweepChange(Math.min(360, Math.max(30, Number(event.target.value))))}
              className='bg-white/60 h-8 text-xs'
            />
          </div>
        </div>
        <Button size='sm' variant='outline' className='w-full' onClick={onArc}>
          Biến thành cung tròn
        </Button>
      </div>
    </div>
  )
}
