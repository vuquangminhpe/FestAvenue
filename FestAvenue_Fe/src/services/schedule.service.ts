import type { Schedule, ScheduleFormData, SubTask } from '@/types/schedule.types'
import { mockSchedules } from '../mocks/schedule.mock'

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

class ScheduleService {
  private schedules: Schedule[] = [...mockSchedules]

  // Get all schedules
  async getAllSchedules(): Promise<Schedule[]> {
    await delay(500)
    return [...this.schedules].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  // Get schedule by ID
  async getScheduleById(id: string): Promise<Schedule | null> {
    await delay(300)
    const schedule = this.schedules.find((s) => s.id === id)
    return schedule ? { ...schedule } : null
  }

  // Get schedules by date range
  async getSchedulesByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
    await delay(400)
    return this.schedules.filter((schedule) => {
      const scheduleStart = new Date(schedule.startDate)
      const scheduleEnd = new Date(schedule.endDate)
      return (
        (scheduleStart >= startDate && scheduleStart <= endDate) ||
        (scheduleEnd >= startDate && scheduleEnd <= endDate) ||
        (scheduleStart <= startDate && scheduleEnd >= endDate)
      )
    })
  }

  // Search schedules
  async searchSchedules(query: string): Promise<Schedule[]> {
    await delay(300)
    const lowercaseQuery = query.toLowerCase()

    return this.schedules.filter((schedule) => {
      const titleMatch = schedule.title.toLowerCase().includes(lowercaseQuery)
      const descriptionMatch = schedule.description?.toLowerCase().includes(lowercaseQuery)
      const subTaskMatch = schedule.subTasks.some(
        (st) =>
          st.title.toLowerCase().includes(lowercaseQuery) || st.description?.toLowerCase().includes(lowercaseQuery)
      )
      return titleMatch || descriptionMatch || subTaskMatch
    })
  }

  // Create schedule
  async createSchedule(data: ScheduleFormData): Promise<Schedule> {
    await delay(600)

    const newSchedule: Schedule = {
      id: `schedule_${Date.now()}`,
      ...data,
      subTasks: data.subTasks.map((st, index) => ({
        ...st,
        id: `subtask_${Date.now()}_${index}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      isNotified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('Complete Schedule Object:', newSchedule)

    this.schedules.push(newSchedule)
    return { ...newSchedule }
  }

  // Update schedule
  async updateSchedule(id: string, data: Partial<ScheduleFormData>): Promise<Schedule | null> {
    await delay(600)

    const index = this.schedules.findIndex((s) => s.id === id)
    if (index === -1) return null

    const existingSchedule = this.schedules[index]

    const updatedSchedule: Schedule = {
      ...existingSchedule,
      ...data,
      subTasks:
        data.subTasks?.map((st, idx) => ({
          ...st,
          id: (st as SubTask).id || `subtask_${Date.now()}_${idx}`,
          createdAt: (st as SubTask).createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })) || existingSchedule.subTasks,
      updatedAt: new Date().toISOString()
    }

    this.schedules[index] = updatedSchedule
    return { ...updatedSchedule }
  }

  // Delete schedule
  async deleteSchedule(id: string): Promise<boolean> {
    await delay(400)
    const index = this.schedules.findIndex((s) => s.id === id)
    if (index === -1) return false

    this.schedules.splice(index, 1)
    return true
  }

  // Create subtask in a schedule
  async createSubTask(
    scheduleId: string,
    subTaskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SubTask | null> {
    await delay(400)

    const schedule = this.schedules.find((s) => s.id === scheduleId)
    if (!schedule) return null

    const newSubTask: SubTask = {
      ...subTaskData,
      id: `subtask_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    schedule.subTasks.push(newSubTask)
    schedule.updatedAt = new Date().toISOString()

    return { ...newSubTask }
  }

  // Update subtask
  async updateSubTask(
    scheduleId: string,
    subTaskId: string,
    updates: Partial<Omit<SubTask, 'id' | 'createdAt'>>
  ): Promise<SubTask | null> {
    await delay(400)

    const schedule = this.schedules.find((s) => s.id === scheduleId)
    if (!schedule) return null

    const subTaskIndex = schedule.subTasks.findIndex((st) => st.id === subTaskId)
    if (subTaskIndex === -1) return null

    const updatedSubTask: SubTask = {
      ...schedule.subTasks[subTaskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // If marking as completed, set completedAt timestamp
    if (updates.isCompleted === true && !schedule.subTasks[subTaskIndex].isCompleted) {
      updatedSubTask.completedAt = new Date().toISOString()
    }
    // If marking as incomplete, clear completedAt timestamp
    else if (updates.isCompleted === false && schedule.subTasks[subTaskIndex].isCompleted) {
      updatedSubTask.completedAt = undefined
    }

    schedule.subTasks[subTaskIndex] = updatedSubTask
    schedule.updatedAt = new Date().toISOString()

    return { ...updatedSubTask }
  }

  // Delete subtask
  async deleteSubTask(scheduleId: string, subTaskId: string): Promise<boolean> {
    await delay(400)

    const schedule = this.schedules.find((s) => s.id === scheduleId)
    if (!schedule) return false

    const subTaskIndex = schedule.subTasks.findIndex((st) => st.id === subTaskId)
    if (subTaskIndex === -1) return false

    schedule.subTasks.splice(subTaskIndex, 1)
    schedule.updatedAt = new Date().toISOString()

    return true
  }

  // Mark schedule as notified
  async markAsNotified(id: string): Promise<boolean> {
    await delay(200)

    const schedule = this.schedules.find((s) => s.id === id)
    if (!schedule) return false

    schedule.isNotified = true
    schedule.updatedAt = new Date().toISOString()

    return true
  }
}

export const scheduleService = new ScheduleService()
