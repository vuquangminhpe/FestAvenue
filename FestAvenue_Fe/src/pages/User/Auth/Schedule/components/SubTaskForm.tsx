import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Plus,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Copy,
  Loader2,
  UserPlus,
  Check
} from 'lucide-react'
import { Badge } from '../../../../../components/ui/badge'
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Label } from '../../../../../components/ui/label'
import { Textarea } from '../../../../../components/ui/textarea'
import { Checkbox } from '../../../../../components/ui/checkbox'
import type { SubTask, DailyTimeSlot } from '../../../../../types/schedule.types'
import { format, eachDayOfInterval, parseISO, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useGetUsersInEvent } from '@/pages/User/Process/UserManagementInEvents/hooks/useUserManagement'

interface SubTaskFormProps {
  eventCode: string
  subTasks: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>[]
  onChange: (subTasks: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>[]) => void
  parentScheduleStart: string // ISO date string from parent schedule
  parentScheduleEnd: string // ISO date string from parent schedule
}

type FilterStatus = 'all' | 'completed' | 'pending'

export default function SubTaskForm({
  eventCode,
  subTasks,
  onChange,
  parentScheduleStart,
  parentScheduleEnd
}: SubTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedTimeSlots, setExpandedTimeSlots] = useState<Record<number, boolean>>({})
  const [openDropdowns, setOpenDropdowns] = useState<Record<number, boolean>>({})
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState<Record<number, string>>({})
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach((key) => {
        const index = parseInt(key)
        if (openDropdowns[index] && dropdownRefs.current[index]) {
          if (!dropdownRefs.current[index]?.contains(event.target as Node)) {
            setOpenDropdowns((prev) => ({ ...prev, [index]: false }))
          }
        }
      })
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdowns])

  // Fetch users in event từ API
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersInEvent(
    {
      eventCode,
      servicePackageIds: [],
      searchFullName: '',
      paginationParam: {
        isPaging: false,
        pageIndex: 0,
        pageSize: 100
        // orderBy: 'fullName',
      }
    },
    !!eventCode
  )

  const users = useMemo(() => {
    return (
      usersData?.data?.result?.map((user) => ({
        id: user.userId,
        name: user.fullName
      })) || []
    )
  }, [usersData])

  // Toggle dropdown open/close
  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  // Toggle assignee selection
  const toggleAssignee = (subTaskIndex: number, userId: string) => {
    const currentIds = subTasks[subTaskIndex].assigneeIds || []
    const newIds = currentIds.includes(userId) ? currentIds.filter((id) => id !== userId) : [...currentIds, userId]
    updateSubTask(subTaskIndex, 'assigneeIds', newIds)
  }

  // Get filtered users for dropdown based on search
  const getFilteredUsers = (subTaskIndex: number) => {
    const query = assigneeSearchQuery[subTaskIndex]?.toLowerCase() || ''
    if (!query) return users
    return users.filter((user) => user.name.toLowerCase().includes(query))
  }

  // Get parent schedule date range in local datetime format for input
  const parentStartLocal = useMemo(() => {
    try {
      return new Date(parentScheduleStart).toISOString().slice(0, 16)
    } catch {
      return ''
    }
  }, [parentScheduleStart])

  const parentEndLocal = useMemo(() => {
    try {
      return new Date(parentScheduleEnd).toISOString().slice(0, 16)
    } catch {
      return ''
    }
  }, [parentScheduleEnd])

  const addSubTask = () => {
    onChange([
      ...subTasks,
      {
        title: '',
        description: '',
        isCompleted: false,
        startDate: undefined,
        endDate: undefined,
        dailyTimeSlots: []
      }
    ])
  }

  const updateSubTask = (
    index: number,
    field: keyof Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>,
    value: string | boolean | DailyTimeSlot[] | string[] | undefined
  ) => {
    const newSubTasks = [...subTasks]

    // If updating assigneeIds (multiple), also update assignees array
    if (field === 'assigneeIds') {
      const selectedIds = value as string[]
      const selectedUsers = users.filter((u) => selectedIds.includes(u.id))
      newSubTasks[index] = {
        ...newSubTasks[index],
        assigneeIds: selectedIds,
        assignees: selectedUsers.map((u) => ({ id: u.id, name: u.name })),
        // Also update legacy single assignee for backwards compatibility
        assigneeId: selectedIds[0],
        assigneeName: selectedUsers[0]?.name
      }
    }
    // If updating assigneeId (legacy single), also update assigneeName
    else if (field === 'assigneeId') {
      const user = users.find((u) => u.id === value)
      newSubTasks[index] = {
        ...newSubTasks[index],
        assigneeId: value as string,
        assigneeName: user?.name,
        // Also update new multiple assignee fields
        assigneeIds: value ? [value as string] : [],
        assignees: user ? [{ id: user.id, name: user.name }] : []
      }
    }
    // If updating date range, regenerate time slots
    else if (field === 'startDate' || field === 'endDate') {
      const updated = {
        ...newSubTasks[index],
        [field]: value
      }

      // Auto-generate daily time slots if both dates are set
      if (updated.startDate && updated.endDate) {
        try {
          const start = parseISO(updated.startDate)
          const end = parseISO(updated.endDate)

          if (isValid(start) && isValid(end) && start <= end) {
            const days = eachDayOfInterval({ start, end })
            const existingSlots = updated.dailyTimeSlots || []

            // Only keep existing slots that are within the new date range
            // and create new slots for dates that don't have slots yet
            updated.dailyTimeSlots = days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const existing = existingSlots.find((slot) => slot.date === dateStr)
              return (
                existing || {
                  date: dateStr,
                  startTime: '08:00',
                  endTime: '18:00'
                }
              )
            })
          }
        } catch (e) {
          console.error('❌ Error generating time slots:', e)
        }
      }

      newSubTasks[index] = updated
    } else {
      newSubTasks[index] = {
        ...newSubTasks[index],
        [field]: value
      }
    }

    onChange(newSubTasks)
  }

  const updateTimeSlot = (subTaskIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const newSubTasks = [...subTasks]
    const subTask = newSubTasks[subTaskIndex]

    if (subTask.dailyTimeSlots) {
      const newSlots = [...subTask.dailyTimeSlots]
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        [field]: value
      }
      newSubTasks[subTaskIndex] = {
        ...subTask,
        dailyTimeSlots: newSlots
      }
      onChange(newSubTasks)
    }
  }

  const autoFillTimeSlots = (subTaskIndex: number) => {
    const subTask = subTasks[subTaskIndex]
    if (!subTask.dailyTimeSlots || subTask.dailyTimeSlots.length === 0) return

    const firstSlot = subTask.dailyTimeSlots[0]
    const newSlots = subTask.dailyTimeSlots.map((slot) => ({
      ...slot,
      startTime: firstSlot.startTime,
      endTime: firstSlot.endTime
    }))

    updateSubTask(subTaskIndex, 'dailyTimeSlots', newSlots)
  }

  const removeSubTask = (index: number) => {
    onChange(subTasks.filter((_, i) => i !== index))
  }

  const toggleTimeSlots = (index: number) => {
    setExpandedTimeSlots((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Get unique assignees
  const uniqueAssignees = useMemo(() => {
    const assignees = subTasks
      .filter((st) => st.assigneeName)
      .map((st) => ({
        id: st.assigneeId || '',
        name: st.assigneeName || ''
      }))
    const uniqueMap = new Map(assignees.map((a) => [a.id, a]))
    return Array.from(uniqueMap.values())
  }, [subTasks])

  // Filter subtasks
  const filteredIndices = useMemo(() => {
    let indices = subTasks.map((_, index) => index)

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      indices = indices.filter((i) => {
        const st = subTasks[i]
        return (
          st.title.toLowerCase().includes(query) ||
          st.description?.toLowerCase().includes(query) ||
          st.assigneeName?.toLowerCase().includes(query)
        )
      })
    }

    // Status filter
    if (filterStatus !== 'all') {
      indices = indices.filter((i) => {
        const st = subTasks[i]
        return filterStatus === 'completed' ? st.isCompleted : !st.isCompleted
      })
    }

    // Assignee filter
    if (filterAssignee !== 'all') {
      indices = indices.filter((i) => subTasks[i].assigneeId === filterAssignee)
    }

    return indices
  }, [subTasks, searchQuery, filterStatus, filterAssignee])

  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterAssignee !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterAssignee('all')
  }

  const completedCount = subTasks.filter((st) => st.isCompleted).length

  // Helper to convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  const toDateTimeLocal = (isoString: string | undefined) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      // Format: YYYY-MM-DDTHH:mm
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch {
      return ''
    }
  }

  // Helper to check if dates span multiple days
  const isMultiDay = (subTask: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    if (!subTask.startDate || !subTask.endDate) return false
    try {
      const start = parseISO(subTask.startDate)
      const end = parseISO(subTask.endDate)
      return format(start, 'yyyy-MM-dd') !== format(end, 'yyyy-MM-dd')
    } catch {
      return false
    }
  }

  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={() => setIsExpanded(!isExpanded)}
          className='flex items-center gap-2 font-medium text-gray-900 hover:text-gray-700 transition-all duration-200'
        >
          {isExpanded ? (
            <ChevronUp className='w-4 h-4 transition-transform duration-200' />
          ) : (
            <ChevronDown className='w-4 h-4 transition-transform duration-200' />
          )}
          <span>
            Subtasks ({completedCount}/{subTasks.length})
          </span>
        </button>
        <div className='flex gap-2'>
          {subTasks.length > 0 && (
            <Button
              type='button'
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
                  {[searchQuery, filterStatus !== 'all', filterAssignee !== 'all'].filter(Boolean).length}
                </span>
              )}
            </Button>
          )}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addSubTask}
            className='transition-all duration-200 hover:bg-blue-50 hover:border-blue-300'
          >
            <Plus className='w-4 h-4 mr-2' />
            Thêm
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters && subTasks.length > 0 ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 space-y-3 border border-gray-200 shadow-sm'>
          {/* Search */}
          <div className='relative group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-blue-500' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm subtask...'
              className='pl-9 pr-4 h-9 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300'
            />
          </div>

          {/* Filter Grid */}
          <div className='grid grid-cols-2 gap-2'>
            {/* Status Filter */}
            <div className='space-y-1'>
              <label className='text-xs font-medium text-gray-600 flex items-center gap-1'>
                <CheckCircle2 className='w-3 h-3' />
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white cursor-pointer'
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
                className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-white cursor-pointer'
              >
                <option value='all'>Tất cả</option>
                {uniqueAssignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={clearFilters}
              className='w-full h-8 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
            >
              <X className='w-3 h-3 mr-1' />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Subtasks List */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='space-y-3'>
          {subTasks.length === 0 ? (
            <div className='text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
              <p className='text-sm'>Chưa có subtask nào. Nhấn "Thêm" để tạo mới.</p>
            </div>
          ) : filteredIndices.length === 0 ? (
            <div className='text-center py-6 text-gray-500 bg-gray-50 rounded-lg'>
              <Search className='w-10 h-10 mx-auto mb-2 opacity-50' />
              <p className='text-sm'>Không tìm thấy subtask phù hợp</p>
            </div>
          ) : (
            <div className='space-y-3 max-h-[600px] overflow-y-auto pr-1'>
              {filteredIndices.map((index, idx) => {
                const subTask = subTasks[index]
                const multiDay = isMultiDay(subTask)
                const timeSlotsExpanded = expandedTimeSlots[index]

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 space-y-3 transition-all duration-200 hover:shadow-md ${
                      subTask.isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200 bg-white'
                    }`}
                    style={{
                      animation: `slideInFromLeft 0.3s ease-out ${idx * 50}ms both`
                    }}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 space-y-2'>
                        {/* Title */}
                        <Input
                          value={subTask.title}
                          onChange={(e) => updateSubTask(index, 'title', e.target.value)}
                          placeholder='Tiêu đề subtask'
                          required
                          className='h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                        />

                        {/* Description */}
                        <Textarea
                          value={subTask.description || ''}
                          onChange={(e) => updateSubTask(index, 'description', e.target.value)}
                          placeholder='Mô tả (tùy chọn)'
                          rows={2}
                          className='text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                        />

                        {/* Date Range */}
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <Label className='text-xs flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              Ngày bắt đầu
                            </Label>
                            <Input
                              type='datetime-local'
                              value={toDateTimeLocal(subTask.startDate)}
                              onChange={(e) => {
                                if (e.target.value) {
                                  const date = new Date(e.target.value)
                                  updateSubTask(index, 'startDate', date.toISOString())
                                }
                              }}
                              min={parentStartLocal}
                              max={parentEndLocal}
                              className='text-xs h-8 transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                            />
                          </div>
                          <div className='space-y-1'>
                            <Label className='text-xs flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              Ngày kết thúc
                            </Label>
                            <Input
                              type='datetime-local'
                              value={toDateTimeLocal(subTask.endDate)}
                              onChange={(e) => {
                                if (e.target.value) {
                                  const date = new Date(e.target.value)
                                  updateSubTask(index, 'endDate', date.toISOString())
                                }
                              }}
                              min={toDateTimeLocal(subTask.startDate) || parentStartLocal}
                              max={parentEndLocal}
                              className='text-xs h-8 transition-all duration-200 focus:ring-2 focus:ring-blue-500'
                            />
                          </div>
                        </div>

                        {/* Daily Time Slots for Multi-day Tasks */}
                        {multiDay && subTask.dailyTimeSlots && subTask.dailyTimeSlots.length > 0 && (
                          <div className='space-y-2 border-t pt-2'>
                            <div className='flex items-center justify-between'>
                              <button
                                type='button'
                                onClick={() => toggleTimeSlots(index)}
                                className='text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1'
                              >
                                <Clock className='w-3 h-3' />
                                Thời gian theo ngày ({subTask.dailyTimeSlots.length} ngày)
                                {timeSlotsExpanded ? (
                                  <ChevronUp className='w-3 h-3' />
                                ) : (
                                  <ChevronDown className='w-3 h-3' />
                                )}
                              </button>
                              {subTask.dailyTimeSlots.length > 1 && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => autoFillTimeSlots(index)}
                                  className='h-6 text-xs hover:bg-blue-50'
                                  title='Áp dụng giờ của ngày đầu tiên cho tất cả các ngày'
                                >
                                  <Copy className='w-3 h-3 mr-1' />
                                  Auto-fill
                                </Button>
                              )}
                            </div>

                            {timeSlotsExpanded && (
                              <div className='space-y-1.5 bg-blue-50/50 p-2 rounded max-h-40 overflow-y-auto'>
                                {subTask.dailyTimeSlots.map((slot, slotIdx) => (
                                  <div key={slot.date} className='grid grid-cols-3 gap-2 items-center text-xs'>
                                    <div className='text-gray-700 font-medium'>
                                      {format(parseISO(slot.date), 'dd/MM (EEE)', { locale: vi })}
                                    </div>
                                    <Input
                                      type='time'
                                      value={slot.startTime}
                                      onChange={(e) => updateTimeSlot(index, slotIdx, 'startTime', e.target.value)}
                                      className='h-7 text-xs'
                                    />
                                    <Input
                                      type='time'
                                      value={slot.endTime}
                                      onChange={(e) => updateTimeSlot(index, slotIdx, 'endTime', e.target.value)}
                                      className='h-7 text-xs'
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Assignee - Multi Select with Custom Dropdown */}
                        <div className='space-y-2'>
                          <Label className='text-xs flex items-center gap-1 text-gray-700 font-medium'>
                            <UserPlus className='w-3.5 h-3.5' />
                            Người thực hiện
                          </Label>

                          {/* Custom Dropdown */}
                          <div
                            ref={(el) => {
                              dropdownRefs.current[index] = el
                            }}
                            className='relative'
                          >
                            {/* Trigger Button */}
                            <button
                              type='button'
                              onClick={() => toggleDropdown(index)}
                              disabled={isLoadingUsers}
                              className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2'
                            >
                              <span className='text-gray-600 flex-1'>
                                {isLoadingUsers ? (
                                  <span className='flex items-center gap-2'>
                                    <Loader2 className='w-3 h-3 animate-spin' />
                                    Đang tải...
                                  </span>
                                ) : subTask.assigneeIds && subTask.assigneeIds.length > 0 ? (
                                  `Đã chọn ${subTask.assigneeIds.length} người`
                                ) : (
                                  'Chọn người thực hiện...'
                                )}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                  openDropdowns[index] ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {/* Dropdown Panel */}
                            {openDropdowns[index] && !isLoadingUsers && (
                              <div className='absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
                                {/* Search Box */}
                                <div className='p-2 border-b border-gray-200 bg-gray-50'>
                                  <div className='relative'>
                                    <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400' />
                                    <Input
                                      type='text'
                                      placeholder='Tìm kiếm...'
                                      value={assigneeSearchQuery[index] || ''}
                                      onChange={(e) =>
                                        setAssigneeSearchQuery((prev) => ({
                                          ...prev,
                                          [index]: e.target.value
                                        }))
                                      }
                                      className='pl-8 h-8 text-xs border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>

                                {/* User List */}
                                <div className='max-h-48 overflow-y-auto'>
                                  {getFilteredUsers(index).length === 0 ? (
                                    <div className='p-4 text-center text-xs text-gray-500'>
                                      Không tìm thấy người dùng
                                    </div>
                                  ) : (
                                    getFilteredUsers(index).map((user) => {
                                      const isSelected = subTask.assigneeIds?.includes(user.id)
                                      return (
                                        <button
                                          key={user.id}
                                          type='button'
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleAssignee(index, user.id)
                                          }}
                                          className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors duration-150 flex items-center gap-2 ${
                                            isSelected ? 'bg-blue-50' : ''
                                          }`}
                                        >
                                          <div
                                            className={`flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 ${
                                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                                            }`}
                                          >
                                            {isSelected && <Check className='w-3 h-3 text-white' />}
                                          </div>
                                          <User className='w-3.5 h-3.5 text-gray-400' />
                                          <span
                                            className={`flex-1 ${
                                              isSelected ? 'font-medium text-blue-700' : 'text-gray-700'
                                            }`}
                                          >
                                            {user.name}
                                          </span>
                                        </button>
                                      )
                                    })
                                  )}
                                </div>

                                {/* Footer with count */}
                                {subTask.assigneeIds && subTask.assigneeIds.length > 0 && (
                                  <div className='px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between'>
                                    <span className='text-xs text-gray-600'>
                                      {subTask.assigneeIds.length} người được chọn
                                    </span>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='sm'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateSubTask(index, 'assigneeIds', [])
                                      }}
                                      className='h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-50'
                                    >
                                      Xóa tất cả
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Selected Users Display as Badges */}
                          {subTask.assigneeIds && subTask.assigneeIds.length > 0 && (
                            <div className='flex flex-wrap gap-1.5'>
                              {subTask.assignees?.map((assignee) => (
                                <Badge
                                  key={assignee.id}
                                  variant='secondary'
                                  className='text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-150 pl-2 pr-1 py-1 flex items-center gap-1'
                                >
                                  <User className='w-3 h-3' />
                                  {assignee.name}
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const newIds = (subTask.assigneeIds || []).filter((id) => id !== assignee.id)
                                      updateSubTask(index, 'assigneeIds', newIds)
                                    }}
                                    className='ml-0.5 hover:bg-blue-300 rounded-full p-0.5 transition-colors duration-150'
                                  >
                                    <X className='w-2.5 h-2.5' />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeSubTask(index)}
                        className='text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 transition-all duration-200'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>

                    {/* Completed checkbox */}
                    <div className='flex items-center gap-2 pt-2 border-t border-gray-200'>
                      <Checkbox
                        id={`completed-${index}`}
                        checked={subTask.isCompleted}
                        onCheckedChange={(checked) => updateSubTask(index, 'isCompleted', checked as boolean)}
                      />
                      <Label htmlFor={`completed-${index}`} className='text-sm cursor-pointer'>
                        Đã hoàn thành
                      </Label>
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
      `}</style>
    </div>
  )
}
