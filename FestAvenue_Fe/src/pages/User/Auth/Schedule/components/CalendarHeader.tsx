import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '../../../../../components/ui/button'

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export default function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday
}: CalendarHeaderProps) {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center gap-4'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {format(currentDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        <Button
          variant='outline'
          size='sm'
          onClick={onToday}
          className='flex items-center gap-2'
        >
          <CalendarIcon className='w-4 h-4' />
          Hôm nay
        </Button>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={onPreviousMonth}
          className='h-9 w-9'
        >
          <ChevronLeft className='w-4 h-4' />
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={onNextMonth}
          className='h-9 w-9'
        >
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}
