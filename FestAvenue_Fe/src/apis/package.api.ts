import type { APIResponse } from '@/types/API.types'
import type { bodyCreatePackage, bodyUpdatePackage, getPackageByStatusRes } from '@/types/package.types'
import http from '@/utils/http'

const packageApis = {
  getPackageByStatus: async ({ isPublic = true }: { isPublic?: string | boolean }) => {
    const data = await http.get<APIResponse<getPackageByStatusRes>>(
      `package/by-status${isPublic === 'all' ? '' : `?isActive=${isPublic}`}`
    )
    return data?.data
  },
  createPackageForAdmin: async (body: bodyCreatePackage) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/package/create-package', body)
    return data?.data
  },
  updatePackageForAdmin: async (body: bodyUpdatePackage) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/package/update-status', body)
    return data?.data
  }
}
export default packageApis
