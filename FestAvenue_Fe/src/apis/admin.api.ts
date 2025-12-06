import type { bodyCreateCategory, bodyUpdateCategory, resAdminStatistics } from '@/types/admin.types'
import type { APIResponse } from '@/types/API.types'
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
    const data = await http.get<APIResponse<resAdminStatistics>>('/admin-dashboard/admin-statistics')
    return data?.data
  }
}
export default adminApi
