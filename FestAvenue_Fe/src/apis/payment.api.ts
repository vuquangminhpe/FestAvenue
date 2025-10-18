import type { APIResponse } from '@/types/API.types'
import type {
  bodyCreateAndUpdatePackageEvent,
  CreatePaymentRes,
  PaymentStatus,
  TransactionItem
} from '@/types/payment.types'

import http from '@/utils/http'

const paymentApis = {
  createPaymentPackage: async (body: bodyCreateAndUpdatePackageEvent) => {
    const data = await http.post<APIResponse<CreatePaymentRes>>('/payment/create-event-package-payment', body)
    return data?.data
  },
  upGradePaymentPackage: async (body: bodyCreateAndUpdatePackageEvent) => {
    const data = await http.post<APIResponse<TransactionItem>>('/payment/upgrade-event-package', body)
    return data?.data
  },
  // Lấy danh sách payment theo trạng thái
  getPaymentsByStatus: async (status: PaymentStatus) => {
    const data = await http.get<APIResponse<TransactionItem[]>>(
      `/payment/get-payments-by-status?${status ? `status=${status}` : ``}`
    )
    return data?.data
  },
  //Lấy trạng thái Payment theo PaymentId
  getStatusPaymentByPaymentId: async (paymentId: string) => {
    const data = await http.get<APIResponse<{ data: PaymentStatus }>>(
      `/payment/get-status-payment-by-paymentId?paymentId=${paymentId}`
    )
    return data?.data
  },
  // Lấy thông tin chi tiết của 1 paymentID
  getPaymentByPaymentId: async (paymentId: string) => {
    const data = await http.get<APIResponse<TransactionItem>>(`/payment/get-payment-by-id?paymentId=${paymentId}`)
    return data?.data
  }
}
export default paymentApis
