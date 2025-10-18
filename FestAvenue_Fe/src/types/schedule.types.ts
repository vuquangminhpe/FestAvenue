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
  // Support multiple assignees
  assigneeIds?: string[]
  assignees?: Array<{ id: string; name: string }>
  // Legacy single assignee fields (kept for backwards compatibility)
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

/////////// Types mới chính thức từ api
export interface bodyGetListSchedule {
  eventCode: string
  status: number
  startDate: string
  endDate: string
  keyword: string
  isCompleted: boolean
  sortBy: number
  isAsc: boolean
}
export interface EventItem {
  id: string
  eventCode: string
  title: string
  description: string
  color: string
  status: number
  startDate: string // ISO date string
  endDate: string // ISO date string
  createdBy: string
  createdByUser: CreatedByUser
  subtasks: Subtask[]
}

export interface CreatedByUser {
  id: string
  fullName: string
  avatar: string
  email: string
}

export interface Subtask {
  id: string
  title: string
  description: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  startTime: string // ISO date string
  endTime: string // ISO date string
  isCompleted: boolean
  implementByUsers: ImplementByUser[]
}

export interface ImplementByUser {
  id: string
  fullName: string
  avatar: string
  email: string
}

export interface bodyCreateEventScheduleRequest {
  eventCode: string
  title: string
  description: string
  color: string
  status: number
  startDate: string // ISO date string
  endDate: string // ISO date string
  subtasks: SubtaskRequest[]
}
export interface bodyUpdateEventScheduleRequest extends bodyCreateEventScheduleRequest {
  id: string // Schedule ID for update
}
export interface SubtaskRequest {
  title: string
  description: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  startTime: string // ISO date string
  endTime: string // ISO date string
  implementByUserIds: string[]
  isCompleted: boolean
}
