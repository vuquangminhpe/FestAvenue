import { useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, CalendarDays, Lock, Loader2 } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import type { Schedule, ScheduleFilter as ScheduleFilterType } from '../../../../types/schedule.types'
import CalendarHeader from './components/CalendarHeader'
import CalendarGrid from './components/CalendarGrid'
import ScheduleFilter from './components/ScheduleFilter'
import ScheduleForm from './components/ScheduleForm'
import ScheduleDetail from './components/ScheduleDetail'
import { addMonths, subMonths } from 'date-fns'
import { getIdFromNameId } from '@/utils/utils'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'
import { useSchedules, useUpdateSchedule } from '@/hooks/useSchedule'
import { SERVICE_PACKAGE_NAMES } from '@/constants/servicePackages'
import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'

const sortByParamMap: Record<ScheduleFilterType['sortBy'], number> = {
  startDate: 1,
  endDate: 2,
  title: 3,
  createdAt: 4
}

export default function ScheduleManagement() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventIdSplit = nameId.split('-')
  const eventId = eventIdSplit[eventIdSplit.length - 1]

  const eventCode = getIdFromNameId(nameId)

  // Check permissions
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: eventPackagesData } = useEventPackages(eventCode)
  const { data: permissionsData, isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const isEventOwner = ownerCheckData?.data || false
  const servicePackages = eventPackagesData?.data?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Tìm service package ID cho Schedule Management
  const schedulePackage = servicePackages.find((pkg: any) => pkg.name === SERVICE_PACKAGE_NAMES.SCHEDULE)
  const hasSchedulePermission = isEventOwner || (schedulePackage && userServicePackageIds.includes(schedulePackage.id))

  // Filter state
  const [filter, setFilter] = useState<ScheduleFilterType>({
    searchQuery: '',
    dateRange: undefined,
    showCompleted: true,
    sortBy: 'startDate',
    sortOrder: 'asc'
  })

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([])
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null)
  const [prefilledDateRange, setPrefilledDateRange] = useState<{ start: Date; end: Date } | null>(null)

  // Fetch schedules với TanStack Query
  const scheduleQueryFilters = useMemo(() => {
    const startDate = filter.dateRange?.from ? filter.dateRange.from.toISOString() : undefined
    const endDate = filter.dateRange?.to ? filter.dateRange.to.toISOString() : undefined
    const sortBy = sortByParamMap[filter.sortBy]

    return {
      keyword: filter.searchQuery || undefined,
      startDate,
      endDate,
      isCompleted: filter.showCompleted ? undefined : false,
      sortBy,
      isAsc: filter.sortOrder === 'asc'
    }
  }, [filter])

  const { data: schedules = [], isLoading } = useSchedules(eventCode, scheduleQueryFilters)

  // Fetch event data để lấy lifecycle
  const { data: eventData } = useQuery({
    queryKey: ['event', eventCode],
    queryFn: async () => {
      const response = await eventApis.getEventByEventCode(eventCode)
      return response?.data
    },
    enabled: !!eventCode
  })

  const lifecycleInfo = useMemo(() => {
    if (!eventData) return null
    return {
      start: new Date(eventData?.startEventLifecycleTime as string),
      end: new Date(eventData?.endEventLifecycleTime as string)
    }
  }, [eventData])

  const updateScheduleMutation = useUpdateSchedule()

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date, daySchedules: Schedule[]) => {
    setSelectedDate(date)
    setSelectedSchedules(daySchedules)
    setCurrentScheduleIndex(0)

    if (daySchedules.length > 0) {
      setDetailSchedule(daySchedules[0])
      setShowDetail(true)
    }
  }

  const handleScheduleClick = (schedule: Schedule, clickedDate?: Date) => {
    setSelectedDate(clickedDate || null)
    setDetailSchedule(schedule)
    setSelectedSchedules([schedule])
    setCurrentScheduleIndex(0)
    setShowDetail(true)
  }

  const handleScheduleChange = (index: number) => {
    setCurrentScheduleIndex(index)
    setDetailSchedule(selectedSchedules[index])
  }

  const handleCreateNew = () => {
    setEditingSchedule(null)
    setPrefilledDateRange(null)
    setShowForm(true)
  }

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setPrefilledDateRange({ start: startDate, end: endDate })
    setEditingSchedule(null)
    setShowForm(true)
  }

  const handleScheduleDrop = async (scheduleId: string, newStartDate: Date) => {
    const schedule = schedules.find((s) => s.id === scheduleId)
    if (!schedule) return

    const oldStart = new Date(schedule.startDate)
    const oldEnd = new Date(schedule.endDate)

    // Calculate the difference in days between old start and new start
    const oldStartDay = new Date(oldStart.getFullYear(), oldStart.getMonth(), oldStart.getDate())
    const newStartDay = new Date(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate())
    const diffDays = Math.round((newStartDay.getTime() - oldStartDay.getTime()) / (1000 * 60 * 60 * 24))

    // If no change, do nothing
    if (diffDays === 0) return

    // Create new start date preserving the original time
    const newStart = new Date(oldStart)
    newStart.setDate(newStart.getDate() + diffDays)

    // Create new end date preserving the original time
    const newEnd = new Date(oldEnd)
    newEnd.setDate(newEnd.getDate() + diffDays)

    // Validate lifecycle: Check if new dates are within event lifecycle
    // This is a safety check - UI should prevent dropping on invalid dates
    if (lifecycleInfo) {
      const lifecycleStart = new Date(
        lifecycleInfo.start.getFullYear(),
        lifecycleInfo.start.getMonth(),
        lifecycleInfo.start.getDate()
      )
      const lifecycleEnd = new Date(
        lifecycleInfo.end.getFullYear(),
        lifecycleInfo.end.getMonth(),
        lifecycleInfo.end.getDate()
      )
      const newStartDay = new Date(newStart.getFullYear(), newStart.getMonth(), newStart.getDate())
      const newEndDay = new Date(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate())

      if (newStartDay < lifecycleStart || newEndDay > lifecycleEnd) {
        // Silently reject - user already sees X indicator
        return
      }
    }

    // Update schedule with new dates
    try {
      await updateScheduleMutation.mutateAsync({
        scheduleId,
        eventCode,
        data: {
          title: schedule.title,
          description: schedule.description,
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
          color: schedule.color,
          subTasks: schedule.subTasks.map((st) => ({
            title: st.title,
            description: st.description,
            isCompleted: st.isCompleted,
            assigneeId: st.assigneeId,
            assigneeName: st.assigneeName,
            startDate: st.startDate,
            endDate: st.endDate,
            dailyTimeSlots: st.dailyTimeSlots
          }))
        }
      })
    } catch (error) {
      console.error('Failed to move schedule:', error)
      alert('Có lỗi xảy ra khi di chuyển lịch trình')
    }
  }

  const handleEdit = () => {
    setEditingSchedule(detailSchedule)
    setShowDetail(false)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSchedule(null)
    setPrefilledDateRange(null)
  }

  const handleDetailDelete = () => {
    setShowDetail(false)
    setDetailSchedule(null)
  }

  const handleSearch = useCallback((query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  const handleFilterChange = useCallback((newFilter: Partial<ScheduleFilterType>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }))
  }, [])

  // Sort schedules
  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      let aValue: string | Date, bValue: string | Date

      switch (filter.sortBy) {
        case 'startDate':
          aValue = new Date(a.startDate)
          bValue = new Date(b.startDate)
          break
        case 'endDate':
          aValue = new Date(a.endDate)
          bValue = new Date(b.endDate)
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          return 0
      }

      if (aValue < bValue) return filter.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filter.sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [schedules, filter.sortBy, filter.sortOrder])

  // Loading state
  if (isCheckingOwner || isLoadingPermissions) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-cyan-400' />
          <span className='text-gray-600 font-medium'>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    )
  }

  // Permission denied
  if (!hasSchedulePermission) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
        <div className='max-w-md text-center'>
          <div className='mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-6'>
            <Lock className='w-10 h-10 text-red-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-3'>Không có quyền truy cập</h2>
          <p className='text-gray-600 mb-6'>
            Bạn không có quyền quản lý lịch cho sự kiện này. Vui lòng liên hệ chủ sự kiện để được cấp quyền.
          </p>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-sm text-blue-800'>
              <strong>Gợi ý:</strong> Chủ sự kiện có thể cấp quyền cho bạn thông qua trang Quản người dùng.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <CalendarDays className='w-8 h-8 text-blue-600' />
              Quản lý lịch trình
            </h1>
            <p className='text-gray-600 mt-1'>Theo dõi và quản lý các lịch trình của bạn</p>
          </div>
          <Button onClick={handleCreateNew} size='lg' className='gap-2'>
            <Plus className='w-5 h-5' />
            Tạo lịch mới
          </Button>
        </div>

        {/* Filter Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <ScheduleFilter filter={filter} onFilterChange={handleFilterChange} onSearch={handleSearch} />
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
            <p className='text-sm text-gray-600 mb-1'>Tổng lịch trình</p>
            <p className='text-2xl font-bold text-gray-900'>{schedules.length}</p>
          </div>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
            <p className='text-sm text-gray-600 mb-1'>Lịch hôm nay</p>
            <p className='text-2xl font-bold text-blue-600'>
              {
                schedules.filter((s) => {
                  const today = new Date()
                  const start = new Date(s.startDate)
                  return (
                    start.getDate() === today.getDate() &&
                    start.getMonth() === today.getMonth() &&
                    start.getFullYear() === today.getFullYear()
                  )
                }).length
              }
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
            <p className='text-sm text-gray-600 mb-1'>Đang hiển thị</p>
            <p className='text-2xl font-bold text-purple-600'>{sortedSchedules.length}</p>
          </div>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
            <p className='text-sm text-gray-600 mb-1'>Có thông báo</p>
            <p className='text-2xl font-bold text-amber-600'>{schedules.filter((s) => s.isNotified).length}</p>
          </div>
        </div>

        {/* Calendar */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />
          {isLoading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
            </div>
          ) : (
            <CalendarGrid
              currentDate={currentDate}
              schedules={sortedSchedules}
              onDayClick={handleDayClick}
              onDateRangeSelect={handleDateRangeSelect}
              onScheduleDrop={handleScheduleDrop}
              onScheduleClick={handleScheduleClick}
              lifecycleInfo={lifecycleInfo}
            />
          )}
        </div>

        {/* Empty State */}
        {!isLoading && schedules.length === 0 && (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
            <CalendarDays className='w-16 h-16 mx-auto mb-4 text-gray-400' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Chưa có lịch trình nào</h3>
            <p className='text-gray-600 mb-6'>
              Bắt đầu tạo lịch trình đầu tiên của bạn để quản lý công việc hiệu quả hơn
            </p>
            <Button onClick={handleCreateNew} className='gap-2'>
              <Plus className='w-5 h-5' />
              Tạo lịch mới
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ScheduleForm
          eventId={eventId}
          eventCode={eventCode}
          schedule={editingSchedule}
          prefilledDateRange={prefilledDateRange}
          onClose={() => {
            setShowForm(false)
            setEditingSchedule(null)
            setPrefilledDateRange(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetail && detailSchedule && (
        <ScheduleDetail
          eventCode={eventCode}
          schedule={detailSchedule}
          schedules={selectedSchedules}
          currentIndex={currentScheduleIndex}
          selectedDate={selectedDate}
          onClose={() => {
            setShowDetail(false)
            setDetailSchedule(null)
            setSelectedSchedules([])
            setCurrentScheduleIndex(0)
          }}
          onEdit={handleEdit}
          onDelete={handleDetailDelete}
          onRefresh={() => {}}
          onScheduleChange={handleScheduleChange}
        />
      )}
    </div>
  )
}
