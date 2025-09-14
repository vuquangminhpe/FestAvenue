import type { APIResponse } from '@/types/API.types'
import http from '@/utils/http'

const organizationApi = {
  updateGroupChatStatusAccepted: async (groupChatId: string) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      `/group-chat-organization/update-group-chat-status-accepted/${groupChatId}`
    )
    return data?.data
  },
  updateGroupChatStatusRejected: async (groupChatId: string) => {
    const data = await http.put<APIResponse<{ messages: string }>>(
      `/group-chat-organization/update-group-chat-status-rejected/${groupChatId}`
    )
    return data?.data
  }
}
export default organizationApi
