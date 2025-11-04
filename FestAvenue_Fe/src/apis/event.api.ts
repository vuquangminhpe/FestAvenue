import type { APIResponse } from '@/types/API.types'
import type {
  bodyApproveEventForStaff,
  bodySearchEvent,
  bodySearchWithAI,
  createEvent,
  EventFilterList,
  EventSearchFilter,
  EventSearchStaffFilter,
  EventTemp,
  EventVersionResForStaff,
  ReqFilterOwnerEvent,
  ResEventByEventCode
} from '@/types/event.types'
import http from '@/utils/http'
export type sendApproveEventWithOrg = createEvent & {
  eventId: string
}
export type updateEventWithOrg = createEvent & {
  eventCode: string
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
    const data = await http.post<APIResponse<EventFilterList>>('/event/get-event-with-filter-paging', body)
    return data?.data?.data
  },
  deleteEventTempForEventOwner: async (eventTempId: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(`/event/delete-event-temp/${eventTempId}`)
    return data?.data
  },
  deleteEventForEventOwner: async (eventId: string) => {
    const data = await http.delete(`/event/delete-event/${eventId}`)
    return data?.data
  },
  getEventByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<ResEventByEventCode>>(
      `/event/get-event-by-event-code?eventCode=${eventCode}`
    )
    return data?.data
  },
  getRelatedEvents: async (eventCode: string) => {
    const data = await http.get<APIResponse<ResEventByEventCode[]>>(`/event/get-related-events?eventCode=${eventCode}`)
    return data?.data
  },
  searchEventWithAI: async (body: bodySearchWithAI) => {
    const formdata = new FormData()

    // Only append if value exists (not undefined/null/empty)
    if (body?.SearchText && body.SearchText.trim().length > 0) {
      formdata.append('SearchText', body.SearchText)
    }

    if (body?.SearchImage) {
      formdata.append('SearchImage', body.SearchImage)
    }

    const data = await http.post<APIResponse<ReqFilterOwnerEvent[]>>('/event/search-event-with-ai', formdata)
    return data?.data
  },
  getTop20EventFeaturedEvent: async () => {
    const data = await http.get<APIResponse<ReqFilterOwnerEvent[]>>('/event/get-top20-featured-events')
    return data?.data
  },
  searchEventsWithPaging: async (body: bodySearchEvent) => {
    const data = await http.post<APIResponse<ReqFilterOwnerEvent[]>>('/event/search-events-with-paging', body)
    return data?.data
  }
}

const staffEventApis = {
  getEventWithFilterPagingForStaff: async (body: EventSearchStaffFilter) => {
    const data = await http.post<APIResponse<EventVersionResForStaff>>(
      '/event/get-event-request-with-filter-paging-for-staff',
      body
    )
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
