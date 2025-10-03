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

  const hasActiveFilters =
    searchInput || filter.dateRange || !filter.showCompleted || filter.sortBy !== 'startDate'

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex gap-2'>
        <div className='relative flex-1 group'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-200 group-hover:text-blue-500' />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Tìm kiếm theo tiêu đề, mô tả, hoặc subtask...'
            className='pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors duration-200 hover:scale-110'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>
        <Button
          variant='outline'
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={`flex items-center gap-2 transition-all duration-200 ${
            hasActiveFilters || isAdvancedOpen
              ? 'bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100'
              : 'hover:bg-gray-100'
          }`}
        >
          <Filter
            className={`w-4 h-4 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`}
          />
          {isAdvancedOpen ? 'Ẩn bộ lọc' : 'Bộ lọc'}
          {hasActiveFilters && !isAdvancedOpen && (
            <span className='px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full animate-in fade-in zoom-in duration-200'>
              !
            </span>
          )}
        </Button>
      </div>

      {/* Quick Filters */}
      <div className='flex gap-2 flex-wrap'>
        {QUICK_FILTERS.map((qf, index) => (
          <Button
            key={qf.value}
            variant='outline'
            size='sm'
            onClick={() => handleQuickFilter(qf.value)}
            className='text-xs transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
            style={{
              animation: `fadeInUp 0.3s ease-out ${index * 100}ms both`
            }}
          >
            <Calendar className='w-3 h-3 mr-1' />
            {qf.label}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isAdvancedOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm'>
          <h3 className='font-semibold text-sm text-gray-700 flex items-center gap-2'>
            <Filter className='w-4 h-4 text-blue-600' />
            Bộ lọc nâng cao
          </h3>

          {/* Date Range */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-600 flex items-center gap-1'>
              <Calendar className='w-3 h-3' />
              Khoảng thời gian
            </Label>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <Input
                  type='datetime-local'
                  value={localDateFrom}
                  onChange={(e) => setLocalDateFrom(e.target.value)}
                  onBlur={handleDateRangeChange}
                  placeholder='Từ ngày'
                  className='text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300'
                />
              </div>
              <div>
                <Input
                  type='datetime-local'
                  value={localDateTo}
                  onChange={(e) => setLocalDateTo(e.target.value)}
                  onBlur={handleDateRangeChange}
                  placeholder='Đến ngày'
                  className='text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 hover:border-blue-300'
                />
              </div>
            </div>
            {filter.dateRange && (
              <Button
                variant='ghost'
                size='sm'
                onClick={clearDateRange}
                className='text-xs transition-all duration-200 hover:bg-red-50 hover:text-red-600'
              >
                <X className='w-3 h-3 mr-1' />
                Xóa khoảng thời gian
              </Button>
            )}
          </div>

          {/* Show Completed */}
          <div className='flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-white'>
            <Checkbox
              id='showCompleted'
              checked={filter.showCompleted}
              onCheckedChange={(checked) => onFilterChange({ showCompleted: checked as boolean })}
              className='transition-all duration-200'
            />
            <Label htmlFor='showCompleted' className='text-sm cursor-pointer flex items-center gap-1'>
              <CheckCircle2 className='w-4 h-4 text-green-600' />
              Hiển thị các lịch đã hoàn thành
            </Label>
          </div>

          {/* Sort Options */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-600'>Sắp xếp theo</Label>
              <Select
                value={filter.sortBy}
                onValueChange={(value) => onFilterChange({ sortBy: value as ScheduleFilterType['sortBy'] })}
              >
                <SelectTrigger className='text-sm transition-all duration-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500'>
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
              <Label className='text-sm font-medium text-gray-600'>Thứ tự</Label>
              <Select
                value={filter.sortOrder}
                onValueChange={(value) => onFilterChange({ sortOrder: value as ScheduleFilterType['sortOrder'] })}
              >
                <SelectTrigger className='text-sm transition-all duration-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-500'>
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
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
