import type { APIResponse } from '@/types/API.types'
import type { Organization } from '@/types/organization.types'
import type {
  bodyCreatePaymentWithOrganization,
  createPaymentWithOrganizationRes,
  getPaymentStatusByOrganizationRes
} from '@/types/payment.types'
import http_v2 from '@/utils/http_v2'

const paymentApis = {
  createPaymentWithOrganization: async (body: bodyCreatePaymentWithOrganization) => {
    const data = await http_v2.post<APIResponse<createPaymentWithOrganizationRes>>(
      '/payment/create-payment-organization',
      body
    )
    return data?.data
  },
  getPaymentStatusByOrganization: async (organizationId: string) => {
    const data = await http_v2.get<APIResponse<Organization>>(`/organization/get-organization/${organizationId}`)
    return data?.data
  },
  getStatusByPaymentId: async (paymentId: string) => {
    const data = await http_v2.get<APIResponse<getPaymentStatusByOrganizationRes>>(
      `payment/get-payment-status/${paymentId}`
    )
    return data?.data
  }
}
export default paymentApis
