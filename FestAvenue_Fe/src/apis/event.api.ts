import type { APIResponse } from '@/types/API.types'
import type {
  bodyApproveEventForStaff,
  createEvent,
  EventFilterList,
  EventSearchFilter,
  EventSearchStaffFilter,
  EventTemp
} from '@/types/event.types'
import http from '@/utils/http'
export type sendApproveEventWithOrg = createEvent & {
  eventId: string
}
type updateEventWithOrg = createEvent & {
  id: string
}
type bodyRejectEventForStaff = bodyApproveEventForStaff
const eventApis = {
  sendApproveEvent: async (body: sendApproveEventWithOrg) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/event/Send-approve-event', body)
    return data?.data
  },
  updateEvent: async (body: updateEventWithOrg) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/event/update-event', body)
    return data?.data
  },
  createEvent: async (body: createEvent) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/event/create-event', body)
    return data?.data
  },
  getEventTempWithFilterPagingForEventOwner: async (body: EventSearchFilter) => {
    const data = await http.post<APIResponse<EventTemp[]>>(
      '/event/get-event-temp-with-filter-paging-for-event-owner',
      body
    )
    return data?.data
  },
  getEventWithFilterPaging: async (body: EventSearchFilter) => {
    const data = await http.post<APIResponse<EventFilterList[]>>('/event/get-event-with-filter-paging', body)
    return data?.data
  },
  deleteEventTempForEventOwner: async (eventTempId: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(`/event/delete-event-temp/${eventTempId}`)
    return data?.data
  },
  deleteEventForEventOwner: async (eventId: string) => {
    const data = await http.delete(`/event/delete-event/${eventId}`)
    return data?.data
  }
}

const staffEventApis = {
  getEventTempWithFilterPagingForStaff: async (body: EventSearchStaffFilter) => {
    const data = await http.post<APIResponse<EventTemp[]>>('/event/get-event-temp-with-filter-paging-for-staff', body)
    return data?.data
  },
  approveEventForStaff: async (body: bodyApproveEventForStaff) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/event/accept-event', body)
    return data?.data
  },
  rejectEventForStaff: async (body: bodyRejectEventForStaff) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/event/reject-event', body)
    return data?.data
  }
}
export { eventApis, staffEventApis }
export default eventApis
