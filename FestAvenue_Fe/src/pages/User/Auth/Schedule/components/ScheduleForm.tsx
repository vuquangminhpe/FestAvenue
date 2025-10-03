import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Textarea } from '../../../../../components/ui/textarea'
import type { Schedule, ScheduleFormData } from '../../../../../types/schedule.types'
import { scheduleService } from '../../../../../services/schedule.service'
import ColorPicker from './ColorPicker'
import SubTaskForm from './SubTaskForm'

interface ScheduleFormProps {
  schedule?: Schedule | null
  prefilledDateRange?: { start: Date; end: Date } | null
  onClose: () => void
  onSuccess: () => void
}

export default function ScheduleForm({ schedule, prefilledDateRange, onClose, onSuccess }: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    color: '#3b82f6',
    subTasks: []
  })

  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title,
        description: schedule.description || '',
        startDate: schedule.startDate.slice(0, 16),
        endDate: schedule.endDate.slice(0, 16),
        color: schedule.color,
        subTasks: schedule.subTasks.map((st) => ({
          title: st.title,
          description: st.description,
          isCompleted: st.isCompleted,
          assigneeId: st.assigneeId,
          assigneeName: st.assigneeName
        }))
      })
    } else if (prefilledDateRange) {
      // Set default times: 8:00 AM for start, 6:00 PM for end
      const startDateTime = new Date(prefilledDateRange.start)
      startDateTime.setHours(8, 0, 0, 0)

      const endDateTime = new Date(prefilledDateRange.end)
      endDateTime.setHours(18, 0, 0, 0)

      setFormData((prev) => ({
        ...prev,
        startDate: startDateTime.toISOString().slice(0, 16),
        endDate: endDateTime.toISOString().slice(0, 16)
      }))
    }
  }, [schedule, prefilledDateRange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (schedule) {
        await scheduleService.updateSchedule(schedule.id, formData)
      } else {
        await scheduleService.createSchedule(formData)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save schedule:', error)
      alert('Có lỗi xảy ra khi lưu lịch trình')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-900'>{schedule ? 'Cập nhật lịch trình' : 'Tạo lịch trình mới'}</h2>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='w-5 h-5' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Title */}
          <div className='space-y-2'>
            <Label htmlFor='title'>
              Tiêu đề <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder='Nhập tiêu đề lịch trình'
              required
            />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder='Nhập mô tả chi tiết'
              rows={3}
            />
          </div>

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='startDate'>
                Ngày bắt đầu <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='startDate'
                type='datetime-local'
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endDate'>
                Ngày kết thúc <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='endDate'
                type='datetime-local'
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Color Picker */}
          <ColorPicker color={formData.color} onChange={(color) => setFormData({ ...formData, color })} />

          {/* SubTasks */}
          <div className='space-y-2'>
            <Label>Subtasks (Ghi chú)</Label>
            <SubTaskForm
              subTasks={formData.subTasks}
              onChange={(subTasks) => setFormData({ ...formData, subTasks })}
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button type='button' variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : schedule ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
