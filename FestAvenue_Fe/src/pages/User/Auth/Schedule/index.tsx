import { useEffect, useState, useCallback } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import { useScheduleStore } from '../../../../stores/schedule.store'
import type { Schedule } from '../../../../types/schedule.types'
import CalendarHeader from './components/CalendarHeader'
import CalendarGrid from './components/CalendarGrid'
import ScheduleFilter from './components/ScheduleFilter'
import ScheduleForm from './components/ScheduleForm'
import ScheduleDetail from './components/ScheduleDetail'
import { addMonths, subMonths } from 'date-fns'

export default function ScheduleManagement() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [, setSelectedDate] = useState<Date | null>(null)
  const [, setSelectedSchedules] = useState<Schedule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null)

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

    if (daySchedules.length === 1) {
      setDetailSchedule(daySchedules[0])
      setShowDetail(true)
    } else if (daySchedules.length > 1) {
      // Show list of schedules for this day
      // For now, just show the first one
      setDetailSchedule(daySchedules[0])
      setShowDetail(true)
    }
  }

  const handleCreateNew = () => {
    setEditingSchedule(null)
    setShowForm(true)
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
            <CalendarGrid currentDate={currentDate} schedules={sortedSchedules} onDayClick={handleDayClick} />
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
          onClose={() => {
            setShowForm(false)
            setEditingSchedule(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDetail && detailSchedule && (
        <ScheduleDetail
          schedule={detailSchedule}
          onClose={() => {
            setShowDetail(false)
            setDetailSchedule(null)
          }}
          onEdit={handleEdit}
          onDelete={handleDetailDelete}
          onRefresh={refreshSchedules}
        />
      )}
    </div>
  )
}
