import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { Schedule } from '../../../../../types/schedule.types'
import BellNotification from './BellNotification'
import { format, isSameDay, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'

interface CalendarDayProps {
  date: Date
  schedules: Schedule[]
  isCurrentMonth: boolean
  onClick: () => void
}

export default function CalendarDay({ date, schedules, isCurrentMonth, onClick }: CalendarDayProps) {
  const dayRef = useRef<HTMLDivElement>(null)
  const hasSchedules = schedules.length > 0
  const isActiveDay = isToday(date)
  const hasNotification = schedules.some((s) => {
    const scheduleDate = new Date(s.startDate)
    return isSameDay(scheduleDate, date) && s.isNotified
  })

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

  return (
    <div
      ref={dayRef}
      onClick={onClick}
      className={`
        relative min-h-[80px] p-2 border border-gray-200 cursor-pointer
        transition-colors duration-200 hover:bg-gray-50
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
        ${isActiveDay ? 'ring-2 ring-blue-500 ring-inset' : ''}
      `}
    >
      {/* Date number */}
      <div className='flex items-start justify-between mb-1'>
        <span
          className={`
          text-sm font-medium
          ${isActiveDay ? 'text-blue-600 font-bold' : ''}
          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
        `}
        >
          {format(date, 'd', { locale: vi })}
        </span>

        {/* Bell notification */}
        {hasNotification && (
          <div className='absolute top-1 right-1'>
            <BellNotification isActive={true} size={18} />
          </div>
        )}
      </div>

      {/* Schedule indicators */}
      {hasSchedules && (
        <div className='space-y-1'>
          {schedules.slice(0, 2).map((schedule) => (
            <div
              key={schedule.id}
              className='text-xs truncate px-1.5 py-0.5 rounded text-white font-medium'
              style={{ backgroundColor: schedule.color }}
              title={schedule.title}
            >
              {schedule.title}
            </div>
          ))}
          {schedules.length > 2 && (
            <div className='text-xs text-gray-500 font-medium px-1.5'>+{schedules.length - 2} lịch khác</div>
          )}
        </div>
      )}

      {/* Color dots for schedules */}
      {hasSchedules && schedules.length > 0 && (
        <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1'>
          {getScheduleColors().map((color, index) => (
            <div key={index} className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: color }} />
          ))}
        </div>
      )}
    </div>
  )
}
