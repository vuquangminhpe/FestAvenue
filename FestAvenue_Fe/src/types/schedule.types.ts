export interface DailyTimeSlot {
  date: string // ISO date string (YYYY-MM-DD)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export interface SubTask {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  assigneeId?: string
  assigneeName?: string
  completedAt?: string
  startDate?: string // ISO date string - start date of subtask
  endDate?: string // ISO date string - end date of subtask
  dailyTimeSlots?: DailyTimeSlot[] // Time slots for each day
  createdAt: string
  updatedAt: string
}

export interface Schedule {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  color: string
  subTasks: SubTask[]
  isNotified: boolean
  createdAt: string
  updatedAt: string
}

export interface ScheduleFormData {
  title: string
  description?: string
  startDate: string
  endDate: string
  color: string
  subTasks: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>[]
}

export interface ScheduleFilter {
  searchQuery: string
  dateRange?: {
    from: Date
    to: Date
  }
  showCompleted: boolean
  sortBy: 'startDate' | 'endDate' | 'title' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

export type ScheduleView = 'month' | 'week' | 'day' | 'list'
