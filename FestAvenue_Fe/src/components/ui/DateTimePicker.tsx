import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  error?: boolean
  variant?: 'start' | 'end'
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày và giờ',
  minDate,
  maxDate,
  disabled = false,
  error = false,
  variant = 'start'
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)
  const [hours, setHours] = useState(value ? value.getHours().toString().padStart(2, '0') : '08')
  const [minutes, setMinutes] = useState(value ? value.getMinutes().toString().padStart(2, '0') : '00')

  const variantConfig = {
    start: {
      gradientFrom: 'from-green-400',
      gradientTo: 'to-emerald-500',
      borderColor: 'border-green-200',
      focusBorderColor: 'focus:border-green-400',
      focusRingColor: 'focus:ring-green-300',
      hoverBorderColor: 'hover:border-green-300',
      bgGradient: 'from-green-50/40',
      iconColor: 'text-green-500',
      iconHoverColor: 'group-hover:text-green-600',
      buttonBg: 'bg-green-500',
      buttonHoverBg: 'hover:bg-green-600'
    },
    end: {
      gradientFrom: 'from-red-400',
      gradientTo: 'to-rose-500',
      borderColor: 'border-red-200',
      focusBorderColor: 'focus:border-red-400',
      focusRingColor: 'focus:ring-red-300',
      hoverBorderColor: 'hover:border-red-300',
      bgGradient: 'from-red-50/40',
      iconColor: 'text-red-500',
      iconHoverColor: 'group-hover:text-red-600',
      buttonBg: 'bg-red-500',
      buttonHoverBg: 'hover:bg-red-600'
    }
  }

  const config = variantConfig[variant]

  useEffect(() => {
    if (value) {
      setSelectedDate(value)
      const h = value.getHours().toString().padStart(2, '0')
      const m = value.getMinutes().toString().padStart(2, '0')
      setHours(h)
      setMinutes(m)
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Apply current time to the selected date
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      onChange?.(newDate)
    }
  }

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours)
    setMinutes(newMinutes)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(newHours), parseInt(newMinutes), 0, 0)
      onChange?.(newDate)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setHours('08')
    setMinutes('00')
    onChange?.(undefined)
  }

  // Generate hours array (0-23)
  const hoursArray = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  // Generate minutes array (0-59)
  const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  // Helper to check if selected date is same day as minDate/maxDate
  const isSameDayAsMin = selectedDate && minDate &&
    selectedDate.getDate() === minDate.getDate() &&
    selectedDate.getMonth() === minDate.getMonth() &&
    selectedDate.getFullYear() === minDate.getFullYear()

  const isSameDayAsMax = selectedDate && maxDate &&
    selectedDate.getDate() === maxDate.getDate() &&
    selectedDate.getMonth() === maxDate.getMonth() &&
    selectedDate.getFullYear() === maxDate.getFullYear()

  // Helper to check if hour/minute should be disabled
  const isHourDisabled = (hour: string) => {
    const hourNum = parseInt(hour)

    if (isSameDayAsMin && minDate) {
      const minHour = minDate.getHours()
      if (hourNum < minHour) return true
    }

    if (isSameDayAsMax && maxDate) {
      const maxHour = maxDate.getHours()
      if (hourNum > maxHour) return true
    }

    return false
  }

  const isMinuteDisabled = (minute: string) => {
    const minuteNum = parseInt(minute)
    const currentHour = parseInt(hours)

    if (isSameDayAsMin && minDate) {
      const minHour = minDate.getHours()
      const minMinute = minDate.getMinutes()

      // If same hour as minDate, disable minutes <= minMinute
      if (currentHour === minHour && minuteNum <= minMinute) {
        return true
      }
    }

    if (isSameDayAsMax && maxDate) {
      const maxHour = maxDate.getHours()
      const maxMinute = maxDate.getMinutes()

      // If same hour as maxDate, disable minutes >= maxMinute
      if (currentHour === maxHour && minuteNum >= maxMinute) {
        return true
      }
    }

    return false
  }

  const displayValue = selectedDate ? `${format(selectedDate, 'dd/MM/yyyy', { locale: vi })} ${hours}:${minutes}` : ''

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='relative group'>
          <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10'>
            <Clock className={cn('w-4 h-4 transition-colors', config.iconColor, config.iconHoverColor)} />
          </div>
          <Input
            value={displayValue}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            className={cn(
              'pl-11 pr-10 h-11 text-sm font-medium cursor-pointer transition-all duration-200',
              error
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : cn(
                    config.borderColor,
                    config.focusBorderColor,
                    config.focusRingColor,
                    config.hoverBorderColor,
                    `bg-gradient-to-r ${config.bgGradient} to-white hover:shadow-md`
                  )
            )}
          />
          {selectedDate && !disabled && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0 shadow-2xl border-2' align='start'>
        {/* Calendar with gradient header */}
        <div className={cn('bg-gradient-to-r p-4 text-white rounded-t-md', config.gradientFrom, config.gradientTo)}>
          <div className='flex items-center gap-2 mb-2'>
            <CalendarIcon className='w-5 h-5' />
            <h3 className='font-semibold'>{variant === 'start' ? 'Ngày bắt đầu' : 'Ngày kết thúc'}</h3>
          </div>
          {selectedDate && (
            <p className='text-sm opacity-90'>{format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: vi })}</p>
          )}
        </div>

        {/* Calendar */}
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => {
            // Compare only dates (ignore time) to allow same-day selection
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

            if (minDate) {
              const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
              if (dateOnly < minDateOnly) return true
            }

            if (maxDate) {
              const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
              if (dateOnly > maxDateOnly) return true
            }

            return false
          }}
          initialFocus
          className='border-none'
        />

        {/* Time Picker */}
        <div className='p-4 border-t bg-gradient-to-br from-gray-50 to-slate-50'>
          <div className='flex items-center gap-3 justify-center'>
            {/* Hours */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-600 font-medium text-center'>Giờ</label>
              <select
                value={hours}
                onChange={(e) => handleTimeChange(e.target.value, minutes)}
                className='px-3 py-2 text-center font-bold text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white hover:border-cyan-400 transition-colors cursor-pointer'
                style={{
                  // Custom scrollbar for dropdown
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#06b6d4 #f3f4f6'
                }}
              >
                {hoursArray.map((hour) => (
                  <option
                    key={hour}
                    value={hour}
                    disabled={isHourDisabled(hour)}
                    className='py-3 px-4 hover:bg-cyan-50 checked:bg-cyan-100 checked:font-bold disabled:text-gray-300 disabled:cursor-not-allowed'
                  >
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            <span className='text-2xl font-bold text-gray-400 mt-5'>:</span>

            {/* Minutes */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-600 font-medium text-center'>Phút</label>
              <select
                value={minutes}
                onChange={(e) => handleTimeChange(hours, e.target.value)}
                className='px-3 py-2 text-center font-bold text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white hover:border-cyan-400 transition-colors cursor-pointer'
                style={{
                  // Custom scrollbar for dropdown
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#06b6d4 #f3f4f6'
                }}
              >
                {minutesArray.map((minute) => (
                  <option
                    key={minute}
                    value={minute}
                    disabled={isMinuteDisabled(minute)}
                    className='py-3 px-4 hover:bg-cyan-50 checked:bg-cyan-100 checked:font-bold disabled:text-gray-300 disabled:cursor-not-allowed'
                  >
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
