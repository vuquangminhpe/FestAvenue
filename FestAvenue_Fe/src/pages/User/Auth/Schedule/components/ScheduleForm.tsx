import { useState, useEffect } from 'react'
import { X, AlertCircle, Calendar } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Textarea } from '../../../../../components/ui/textarea'
import { Alert, AlertDescription } from '../../../../../components/ui/alert'
import type { Schedule, ScheduleFormData } from '../../../../../types/schedule.types'
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/useSchedule'
import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'
import ColorPicker from './ColorPicker'
import SubTaskForm from './SubTaskForm'
import { DateTimePicker } from '../../../../../components/ui/DateTimePicker'
import {
  validateScheduleTitle,
  validateScheduleDescription,
  sanitizeTitle,
  sanitizeDescription
} from '@/utils/scheduleValidation'
import { formatDateToLocalISOShort } from '@/utils/utils'

interface ScheduleFormProps {
  eventCode: string
  eventId?: string
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

  // Fetch event data to get lifecycle times
  const { data: eventData, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', eventCode],
    queryFn: () => eventApis.getEventByEventCode(eventCode as string),
    enabled: !!eventCode
  })

  const event = eventData?.data

  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate title with strict rules
    const titleValidation = validateScheduleTitle(formData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!
    }

    // Validate description
    const descValidation = validateScheduleDescription(formData.description)
    if (!descValidation.isValid) {
      newErrors.description = descValidation.error!
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

      // Check if dates are in the past
      const now = new Date()
      if (end < now) {
        newErrors.endDate = 'Ngày kết thúc không thể trong quá khứ'
      }

      // Validate against event lifecycle if available
      if (event) {
        const lifecycleStart = event.startEventLifecycleTime
        const lifecycleEnd = event.endEventLifecycleTime

        if (lifecycleStart && lifecycleEnd) {
          const eventStart = new Date(lifecycleStart)
          const eventEnd = new Date(lifecycleEnd)

          if (start < eventStart) {
            newErrors.startDate = `Lịch trình không được bắt đầu trước vòng đời sự kiện (${new Date(
              lifecycleStart
            ).toLocaleDateString('vi-VN')})`
          }

          if (end > eventEnd) {
            newErrors.endDate = `Lịch trình không được kết thúc sau vòng đời sự kiện (${new Date(
              lifecycleEnd
            ).toLocaleDateString('vi-VN')})`
          }
        }
      }

      // Check duration is reasonable (not too long)
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      if (durationDays > 30) {
        newErrors.endDate = 'Lịch trình không được kéo dài quá 30 ngày'
      }
    }

    // Validate subtasks
    formData.subTasks.forEach((subTask, index) => {
      if (subTask.title && subTask.title.trim().length > 0) {
        const subTitleValidation = validateScheduleTitle(subTask.title)
        if (!subTitleValidation.isValid) {
          newErrors[`subTask_${index}_title`] = subTitleValidation.error!
        }
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
      console.log('❌ Validation failed with errors:', errors)
      // Scroll to first error
      const firstError = Object.keys(errors)[0]
      const element = document.getElementById(firstError)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Sanitize data before submit
    const sanitizedData: ScheduleFormData = {
      ...formData,
      title: sanitizeTitle(formData.title),
      description: sanitizeDescription(formData.description),
      // Filter out empty subtasks (no title and no meaningful data)
      subTasks: formData.subTasks
        .filter((st) => st.title.trim().length > 0) // Only keep subtasks with title
        .map((st) => ({
          ...st,
          title: sanitizeTitle(st.title),
          description: sanitizeDescription(st.description)
        }))
    }

    try {
      if (schedule) {
        await updateMutation.mutateAsync({
          scheduleId: schedule.id,
          eventCode,
          data: sanitizedData
        })
      } else {
        await createMutation.mutateAsync({
          eventCode,
          data: sanitizedData
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save schedule:', error)
      alert('Có lỗi xảy ra khi lưu lịch trình')
    }
  }

  // Get lifecycle info for display
  const getLifecycleInfo = () => {
    if (!event) return null

    const lifecycleStart = event.startEventLifecycleTime
    const lifecycleEnd = event.endEventLifecycleTime

    if (!lifecycleStart || !lifecycleEnd) return null

    return {
      start: new Date(lifecycleStart),
      end: new Date(lifecycleEnd)
    }
  }

  const lifecycleInfo = getLifecycleInfo()

  // Calculate word count for title
  const titleTrimmed = formData.title.trim()
  const wordCount = titleTrimmed ? titleTrimmed.split(/\s+/).filter((w) => w.length > 0).length : 0

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
          {/* Event Lifecycle Info */}
          {lifecycleInfo && (
            <Alert className='bg-blue-50 border-blue-200'>
              <AlertCircle className='w-4 h-4 text-blue-600' />
              <AlertDescription className='text-sm text-blue-800'>
                <strong>Vòng đời sự kiện:</strong>{' '}
                {lifecycleInfo.start.toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}{' '}
                -{' '}
                {lifecycleInfo.end.toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                <br />
                <span className='text-xs'>Lịch trình phải nằm trong khoảng thời gian này</span>
              </AlertDescription>
            </Alert>
          )}

          {isLoadingEvent && (
            <Alert>
              <AlertDescription className='text-sm'>Đang tải thông tin sự kiện...</AlertDescription>
            </Alert>
          )}

          {/* Title with validation hints */}
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
              placeholder='Ví dụ: "Họp ban tổ chức", "Chuẩn bị sân khấu"'
              className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
              required
            />
            {errors.title && (
              <Alert className='bg-red-50 border-red-200'>
                <AlertCircle className='w-4 h-4 text-red-600' />
                <AlertDescription className='text-sm text-red-800'>{errors.title}</AlertDescription>
              </Alert>
            )}
            <p className='text-xs text-gray-500'>
              {formData.title.length}/200 ký tự
              {wordCount > 0 && <span className='ml-2'>• {wordCount} từ</span>}
            </p>
            <p className='text-xs text-gray-400'>
              💡 Tiêu đề phải: bắt đầu bằng chữ cái, có ít nhất 2 từ, không lặp ký tự
            </p>
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
              placeholder='Nhập mô tả chi tiết có ý nghĩa (không bắt buộc, tối đa 1000 ký tự)'
              rows={3}
              className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
            />
            {errors.description && (
              <Alert className='bg-red-50 border-red-200'>
                <AlertCircle className='w-4 h-4 text-red-600' />
                <AlertDescription className='text-sm text-red-800'>{errors.description}</AlertDescription>
              </Alert>
            )}
            <p className='text-xs text-gray-500'>{formData.description?.length || 0}/1000 ký tự</p>
          </div>

          {/* Date Range */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='startDate' className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <div className='p-1.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm'>
                  <Calendar className='w-4 h-4 text-white' />
                </div>
                Ngày bắt đầu <span className='text-red-500'>*</span>
              </Label>
              <DateTimePicker
                value={formData.startDate ? new Date(formData.startDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    setFormData({ ...formData, startDate: formatDateToLocalISOShort(date) })
                    if (errors.startDate) setErrors({ ...errors, startDate: '' })
                  }
                }}
                minDate={lifecycleInfo?.start}
                maxDate={lifecycleInfo?.end}
                error={!!errors.startDate}
                variant='start'
                placeholder='Chọn ngày bắt đầu'
              />
              {errors.startDate && (
                <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endDate' className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <div className='p-1.5 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm'>
                  <Calendar className='w-4 h-4 text-white' />
                </div>
                Ngày kết thúc <span className='text-red-500'>*</span>
              </Label>
              <DateTimePicker
                value={formData.endDate ? new Date(formData.endDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    setFormData({ ...formData, endDate: formatDateToLocalISOShort(date) })
                    if (errors.endDate) setErrors({ ...errors, endDate: '' })
                  }
                }}
                minDate={formData.startDate ? new Date(formData.startDate) : lifecycleInfo?.start}
                maxDate={lifecycleInfo?.end}
                error={!!errors.endDate}
                variant='end'
                placeholder='Chọn ngày kết thúc'
              />
              {errors.endDate && (
                <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.endDate}
                </p>
              )}
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
              errors={errors}
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button type='button' variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button type='submit'>{isSubmitting ? 'Đang lưu...' : schedule ? 'Cập nhật' : 'Tạo mới'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
