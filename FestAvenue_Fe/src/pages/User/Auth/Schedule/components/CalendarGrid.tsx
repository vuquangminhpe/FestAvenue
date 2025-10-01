import { useMemo } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Schedule } from '../../../../../types/schedule.types'
import CalendarDay from './CalendarDay'

interface CalendarGridProps {
  currentDate: Date
  schedules: Schedule[]
  onDayClick: (date: Date, schedules: Schedule[]) => void
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function CalendarGrid({ currentDate, schedules, onDayClick }: CalendarGridProps) {
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
      <div className='grid grid-cols-7'>
        {calendarDays.map((date) => {
          const daySchedules = getSchedulesForDay(date)
          const isCurrentMonth = isSameMonth(date, currentDate)

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              schedules={daySchedules}
              isCurrentMonth={isCurrentMonth}
              onClick={() => onDayClick(date, daySchedules)}
            />
          )
        })}
      </div>
    </div>
  )
}
