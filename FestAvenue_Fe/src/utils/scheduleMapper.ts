import type { Schedule, SubTask } from '@/types/schedule.types'
import type {
  EventItem,
  Subtask,
  bodyCreateEventScheduleRequest,
  bodyUpdateEventScheduleRequest,
  SubtaskRequest
} from '@/types/schedule.types'

/**
 * Map API EventItem to UI Schedule type
 */
export function mapEventItemToSchedule(eventItem: EventItem): Schedule {
  return {
    id: eventItem.id,
    title: eventItem.title,
    description: eventItem.description,
    startDate: eventItem.startDate,
    endDate: eventItem.endDate,
    color: eventItem.color,
    subTasks: eventItem.subtasks.map(mapSubtaskToSubTask),
    isNotified: false, // API doesn't have this field, default to false
    createdAt: eventItem.startDate, // Use startDate as createdAt
    updatedAt: eventItem.endDate // Use endDate as updatedAt
  }
}

/**
 * Map API Subtask to UI SubTask type
 */
export function mapSubtaskToSubTask(subtask: Subtask): SubTask {
  return {
    id: subtask.id,
    title: subtask.title,
    description: subtask.description,
    isCompleted: subtask.isCompleted,
    // Multiple assignees support
    assigneeIds: subtask.implementByUsers.map((user) => user.id),
    assignees: subtask.implementByUsers.map((user) => ({
      id: user.id,
      name: user.fullName
    })),
    completedAt: subtask.isCompleted ? subtask.endDate : undefined,
    startDate: subtask.startDate,
    endDate: subtask.endDate,
    dailyTimeSlots: [
      {
        date: subtask.startDate.split('T')[0],
        startTime: subtask.startTime.split('T')[1]?.substring(0, 5) || '00:00',
        endTime: subtask.endTime.split('T')[1]?.substring(0, 5) || '23:59'
      }
    ],
    createdAt: subtask.startDate,
    updatedAt: subtask.endDate
  }
}

/**
 * Map UI Schedule to API request body for create
 */
export function mapScheduleToCreateRequest(
  eventCode: string,
  schedule: {
    title: string
    description?: string
    startDate: string
    endDate: string
    color: string
    subTasks: Array<{
      title: string
      description?: string
      isCompleted: boolean
      assigneeId?: string
      startDate?: string
      endDate?: string
      dailyTimeSlots?: Array<{ date: string; startTime: string; endTime: string }>
    }>
  }
): bodyCreateEventScheduleRequest {
  return {
    eventCode,
    title: schedule.title,
    description: schedule.description || '',
    color: schedule.color,
    status: 1, // Default status active
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    subtasks: schedule.subTasks.map((st) => mapSubTaskToSubtaskRequest(st, schedule.startDate, schedule.endDate))
  }
}

/**
 * Map UI Schedule to API request body for update
 */
export function mapScheduleToUpdateRequest(
  scheduleId: string,
  eventCode: string,
  schedule: {
    title: string
    description?: string
    startDate: string
    endDate: string
    color: string
    subTasks: Array<{
      title: string
      description?: string
      isCompleted: boolean
      assigneeId?: string
      startDate?: string
      endDate?: string
      dailyTimeSlots?: Array<{ date: string; startTime: string; endTime: string }>
    }>
  }
): bodyUpdateEventScheduleRequest {
  return {
    ...mapScheduleToCreateRequest(eventCode, schedule),
    id: scheduleId
  }
}

/**
 * Map UI SubTask to API SubtaskRequest
 */
function mapSubTaskToSubtaskRequest(
  subTask: {
    title: string
    description?: string
    isCompleted: boolean
    assigneeIds?: string[]
    assigneeId?: string // Legacy support
    startDate?: string
    endDate?: string
    dailyTimeSlots?: Array<{ date: string; startTime: string; endTime: string }>
  },
  scheduleStartDate: string,
  scheduleEndDate: string
): SubtaskRequest {
  // Use subtask dates if available, otherwise use schedule dates
  const startDate = subTask.startDate || scheduleStartDate
  const endDate = subTask.endDate || scheduleEndDate

  // Extract time from dailyTimeSlots or use default
  const firstSlot = subTask.dailyTimeSlots?.[0]
  const startTime = firstSlot?.startTime ? `${startDate.split('T')[0]}T${firstSlot.startTime}:00` : startDate
  const endTime = firstSlot?.endTime ? `${endDate.split('T')[0]}T${firstSlot.endTime}:00` : endDate

  // Support both multiple assignees (assigneeIds) and legacy single assignee (assigneeId)
  const implementByUserIds =
    subTask.assigneeIds && subTask.assigneeIds.length > 0
      ? subTask.assigneeIds
      : subTask.assigneeId
      ? [subTask.assigneeId]
      : []

  return {
    title: subTask.title,
    description: subTask.description || '',
    startDate,
    endDate,
    startTime,
    endTime,
    implementByUserIds,
    isCompleted: subTask.isCompleted
  }
}
