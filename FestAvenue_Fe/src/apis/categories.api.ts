import type { APIResponse } from '@/types/API.types'
import type { getCategoryActiveRes } from '@/types/categories.types'
import http_v2 from '@/utils/http_v2'

const categoryApis = {
  getCategoryActive: async () => {
    const data = await http_v2.get<APIResponse<getCategoryActiveRes[]>>('/category/get-active-categories')
    return data?.data
  }
}
export default categoryApis
