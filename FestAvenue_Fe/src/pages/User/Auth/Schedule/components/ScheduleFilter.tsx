import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, X, Calendar, CheckCircle2 } from 'lucide-react'
import { Input } from '../../../../../components/ui/input'
import { Button } from '../../../../../components/ui/button'
import { Label } from '../../../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select'
import { Checkbox } from '../../../../../components/ui/checkbox'
import type { ScheduleFilter as ScheduleFilterType } from '../../../../../types/schedule.types'
import { format } from 'date-fns'

interface ScheduleFilterProps {
  filter: ScheduleFilterType
  onFilterChange: (filter: Partial<ScheduleFilterType>) => void
  onSearch: (query: string) => void
}

const QUICK_FILTERS = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'thisWeek' },
  { label: 'Tháng này', value: 'thisMonth' }
]

export default function ScheduleFilter({ filter, onFilterChange, onSearch }: ScheduleFilterProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(filter.searchQuery)
  const [localDateFrom, setLocalDateFrom] = useState('')
  const [localDateTo, setLocalDateTo] = useState('')

  const debouncedSearch = useCallback(
    (value: string) => {
      onSearch(value)
    },
    [onSearch]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchInput)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput, debouncedSearch])

  const handleQuickFilter = (value: string) => {
    const today = new Date()
    let from: Date, to: Date

    switch (value) {
      case 'today':
        from = new Date(today.setHours(0, 0, 0, 0))
        to = new Date(today.setHours(23, 59, 59, 999))
        break
      case 'thisWeek':
        from = new Date(today.setDate(today.getDate() - today.getDay()))
        from.setHours(0, 0, 0, 0)
        to = new Date(today.setDate(today.getDate() - today.getDay() + 6))
        to.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      default:
        return
    }

    onFilterChange({ dateRange: { from, to } })
    setLocalDateFrom(format(from, "yyyy-MM-dd'T'HH:mm"))
    setLocalDateTo(format(to, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleDateRangeChange = () => {
    if (localDateFrom && localDateTo) {
      onFilterChange({
        dateRange: {
          from: new Date(localDateFrom),
          to: new Date(localDateTo)
        }
      })
    }
  }

  const clearDateRange = () => {
    setLocalDateFrom('')
    setLocalDateTo('')
    onFilterChange({ dateRange: undefined })
  }

  const clearSearch = () => {
    setSearchInput('')
    onSearch('')
  }

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Tìm kiếm theo tiêu đề, mô tả, hoặc subtask...'
            className='pl-10 pr-10'
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
        <Button
          variant='outline'
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className='flex items-center gap-2'
        >
          <Filter className='w-4 h-4' />
          {isAdvancedOpen ? 'Ẩn bộ lọc' : 'Bộ lọc'}
        </Button>
      </div>

      {/* Quick Filters */}
      <div className='flex gap-2 flex-wrap'>
        {QUICK_FILTERS.map((qf) => (
          <Button
            key={qf.value}
            variant='outline'
            size='sm'
            onClick={() => handleQuickFilter(qf.value)}
            className='text-xs'
          >
            <Calendar className='w-3 h-3 mr-1' />
            {qf.label}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className='border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50'>
          <h3 className='font-semibold text-sm text-gray-700 flex items-center gap-2'>
            <Filter className='w-4 h-4' />
            Bộ lọc nâng cao
          </h3>

          {/* Date Range */}
          <div className='space-y-2'>
            <Label className='text-sm'>Khoảng thời gian</Label>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Input
                  type='datetime-local'
                  value={localDateFrom}
                  onChange={(e) => setLocalDateFrom(e.target.value)}
                  onBlur={handleDateRangeChange}
                  placeholder='Từ ngày'
                  className='text-sm'
                />
              </div>
              <div>
                <Input
                  type='datetime-local'
                  value={localDateTo}
                  onChange={(e) => setLocalDateTo(e.target.value)}
                  onBlur={handleDateRangeChange}
                  placeholder='Đến ngày'
                  className='text-sm'
                />
              </div>
            </div>
            {filter.dateRange && (
              <Button variant='ghost' size='sm' onClick={clearDateRange} className='text-xs'>
                <X className='w-3 h-3 mr-1' />
                Xóa khoảng thời gian
              </Button>
            )}
          </div>

          {/* Show Completed */}
          <div className='flex items-center gap-2'>
            <Checkbox
              id='showCompleted'
              checked={filter.showCompleted}
              onCheckedChange={(checked) => onFilterChange({ showCompleted: checked as boolean })}
            />
            <Label htmlFor='showCompleted' className='text-sm cursor-pointer flex items-center gap-1'>
              <CheckCircle2 className='w-4 h-4 text-green-600' />
              Hiển thị các lịch đã hoàn thành
            </Label>
          </div>

          {/* Sort Options */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm'>Sắp xếp theo</Label>
              <Select
                value={filter.sortBy}
                onValueChange={(value) => onFilterChange({ sortBy: value as ScheduleFilterType['sortBy'] })}
              >
                <SelectTrigger className='text-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='startDate'>Ngày bắt đầu</SelectItem>
                  <SelectItem value='endDate'>Ngày kết thúc</SelectItem>
                  <SelectItem value='title'>Tiêu đề</SelectItem>
                  <SelectItem value='createdAt'>Ngày tạo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm'>Thứ tự</Label>
              <Select
                value={filter.sortOrder}
                onValueChange={(value) => onFilterChange({ sortOrder: value as ScheduleFilterType['sortOrder'] })}
              >
                <SelectTrigger className='text-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='asc'>Tăng dần</SelectItem>
                  <SelectItem value='desc'>Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
