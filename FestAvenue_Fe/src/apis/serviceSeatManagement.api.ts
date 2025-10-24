import type { APIResponse } from '@/types/API.types'
import type { bodyCreateSeatingChart } from '@/types/serviceSeatChartManagement'
import http from '@/utils/http'

const serviceSeatManagementApi = {
  createSeatingChart: async (body: bodyCreateSeatingChart) => {
    const data = await http.post<APIResponse<{ message: string }>>('/seating-chart/create-seating-chart', body)
    return data?.data
  },
  updateSeatingChart: async (body: bodyCreateSeatingChart) => {
    const data = await http.put<APIResponse<{ message: string }>>('/seating-chart/update-seating-chart', body)
    return data?.data
  },
  deleteSeatingChart: async (id: string) => {
    const data = await http.delete<APIResponse<{ message: string }>>(`/seating-chart/delete-seating-char-by-id/${id}`)
    return data?.data
  }
}
export default serviceSeatManagementApi
