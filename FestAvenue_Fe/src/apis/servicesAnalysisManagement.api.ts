import type { APIResponse } from '@/types/API.types'
import type {
  DashboardAnalytics,
  SocialMediaPostStatistics,
  StaffStatistics
} from '@/types/servicesAnalysisManagement.types'
import http from '@/utils/http'

const servicesAnalysisManagementApis = {
  //Get general statistics (Total Participants, Revenue, etc.) for an event by EventCode.
  getGeneralStatistics: async (EventCode: string) => {
    const data = await http.get<APIResponse<DashboardAnalytics>>(`/general-statistics?EventCode=${EventCode}`)
    return data?.data
  },
  getStaffStatistics: async (EventCode: string) => {
    const data = await http.get<APIResponse<StaffStatistics>>(`/staff-statistics?EventCode=${EventCode}`)
    return data?.data
  },
  getSocialMediaPostStatistics: async (EventCode: string) => {
    const data = await http.get<APIResponse<SocialMediaPostStatistics>>(
      `/social-media-post-statistics?EventCode=${EventCode}`
    )
    return data?.data
  }
}
export default servicesAnalysisManagementApis
