import type { APIResponse } from '@/types/API.types'
import type {
  bodyCreateTicketInEvent,
  bodyUpdateTicketInEvent,
  resGetSeatMapByEventCode,
  Ticket,
  TicketResponse,
  TicketSearchRequest
} from '@/types/serviceTicketManagement.types'
import http from '@/utils/http'

const serviceTicketManagementApi = {
  createTicketInEvent: async (body: bodyCreateTicketInEvent) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/tickets/create-ticket', body)
    return data?.data
  },
  updateTicketInEvent: async (body: bodyUpdateTicketInEvent) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/tickets/update-ticket', body)
    return data?.data
  },
  deleteTicketInEvent: async (ticketId: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(`/tickets/delete-ticket/${ticketId}`)
    return data?.data
  },
  getTicketByTicketId: async (ticketId: string) => {
    const data = await http.get<APIResponse<Ticket>>(`/tickets/get-ticket-by-ticketId/${ticketId}`)
    return data?.data
  },
  getAllTicketSearchFilter: async (body: TicketSearchRequest) => {
    const data = await http.post<APIResponse<TicketResponse>>(`/tickets/get-all-ticket-search-filter-paging`, body)
    return data?.data
  },
  getStructureSeatByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<{ seatingChartStructure: string; id: string }>>(
      `/seating-chart/event/${eventCode}/structure`
    )
    return data?.data
  },
  getSeatMapByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<resGetSeatMapByEventCode>>(`/seating-chart/event/${eventCode}`)
    return data?.data
  },
  deleteSeatByEventCode: async (eventCode: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(
      `/seating-chart/delete-seating-char-by-event-code/${eventCode}`
    )
    return data?.data
  },
  getTicksByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<Ticket>>(`/tickets/get-tickets-by-event-code?eventCode=${eventCode}`)
    return data?.data
  }
}
export default serviceTicketManagementApi
