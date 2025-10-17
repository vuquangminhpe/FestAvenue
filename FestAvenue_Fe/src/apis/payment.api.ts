import type { APIResponse } from '@/types/API.types'
import type { bodyCreateAndUpdatePackageEvent } from '@/types/payment.types'

import http from '@/utils/http'

const paymentApis = {
  createPaymentPackage: async (body: bodyCreateAndUpdatePackageEvent) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/payment/create-event-package-payment', body)
    return data?.data
  }
}
export default paymentApis
