import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import adminApi from '@/apis/admin.api'
import type { bodyGetAllUserFilter, resAdminGetAllUser } from '@/types/admin.types'
import type { bodyUpdateStaff } from '@/types/API.types'

export const ACCOUNT_QUERY_KEYS = {
  users: ['admin-users'] as const,
  userDetail: (userId: string) => ['admin-user', userId] as const
}

export const useAccountQuery = () => {
  const queryClient = useQueryClient()

  // Query để lấy danh sách users với filter và paging
  const useUsersQuery = (filter: bodyGetAllUserFilter) =>
    useQuery({
      queryKey: [...ACCOUNT_QUERY_KEYS.users, filter],
      queryFn: () => adminApi.getAllUserFilter(filter)
    })

  // Mutation tạo tài khoản staff
  const createStaffMutation = useMutation({
    mutationFn: (email: string) => adminApi.createAccountStaffByAdmin(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.users })
      toast.success('Tạo tài khoản staff thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản')
    }
  })

  // Mutation cập nhật tài khoản staff
  const updateStaffMutation = useMutation({
    mutationFn: (body: bodyUpdateStaff) => adminApi.updateStaffAccountForAdmin(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.users })
      toast.success('Cập nhật tài khoản thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản')
    }
  })

  // Mutation xóa tài khoản staff
  const deleteStaffMutation = useMutation({
    mutationFn: (staffId: string) => adminApi.deleteAccountStaffByAdmin(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.users })
      toast.success('Xóa tài khoản thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản')
    }
  })

  // Mutation ban tài khoản
  const banAccountMutation = useMutation({
    mutationFn: (userId: string) => adminApi.banAccountUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.users })
      toast.success('Đã cấm tài khoản thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cấm tài khoản')
    }
  })

  // Mutation active tài khoản
  const activeAccountMutation = useMutation({
    mutationFn: (userId: string) => adminApi.activeAccountUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.users })
      toast.success('Đã kích hoạt tài khoản thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi kích hoạt tài khoản')
    }
  })

  return {
    useUsersQuery,
    createStaffMutation,
    updateStaffMutation,
    deleteStaffMutation,
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
