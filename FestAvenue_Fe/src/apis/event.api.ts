import type { APIResponse } from '@/types/API.types'
import type {
  bodyAcceptRequestWithDrawal,
  bodyApproveEventForStaff,
  bodyCreateWithDrawal,
  bodyGetListReqDrawalByAdmin,
  bodyRejectRequestWithDrawal,
  bodySearchEvent,
  bodySearchWithAI,
  createEvent,
  EventFilterList,
  EventSearchFilter,
  EventSearchStaffFilter,
  EventTemp,
  EventVersionResForStaff,
  getListWithDrawByAdminRes,
  ReqFilterOwnerEvent,
  ResEventByEventCode,
  WithdrawalRequest,
  WithdrawalRequestItem
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

    // Only append if value exists and is not empty
    if (body?.SearchText && typeof body.SearchText === 'string' && body.SearchText.trim().length > 0) {
      formdata.append('SearchText', body.SearchText)
    }

    // Only append SearchImage if it's a valid File object
    if (body?.SearchImage && body.SearchImage instanceof File && body.SearchImage.size > 0) {
      formdata.append('SearchImage', body.SearchImage, body.SearchImage.name)
    }

    const data = await http.post<APIResponse<ReqFilterOwnerEvent[]>>('/event/search-event-with-ai', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data?.data
  },
  getTop20EventFeaturedEvent: async () => {
    const data = await http.get<APIResponse<ReqFilterOwnerEvent[]>>('/event/get-top20-featured-events')
    return data?.data
  },
  searchEventsWithPaging: async (body: bodySearchEvent) => {
    const data = await http.post<APIResponse<ReqFilterOwnerEvent[]>>('/event/search-events-with-paging', body)
    return data?.data
  },
  followOrUnfollowEvent: async (eventCode: string) => {
    const data = await http.post<APIResponse<{ messages: string; isFollowing: boolean }>>(
      `/user-follow-event/follow-or-unfollow/${eventCode}`
    )
    return data?.data
  },
  getListEventFollowWithPaging: async (body: bodySearchEvent) => {
    const data = await http.post<APIResponse<ReqFilterOwnerEvent[]>>(
      '/user-follow-event/get-list-event-follow-with-paging',
      body
    )
    return data?.data
  },
  //Lấy danh sách sự kiện kết thúc theo user là event owner
  getEventEndTimeByUser: async () => {
    const data = await http.get<APIResponse<ReqFilterOwnerEvent[]>>('/withdrawal-request/get-event-endtime-by-user')
    return data?.data
  },
  //Lấy detail của yêu cầu rút tiền theo eventCode
  getWithDrawalRequestByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<WithdrawalRequest>>(
      `/withdrawal-request/get-withdrawal-request-by-event-code/${eventCode}`
    )
    return data?.data
  },
  //tạo yêu cầu rút tiền
  createWithDrawalRequest: async (body: bodyCreateWithDrawal) => {
    const data = await http.post<APIResponse<WithdrawalRequestItem>>(
      '/withdrawal-request/create-withdrawal-request',
      body
    )
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
const adminEventApis = {
  getListWithDrawalRequestWithPagingAndFilter: async (body: bodyGetListReqDrawalByAdmin) => {
    const data = await http.post<APIResponse<getListWithDrawByAdminRes>>(
      '/withdrawal-request/get-list-withdrawal-request-with-paging-and-filter',
      body
    )
    return data?.data
  },
  acceptWithDrawalRequestByAdmin: async (body: bodyAcceptRequestWithDrawal) => {
    const data = await http.post<APIResponse<{ message: string }>>(
      '/withdrawal-request/accept-withdrawal-request-by-admin',
      body
    )
    return data?.data
  },
  rejectWithDrawalRequestByAdmin: async (body: bodyRejectRequestWithDrawal) => {
    const data = await http.post<APIResponse<{ message: string }>>(
      '/withdrawal-request/reject-withdrawal-request-by-admin',
      body
    )
    return data?.data
  }
}
export { eventApis, staffEventApis, adminEventApis }
export default eventApis
