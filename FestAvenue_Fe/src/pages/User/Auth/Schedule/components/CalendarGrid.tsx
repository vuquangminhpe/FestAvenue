import { useMemo, useState, useCallback } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Schedule } from '../../../../../types/schedule.types'
import CalendarDay from './CalendarDay'

interface CalendarGridProps {
  currentDate: Date
  schedules: Schedule[]
  onDayClick: (date: Date, schedules: Schedule[]) => void
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void
  onScheduleDrop?: (scheduleId: string, newStartDate: Date) => void
  onScheduleClick?: (schedule: Schedule, date: Date) => void
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function CalendarGrid({
  currentDate,
  schedules,
  onDayClick,
  onDateRangeSelect,
  onScheduleDrop,
  onScheduleClick
}: CalendarGridProps) {
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedScheduleId, setDraggedScheduleId] = useState<string | null>(null)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { locale: vi })
    const calendarEnd = endOfWeek(monthEnd, { locale: vi })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  const getSchedulesForDay = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleStart = new Date(schedule.startDate)
      const scheduleEnd = new Date(schedule.endDate)

      return (
        isSameDay(scheduleStart, date) || isSameDay(scheduleEnd, date) || (scheduleStart < date && scheduleEnd > date)
      )
    })
  }

  const handleMouseDown = useCallback(
    (date: Date, hasSchedules: boolean) => {
      // Only allow drag selection on empty days
      if (!hasSchedules && onDateRangeSelect) {
        setDragStartDate(date)
        setDragEndDate(date)
        setIsDragging(true)
      }
    },
    [onDateRangeSelect]
  )

  const handleMouseEnter = useCallback(
    (date: Date) => {
      if (isDragging && dragStartDate) {
        setDragEndDate(date)
      }
    },
    [isDragging, dragStartDate]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStartDate && dragEndDate && onDateRangeSelect) {
      const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate
      const end = dragStartDate < dragEndDate ? dragEndDate : dragStartDate
      onDateRangeSelect(start, end)
    }
    setDragStartDate(null)
    setDragEndDate(null)
    setIsDragging(false)
  }, [isDragging, dragStartDate, dragEndDate, onDateRangeSelect])

  const isDateInRange = useCallback(
    (date: Date) => {
      if (!dragStartDate || !dragEndDate) return false
      const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate
      const end = dragStartDate < dragEndDate ? dragEndDate : dragStartDate
      return date >= start && date <= end
    },
    [dragStartDate, dragEndDate]
  )

  const handleScheduleDragStart = useCallback((scheduleId: string) => {
    setDraggedScheduleId(scheduleId)
  }, [])

  const handleScheduleDrop = useCallback(
    (date: Date) => {
      if (draggedScheduleId && onScheduleDrop) {
        onScheduleDrop(draggedScheduleId, date)
        setDraggedScheduleId(null)
      }
    },
    [draggedScheduleId, onScheduleDrop]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedScheduleId(null)
  }, [])

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
      {/* Weekday headers */}
      <div className='grid grid-cols-7 bg-gray-50 border-b border-gray-200'>
        {WEEKDAYS.map((day) => (
          <div key={day} className='py-3 text-center text-sm font-semibold text-gray-700'>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div
        className='grid grid-cols-7'
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragEnd={handleDragEnd}
      >
        {calendarDays.map((date) => {
          const daySchedules = getSchedulesForDay(date)
          const isCurrentMonth = isSameMonth(date, currentDate)
          const isInDragRange = isDateInRange(date)

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              schedules={daySchedules}
              isCurrentMonth={isCurrentMonth}
              isInDragRange={isInDragRange}
              isDragTarget={draggedScheduleId !== null}
              onClick={() => !isDragging && !draggedScheduleId && onDayClick(date, daySchedules)}
              onMouseDown={() => handleMouseDown(date, daySchedules.length > 0)}
              onMouseEnter={() => handleMouseEnter(date)}
              onScheduleDragStart={handleScheduleDragStart}
              onScheduleDrop={() => handleScheduleDrop(date)}
              onScheduleClick={onScheduleClick}
            />
          )
        })}
      </div>
    </div>
  )
}
