import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffEventApis } from '@/apis/event.api'
import adminApi from '@/apis/admin.api'
import type { bodyGetAllUserByStaff } from '@/types/event.types'

export const STAFF_ACCOUNT_QUERY_KEYS = {
  users: ['staff-users'] as const
}

export const useStaffAccountQuery = () => {
  const queryClient = useQueryClient()

  // Query để lấy danh sách users với filter và paging (sử dụng API của staff)
  const useUsersQuery = (filter: bodyGetAllUserByStaff) =>
    useQuery({
      queryKey: [...STAFF_ACCOUNT_QUERY_KEYS.users, filter],
      queryFn: () => staffEventApis.getAllUserByStaff(filter)
    })

  // Mutation ban tài khoản (chỉ cho user thường, không phải staff)
  const banAccountMutation = useMutation({
    mutationFn: (userId: string) => adminApi.banAccountUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_ACCOUNT_QUERY_KEYS.users })
      toast.success('Đã cấm tài khoản thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cấm tài khoản')
    }
  })

  // Mutation active tài khoản (chỉ cho user thường, không phải staff)
  const activeAccountMutation = useMutation({
    mutationFn: (userId: string) => adminApi.activeAccountUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_ACCOUNT_QUERY_KEYS.users })
      toast.success('Đã kích hoạt tài khoản thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi kích hoạt tài khoản')
    }
  })

  return {
    useUsersQuery,
    banAccountMutation,
    activeAccountMutation
  }
}

// Helper để map status number sang text
export const getUserStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Chờ duyệt'
    case 1:
      return 'Hoạt động'
    case 2:
      return 'Đã cấm'
    default:
      return 'Không xác định'
  }
}

export const getUserStatusVariant = (status: number): string => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 text-yellow-800'
    case 1:
      return 'bg-green-100 text-green-800'
    case 2:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Helper để map roles
export const getRoleBadgeVariant = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'organizer':
      return 'bg-blue-100 text-blue-800'
    case 'staff':
      return 'bg-green-100 text-green-800'
    case 'user':
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
