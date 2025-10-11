import type { APIResponse } from '@/types/API.types'
import type { getCategoryActiveRes } from '@/types/categories.types'
import http from '@/utils/http'

const categoryApis = {
  getCategoryActive: async () => {
    const data = await http.get<APIResponse<getCategoryActiveRes[]>>('/category/get-active-categories')
    return data?.data
  }
}
export default categoryApis
