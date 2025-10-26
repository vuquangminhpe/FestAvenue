import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'
import serviceTicketManagementApi from '@/apis/serviceTicketManagement.api'
import type { TicketSearchRequest } from '@/types/serviceTicketManagement.types'

// Query keys
export const eventDetailsKeys = {
  all: ['eventDetails'] as const,
  detail: (eventCode: string) => [...eventDetailsKeys.all, 'detail', eventCode] as const,
  tickets: (eventCode: string) => [...eventDetailsKeys.all, 'tickets', eventCode] as const
}

/**
 * Hook để lấy chi tiết sự kiện theo eventCode
 */
export const useGetEventByCode = (eventCode: string) => {
  return useQuery({
    queryKey: eventDetailsKeys.detail(eventCode),
    queryFn: async () => {
      const response = await eventApis.getEventByEventCode(eventCode)
      return response?.data
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

/**
 * Hook để lấy danh sách vé của sự kiện
 */
export const useGetEventTickets = (eventCode: string) => {
  const searchRequest: TicketSearchRequest = {
    eventCode: eventCode,
    search: '',
    minPrice: 0,
    maxPrice: 999999999,
    pagination: {
      pageIndex: 1,
      pageSize: 100,
      isPaging: true,
      orderBy: 'createdAt'
    }
  }

  return useQuery({
    queryKey: eventDetailsKeys.tickets(eventCode),
    queryFn: async () => {
      const response = await serviceTicketManagementApi.getAllTicketSearchFilter(searchRequest)
      return response?.data?.result || []
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

/**
 * Hook kết hợp để lấy cả event và tickets
 */
export const useEventDetailsData = (eventCode: string) => {
  const eventQuery = useGetEventByCode(eventCode)
  const ticketsQuery = useGetEventTickets(eventCode)

  return {
    event: eventQuery.data,
    tickets: ticketsQuery.data || [],
    isLoading: eventQuery.isLoading || ticketsQuery.isLoading,
    isError: eventQuery.isError || ticketsQuery.isError,
    error: eventQuery.error || ticketsQuery.error,
    refetch: () => {
      eventQuery.refetch()
      ticketsQuery.refetch()
    }
  }
}
