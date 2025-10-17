import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import serviceUserManagementsApis from '@/apis/serviceManaget.api'
import type { bodyGetInvitationsReceived } from '@/types/userManagement.types'
import { toast } from 'sonner'

// Hook để lấy danh sách lời mời mà người dùng nhận được
export const useGetInvitationsReceived = (body: bodyGetInvitationsReceived, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['invitationsReceived', body.paginationParam.pageIndex],
    queryFn: () => serviceUserManagementsApis.getInvitationsReceived(body),
    enabled
  })
}

// Hook để chấp nhận lời mời
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventInvitationId: string) => serviceUserManagementsApis.AcceptInvitation(eventInvitationId),
    onSuccess: () => {
      toast.success('Chấp nhận lời mời thành công!')
      queryClient.invalidateQueries({ queryKey: ['invitationsReceived'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Chấp nhận lời mời thất bại!')
    }
  })
}

// Hook để từ chối lời mời
export const useDeclineInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventInvitationId: string) => serviceUserManagementsApis.DeclineInvitation(eventInvitationId),
    onSuccess: () => {
      toast.success('Từ chối lời mời thành công!')
      queryClient.invalidateQueries({ queryKey: ['invitationsReceived'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Từ chối lời mời thất bại!')
    }
  })
}
