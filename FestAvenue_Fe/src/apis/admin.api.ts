import type {
  bodyCreateCategory,
  bodyGetAllUserFilter,
  bodyUpdateCategory,
  DashboardData,
  resAdminGetAllUser
} from '@/types/admin.types'
import type { APIResponse, bodyUpdateStaff } from '@/types/API.types'
import type { getCategoryActiveRes } from '@/types/categories.types'
import http from '@/utils/http'

const adminApi = {
  createCategory: async (body: bodyCreateCategory) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/admin/category/create-category', body)
    return data?.data
  },
  updateCategory: async (body: bodyUpdateCategory) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/admin/category/update-category', body)
    return data?.data
  },
  getCateGoryById: async (categoryId: string) => {
    const data = await http.get<APIResponse<getCategoryActiveRes>>(`/admin/category/get-category-by-id/${categoryId}`)
    return data?.data
  },
  getAllCategory: async () => {
    const data = await http.get<APIResponse<getCategoryActiveRes[]>>('/admin/category/get-all-categories')
    return data?.data
  },
  getAdminStatistics: async () => {
    const data = await http.get<APIResponse<DashboardData>>('/admin-dashboard/admin-statistics')
    return data?.data
  },
  getAllUserFilter: async (body: bodyGetAllUserFilter) => {
    const data = await http.post<APIResponse<{ result: resAdminGetAllUser }>>(
      '/admin/user/get-all-user-filter-paging',
      body
    )
    return data?.data
  },
  updateStaffAccountForAdmin: async (body: bodyUpdateStaff) => {
    const data = await http.put<APIResponse<{ message: string }>>('/admin/user/update-staff-account-for-admin', body)
    return data?.data
  },
  deleteAccountStaffByAdmin: async (staffId: string) => {
    const data = await http.delete<APIResponse<{ message: string }>>(
      `/admin/user/delete-staff-account-for-admin/${staffId}`
    )
    return data?.data
  },
  createAccountStaffByAdmin: async (email: string) => {
    const data = await http.post<APIResponse<{ message: string }>>(`/admin/user/create-staff-account`, undefined, {
      params: {
        email
      }
    })
    return data?.data
  },
  banAccountUser: async (userId: string) => {
    const data = await http.post<APIResponse<{ message: string }>>(`/admin/user/ban-account/${userId}`)
    return data?.data
  },
  activeAccountUser: async (userId: string) => {
    const data = await http.post<APIResponse<{ message: string }>>(`/admin/user/active-account/${userId}`)
    return data?.data
  }
}
export default adminApi
