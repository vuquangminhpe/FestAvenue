import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import serviceUserManagementsApis from '@/apis/serviceManaget.api'
import type {
  bodySendInvitation,
  bodyGetUserInEvent,
  bodyUpdatePackagesForUser,
  getInvitationsEvent
} from '@/types/userManagement.types'
import { toast } from 'sonner'

// Hook để lấy danh sách người dùng trong sự kiện
export const useGetUsersInEvent = (body: bodyGetUserInEvent, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['usersInEvent', body.eventCode, body.searchFullName, body.servicePackageIds],
    queryFn: () => serviceUserManagementsApis.GetUsersInEvent(body),
    enabled
  })
}

// Hook để gửi lời mời
export const useSendInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: bodySendInvitation) => serviceUserManagementsApis.sendInvitation(body),
    onSuccess: () => {
      toast.success('Gửi lời mời thành công!')
      // Invalidate các query liên quan
      queryClient.invalidateQueries({ queryKey: ['invitationsEvent'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gửi lời mời thất bại!')
    }
  })
}

// Hook để lấy danh sách lời mời từ event owner
export const useGetInvitationsEvent = (body: getInvitationsEvent, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['invitationsEvent', body.eventCode, body.invitationStatuses, body.searchMail],
    queryFn: () => serviceUserManagementsApis.getInvitationsEvent(body),
    enabled
  })
}

// Hook để hủy lời mời (Cancel - Event Owner)
export const useCancelInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventInvitationId: string) => serviceUserManagementsApis.CancelInvitationsById(eventInvitationId),
    onSuccess: () => {
      toast.success('Hủy lời mời thành công!')
      queryClient.invalidateQueries({ queryKey: ['invitationsEvent'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Hủy lời mời thất bại!')
    }
  })
}

// Hook để cập nhật service packages cho user
export const useUpdateServicePackageForUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: bodyUpdatePackagesForUser) => serviceUserManagementsApis.updateServicePackageForUser(body),
    onSuccess: () => {
      toast.success('Cập nhật quyền thành công!')
      // Invalidate query để refresh danh sách users
      queryClient.invalidateQueries({ queryKey: ['usersInEvent'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Cập nhật quyền thất bại!')
    }
  })
}

// Hook để xóa user khỏi event (Event Owner)
export const useRemoveUserFromEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      serviceUserManagementsApis.removeUserFromEvent({ eventId, userId }),
    onSuccess: () => {
      toast.success('Xóa thành viên thành công!')
      queryClient.invalidateQueries({ queryKey: ['usersInEvent'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xóa thành viên thất bại!')
    }
  })
}

// Hook để người dùng tự rời khỏi event
export const useUserLeaveEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      serviceUserManagementsApis.userLeaveEvent({ eventId, userId }),
    onSuccess: () => {
      toast.success('Rời khỏi sự kiện thành công!')
      queryClient.invalidateQueries({ queryKey: ['usersInEvent'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Rời khỏi sự kiện thất bại!')
    }
  })
}
