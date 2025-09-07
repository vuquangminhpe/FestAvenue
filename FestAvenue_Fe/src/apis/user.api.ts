import type { APIResponse } from '@/types/API.types'
import type {
  bodyLoginType,
  loginResponse,
  bodyRegisterType,
  registerResponse,
  updateBodyProfile,
  updatePasswordBody,
  bodyResetPassword,
  userRes
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
  }
}
export default userApi
