import type { bodyCreateCategory, bodyUpdateCategory } from '@/types/admin.types'
import type { APIResponse } from '@/types/API.types'
import type { getCategoryActiveRes } from '@/types/categories.types'
import http_v2 from '@/utils/http_v2'

const adminApi = {
  createCategory: async (body: bodyCreateCategory) => {
    const data = await http_v2.post<APIResponse<{ messages: string }>>('/admin/category/create-category', body)
    return data?.data
  },
  updateCategory: async (body: bodyUpdateCategory) => {
    const data = await http_v2.put<APIResponse<{ messages: string }>>('/admin/category/update-category', body)
    return data?.data
  },
  getCateGoryById: async (categoryId: string) => {
    const data = await http_v2.get<APIResponse<getCategoryActiveRes>>(
      `/admin/category/get-category-by-id/${categoryId}`
    )
    return data?.data
  },
  getAllCategory: async () => {
    const data = await http_v2.get<APIResponse<getCategoryActiveRes[]>>('/admin/category/get-all-categories')
    return data?.data
  }
}
export default adminApi
