import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Search, Filter, User, CheckCircle2, Circle, Timer, X, Clock } from 'lucide-react'
import { Checkbox } from '../../../../../components/ui/checkbox'
import { Input } from '../../../../../components/ui/input'
import { Button } from '../../../../../components/ui/button'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { SubTask } from '../../../../../types/schedule.types'

interface SubTaskListProps {
  subTasks: SubTask[]
  onToggleSubTask?: (subTaskId: string, currentStatus: boolean) => void
  readOnly?: boolean
  scheduleColor?: string
  selectedDate?: Date | null
}

type FilterStatus = 'all' | 'completed' | 'pending'
type SortBy = 'time_asc' | 'time_desc' | 'name_asc' | 'name_desc'

export default function SubTaskList({ subTasks, onToggleSubTask, readOnly = false, selectedDate }: SubTaskListProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortBy>('time_desc')
  const [showFilters, setShowFilters] = useState(false)
  const [timeRangeStart, setTimeRangeStart] = useState('')
  const [timeRangeEnd, setTimeRangeEnd] = useState('')
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set())
  const previousCompletionState = useRef<Map<string, boolean>>(new Map())
  const taskOrderRef = useRef<string[]>([])
  const isUserInteracting = useRef(false)

  // Track completion state changes and trigger animations
  useEffect(() => {
    const newAnimatingTasks = new Set<string>()

    subTasks.forEach((task) => {
      const prevState = previousCompletionState.current.get(task.id)
      if (prevState !== undefined && prevState !== task.isCompleted) {
        // State changed, trigger animation only once
        newAnimatingTasks.add(task.id)
        // Mark as user interacting to preserve order
        isUserInteracting.current = true
      }
      previousCompletionState.current.set(task.id, task.isCompleted)
    })

    if (newAnimatingTasks.size > 0) {
      setAnimatingTasks(newAnimatingTasks)
      // Clear animation state and interaction flag after animation completes
      const timer = setTimeout(() => {
        setAnimatingTasks(new Set())
        isUserInteracting.current = false
      }, 1000) // Give enough time for both animation and re-render
      return () => clearTimeout(timer)
    }
  }, [subTasks])

  // Get unique assignees
  const uniqueAssignees = useMemo(() => {
    const assignees = subTasks
      .filter((st) => st.assigneeName)
      .map((st) => ({
        id: st.assigneeId || '',
        name: st.assigneeName || ''
      }))
    // Remove duplicates
    const uniqueMap = new Map(assignees.map((a) => [a.id, a]))
    return Array.from(uniqueMap.values())
  }, [subTasks])

  // Filter and sort subtasks
  const filteredSubTasks = useMemo(() => {
    let filtered = [...subTasks]

    // Filter by selected date if provided
    if (selectedDate) {
      filtered = filtered.filter((st) => {
        if (!st.startDate || !st.endDate) {
          return true // Show subtasks without dates
        }

        try {
          const subTaskStart = new Date(st.startDate)
          const subTaskEnd = new Date(st.endDate)

          // Normalize dates to compare only date parts (ignore time)
          const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
          const subTaskStartOnly = new Date(subTaskStart.getFullYear(), subTaskStart.getMonth(), subTaskStart.getDate())
          const subTaskEndOnly = new Date(subTaskEnd.getFullYear(), subTaskEnd.getMonth(), subTaskEnd.getDate())

          const isInRange = selectedDateOnly >= subTaskStartOnly && selectedDateOnly <= subTaskEndOnly

          // Check if selectedDate is within the subtask date range (inclusive)
          return isInRange
        } catch (e) {
          console.error(` Error filtering subtask "${st.title}":`, e)
          return true // Show if date parsing fails
        }
      })
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (st) =>
          st.title.toLowerCase().includes(query) ||
          st.description?.toLowerCase().includes(query) ||
          st.assigneeName?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((st) => (filterStatus === 'completed' ? st.isCompleted : !st.isCompleted))
    }

    // Assignee filter
    if (filterAssignee !== 'all') {
      filtered = filtered.filter((st) => st.assigneeId === filterAssignee)
    }

    // Time range filter
    if (timeRangeStart && timeRangeEnd) {
      filtered = filtered.filter((st) => {
        try {
          const updatedDate = parseISO(st.updatedAt)
          const today = new Date()
          const startDateTime = new Date(today.toDateString() + ' ' + timeRangeStart)
          const endDateTime = new Date(today.toDateString() + ' ' + timeRangeEnd)

          // Get the time part of updated date
          const updatedTime = new Date(today.toDateString() + ' ' + format(updatedDate, 'HH:mm'))

          return isWithinInterval(updatedTime, { start: startDateTime, end: endDateTime })
        } catch {
          return true
        }
      })
    }

    // If user is interacting and we have a saved order, preserve it
    if (isUserInteracting.current && taskOrderRef.current.length > 0) {
      // Keep existing order
      const orderMap = new Map(taskOrderRef.current.map((id, idx) => [id, idx]))
      filtered.sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? 9999
        const orderB = orderMap.get(b.id) ?? 9999
        return orderA - orderB
      })
    } else {
      // Normal sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'time_asc':
            return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          case 'time_desc':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          case 'name_asc':
            return a.title.localeCompare(b.title, 'vi')
          case 'name_desc':
            return b.title.localeCompare(a.title, 'vi')
          default:
            return 0
        }
      })
      // Save this order
      taskOrderRef.current = filtered.map((t) => t.id)
    }

    return filtered
  }, [subTasks, searchQuery, filterStatus, filterAssignee, sortBy, timeRangeStart, timeRangeEnd, selectedDate])

  const completedCount = subTasks.filter((st) => st.isCompleted).length
  const totalCount = subTasks.length

  // Calculate completion time
  const getCompletionTime = (createdAt: string, completedAt?: string) => {
    if (!completedAt) return null
    const created = new Date(createdAt)
    const completed = new Date(completedAt)
    const diffMs = completed.getTime() - created.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  // Get time slot for the selected date
  const getTimeSlotForDate = (subTask: SubTask, date: Date | null) => {
    if (!date || !subTask.dailyTimeSlots || subTask.dailyTimeSlots.length === 0) {
      return null
    }

    try {
      const dateStr = format(date, 'yyyy-MM-dd')

      const timeSlot = subTask.dailyTimeSlots.find((slot) => slot.date === dateStr)

      return timeSlot
    } catch (e) {
      console.error(`  ❌ Error in getTimeSlotForDate:`, e)
      return null
    }
  }

  const hasActiveFilters =
    searchQuery || filterStatus !== 'all' || filterAssignee !== 'all' || timeRangeStart || timeRangeEnd

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterAssignee('all')
    setSortBy('time_desc')
    setTimeRangeStart('')
    setTimeRangeEnd('')
  }

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2 font-semibold text-gray-900 hover:text-gray-700 transition-all duration-200'
        >
          {isExpanded ? (
            <ChevronUp className='w-5 h-5 transition-transform duration-200' />
          ) : (
            <ChevronDown className='w-5 h-5 transition-transform duration-200' />
          )}
          <CheckCircle2 className='w-5 h-5 text-gray-600' />
          <span>
            Subtasks ({completedCount}/{totalCount})
          </span>
        </button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className={`transition-all duration-200 ${
            hasActiveFilters ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          <Filter className={`w-4 h-4 mr-1 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          Lọc
          {hasActiveFilters && (
            <span className='ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full animate-in fade-in zoom-in duration-200'>
              {
                [searchQuery, filterStatus !== 'all', filterAssignee !== 'all', timeRangeStart && timeRangeEnd].filter(
                  Boolean
                ).length
              }
            </span>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-4 space-y-3 border border-gray-200 shadow-sm'>
          {/* Search */}
          <div className='relative group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-blue-500' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm theo tên, mô tả, người thực hiện...'
              className='pl-9 pr-4 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
            />
          </div>

          {/* Filter Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {/* Status Filter */}
            <div className='space-y-1'>
              <label className='text-xs font-medium text-gray-600 flex items-center gap-1'>
                <CheckCircle2 className='w-3 h-3' />
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white cursor-pointer'
              >
                <option value='all'>Tất cả</option>
                <option value='completed'>Đã hoàn thành</option>
                <option value='pending'>Chưa hoàn thành</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div className='space-y-1'>
              <label className='text-xs font-medium text-gray-600 flex items-center gap-1'>
                <User className='w-3 h-3' />
                Người thực hiện
              </label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white cursor-pointer'
              >
                <option value='all'>Tất cả</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className='space-y-1'>
              <label className='text-xs font-medium text-gray-600 flex items-center gap-1'>
                <Filter className='w-3 h-3' />
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white cursor-pointer'
              >
                <option value='time_desc'>Mới nhất</option>
                <option value='time_asc'>Cũ nhất</option>
                <option value='name_asc'>Tên A-Z</option>
                <option value='name_desc'>Tên Z-A</option>
              </select>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className='space-y-2 p-3 bg-white rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-300'>
            <label className='text-xs font-medium text-gray-600 flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              Lọc theo giờ cập nhật
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <label className='text-xs text-gray-500'>Từ giờ</label>
                <input
                  type='time'
                  value={timeRangeStart}
                  onChange={(e) => setTimeRangeStart(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 cursor-pointer'
                />
              </div>
              <div className='space-y-1'>
                <label className='text-xs text-gray-500'>Đến giờ</label>
                <input
                  type='time'
                  value={timeRangeEnd}
                  onChange={(e) => setTimeRangeEnd(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 cursor-pointer'
                />
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant='outline'
              size='sm'
              onClick={clearFilters}
              className='w-full transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 animate-in fade-in slide-in-from-top-2'
            >
              <X className='w-4 h-4 mr-1' />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Subtasks List */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='space-y-2'>
          {totalCount === 0 ? (
            <div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg'>
              <Circle className='w-12 h-12 mx-auto mb-2 opacity-50' />
              <p>Chưa có subtask nào</p>
            </div>
          ) : filteredSubTasks.length === 0 ? (
            <div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg'>
              <Search className='w-12 h-12 mx-auto mb-2 opacity-50' />
              <p>Không tìm thấy subtask phù hợp</p>
            </div>
          ) : (
            <div className='space-y-2 max-h-[400px] overflow-y-auto pr-1'>
              {filteredSubTasks.map((subTask, index) => {
                const isAnimating = animatingTasks.has(subTask.id)
                const timeSlot = selectedDate ? getTimeSlotForDate(subTask, selectedDate) : null

                return (
                  <div
                    key={subTask.id}
                    className={`border rounded-lg p-3 transition-all duration-500 ease-in-out hover:shadow-md hover:scale-[1.01] ${
                      subTask.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    } ${isAnimating ? 'animate-statusChange' : ''}`}
                    style={{
                      animation: isAnimating ? undefined : `slideInFromLeft 0.3s ease-out ${index * 50}ms both`
                    }}
                  >
                    <div className='flex items-start gap-3'>
                      {!readOnly && (
                        <Checkbox
                          id={subTask.id}
                          checked={subTask.isCompleted}
                          onCheckedChange={() => onToggleSubTask?.(subTask.id, subTask.isCompleted)}
                          className='mt-0.5'
                        />
                      )}
                      <div className='flex-1 min-w-0'>
                        {/* Title */}
                        <label
                          htmlFor={subTask.id}
                          className={`font-medium cursor-pointer block transition-all duration-300 ${
                            subTask.isCompleted ? 'text-green-700 line-through decoration-2' : 'text-gray-900'
                          }`}
                        >
                          {subTask.title}
                        </label>

                        {/* Description */}
                        {subTask.description && (
                          <p
                            className={`text-sm mt-1 line-clamp-2 ${
                              subTask.isCompleted ? 'text-green-600' : 'text-gray-600'
                            }`}
                          >
                            {subTask.description}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className='flex flex-wrap gap-3 mt-2'>
                          {/* Assignee */}
                          {subTask.assigneeName && (
                            <div className='flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded transition-all duration-200 hover:bg-blue-100'>
                              <User className='w-3 h-3' />
                              <span>{subTask.assigneeName}</span>
                            </div>
                          )}

                          {/* Subtask Date/Time - show time slot for selected date if available */}
                          {subTask.startDate && subTask.endDate && (
                            <div className='flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded transition-all duration-200 hover:bg-purple-100'>
                              <Clock className='w-3 h-3' />
                              {timeSlot && selectedDate ? (
                                // Show specific time slot for the selected date
                                <span>
                                  {format(selectedDate, 'dd/MM', { locale: vi })} ({timeSlot.startTime} →{' '}
                                  {timeSlot.endTime})
                                </span>
                              ) : (
                                // Show full date range
                                <span>
                                  {format(new Date(subTask.startDate), 'dd/MM HH:mm', { locale: vi })}
                                  {' → '}
                                  {format(new Date(subTask.endDate), 'dd/MM HH:mm', { locale: vi })}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Completion time */}
                          {subTask.isCompleted && subTask.completedAt && (
                            <div className='flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded transition-all duration-200 hover:bg-green-100'>
                              <Timer className='w-3 h-3' />
                              <span>{getCompletionTime(subTask.createdAt, subTask.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes statusChange {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.03);
          }
          50% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-statusChange {
          animation: statusChange 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
