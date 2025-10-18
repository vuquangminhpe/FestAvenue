import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import serviceScheduleManagementApis from '@/apis/serviceScheduleManagement.api'
import type { ScheduleFormData } from '@/types/schedule.types'
import { mapEventItemToSchedule, mapScheduleToCreateRequest, mapScheduleToUpdateRequest } from '@/utils/scheduleMapper'

// Query keys
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (eventCode: string, filters?: any) => [...scheduleKeys.lists(), eventCode, filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const
}

/**
 * Hook để lấy danh sách schedules
 */
export function useSchedules(
  eventCode: string,
  filters?: {
    keyword?: string
    startDate?: string
    endDate?: string
    isCompleted?: boolean
    sortBy?: number
    isAsc?: boolean
  }
) {
  return useQuery({
    queryKey: scheduleKeys.list(eventCode, filters),
    queryFn: async () => {
      const response = await serviceScheduleManagementApis.getListSchedule({
        eventCode,
        status: 1,
        startDate: filters?.startDate || new Date(2000, 0, 1).toISOString(),
        endDate: filters?.endDate || new Date(2100, 11, 31).toISOString(),
        keyword: filters?.keyword || '',
        isCompleted: filters?.isCompleted ?? false,
        sortBy: filters?.sortBy ?? 1,
        isAsc: filters?.isAsc ?? true
      })

      if (!response?.data) return []
      return response.data.map(mapEventItemToSchedule)
    },
    enabled: !!eventCode
  })
}

/**
 * Hook để lấy chi tiết schedule
 */
export function useScheduleDetail(scheduleId: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(scheduleId),
    queryFn: async () => {
      const response = await serviceScheduleManagementApis.getScheduleDetails(scheduleId)
      if (!response?.data) return null
      return mapEventItemToSchedule(response.data)
    },
    enabled: !!scheduleId
  })
}

/**
 * Hook để tạo schedule mới
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventCode, data }: { eventCode: string; data: ScheduleFormData }) => {
      const requestBody = mapScheduleToCreateRequest(eventCode, data)
      const response = await serviceScheduleManagementApis.createScheduleInEvent(requestBody)

      if (!response?.data) {
        throw new Error('Không nhận được dữ liệu từ server')
      }

      return mapEventItemToSchedule(response.data)
    },
    onSuccess: (_, variables) => {
      // Invalidate schedules list để refresh data
      queryClient.invalidateQueries({ queryKey: scheduleKeys.list(variables.eventCode) })
    }
  })
}

/**
 * Hook để cập nhật schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      eventCode,
      data
    }: {
      scheduleId: string
      eventCode: string
      data: Partial<ScheduleFormData>
    }) => {
      // Lấy schedule hiện tại để merge
      const currentResponse = await serviceScheduleManagementApis.getScheduleDetails(scheduleId)
      if (!currentResponse?.data) {
        throw new Error('Không tìm thấy lịch trình')
      }

      const current = mapEventItemToSchedule(currentResponse.data)

      // Merge data
      const mergedData: ScheduleFormData = {
        title: data.title ?? current.title,
        description: data.description ?? current.description,
        startDate: data.startDate ?? current.startDate,
        endDate: data.endDate ?? current.endDate,
        color: data.color ?? current.color,
        subTasks:
          data.subTasks ??
          current.subTasks.map((st) => ({
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

      const requestBody = mapScheduleToUpdateRequest(scheduleId, eventCode, mergedData)
      const response = await serviceScheduleManagementApis.updateScheduleInSchedule(requestBody)

      if (!response?.data) {
        throw new Error('Không nhận được dữ liệu từ server')
      }

      return mapEventItemToSchedule(response.data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.list(variables.eventCode) })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.scheduleId) })
    }
  })
}

/**
 * Hook để xóa schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const response = await serviceScheduleManagementApis.deleteScheduleInEvent(scheduleId)
      return response?.data?.data ?? false
    },
    onSuccess: (_, scheduleId) => {
      // Invalidate tất cả schedules lists
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.removeQueries({ queryKey: scheduleKeys.detail(scheduleId) })
    }
  })
}

/**
 * Hook để cập nhật subtask
 */
export function useUpdateSubTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      scheduleId,
      eventCode,
      subTaskId,
      updates
    }: {
      scheduleId: string
      eventCode: string
      subTaskId: string
      updates: { isCompleted?: boolean }
    }) => {
      // Lấy schedule hiện tại
      const currentResponse = await serviceScheduleManagementApis.getScheduleDetails(scheduleId)
      if (!currentResponse?.data) {
        throw new Error('Không tìm thấy lịch trình')
      }

      const schedule = mapEventItemToSchedule(currentResponse.data)
      const subTaskIndex = schedule.subTasks.findIndex((st) => st.id === subTaskId)

      if (subTaskIndex === -1) {
        throw new Error('Không tìm thấy subtask')
      }

      // Update subtask
      const updatedSubTask = {
        ...schedule.subTasks[subTaskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      // Set/clear completedAt
      if (updates.isCompleted === true && !schedule.subTasks[subTaskIndex].isCompleted) {
        updatedSubTask.completedAt = new Date().toISOString()
      } else if (updates.isCompleted === false && schedule.subTasks[subTaskIndex].isCompleted) {
        updatedSubTask.completedAt = undefined
      }

      schedule.subTasks[subTaskIndex] = updatedSubTask

      // Update schedule với subtask mới
      const requestBody = mapScheduleToUpdateRequest(scheduleId, eventCode, {
        title: schedule.title,
        description: schedule.description,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
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

      const response = await serviceScheduleManagementApis.updateScheduleInSchedule(requestBody)

      if (!response?.data) {
        throw new Error('Không nhận được dữ liệu từ server')
      }

      return updatedSubTask
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.scheduleId) })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
    }
  })
}
