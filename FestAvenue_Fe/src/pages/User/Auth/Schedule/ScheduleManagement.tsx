import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, CalendarDays, Lock, Loader2 } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { useScheduleStore } from '../../../../stores/schedule.store'
import type { Schedule } from '../../../../types/schedule.types'
import CalendarHeader from './components/CalendarHeader'
import CalendarGrid from './components/CalendarGrid'
import ScheduleFilter from './components/ScheduleFilter'
import ScheduleForm from './components/ScheduleForm'
import ScheduleDetail from './components/ScheduleDetail'
import { addMonths, subMonths } from 'date-fns'
import { scheduleService } from '../../../../services/schedule.service'
import { getIdFromNameId } from '@/utils/utils'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'

export default function ScheduleManagement() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  // Check permissions
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: eventPackagesData } = useEventPackages(eventCode)
  const { data: permissionsData, isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const isEventOwner = ownerCheckData?.data?.data || false
  const servicePackages = eventPackagesData?.data?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Tìm service package ID cho Schedule Management
  const schedulePackage = servicePackages.find(
    (pkg: any) =>
      pkg.name.includes('Schedule') || pkg.name.includes('Lịch trình') || pkg.name.includes('Schedule Management')
  )
  const hasSchedulePermission = isEventOwner || (schedulePackage && userServicePackageIds.includes(schedulePackage.id))

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([])
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null)
  const [prefilledDateRange, setPrefilledDateRange] = useState<{ start: Date; end: Date } | null>(null)

  const { schedules, filter, isLoading, fetchSchedules, searchSchedules, setFilter, refreshSchedules } =
    useScheduleStore()

  useEffect(() => {
    fetchSchedules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // If clicked from calendar day, use that date. Otherwise use null
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

    // Update schedule with new dates
    try {
      await scheduleService.updateSchedule(scheduleId, {
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
      })

      refreshSchedules()
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
    refreshSchedules()
    setShowForm(false)
    setEditingSchedule(null)
    setPrefilledDateRange(null)
  }

  const handleDetailDelete = () => {
    refreshSchedules()
    setShowDetail(false)
    setDetailSchedule(null)
  }

  const handleSearch = useCallback(
    (query: string) => {
      searchSchedules(query)
    },
    [searchSchedules]
  )

  const filteredSchedules = schedules.filter((schedule) => {
    // Apply filters
    if (!filter.showCompleted) {
      const allCompleted = schedule.subTasks.length > 0 && schedule.subTasks.every((st) => st.isCompleted)
      if (allCompleted) return false
    }

    if (filter.dateRange) {
      const scheduleStart = new Date(schedule.startDate)
      const scheduleEnd = new Date(schedule.endDate)
      const { from, to } = filter.dateRange

      const isInRange =
        (scheduleStart >= from && scheduleStart <= to) ||
        (scheduleEnd >= from && scheduleEnd <= to) ||
        (scheduleStart <= from && scheduleEnd >= to)

      if (!isInRange) return false
    }

    return true
  })

  // Sort schedules
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
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
          <ScheduleFilter filter={filter} onFilterChange={setFilter} onSearch={handleSearch} />
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
            <p className='text-2xl font-bold text-purple-600'>{filteredSchedules.length}</p>
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
          onRefresh={refreshSchedules}
          onScheduleChange={handleScheduleChange}
        />
      )}
    </div>
  )
}
