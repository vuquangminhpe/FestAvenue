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
      setHours(value.getHours().toString().padStart(2, '0'))
      setMinutes(value.getMinutes().toString().padStart(2, '0'))
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      // Apply current time to the selected date
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onChange?.(newDate)
    }
  }

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours)
    setMinutes(newMinutes)

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(newHours), parseInt(newMinutes))
      onChange?.(newDate)
    }
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    setHours('08')
    setMinutes('00')
    onChange?.(undefined)
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
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          initialFocus
          className='border-none'
        />

        {/* Time Picker */}
        <div className='p-2 border-t bg-gradient-to-br from-gray-50 to-slate-50'>
          <div className='flex items-center gap-3 justify-center'>
            {/* Hours */}
            <div className='flex gap-1 items-center '>
              <label className='text-xs text-gray-500 mb-1 block'>Giờ</label>
              <Input
                type='number'
                min='0'
                max='23'
                value={hours}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                  handleTimeChange(val.toString().padStart(2, '0'), minutes)
                }}
                className='text-center font-bold text-lg h-8 p-0'
              />
            </div>
            {/* Minutes */}
            <div className='flex gap-1 items-center'>
              <label className='text-xs text-gray-500 mb-1 block'>Phút</label>
              <Input
                type='number'
                min='0'
                max='59'
                value={minutes}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                  handleTimeChange(hours, val.toString().padStart(2, '0'))
                }}
                className='text-center font-bold text-lg h-8 p-0'
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
