import type { APIResponse } from '@/types/API.types'
import type {
  bodyCreateServicesPackage,
  bodyUpdateStatusPackage,
  Package,
  PackageCreateOrUpdate,
  ServicePackage
} from '@/types/package.types'
import http from '@/utils/http'

const packageApis = {
  getPackageByStatus: async ({ isPublic = true }: { isPublic?: string | boolean }) => {
    const data = await http.get<APIResponse<Package>>(
      `package/get-package-by-status${isPublic === 'all' ? '' : `?isActive=${isPublic}`}`
    )
    return data?.data
  },
  createPackageForAdmin: async (body: PackageCreateOrUpdate) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/package/create-package', body)
    return data?.data
  },
  updatePackageForAdmin: async (body: PackageCreateOrUpdate) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/package/update-package', body)
    return data?.data
  },
  updateStatusPackageForAdmin: async (body: bodyUpdateStatusPackage) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/package/update-status', body)
    return data?.data
  },
  getServicesPackageByStatus: async ({ isActive = true }: { isActive?: string | boolean }) => {
    const data = await http.get<APIResponse<ServicePackage[]>>(
      `/service-package/get-service-package-by-status${isActive === 'all' ? '' : `?isActive=${isActive}`}`
    )
    return data?.data
  },
  createServicesPackage: async (body: bodyCreateServicesPackage) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/service-package/create-service-package', body)
    return data?.data
  },
  updateServicesPackage: async (body: bodyCreateServicesPackage & { id: string }) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/service-package/update-service-package', body)
    return data?.data
  },
  updateStatusServicePackage: async (body: bodyUpdateStatusPackage) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      '/service-package/update-status-service-package',
      body
    )
    return data?.data
  },
  deleteServicePackage: async (servicesPackageId: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(
      `/service-package/delete-service-package/${servicesPackageId}`
    )
    return data?.data
  }
}
export default packageApis
