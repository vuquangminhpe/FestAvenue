import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Textarea } from '../../../../../components/ui/textarea'
import type { Schedule, ScheduleFormData } from '../../../../../types/schedule.types'
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/useSchedule'
import ColorPicker from './ColorPicker'
import SubTaskForm from './SubTaskForm'

interface ScheduleFormProps {
  eventCode: string
  schedule?: Schedule | null
  prefilledDateRange?: { start: Date; end: Date } | null
  onClose: () => void
  onSuccess: () => void
}

export default function ScheduleForm({
  eventCode,
  schedule,
  prefilledDateRange,
  onClose,
  onSuccess
}: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    color: '#3b82f6',
    subTasks: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Tiêu đề không được vượt quá 200 ký tự'
    }

    // Validate description
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự'
    }

    // Validate dates
    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu không được để trống'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc không được để trống'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (start >= end) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
      }

      // Check if dates are too far in the past (optional warning)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      if (end < now) {
        newErrors.endDate = 'Ngày kết thúc không thể trong quá khứ'
      }
    }

    // Validate subtasks
    formData.subTasks.forEach((subTask, index) => {
      if (subTask.title && subTask.title.length < 2) {
        newErrors[`subTask_${index}_title`] = 'Tiêu đề subtask phải có ít nhất 2 ký tự'
      }

      if (subTask.startDate && subTask.endDate) {
        const subStart = new Date(subTask.startDate)
        const subEnd = new Date(subTask.endDate)
        const parentStart = new Date(formData.startDate)
        const parentEnd = new Date(formData.endDate)

        if (subStart < parentStart) {
          newErrors[`subTask_${index}_date`] = 'Subtask không được bắt đầu trước lịch trình chính'
        }

        if (subEnd > parentEnd) {
          newErrors[`subTask_${index}_date`] = 'Subtask không được kết thúc sau lịch trình chính'
        }

        if (subStart >= subEnd) {
          newErrors[`subTask_${index}_date`] = 'Ngày kết thúc subtask phải sau ngày bắt đầu'
        }
      }

      // Validate time slots
      if (subTask.dailyTimeSlots && subTask.dailyTimeSlots.length > 0) {
        subTask.dailyTimeSlots.forEach((slot) => {
          if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
            newErrors[`subTask_${index}_timeSlot`] = 'Giờ kết thúc phải sau giờ bắt đầu'
          }
        })
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
          assigneeName: st.assigneeName,
          startDate: st.startDate,
          endDate: st.endDate,
          dailyTimeSlots: st.dailyTimeSlots
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

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0]
      const element = document.getElementById(firstError)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    try {
      if (schedule) {
        await updateMutation.mutateAsync({
          scheduleId: schedule.id,
          eventCode,
          data: formData
        })
      } else {
        await createMutation.mutateAsync({
          eventCode,
          data: formData
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save schedule:', error)
      alert('Có lỗi xảy ra khi lưu lịch trình')
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
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value })
                if (errors.title) setErrors({ ...errors, title: '' })
              }}
              placeholder='Nhập tiêu đề lịch trình (3-200 ký tự)'
              className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
              required
            />
            {errors.title && <p className='text-sm text-red-600'>{errors.title}</p>}
            <p className='text-xs text-gray-500'>{formData.title.length}/200 ký tự</p>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: '' })
              }}
              placeholder='Nhập mô tả chi tiết (tối đa 1000 ký tự)'
              rows={3}
              className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.description && <p className='text-sm text-red-600'>{errors.description}</p>}
            <p className='text-xs text-gray-500'>{formData.description?.length || 0}/1000 ký tự</p>
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
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value })
                  if (errors.startDate) setErrors({ ...errors, startDate: '' })
                }}
                className={errors.startDate ? 'border-red-500 focus:ring-red-500' : ''}
                required
              />
              {errors.startDate && <p className='text-sm text-red-600'>{errors.startDate}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endDate'>
                Ngày kết thúc <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='endDate'
                type='datetime-local'
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value })
                  if (errors.endDate) setErrors({ ...errors, endDate: '' })
                }}
                className={errors.endDate ? 'border-red-500 focus:ring-red-500' : ''}
                required
              />
              {errors.endDate && <p className='text-sm text-red-600'>{errors.endDate}</p>}
            </div>
          </div>

          {/* Color Picker */}
          <ColorPicker color={formData.color} onChange={(color) => setFormData({ ...formData, color })} />

          {/* SubTasks */}
          <div className='space-y-2'>
            <Label>Subtasks (Ghi chú)</Label>
            <SubTaskForm
              eventCode={eventCode}
              subTasks={formData.subTasks}
              onChange={(subTasks) => setFormData({ ...formData, subTasks })}
              parentScheduleStart={
                formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString()
              }
              parentScheduleEnd={formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString()}
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
