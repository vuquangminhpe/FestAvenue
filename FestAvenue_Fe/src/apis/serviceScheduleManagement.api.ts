import type { APIResponse } from '@/types/API.types'
import type {
  bodyCreateEventScheduleRequest,
  bodyGetListSchedule,
  bodyUpdateEventScheduleRequest,
  EventItem
} from '@/types/schedule.types'
import http from '@/utils/http'

const serviceScheduleManagementApis = {
  //Lấy danh sách lịch trình trong khoảng thời gian nhất định (hiển thị lịch).
  getListSchedule: async (body: bodyGetListSchedule) => {
    const data = await http.post<APIResponse<EventItem[]>>('/schedule/list-schedule', body)
    return data?.data
  },
  //Lấy chi tiết một lịch trình (Schedule) bao gồm danh sách Subtasks.
  getScheduleDetails: async (scheduleId: string) => {
    const data = await http.get<APIResponse<EventItem>>(`/schedule/detail-schedule/${scheduleId}`)
    return data?.data
  },
  //Tạo mới một lịch trình (Schedule) cho sự kiện.
  createScheduleInEvent: async (body: bodyCreateEventScheduleRequest) => {
    const data = await http.post<APIResponse<EventItem>>('/schedule/create-schedule', body)
    return data?.data
  },
  //Cập nhật thông tin lịch trình (Schedule)
  updateScheduleInSchedule: async (body: bodyUpdateEventScheduleRequest) => {
    const data = await http.put<APIResponse<EventItem>>('/schedule/update-schedule', body)
    return data?.data
  },
  //Xóa một lịch trình (Schedule) theo Id.
  deleteScheduleInEvent: async (scheduleId: string) => {
    const data = await http.delete<APIResponse<{ data: boolean }>>(`/payment/delete-schedule/${scheduleId}`)
    return data?.data
  }
}
export default serviceScheduleManagementApis
