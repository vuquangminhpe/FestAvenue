import { useState, useEffect, useRef } from 'react'
import { X, Calendar, Clock, Edit, Trash2, CheckCircle2, Circle, User, Timer } from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import type { Schedule } from '../../../../../types/schedule.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { scheduleService } from '../../../../../services/schedule.service'
import { gsap } from 'gsap'
import BellNotification from './BellNotification'
import { Checkbox } from '../../../../../components/ui/checkbox'

interface ScheduleDetailProps {
  schedule: Schedule
  schedules?: Schedule[]
  currentIndex?: number
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onRefresh: () => void
  onScheduleChange?: (index: number) => void
}

export default function ScheduleDetail({
  schedule,
  schedules,
  currentIndex = 0,
  onClose,
  onEdit,
  onDelete,
  onRefresh,
  onScheduleChange
}: ScheduleDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const hasMultipleSchedules = schedules && schedules.length > 1

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [])

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return

    setIsDeleting(true)
    try {
      await scheduleService.deleteSchedule(schedule.id)
      onDelete()
      onClose()
    } catch (error) {
      console.error('Failed to delete schedule:', error)
      alert('Có lỗi xảy ra khi xóa lịch trình')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleSubTask = async (subTaskId: string, currentStatus: boolean) => {
    try {
      await scheduleService.updateSubTask(schedule.id, subTaskId, {
        isCompleted: !currentStatus
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update subtask:', error)
    }
  }

  const completedCount = schedule.subTasks.filter((st) => st.isCompleted).length
  const totalCount = schedule.subTasks.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Determine notification status
  const getNotificationStatus = (): 'upcoming' | 'overdue' | 'none' => {
    const now = new Date()
    const scheduleEnd = new Date(schedule.endDate)
    const scheduleStart = new Date(schedule.startDate)

    // Check if all tasks are completed (100%)
    const isFullyCompleted = totalCount > 0 && completedCount === totalCount

    // If 100% completed, don't show notification
    if (isFullyCompleted) {
      return 'none'
    }

    // Overdue: end date has passed
    if (scheduleEnd < now) {
      return 'overdue'
    }
    // Upcoming: starts within 24 hours
    const hoursUntilStart = (scheduleStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursUntilStart <= 24 && hoursUntilStart >= 0) {
      return 'upcoming'
    }
    return 'none'
  }

  // Calculate completion time in hours
  const getCompletionTime = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return null
    const created = new Date(createdAt)
    const completed = new Date(completedAt)
    const diffMs = completed.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div ref={modalRef} className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div
          className='sticky top-0 px-6 py-4 border-b border-gray-200 flex items-start justify-between'
          style={{ backgroundColor: schedule.color }}
        >
          <div className='flex-1 pr-4'>
            <div className='flex items-center gap-3 mb-2'>
              <BellNotification status={getNotificationStatus()} size={20} />
              <h2 className='text-xl font-bold text-white'>{schedule.title}</h2>
            </div>
            {schedule.description && <p className='text-white/90 text-sm'>{schedule.description}</p>}
          </div>
          <Button variant='ghost' size='icon' onClick={onClose} className='text-white hover:bg-white/20'>
            <X className='w-5 h-5' />
          </Button>
        </div>

        {/* Dots Navigation */}
        {hasMultipleSchedules && (
          <div className='flex items-center justify-center gap-2 py-3 px-6 border-b border-gray-200'>
            {schedules!.map((_, index) => (
              <button
                key={index}
                onClick={() => onScheduleChange?.(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-6 bg-gradient-to-r from-cyan-400 to-blue-300'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Xem lịch ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Date & Time Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
              <Calendar className='w-5 h-5 text-gray-600 mt-0.5' />
              <div>
                <p className='text-xs text-gray-500 mb-1'>Bắt đầu</p>
                <p className='font-medium text-gray-900'>
                  {format(new Date(schedule.startDate), 'dd MMM yyyy', { locale: vi })}
                </p>
                <p className='text-sm text-gray-600'>{format(new Date(schedule.startDate), 'HH:mm', { locale: vi })}</p>
              </div>
            </div>
            <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
              <Clock className='w-5 h-5 text-gray-600 mt-0.5' />
              <div>
                <p className='text-xs text-gray-500 mb-1'>Kết thúc</p>
                <p className='font-medium text-gray-900'>
                  {format(new Date(schedule.endDate), 'dd MMM yyyy', { locale: vi })}
                </p>
                <p className='text-sm text-gray-600'>{format(new Date(schedule.endDate), 'HH:mm', { locale: vi })}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600 font-medium'>Tiến độ hoàn thành</span>
                <span className='text-gray-900 font-semibold'>
                  {completedCount}/{totalCount} ({Math.round(progressPercentage)}%)
                </span>
              </div>
              <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full transition-all duration-500'
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: schedule.color
                  }}
                />
              </div>
            </div>
          )}

          {/* SubTasks */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-gray-600' />
                Subtasks ({totalCount})
              </h3>
            </div>

            {totalCount === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <Circle className='w-12 h-12 mx-auto mb-2 opacity-50' />
                <p>Chưa có subtask nào</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {schedule.subTasks.map((subTask) => (
                  <div
                    key={subTask.id}
                    className={`border rounded-lg p-4 transition-all ${
                      subTask.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        id={subTask.id}
                        checked={subTask.isCompleted}
                        onCheckedChange={() => handleToggleSubTask(subTask.id, subTask.isCompleted)}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <label
                          htmlFor={subTask.id}
                          className={`font-medium cursor-pointer block ${
                            subTask.isCompleted ? 'text-green-700 line-through' : 'text-gray-900'
                          }`}
                        >
                          {subTask.title}
                        </label>
                        {subTask.description && (
                          <p className={`text-sm mt-1 ${subTask.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                            {subTask.description}
                          </p>
                        )}
                        <div className='flex flex-wrap gap-3 mt-2'>
                          {subTask.assigneeName && (
                            <div className='flex items-center gap-1 text-xs text-blue-600'>
                              <User className='w-3 h-3' />
                              <span>{subTask.assigneeName}</span>
                            </div>
                          )}
                          {subTask.isCompleted && subTask.completedAt && (
                            <div className='flex items-center gap-1 text-xs text-green-600'>
                              <Timer className='w-3 h-3' />
                              <span>Hoàn thành trong: {getCompletionTime(subTask.createdAt, subTask.completedAt)}</span>
                            </div>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-2'>
                          Cập nhật:{' '}
                          {format(new Date(subTask.updatedAt), 'dd/MM/yyyy HH:mm', {
                            locale: vi
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className='pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1'>
            <p>Tạo lúc: {format(new Date(schedule.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
            <p>Cập nhật lúc: {format(new Date(schedule.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button
              variant='outline'
              onClick={handleDelete}
              disabled={isDeleting}
              className='text-red-600 hover:text-red-700 hover:bg-red-50'
            >
              <Trash2 className='w-4 h-4 mr-2' />
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
            <Button onClick={onEdit} style={{ backgroundColor: schedule.color }}>
              <Edit className='w-4 h-4 mr-2' />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
