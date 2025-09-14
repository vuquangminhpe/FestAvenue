import type { APIResponse } from '@/types/API.types'
import type { bodyCreatedGroupChatOrganization } from '@/types/organization.types'
import type {
  bodyLoginType,
  loginResponse,
  bodyRegisterType,
  registerResponse,
  updateBodyProfile,
  updatePasswordBody,
  bodyResetPassword,
  userRes,
  bodyUpdateAvatar,
  CreateOrganizationBody,
  CreateOrganizationResponse,
  OrganizationResponse,
  bodyCheckExits,
  GroupChatResponse,
  bodyGetChatMessagesWithPagging,
  updateOrganizationBody
} from '@/types/user.types'
import http from '@/utils/http'

const userApi = {
  login_normal: async (body: bodyLoginType) => {
    const data = await http.post<APIResponse<loginResponse>>('/login/login-normal', body)
    return data?.data
  },
  register: async (body: bodyRegisterType) => {
    const data = await http.post<APIResponse<registerResponse>>('/register/register-account', body)
    return data?.data
  },
  register_verify: async (token: string) => {
    const data = await http.get<APIResponse<{ messages: string }>>(`/register/verify-account?token=${token}`)
    return data?.data
  },
  updateMyProfile: async (body: updateBodyProfile) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/profile/update-profile', body)
    return data?.data
  },
  updateMyPassword: async (body: updatePasswordBody) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/profile/change-password', body)
    return data?.data
  },
  deleteMyAccount: async () => {
    const data = await http.post<APIResponse<{ messages: string }>>('/profile/delete-account')
    return data?.data
  },
  uploadsStorage: async (file: File) => {
    const formDataBody = new FormData()
    formDataBody.append('file', file)
    const data = await http.post<APIResponse<{ data: string }>>('/storage/upload-file', formDataBody, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 0
    })
    return data?.data
  },
  ForgotPassword: async (email: string) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/reset-password/forgot-password', email)
    return data?.data
  },
  resetPassword: async (body: bodyResetPassword) => {
    const data = await http.post<APIResponse<{ messages: string }>>('/reset-password/reset-password', body)
    return data?.data
  },
  getMyProfile: async () => {
    const data = await http.get<APIResponse<userRes>>('/profile/my-profile')
    return data?.data
  },
  updateAvatarProfile: async (body: bodyUpdateAvatar) => {
    const data = await http.put<APIResponse<{ messages: string }>>('/profile/update-avatar', body)
    return data?.data
  },
  deletedFileStorage: async (fileName: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(`/storage/delete-file?fileName=${fileName}`)
    return data?.data
  },
  createOrganization: async (body: CreateOrganizationBody) => {
    const data = await http.post<APIResponse<CreateOrganizationResponse>>('/organization/create-organization', body)
    return data?.data
  },
  getMyOrganization: async () => {
    const data = await http.get<APIResponse<OrganizationResponse>>('/organization/my-organization')
    return data?.data
  },
  checkOrganizationExists: async (body: bodyCheckExits) => {
    const data = await http.post<APIResponse<OrganizationResponse>>(`/organization/exist-organization`, body)
    return data?.data
  },
  getOrganizationById: async (id: string) => {
    const data = await http.get<APIResponse<OrganizationResponse>>(`/organization/${id}`)
    return data?.data
  },
  updateOrganization: async (id: string, body: Partial<CreateOrganizationBody>) => {
    const data = await http.put<APIResponse<OrganizationResponse>>(`/organization/${id}`, body)
    return data?.data
  },
  deleteOrganization: async (id: string) => {
    const data = await http.delete<APIResponse<{ message: string }>>(`/organization/${id}`)
    return data?.data
  },
  createdGroupChatOrganization: async (body: bodyCreatedGroupChatOrganization) => {
    const data = await http.post<APIResponse<{ data: string }>>('/group-chat-organization/create', body)
    return data?.data
  },
  deletedGroupChatOrganization: async (groupChatId: string) => {
    const data = await http.delete<APIResponse<{ messages: string }>>(`/group-chat-organization/delete/${groupChatId}`)
    return data?.data
  },
  getGroupChats: async () => {
    const data = await http.get<APIResponse<GroupChatResponse[]>>('/group-chat-organization/list-group-chat-by-userId')
    return data?.data
  },
  getChatMessagesWithPagging: async (body: bodyGetChatMessagesWithPagging) => {
    const data = await http.post<APIResponse<{ data: string }>>(
      '/chat-message-organization/get-chat-message-with-pagging',
      body
    )
    return data?.data
  },
  getCurrentOrganization: async () => {
    const data = await http.get<APIResponse<OrganizationResponse[]>>('/organization/get-current-organizations')
    return data?.data
  },
  updateOrganizationById: async (id: string, body: updateOrganizationBody) => {
    const data = await http.put<APIResponse<{ messages: string }>>(`organization/update-organization/${id}`, body)
    return data?.data
  }
}
export default userApi
