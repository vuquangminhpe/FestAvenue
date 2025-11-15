import { useState, useEffect } from 'react'
import { Clock, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TimeOnlyPickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  variant?: 'start' | 'end'
  baseDate?: Date // Date to use when creating the full datetime
  minTime?: Date // Minimum time allowed (for validation)
}

export function TimeOnlyPicker({
  value,
  onChange,
  placeholder = 'Chọn giờ',
  disabled = false,
  error = false,
  variant = 'start',
  baseDate,
  minTime
}: TimeOnlyPickerProps) {
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState(value ? value.getHours().toString().padStart(2, '0') : '08')
  const [minutes, setMinutes] = useState(value ? value.getMinutes().toString().padStart(2, '0') : '00')

  const variantConfig = {
    start: {
      gradientFrom: 'from-cyan-400',
      gradientTo: 'to-blue-500',
      borderColor: 'border-cyan-200',
      focusBorderColor: 'focus:border-cyan-400',
      focusRingColor: 'focus:ring-cyan-300',
      hoverBorderColor: 'hover:border-cyan-300',
      bgGradient: 'from-cyan-50/40',
      iconColor: 'text-cyan-500',
      iconHoverColor: 'group-hover:text-cyan-600',
      buttonBg: 'bg-cyan-500',
      buttonHoverBg: 'hover:bg-cyan-600'
    },
    end: {
      gradientFrom: 'from-blue-400',
      gradientTo: 'to-indigo-500',
      borderColor: 'border-blue-200',
      focusBorderColor: 'focus:border-blue-400',
      focusRingColor: 'focus:ring-blue-300',
      hoverBorderColor: 'hover:border-blue-300',
      bgGradient: 'from-blue-50/40',
      iconColor: 'text-blue-500',
      iconHoverColor: 'group-hover:text-blue-600',
      buttonBg: 'bg-blue-500',
      buttonHoverBg: 'hover:bg-blue-600'
    }
  }

  const config = variantConfig[variant]

  useEffect(() => {
    if (value) {
      const h = value.getHours().toString().padStart(2, '0')
      const m = value.getMinutes().toString().padStart(2, '0')
      setHours(h)
      setMinutes(m)
    }
  }, [value])

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours)
    setMinutes(newMinutes)

    if (baseDate) {
      // Use the provided base date and set the time
      const newDate = new Date(baseDate)
      newDate.setHours(parseInt(newHours), parseInt(newMinutes), 0, 0)
      onChange?.(newDate)
    }
  }

  const handleClear = () => {
    setHours('08')
    setMinutes('00')
    onChange?.(undefined)
  }

  // Generate hours array (0-23) - filter based on minTime
  const hoursArray = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).filter((hour) => {
    // For start variant, filter hours that are invalid
    if (variant === 'start' && minTime && baseDate) {
      const baseDateOnly = new Date(baseDate)
      baseDateOnly.setHours(0, 0, 0, 0)
      const minTimeOnly = new Date(minTime)
      minTimeOnly.setHours(0, 0, 0, 0)

      // Only filter if same day
      if (baseDateOnly.getTime() === minTimeOnly.getTime()) {
        return (
          parseInt(hour) > minTime.getHours() || (parseInt(hour) === minTime.getHours() && minTime.getMinutes() < 59)
        )
      }
    }
    return true
  })

  // Generate minutes array (0-59) - filter based on selected hour and minTime
  const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).filter((minute) => {
    if (variant === 'start' && minTime && baseDate) {
      const baseDateOnly = new Date(baseDate)
      baseDateOnly.setHours(0, 0, 0, 0)
      const minTimeOnly = new Date(minTime)
      minTimeOnly.setHours(0, 0, 0, 0)

      // Only filter if same day and same hour
      if (baseDateOnly.getTime() === minTimeOnly.getTime() && parseInt(hours) === minTime.getHours()) {
        return parseInt(minute) > minTime.getMinutes()
      }
    }
    return true
  })

  const displayValue = value ? `${hours}:${minutes}` : ''

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
          {value && !disabled && (
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
        {/* Time Picker Header */}
        <div className={cn('bg-gradient-to-r p-4 text-white rounded-t-md', config.gradientFrom, config.gradientTo)}>
          <div className='flex items-center gap-2 mb-2'>
            <Clock className='w-5 h-5' />
            <h3 className='font-semibold'>{variant === 'start' ? 'Giờ bắt đầu' : 'Giờ kết thúc'}</h3>
          </div>
          <p className='text-sm opacity-90'>Chỉ chọn giờ, ngày sẽ tự động lấy từ ngày kết thúc bán vé</p>
        </div>

        {/* Time Picker */}
        <div className='p-6 bg-gradient-to-br from-gray-50 to-slate-50'>
          <div className='flex items-center gap-3 justify-center'>
            {/* Hours */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-600 font-medium text-center'>Giờ</label>
              <select
                value={hours}
                onChange={(e) => handleTimeChange(e.target.value, minutes)}
                className='px-4 py-3 text-center font-bold text-xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white hover:border-cyan-400 transition-colors cursor-pointer'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#06b6d4 #f3f4f6'
                }}
              >
                {hoursArray.map((hour) => (
                  <option key={hour} value={hour} className='py-3 px-4 hover:bg-cyan-50'>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            <span className='text-3xl font-bold text-gray-400 mt-5'>:</span>

            {/* Minutes */}
            <div className='flex flex-col gap-1'>
              <label className='text-xs text-gray-600 font-medium text-center'>Phút</label>
              <select
                value={minutes}
                onChange={(e) => handleTimeChange(hours, e.target.value)}
                className='px-4 py-3 text-center font-bold text-xl border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white hover:border-cyan-400 transition-colors cursor-pointer'
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#06b6d4 #f3f4f6'
                }}
              >
                {minutesArray.map((minute) => (
                  <option key={minute} value={minute} className='py-3 px-4 hover:bg-cyan-50'>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Help text */}
          <div className='mt-4 text-center'>
            <p className='text-xs text-gray-500'>
              Ngày sẽ được tự động đặt dựa trên{' '}
              <span className='font-semibold text-cyan-600'>thời gian kết thúc bán vé</span>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
