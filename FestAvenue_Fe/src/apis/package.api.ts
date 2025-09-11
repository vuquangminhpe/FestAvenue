import type { APIResponse } from '@/types/API.types'
import type { getPackageByStatusRes } from '@/types/package.types'
import http from '@/utils/http'

const packageApis = {
  getPackageByStatus: async () => {
    const data = await http.get<APIResponse<getPackageByStatusRes>>(`package/by-status?isActive=true`)
    return data?.data
  }
}
export default packageApis
