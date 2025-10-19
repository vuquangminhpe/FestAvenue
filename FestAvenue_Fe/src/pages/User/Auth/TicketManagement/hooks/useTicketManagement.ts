import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import serviceTicketManagementApi from '@/apis/serviceTicketManagement.api'
import type {
  bodyCreateTicketInEvent,
  bodyUpdateTicketInEvent,
  TicketSearchRequest
} from '@/types/serviceTicketManagement.types'

// Query keys
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (eventCode: string, filters?: Partial<TicketSearchRequest>) =>
    [...ticketKeys.lists(), eventCode, filters] as const,
  detail: (ticketId: string) => [...ticketKeys.all, 'detail', ticketId] as const
}

/**
 * Hook để lấy danh sách vé với bộ lọc và phân trang
 */
export const useGetTickets = (eventCode: string, searchRequest: TicketSearchRequest) => {
  return useQuery({
    queryKey: ticketKeys.list(eventCode, searchRequest),
    queryFn: () => serviceTicketManagementApi.getAllTicketSearchFilter(searchRequest),
    enabled: !!eventCode,
    staleTime: 30000 // 30 seconds
  })
}

/**
 * Hook để lấy chi tiết một vé
 */
export const useGetTicketDetail = (ticketId: string) => {
  return useQuery({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: () => serviceTicketManagementApi.getTicketByTicketId(ticketId),
    enabled: !!ticketId,
    staleTime: 30000
  })
}

/**
 * Hook để tạo vé mới
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: bodyCreateTicketInEvent) => serviceTicketManagementApi.createTicketInEvent(data),
    onSuccess: (response) => {
      // Invalidate queries để refetch data
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      toast.success(response?.data?.messages || 'Tạo vé thành công!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo vé'
      toast.error(errorMessage)
    }
  })
}

/**
 * Hook để cập nhật vé
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: bodyUpdateTicketInEvent) => serviceTicketManagementApi.updateTicketInEvent(data),
    onSuccess: (response, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.id) })
      toast.success(response?.data?.messages || 'Cập nhật vé thành công!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật vé'
      toast.error(errorMessage)
    }
  })
}

/**
 * Hook để xóa vé
 */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => serviceTicketManagementApi.deleteTicketInEvent(ticketId),
    onSuccess: (response) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
      toast.success(response?.data?.messages || 'Xóa vé thành công!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa vé'
      toast.error(errorMessage)
    }
  })
}
