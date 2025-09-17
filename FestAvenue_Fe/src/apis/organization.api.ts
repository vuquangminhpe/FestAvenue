import type { APIResponse } from '@/types/API.types'
import type {
  bodyManagerOrganization,
  OrganizationResponse,
  saveOrganizationBody,
  saveOrganizationResponse
} from '@/types/organization.types'
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
  },
  managerOrganization: async (body: bodyManagerOrganization) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/manager-organization/create-accounts', body)
    return data?.data
  },
  saveOrganization: async (body: saveOrganizationBody) => {
    const data = await http.post<APIResponse<saveOrganizationResponse>>('/organization/save-organization', body)
    return data?.data
  },
  getOrganizationById: async (id: string) => {
    const data = await http.get<APIResponse<OrganizationResponse>>(`/organization/get-organization/${id}`)
    return data?.data
  }
}
export default organizationApi
