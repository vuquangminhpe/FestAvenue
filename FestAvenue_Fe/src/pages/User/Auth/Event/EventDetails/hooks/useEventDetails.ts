import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'
import serviceTicketManagementApi from '@/apis/serviceTicketManagement.api'
import serviceSocialMediaApis from '@/apis/serviceSocialMedia.api'
import type { TicketSearchRequest } from '@/types/serviceTicketManagement.types'

// Query keys
export const eventDetailsKeys = {
  all: ['eventDetails'] as const,
  detail: (eventCode: string) => [...eventDetailsKeys.all, 'detail', eventCode] as const,
  detailEventOwner: (eventCode: string) => [...eventDetailsKeys.all, 'detailEventOwner', eventCode] as const,
  tickets: (eventCode: string) => [...eventDetailsKeys.all, 'tickets', eventCode] as const,
  posts: (eventCode: string) => [...eventDetailsKeys.all, 'posts', eventCode] as const
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
 * Hook để lấy chi tiết sự kiện theo eventCode
 */
export const useGetEventByCodeOwner = (eventCode: string) => {
  return useQuery({
    queryKey: eventDetailsKeys.detailEventOwner(eventCode),
    queryFn: async () => {
      const response = await eventApis.getEventByEventCodeForEventOwner(eventCode)
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
 * Hook để lấy 5 bài đăng mới nhất của sự kiện
 */
export const useGetTop5Posts = (eventCode: string) => {
  return useQuery({
    queryKey: eventDetailsKeys.posts(eventCode),
    queryFn: async () => {
      const response = await serviceSocialMediaApis.getTop5LatestPostByEventCode(eventCode)
      return response?.data || []
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

/**
 * Hook để lấy các sự kiện liên quan
 */
export const useGetRelatedEvents = (eventCode: string) => {
  return useQuery({
    queryKey: [...eventDetailsKeys.all, 'related', eventCode] as const,
    queryFn: async () => {
      const response = await eventApis.getRelatedEvents(eventCode)
      return response?.data || []
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })
}

/**
 * Hook kết hợp để lấy cả event, tickets, posts và related events
 */
export const useEventDetailsData = (eventCode: string) => {
  const eventQuery = useGetEventByCode(eventCode)
  const ticketsQuery = useGetEventTickets(eventCode)
  const postsQuery = useGetTop5Posts(eventCode)
  const relatedEventsQuery = useGetRelatedEvents(eventCode)

  return {
    event: eventQuery.data,
    tickets: ticketsQuery.data || [],
    posts: postsQuery.data || [],
    relatedEvents: relatedEventsQuery.data || [],
    isLoading: eventQuery.isLoading || ticketsQuery.isLoading || postsQuery.isLoading || relatedEventsQuery.isLoading,
    isError: eventQuery.isError || ticketsQuery.isError || postsQuery.isError || relatedEventsQuery.isError,
    error: eventQuery.error || ticketsQuery.error || postsQuery.error || relatedEventsQuery.error,
    refetch: () => {
      eventQuery.refetch()
      ticketsQuery.refetch()
      postsQuery.refetch()
      relatedEventsQuery.refetch()
    }
  }
}
