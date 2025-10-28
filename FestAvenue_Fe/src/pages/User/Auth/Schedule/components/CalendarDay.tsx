import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { Schedule } from '../../../../../types/schedule.types'
import BellNotification from './BellNotification'
import { format, isSameDay, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronDown, ChevronUp, GripVertical, UserCircle2 } from 'lucide-react'

interface CalendarDayProps {
  date: Date
  schedules: Schedule[]
  isCurrentMonth: boolean
  isInDragRange?: boolean
  isDragTarget?: boolean
  onClick: () => void
  onMouseDown?: () => void
  onMouseEnter?: () => void
  onScheduleDragStart?: (scheduleId: string) => void
  onScheduleDrop?: () => void
  onScheduleClick?: (schedule: Schedule, date: Date) => void
  lifecycleInfo?: { start: Date; end: Date } | null
}

export default function CalendarDay({
  date,
  schedules,
  isCurrentMonth,
  isInDragRange = false,
  isDragTarget = false,
  onClick,
  onMouseDown,
  onMouseEnter,
  onScheduleDragStart,
  onScheduleDrop,
  onScheduleClick,
  lifecycleInfo
}: CalendarDayProps) {
  const dayRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const hasSchedules = schedules.length > 0
  const hasMoreThanTwo = schedules.length > 2
  const isActiveDay = isToday(date)

  // Check if date is within event lifecycle
  const isWithinLifecycle = () => {
    if (!lifecycleInfo) return true // If no lifecycle info, allow drag
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const lifecycleStart = new Date(
      lifecycleInfo.start.getFullYear(),
      lifecycleInfo.start.getMonth(),
      lifecycleInfo.start.getDate()
    )

    const lifecycleEnd = new Date(
      lifecycleInfo.end.getFullYear(),
      lifecycleInfo.end.getMonth(),
      lifecycleInfo.end.getDate()
    )
    return dayStart >= lifecycleStart && dayStart <= lifecycleEnd
  }

  const canDragToThisDay = isWithinLifecycle()

  // Determine notification status for this day
  const getNotificationStatus = (): 'upcoming' | 'overdue' | 'none' => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    for (const schedule of schedules) {
      const scheduleStart = new Date(schedule.startDate)
      const scheduleEnd = new Date(schedule.endDate)

      // Check if this schedule is on this date
      if (isSameDay(scheduleStart, date) || isSameDay(scheduleEnd, date)) {
        // Check if all tasks are completed (100%)
        const totalTasks = schedule.subTasks.length
        const completedTasks = schedule.subTasks.filter((st) => st.isCompleted).length
        const isFullyCompleted = totalTasks > 0 && completedTasks === totalTasks

        // If 100% completed, don't show notification
        if (isFullyCompleted) {
          continue
        }

        // Overdue: end date has passed
        if (scheduleEnd < now) {
          return 'overdue'
        }
        // Upcoming: starts within 24 hours or is today
        const hoursUntilStart = (scheduleStart.getTime() - now.getTime()) / (1000 * 60 * 60)
        if (hoursUntilStart <= 24 && hoursUntilStart >= 0) {
          return 'upcoming'
        }
        // Also show upcoming if it's today and hasn't ended
        if (isSameDay(scheduleStart, today) && scheduleEnd >= now) {
          return 'upcoming'
        }
      }
    }
    return 'none'
  }

  const notificationStatus = getNotificationStatus()
  const displayedSchedules = isExpanded ? schedules : schedules.slice(0, 2)

  useEffect(() => {
    if (!dayRef.current || !hasSchedules) return

    const handleMouseEnter = () => {
      gsap.to(dayRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(dayRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.in'
      })
    }

    const element = dayRef.current
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hasSchedules])

  const getScheduleColors = () => {
    return schedules.slice(0, 3).map((s) => s.color)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    // Visual feedback will be handled by CSS based on canDragToThisDay
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // Only allow drop if date is within lifecycle
    if (canDragToThisDay) {
      onScheduleDrop?.()
    }
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  // Wrap click handlers to prevent interaction with disabled days
  const handleClick = () => {
    if (!canDragToThisDay) return // Ignore clicks on disabled days
    onClick()
  }

  const handleMouseDownWrapper = () => {
    if (!canDragToThisDay) return // Ignore mouse down on disabled days
    onMouseDown?.()
  }

  return (
    <div
      ref={dayRef}
      onClick={handleClick}
      onMouseDown={handleMouseDownWrapper}
      onMouseEnter={onMouseEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative p-3 pb-6 border border-gray-200
        transition-all duration-200
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${isActiveDay ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isInDragRange ? 'bg-blue-100 ring-2 ring-blue-400' : ''}
        ${isDragTarget && canDragToThisDay ? 'ring-2 ring-green-400' : ''}
        ${isDragTarget && !canDragToThisDay ? 'ring-2 ring-red-400 bg-red-50' : ''}
        ${isExpanded ? 'min-h-[140px]' : 'min-h-[100px]'}
        ${!canDragToThisDay ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
      `}
    >
      {/* Outside lifecycle indicator */}
      {!canDragToThisDay && (
        <div className='absolute inset-0  bg-gray-900/5 backdrop-blur-[4px] flex items-center justify-center pointer-events-none z-10'></div>
      )}

      {/* Date number */}
      <div className='flex items-start justify-between mb-1'>
        <span
          className={`
          text-sm font-medium
          ${isActiveDay ? 'text-blue-600 font-bold' : ''}
          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
          ${!canDragToThisDay ? 'opacity-40' : ''}
        `}
        >
          {format(date, 'd', { locale: vi })}
        </span>

        {/* Bell notification */}
        {notificationStatus !== 'none' && (
          <div className='absolute top-1 right-1'>
            <BellNotification status={notificationStatus} size={18} />
          </div>
        )}
      </div>

      {/* Schedule indicators */}
      {hasSchedules && (
        <div className='space-y-1.5'>
          {displayedSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className='group flex items-center gap-1 text-xs rounded transition-all hover:shadow-sm'
              style={{ backgroundColor: schedule.color }}
            >
              {/* Drag handle */}
              <div
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  onScheduleDragStart?.(schedule.id)
                }}
                onDragEnd={(e) => {
                  e.stopPropagation()
                }}
                className='flex-shrink-0 px-0.5 cursor-move opacity-70 hover:opacity-100 transition-opacity'
                title='Kéo để di chuyển'
              >
                <GripVertical className='w-3 h-3 text-white' />
              </div>

              {/* Schedule title - clickable */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onScheduleClick?.(schedule, date)
                }}
                className='flex-1 truncate px-2 py-1 text-white font-medium cursor-pointer hover:brightness-110 transition-all flex items-center gap-1'
                title={`${schedule.title}${
                  schedule.subTasks.some((st) => st.assigneeId) ? ' - Có công việc được phân công' : ''
                }`}
              >
                <span className='truncate'>{schedule.title}</span>
                {/* Show user icon if subtasks have assignees */}
                {schedule.subTasks.some((st) => st.assigneeId) && (
                  <UserCircle2 className='w-3 h-3 flex-shrink-0 opacity-90' />
                )}
              </div>
            </div>
          ))}
          {hasMoreThanTwo && (
            <button
              onClick={handleToggleExpand}
              className='w-full text-xs text-gray-600 hover:text-gray-900 font-medium px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1'
            >
              {isExpanded ? (
                <>
                  <ChevronUp className='w-3 h-3' />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className='w-3 h-3' />+{schedules.length - 2} lịch khác
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Color dots for schedules */}
      {hasSchedules && schedules.length > 0 && (
        <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1'>
          {getScheduleColors().map((color, index) => (
            <div key={index} className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: color }} />
          ))}
        </div>
      )}
    </div>
  )
}
