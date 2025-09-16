import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import organizationApi from '@/apis/organization.api'
import type { bodyManagerOrganization } from '@/types/organization.types'

export const useInviteUsers = () => {
  const queryClient = useQueryClient()

  const inviteUsersMutation = useMutation({
    mutationFn: ({ emails, organizationId }: { emails: string[]; organizationId: string }) => {
      const body: bodyManagerOrganization = {
        emails,
        organizationId
      }
      return organizationApi.managerOrganization(body)
    },
    onSuccess: () => {
      toast.success('Đã gửi lời mời thành công!')
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['dataGetAllCurrentOrganization'] })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời'
      toast.error(errorMessage)
    }
  })

  return {
    inviteUsersMutation,
    inviteUsers: ({ emails, organizationId }: { emails: string[]; organizationId: string }) =>
      inviteUsersMutation.mutateAsync({ emails, organizationId }),
    isLoading: inviteUsersMutation.isPending
  }
}