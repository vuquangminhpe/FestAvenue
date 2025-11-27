import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'
import servicesAnalysisManagementApis from '@/apis/servicesAnalysisManagement.api'

// Query keys
export const eventDetailsKeys = {
  all: ['eventDetails'] as const,
  dashboard: (eventCode: string) => [...eventDetailsKeys.all, 'dashboard', eventCode] as const,
  staffStatistics: (eventCode: string) => [...eventDetailsKeys.all, 'staffStatistics', eventCode] as const,
  socialMediaStatistics: (eventCode: string) =>
    [...eventDetailsKeys.all, 'socialMediaStatistics', eventCode] as const
}

/**
 * Hook để lấy thông số thống kê chung cho sự kiện
 */
export const useGetDashboardEventGeneral = (eventCode: string) => {
  return useQuery({
    queryKey: eventDetailsKeys.dashboard(eventCode),
    queryFn: async () => {
      const response = await eventApis.getDashBoardEventGeneralByEventCode(eventCode)
      return response?.data || []
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // cache 5 phút
    retry: 2
  })
}

/**
 * Hook để lấy thống kê nhân sự
 */
export const useGetStaffStatistics = (eventCode: string) => {
  return useQuery({
    queryKey: eventDetailsKeys.staffStatistics(eventCode),
    queryFn: async () => {
      const response = await servicesAnalysisManagementApis.getStaffStatistics(eventCode)
      return response?.data
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // cache 5 phút
    retry: 2
  })
}

/**
 * Hook để lấy thống kê social media
 */
export const useGetSocialMediaPostStatistics = (eventCode: string) => {
  return useQuery({
    queryKey: eventDetailsKeys.socialMediaStatistics(eventCode),
    queryFn: async () => {
      const response = await servicesAnalysisManagementApis.getSocialMediaPostStatistics(eventCode)
      return response?.data
    },
    enabled: !!eventCode,
    staleTime: 5 * 60 * 1000, // cache 5 phút
    retry: 2
  })
}

/**
 * Hook tổng hợp (chỉ cho dashboard)
 */
export const useEventDetailsData = (eventCode: string) => {
  const dashboardQuery = useGetDashboardEventGeneral(eventCode)

  return {
    dashboard: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch
  }
}
