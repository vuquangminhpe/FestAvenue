import type { APIResponse } from '@/types/API.types'
import type {
  bodyGetInvitationsReceived,
  bodyGetUserInEvent,
  bodySendInvitation,
  bodyUpdatePackagesForUser,
  getInvitationsEvent,
  InvitationListResponse,
  PackageDetail,
  ResGetPermissionService,
  UserServicePackageListResponse
} from '@/types/userManagement.types'
import http from '@/utils/http'

const serviceUserManagementsApis = {
  // owner event gửi lời mời
  sendInvitation: async (body: bodySendInvitation) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/event-invitation/send-invitation', body)
    return data?.data
  },
  // danh sách mà owner event đã gửi
  getInvitationsEvent: async (body: getInvitationsEvent) => {
    const data = await http.post<APIResponse<InvitationListResponse>>('/event-invitation/get-invitations-event', body)
    return data?.data
  },
  // danh sách lời mời được gửi đến người dùng đó
  getInvitationsReceived: async (body: bodyGetInvitationsReceived) => {
    const data = await http.post<APIResponse<InvitationListResponse>>(
      '/event-invitation/get-invitations-received',
      body
    )
    return data?.data
  },
  //Cancel -> Event Owner Hủy lời mời trước đó đã gửi cho người dùng
  CancelInvitationsById: async (eventInvitationId: string) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      `/event-invitation/cancel-invitation/${eventInvitationId}`
    )
    return data?.data
  },
  // Người dùng từ chối lời mời tham gia event
  DeclineInvitation: async (eventInvitationId: string) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      `/event-invitation/decline-invitation/${eventInvitationId}`
    )
    return data?.data
  },
  // Người dùng chấp nhận  lời mời tham gia event
  AcceptInvitation: async (eventInvitationId: string) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      `/event-invitation/accept-invitation/${eventInvitationId}`
    )
    return data?.data
  },
  // Lấy danh sách người dùng trong sự kiện
  GetUsersInEvent: async (body: bodyGetUserInEvent) => {
    const data = await http.post<APIResponse<UserServicePackageListResponse>>(
      '/event-user-management/get-users-in-event',
      body
    )
    return data?.data
  },
  // update service package -> có thể xử lí cả add hoặc remove (add để người dùng nào có thể quyền sử dụng services đó)
  updateServicePackageForUser: async (body: bodyUpdatePackagesForUser) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      '/event-user-management/update-service-package-for-user',
      body
    )
    return data?.data
  },
  // Xóa người dùng khỏi sự kiện
  removeUserFromEvent: async ({ eventId, userId }: { eventId: string; userId: string }) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(
      `/event-user-management/remove-user-from-event?eventId=${eventId}&userId=${userId}`
    )
    return data?.data
  },
  //Người dùng tự rời khỏi sự kiện này (Không phải event Owner, event owner không được phép rời sự kiện họ tạo ra)
  userLeaveEvent: async ({ eventId, userId }: { eventId: string; userId: string }) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(
      `/event-user-management/user-leave-event?eventId=${eventId}&userId=${userId}`
    )
    return data?.data
  },
  //Check xem user thuộc event này được sử dụng các services nào
  getPermissionServicesInEventByUser: async (eventCode: string) => {
    const data = await http.get<APIResponse<ResGetPermissionService>>(
      `/event-user-management/get-service-event-by-user?eventCode=${eventCode}`
    )
    return data?.data
  },
  checkUserIsEventOwner: async (eventCode: string) => {
    const data = await http.get<APIResponse<{ data: boolean }>>(
      `/event-user-management/check-user-is-event-owner?eventCode=${eventCode}`
    )
    return data?.data
  },
  getEventPackageByEventCode: async (eventCode: string) => {
    const data = await http.get<APIResponse<PackageDetail>>(`/event/get-event-package-by-event-code/${eventCode}`)
    return data?.data
  }
}
export default serviceUserManagementsApis
