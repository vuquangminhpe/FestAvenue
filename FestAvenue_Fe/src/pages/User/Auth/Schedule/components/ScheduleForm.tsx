import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Textarea } from '../../../../../components/ui/textarea'
import { Checkbox } from '../../../../../components/ui/checkbox'
import type { Schedule, ScheduleFormData, SubTask } from '../../../../../types/schedule.types'
import { scheduleService } from '../../../../../services/schedule.service'
import ColorPicker from './ColorPicker'

interface ScheduleFormProps {
  schedule?: Schedule | null
  onClose: () => void
  onSuccess: () => void
}

export default function ScheduleForm({ schedule, onClose, onSuccess }: ScheduleFormProps) {
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
          isCompleted: st.isCompleted
        }))
      })
    }
  }, [schedule])

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

  const addSubTask = () => {
    setFormData({
      ...formData,
      subTasks: [
        ...formData.subTasks,
        {
          title: '',
          description: '',
          isCompleted: false
        }
      ]
    })
  }

  const updateSubTask = (
    index: number,
    field: keyof Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>,
    value: string | boolean
  ) => {
    const newSubTasks = [...formData.subTasks]
    newSubTasks[index] = {
      ...newSubTasks[index],
      [field]: value
    }
    setFormData({ ...formData, subTasks: newSubTasks })
  }

  const removeSubTask = (index: number) => {
    setFormData({
      ...formData,
      subTasks: formData.subTasks.filter((_, i) => i !== index)
    })
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
          <ColorPicker
            color={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
          />

          {/* SubTasks */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Subtasks (Ghi chú)</Label>
              <Button type='button' variant='outline' size='sm' onClick={addSubTask}>
                <Plus className='w-4 h-4 mr-2' />
                Thêm subtask
              </Button>
            </div>

            <div className='space-y-3'>
              {formData.subTasks.map((subTask, index) => (
                <div key={index} className='border border-gray-200 rounded-lg p-4 space-y-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 space-y-2'>
                      <Input
                        value={subTask.title}
                        onChange={(e) => updateSubTask(index, 'title', e.target.value)}
                        placeholder='Tiêu đề subtask'
                        required
                      />
                      <Textarea
                        value={subTask.description || ''}
                        onChange={(e) => updateSubTask(index, 'description', e.target.value)}
                        placeholder='Mô tả (tùy chọn)'
                        rows={2}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeSubTask(index)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id={`completed-${index}`}
                      checked={subTask.isCompleted}
                      onCheckedChange={(checked) => updateSubTask(index, 'isCompleted', checked as boolean)}
                    />
                    <Label htmlFor={`completed-${index}`} className='text-sm cursor-pointer'>
                      Đã hoàn thành
                    </Label>
                  </div>
                </div>
              ))}
            </div>
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
