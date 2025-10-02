export interface SubTask {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  assigneeId?: string
  assigneeName?: string
  completedAt?: string
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
  subTasks: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>[]
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
